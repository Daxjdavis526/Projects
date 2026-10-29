// G = c = 1 and converting back to SI. Every quantity becomes a power of
// length, with one conversion factor per kind (mass G/c², energy G/c⁴, power
// G/c⁵, density G/c², angular momentum G/c³); a formula is restored by
// replacing each geometric quantity by its SI form and checking dimensions.
// Then Planck units, ħ = c = G = 1, where the relativist's road (G = c = 1)
// and the particle physicist's road (ħ = c = 1, lesson G-UNITS.1) meet: the
// horizon line R = 2GM/c² crosses the quantum line ħ/Mc near the Planck mass.
// Builds on phys3710.R0.1 (masses as lengths and times, compactness M/R,
// GW150914's peak power, the Sgr A* ISCO period, one restored clock-rate
// formula) without repeating its examples.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const G = 6.6743e-11, C = 299792458, HBAR = 1.054571817e-34, KB = 1.380649e-23, EV = 1.602176634e-19;
const MSUN = 1.32712440018e20 / G;
const AU = 1.495978707e11;
const LP = Math.sqrt(HBAR * G / C ** 3), TP = LP / C, MPL = Math.sqrt(HBAR * C / G);
const POWER = C ** 5 / G;
const r6 = (v) => +(+v).toPrecision(6);
const L2G = Math.log10(2 * G / (C * C)), LHC = Math.log10(HBAR / C);

/** Peters' quadrupole luminosity of a circular binary, in W: (32/5)(c⁵/G) η² (GM/rc²)⁵. */
const gwPower = (m1, m2, rkm) => { const M = (m1 + m2) * MSUN, eta = m1 * m2 / (m1 + m2) ** 2, x = G * M / (C * C * rkm * 1e3); return 6.4 * eta * eta * x ** 5 * POWER; };

// objects on the mass–size map: [name, log10 kg, log10 m, dx, dy, align]
const OBJ = [
  ['electron (ħ/mc)', Math.log10(9.1093837e-31), Math.log10(HBAR / (9.1093837e-31 * C)), 8, -8],
  ['proton (ħ/mc)', Math.log10(1.67262192e-27), Math.log10(HBAR / (1.67262192e-27 * C)), 8, 12],
  ['Planck mass', Math.log10(MPL), Math.log10(LP), 10, 4],
  ['Earth', Math.log10(5.9722e24), Math.log10(6.371e6), -8, -8, 'right'],
  ['Sun', Math.log10(MSUN), Math.log10(6.957e8), 8, 14],
  ['Sgr A* (horizon)', Math.log10(4.3e6 * MSUN), Math.log10(2 * G * 4.3e6 * MSUN / (C * C)), -8, -8, 'right'],
];

/** Mass against size on log axes, with the horizon line R = 2GM/c² and the quantum line ħ/Mc. */
function map({ mark = null, sliders = null, readouts = null, density = null, vlines = null, caption }) {
  const curves = [
    { fn: `x + ${r6(L2G)}`, color: 'bad', width: 1.8, label: 'horizon: R = 2GM/c²', labelAt: 18, labelDx: 10, labelDy: 14 },
    { fn: `${r6(LHC)} - x`, color: 'violet', width: 1.8, label: 'quantum: ħ/Mc', labelAt: -14, labelDx: 10, labelDy: 0 },
  ];
  if (density) curves.push({ fn: `(x + ${r6(Math.log10(3 / (4 * Math.PI * density.rho)))})/3`, color: 'gold', dash: true, width: 1.6, label: density.label, labelAt: density.at ?? 2, labelDx: 8, labelDy: -10 });
  return {
    type: 'graph',
    params: {
      x: [-32, 40], y: [-40, 14], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'mass (kg)', ylabel: 'size (m)', xticks: 8, yticks: 6,
      curves,
      shade: [{ fn: `min(x + ${r6(L2G)}, 14)`, lower: '-40', from: -32, to: 40, color: 'bad', alpha: 0.08 }, { fn: `min(${r6(LHC)} - x, 14)`, lower: '-40', from: -32, to: 40, color: 'violet', alpha: 0.08 }],
      points: OBJ.map(([n, x, y, dx, dy, align]) => ({ x: r6(x), y: r6(y), r: n === mark ? 6 : 4.5, color: n === mark ? 'gold' : 'accent2', label: n, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) })),
      ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}), ...(vlines ? { vlines } : {}),
    },
    caption: caption ?? t`Mass against size on logarithmic scales. Below the red line a body is inside its own horizon (general relativity); below the violet line its size is less than its quantum wavelength $\hbar/Mc$ (quantum mechanics). The lines cross near the Planck mass, where neither theory alone can be trusted. Particles are placed at $\hbar/mc$.`,
  };
}

const EX = { m1: 1.4, m2: 1.4, r: 100 };
EX.M = (EX.m1 + EX.m2) * MSUN; EX.Mg = G * EX.M / (C * C); EX.x = EX.Mg / (EX.r * 1e3); EX.L = gwPower(EX.m1, EX.m2, EX.r);

export default lesson({
  id: 'st-g.G-UNITS.2',
  title: 'G = c = 1 and converting back to SI',
  minutes: 12, difficulty: 3,
  intro: t`Set $G = 1$ as well as $c = 1$ and the kilogram becomes a length too, $G/c^2 = 7.43\times10^{-28}$ m. Then **every quantity is a power of length**, and each kind has one conversion factor: a mass $M$ is the length $GM/c^2$, an energy $E$ is $GE/c^4$, a power is the pure number $P\,G/c^5$, a density $\rho$ is $G\rho/c^2$ in $\text{m}^{-2}$, an angular momentum $J$ is $GJ/c^3$ in $\text{m}^2$. To convert a formula back, replace each quantity by its geometric form and check that both sides have the same power of length. Add $\hbar = 1$ (lesson G-UNITS.1) and even that one unit disappears: **Planck units**, built from all three constants,

$$\ell_P = \sqrt{\frac{\hbar G}{c^3}} = 1.616\times10^{-35}\ \text{m}, \qquad m_P = \sqrt{\frac{\hbar c}{G}} = 2.176\times10^{-8}\ \text{kg}$$

[Geometric units: c = 1](#/lesson/phys3710.R0.1) converted masses to kilometres and microseconds; this lesson is the whole system, and where it meets quantum theory.`,
  symbols: [
    { tex: 'G', text: t`Newton’s constant, $6.6743\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$; set to 1, it turns kilograms into metres via $G/c^2$` },
    { tex: 'c', text: t`the speed of light, $299{,}792{,}458$ m/s; set to 1, it turns seconds into metres` },
    { tex: '\\hbar', text: t`the reduced Planck constant, $1.0546\times10^{-34}$ J s; with $G = c = 1$ it is an area, $\ell_P^2$` },
    { tex: '\\ell_P', text: 'the Planck length: the one length that G, c and ħ make together' },
    { tex: 'm_P', text: t`the Planck mass, about $22\ \mu\text{g}$ — or $1.22\times10^{19}$ GeV of rest energy` },
  ],
  why: 'Gravitational-wave templates, black-hole simulations and every paper on Hawking radiation are written with G = c = 1 (or ħ = G = c = 1); getting a number you can compare with a detector means putting the constants back correctly.',
  visual: {
    ...map({
      sliders: [{ key: 'm', label: t`Mass, $\log_{10}(M/\text{kg})$`, min: -30, max: 39, step: 0.1, value: -7.7, explain: 'From the electron to the largest black holes.' }],
      vlines: [{ x: 'm', color: 'gold', label: 'your mass' }],
      readouts: [
        { label: t`$M$`, expr: '10^m', digits: 3, unit: t`\text{kg}` },
        { label: t`$\log_{10}$ of the horizon radius $2GM/c^2$ in m`, expr: `m + ${r6(L2G)}`, digits: 3 },
        { label: t`$\log_{10}$ of the quantum length $\hbar/Mc$ in m`, expr: `${r6(LHC)} - m`, digits: 3 },
        { label: t`$\log_{10}$ of their ratio, $2(M/m_P)^2$`, expr: `2*m + ${r6(L2G - LHC)}`, digits: 3 },
      ],
    }),
    title: 'Where gravity meets the quantum',
    lead: t`Slide the mass from an electron to a galaxy’s black hole. The readouts give two lengths every mass carries: the radius of its horizon, $2GM/c^2$, and its quantum wavelength, $\hbar/Mc$. One grows with mass, the other shrinks; they are equal near the Planck mass, $10^{-7.7}$ kg.`,
    tasks: [
      t`At an electron’s mass the horizon radius is about $10^{-57}$ m — some $10^{44}$ times smaller than its quantum wavelength. Gravity is irrelevant to single particles.`,
      t`At the Sun’s mass the order reverses by an even larger factor: quantum fuzz is irrelevant to stars.`,
      t`Near $10^{-7.7}$ kg (the default) the two lengths are about equal: the logarithm of their ratio is near 0. Particles sit on the violet line and stars and planets far above the red one; nothing known sits at the crossing.`,
    ],
  },
  example: {
    prompt: t`A binary of two compact stars, masses $m_1$ and $m_2$ (total $M$, $\eta = m_1m_2/M^2$), separated by $r$, radiates gravitational waves with power $L = \tfrac{32}{5}\,\eta^2\,(M/r)^5$ in geometric units. Restore $G$ and $c$, and evaluate for two $${EX.m1}\,M_\odot$ neutron stars ${EX.r} km apart.`,
    visual: map({ caption: t`The map of masses and sizes. Two neutron stars a hundred kilometres apart are a system of about $3\,M_\odot$ and size $10^{5}$ m: close to the red horizon line, which is why they radiate so strongly.` }),
    steps: [
      { label: 'Count lengths', text: t`With $G = c = 1$, $M$ and $r$ are lengths, so $M/r$ and $\eta$ are pure numbers — and so is $L$: a power is dimensionless in geometric units. The formula is consistent.` },
      { label: 'Restore', text: t`Each mass becomes $GM/c^2$, and a pure-number power becomes watts when multiplied by $c^5/G = ${tex(POWER, 4)}$ W: $$L = \frac{32}{5}\,\frac{c^5}{G}\,\eta^2\left(\frac{GM}{rc^2}\right)^5 = \frac{32}{5}\,\frac{G^4}{c^5}\,\frac{(m_1m_2)^2M}{r^5}$$ — Peters’ quadrupole formula.` },
      { label: 'The pieces', text: t`$GM/c^2 = ${EX.m1 + EX.m2}\times1476.6\ \text{m} = ${nice(EX.Mg, 5)}$ m, so $GM/rc^2 = ${nice(EX.x, 4)}$; $\eta = \tfrac14$.` },
      { label: 'Numbers', text: t`$L = 6.4\times\tfrac{1}{16}\times(${nice(EX.x, 4)})^5\times${tex(POWER, 4)}\ \text{W} = ${tex(EX.L, 3)}$ W.` },
      { label: 'Sense check', text: t`That is $10^{18}$–$10^{19}$ Suns ($3.83\times10^{26}$ W each), from two objects 100 km apart — and still a small fraction of $c^5/G$, because $GM/rc^2 \approx 0.04$ enters to the fifth power. The formula is a weak-field approximation and fails as the stars touch.` },
    ],
    answer: t`$L = \tfrac{32}{5}(c^5/G)\,\eta^2(GM/rc^2)^5 \approx ${tex(EX.L, 2)}$ W.`,
  },
  practice: [
    mcq({
      id: 'angular-momentum', difficulty: 2,
      prompt: t`With $G = c = 1$, what kind of quantity is an angular momentum $J$ (SI unit $\text{kg m}^2/\text{s}$), and so what is $a = J/M$?`,
      visual: map({ caption: t`Masses become lengths with $G = c = 1$: every quantity on this map, and every other one, becomes a power of length.` }),
      choices: [t`$J$ is an area ($\text{m}^2$), so $a = J/M$ is a length`, t`$J$ is a length, so $a$ is a pure number`, t`$J$ is a pure number, so $a$ is an inverse length`, t`$J$ is a volume, so $a$ is an area`],
      answer: 0,
      why: {
        1: t`kg becomes m and s becomes m: $\text{kg m}^2/\text{s} \to \text{m}\cdot\text{m}^2/\text{m} = \text{m}^2$.`,
        2: 'Only an energy per mass, a speed or a power ends up dimensionless.',
        3: t`Count again: $\text{m}^{1 + 2 - 1} = \text{m}^2$.`,
      },
      hints: [t`Replace kg by m (factor $G/c^2$) and s by m (factor $c$).`],
      teach: 'With G = c = 1 angular momentum is an area, so a black hole’s spin parameter a = J/M is a length, and J/M² a pure number.',
      explain: t`$J$ has units of $\text{m}^2$ (conversion factor $G/c^3$), so $a = J/M$ is a length — the Kerr parameter, which must be less than $M$ for a black hole — and $\chi = J/M^2$ is a pure number, $cJ/(GM^2)$ in SI.`,
    }),
    num({
      id: 'spin', difficulty: 2,
      gen(r) {
        const [what, J, M, note] = r.pick([
          ['the Earth ($J = 5.86\\times10^{33}\\ \\text{kg m}^2/\\text{s}$, $M = 5.972\\times10^{24}$ kg)', 8.034e37 * 7.2921e-5, 5.9722e24, 'Ordinary bodies can spin “faster” than any black hole: only a black hole is limited to χ ≤ 1.'],
          ['a 716 Hz pulsar of mass $1.4\\,M_\\odot$, taking its moment of inertia as $1.0\\times10^{38}\\ \\text{kg m}^2$ ($J = I\\omega$)', 1e38 * 2 * Math.PI * 716, 1.4 * MSUN, 'Even the fastest pulsar has χ well below 1; its moment of inertia is a model value.'],
        ]);
        const ans = C * J / (G * M * M);
        return {
          prompt: t`The dimensionless spin $\chi = J/M^2$ (with $G = c = 1$) is $\chi = cJ/(GM^2)$ in SI. Find it for ${what}.`,
          visual: map({ mark: M < 1e26 ? 'Earth' : null, caption: t`The bodies on the map. A rotating black hole must have $\chi \le 1$; other bodies are not so limited.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: J / (G * M * M) * C * C, feedback: t`Check the powers: $J$ (an area) needs $G/c^3$, $M^2$ needs $(G/c^2)^2$, so $\chi = cJ/(GM^2)$ — one power of $c$.` }],
          hints: [t`$\chi = \dfrac{GJ/c^3}{(GM/c^2)^2} = \dfrac{cJ}{GM^2}$.`, t`$J = ${tex(J, 4)}\ \text{kg m}^2/\text{s}$, $M = ${tex(M, 4)}$ kg.`],
          teach: 'χ = cJ/(GM²): the geometric spin of any body; black holes must have χ ≤ 1.',
          explain: t`$\chi = ${nice(ans, 3)}$. ${note}`,
        };
      },
    }),
    expr({
      id: 'restore-tide', difficulty: 2,
      prompt: t`With $G = c = 1$, two points a distance $\ell$ apart along the radius at distance $r$ from a mass $M$ differ in gravitational acceleration by $\Delta a = 2M\ell/r^3$. Restore $G$ and $c$ so that $\Delta a$ is in $\text{m/s}^2$.`,
      visual: map({ caption: t`Mass and distance: with $G = c = 1$, $M$ is the length $GM/c^2$, and an acceleration is an inverse length that becomes SI on multiplying by $c^2$.` }),
      answer: '2 G M l/r^3', answerTeX: t`\frac{2GM\ell}{r^3}`, lhs: t`\Delta a`,
      vars: { G: [0.5, 2], M: [0.5, 3], l: [0.1, 1], r: [1, 3], c: [1.5, 3] },
      errors: [{ answer: '2 G M l/(r^3 c^2)', feedback: t`That is the acceleration as an inverse length. Multiply by $c^2$ to get $\text{m/s}^2$ — which cancels the $c^2$ in $GM/c^2$.` }],
      hints: [t`Replace $M$ by $GM/c^2$; the result is in $\text{m}^{-1}$.`, t`An acceleration in $\text{m}^{-1}$ becomes $\text{m/s}^2$ when multiplied by $c^2$.`],
      teach: 'Restore G and c in two moves: masses become GM/c², then multiply by the factor that gives the left side its SI unit.',
      explain: t`$\Delta a = c^2\cdot\dfrac{2(GM/c^2)\ell}{r^3} = \dfrac{2GM\ell}{r^3}$: Newton’s tidal acceleration, with no $c$ at all — a check that this formula is Newtonian.`,
    }),
    num({
      id: 'water-ball', difficulty: 3,
      gen(r) {
        const [what, rho] = r.pick([['water (1000 kg/m³)', 1000], ['rock (2700 kg/m³)', 2700], ['air at sea level (1.2 kg/m³)', 1.2]]);
        const R = Math.sqrt(3 * C * C / (8 * Math.PI * G * rho)), ans = R / AU;
        return {
          prompt: t`With $G = c = 1$ a density is an inverse area. A uniform ball of density $\rho$ and radius $R$ has mass $\tfrac43\pi R^3\rho$, and it lies inside its own horizon when $R \le 2M$. Restore $G$ and $c$ and find the radius at which a ball of ${what} would be a black hole, in astronomical units (1 AU $= 1.496\times10^{11}$ m).`,
          visual: map({ density: { rho, label: `constant density ${rho} kg/m³` }, caption: t`Balls of one density (gold dashed) grow as $R \propto M^{1/3}$, more slowly than the horizon line. Where they cross, the ball is a black hole. Ignores pressure, and that real matter this massive would collapse long before.` }),
          answer: ans, units: 'AU', tol: { rel: 0.005 },
          errors: [{ value: ans * Math.sqrt(2), feedback: t`Use $R = 2GM/c^2$ with $M = \tfrac43\pi R^3\rho$: $R^2 = 3c^2/(8\pi G\rho)$.` }],
          hints: [t`In geometric units $R = 2\cdot\tfrac43\pi R^3\rho$, so $R^2 = 3/(8\pi\rho)$.`, t`Restore: $\rho \to G\rho/c^2$, so $R = \sqrt{3c^2/(8\pi G\rho)}$.`],
          teach: 'A density ρ is the inverse area Gρ/c² in geometric units; 1/√(Gρ/c²) is the length at which that density curves space strongly.',
          explain: t`$R = \sqrt{3c^2/(8\pi G\rho)} = ${tex(R, 3)}$ m $= ${nice(ans, 3)}$ AU. The lower the density, the larger the ball must be — and for the mean density of the universe this length is of the order of the Hubble radius.`,
        };
      },
    }),
    num({
      id: 'planck-energy', difficulty: 2,
      prompt: t`Planck units set $\hbar = c = G = 1$, so the Planck mass $m_P = \sqrt{\hbar c/G}$ has rest energy $m_Pc^2 = \sqrt{\hbar c^5/G}$. What is that in GeV? ($\hbar = 1.054572\times10^{-34}$ J s, $1\ \text{GeV} = 1.602177\times10^{-10}$ J.)`,
      visual: map({ mark: 'Planck mass' }),
      answer: MPL * C * C / EV / 1e9, units: 'GeV', tol: { rel: 0.003 },
      errors: [{ value: MPL / EV / 1e9, feedback: t`That is the mass in kg converted as if it were joules. Multiply by $c^2$ first.` }],
      hints: [t`$m_P = \sqrt{\hbar c/G} = ${tex(MPL, 4)}$ kg.`, t`$m_Pc^2$ in joules, then divide by $1.602\times10^{-10}$ J/GeV.`],
      teach: 'The Planck energy is about 1.22 × 10¹⁹ GeV, a million billion times beyond the LHC.',
      explain: t`$m_Pc^2 = ${tex(MPL * C * C, 4)}$ J $= ${tex(MPL * C * C / EV / 1e9, 4)}$ GeV, about $10^{15}$ times an LHC collision. Quantum effects of gravity should become strong near this energy; none has been observed.`,
    }),
    num({
      id: 'hawking', difficulty: 3,
      gen(r) {
        const [what, Ms] = r.pick([['a black hole of one solar mass', 1], ['a 10-solar-mass black hole', 10], ['Sagittarius A* ($4.3\\times10^{6}\\,M_\\odot$)', 4.3e6]]);
        const T = HBAR * C ** 3 / (8 * Math.PI * G * Ms * MSUN * KB);
        return {
          prompt: t`In Planck units ($\hbar = c = G = k_B = 1$) Hawking’s temperature of a black hole is $T = 1/(8\pi M)$. Restore the constants — a temperature times $k_B$ is an energy — and find $T$ for ${what}, in kelvin. ($k_B = 1.380649\times10^{-23}$ J/K, $M_\odot = 1.989\times10^{30}$ kg.)`,
          visual: map({ mark: Ms > 1e5 ? 'Sgr A* (horizon)' : null, caption: t`Black holes sit on the red horizon line, far above the quantum line: their Hawking temperature is tiny.` }),
          answer: T, units: 'K', tol: { rel: 0.005 },
          errors: [{ value: T * 8 * Math.PI, feedback: t`Keep the $8\pi$: $T = \hbar c^3/(8\pi G M k_B)$.` }],
          hints: [t`$k_BT$ is an energy; $\hbar c^3/(GM)$ is the combination with energy units.`, t`$T = \dfrac{\hbar c^3}{8\pi G M k_B}$.`],
          teach: t`Restoring $\hbar$, $c$, $G$ and $k_B$: $T_H = \hbar c^3/(8\pi GMk_B)$, about $6\times10^{-8}$ K for a solar mass.`,
          explain: t`$T = \hbar c^3/(8\pi GMk_B) = ${tex(T, 3)}$ K — far colder than the $2.7$ K cosmic microwave background, so such a hole absorbs more than it radiates. Hawking radiation is a derived prediction of quantum fields on curved spacetime; it has never been observed from a real black hole.`,
        };
      },
    }),
    mcq({
      id: 'isco-freq', difficulty: 2,
      prompt: t`With $G = c = 1$ the orbital angular frequency at the innermost stable circular orbit of a non-spinning black hole is $\Omega = 1/(6^{3/2}M)$. Which is the SI form?`,
      visual: map({ caption: t`Black holes on the horizon line: their time scales are their masses, $GM/c^3$.` }),
      choices: [t`$\Omega = \dfrac{c^3}{6^{3/2}\,GM}$`, t`$\Omega = \dfrac{c^2}{6^{3/2}\,GM}$`, t`$\Omega = \dfrac{1}{6^{3/2}\,GM}$`, t`$\Omega = \dfrac{c}{6^{3/2}\,GM}$`],
      answer: 0,
      why: {
        1: t`$GM/c^2$ is a length; $c^2/GM$ has units of $\text{m}^{-1}$, not $\text{s}^{-1}$.`,
        2: t`$1/(GM)$ has units $\text{s}^2/\text{m}^3$: put the $c$’s back.`,
        3: t`$c/(GM)$ has units $\text{s}/\text{m}^2$.`,
      },
      hints: [t`A frequency is $1/\text{time}$; a mass as a time is $GM/c^3$.`],
      teach: 'A time in geometric units is GM/c³ in SI when it comes from a mass; a frequency is its inverse.',
      explain: t`$\Omega = 1/(6^{3/2}\,GM/c^3) = c^3/(6^{3/2}GM)$. For $10\,M_\odot$ that is $${nice(C ** 3 / (6 ** 1.5 * G * 10 * MSUN), 4)}$ rad/s, an orbital frequency of $${nice(C ** 3 / (6 ** 1.5 * G * 10 * MSUN) / (2 * Math.PI), 3)}$ Hz.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bbh', difficulty: 3, transfer: true,
      gen(r) {
        const [m1, m2, rkm] = r.pick([[30, 30, 1000], [36, 29, 800], [10, 10, 400]]);
        const ans = gwPower(m1, m2, rkm);
        return {
          prompt: t`Two black holes of $${m1}\,M_\odot$ and $${m2}\,M_\odot$ orbit ${rkm} km apart. Using the restored quadrupole formula $L = \tfrac{32}{5}\,(c^5/G)\,\eta^2\,(GM/rc^2)^5$, with $\eta = m_1m_2/M^2$, $GM_\odot/c^2 = 1476.6$ m and $c^5/G = 3.628\times10^{52}$ W, what power do they radiate, in watts?`,
          visual: map({ mark: 'Sgr A* (horizon)', caption: t`Stellar-mass black holes lie on the horizon line far below Sagittarius A*. A pair a few hundred kilometres apart is in its final second before merging.` }),
          answer: ans, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: ans / (m1 * m2 / (m1 + m2) ** 2), feedback: t`$\eta$ enters squared.` }],
          hints: [t`$M = ${m1 + m2}\,M_\odot$, so $GM/c^2 = ${nice((m1 + m2) * 1476.6, 5)}$ m and $GM/rc^2 = ${nice((m1 + m2) * 1476.6 / (rkm * 1e3), 4)}$.`, t`$\eta = ${nice(m1 * m2 / (m1 + m2) ** 2, 4)}$; multiply $6.4\,\eta^2(GM/rc^2)^5$ by $3.628\times10^{52}$ W.`],
          teach: 'Restored formulas carry c⁵/G for power and GM/c² for every mass: evaluate the dimensionless pieces first.',
          explain: t`$L = ${tex(ans, 3)}$ W. For these last orbits a binary black hole outshines all the stars in the observable universe — in gravitational waves, which only detectors like LIGO can see. Near merger the quadrupole formula is only an estimate.`,
        };
      },
    }),
    num({
      id: 'cp-cmb-hole', difficulty: 3, transfer: true,
      prompt: t`A black hole colder than the cosmic microwave background ($T = 2.725$ K) absorbs more radiation than it emits. Using $T = \hbar c^3/(8\pi GMk_B)$, what mass has a Hawking temperature of exactly 2.725 K, in kg? (Compare the Moon, $7.35\times10^{22}$ kg.)`,
      visual: map({ caption: t`The red horizon line: a black hole’s temperature rises as its mass falls, as $1/M$.` }),
      answer: HBAR * C ** 3 / (8 * Math.PI * G * KB * 2.725), units: 'kg', tol: { rel: 0.005 },
      errors: [{ value: HBAR * C ** 3 / (G * KB * 2.725), feedback: t`Keep the $8\pi$ in the denominator.` }],
      hints: [t`Solve for $M$: $M = \hbar c^3/(8\pi Gk_BT)$.`, t`$\hbar c^3 = ${tex(HBAR * C ** 3, 4)}$ and $8\pi Gk_B T = ${tex(8 * Math.PI * G * KB * 2.725, 4)}$ in SI.`],
      teach: 'Only black holes lighter than about half a Moon are hotter than today’s universe — if any exist.',
      explain: t`$M = ${tex(HBAR * C ** 3 / (8 * Math.PI * G * KB * 2.725), 3)}$ kg, about 0.6 Moon masses. Every black hole formed from a star is far heavier, so it is colder than the sky and growing, not evaporating. Lighter, primordial black holes are allowed by the mathematics; none has been found.`,
    }),
    mcq({
      id: 'cp-hbar-area', difficulty: 2,
      prompt: t`A paper uses $G = c = 1$ but keeps $\hbar$. In those units, what is $\hbar$?`,
      visual: map({ mark: 'Planck mass', caption: t`The Planck point, where the two lines cross: the scale set by $\hbar$ once $G = c = 1$.` }),
      choices: [t`An area: $\ell_P^2 = \hbar G/c^3 = 2.6\times10^{-70}\ \text{m}^2$`, t`A length: $\ell_P = 1.6\times10^{-35}$ m`, t`A pure number, $1.05\times10^{-34}$`, t`A mass: $m_P = 2.2\times10^{-8}$ kg`],
      answer: 0,
      why: {
        1: t`J s $= \text{kg m}^2/\text{s} \to \text{m}\cdot\text{m}^2/\text{m} = \text{m}^2$: an area, the Planck length squared.`,
        2: 'Its SI value is a number only in SI units; in geometric units it carries a unit, m².',
        3: 'With G = c = 1 a mass is a length, and ħ has the units of mass times length.',
      },
      hints: [t`$\hbar$ is in J s $= \text{kg m}^2/\text{s}$. Replace kg by m and s by m.`],
      teach: t`With $G = c = 1$, $\hbar$ is an area, $\ell_P^2$; Planck units set even that to 1.`,
      explain: t`$\hbar \to \hbar G/c^3 = ${tex(LP * LP, 3)}\ \text{m}^2 = \ell_P^2$. Setting it to 1 as well leaves no units at all: every quantity becomes a pure number in Planck units.`,
    }),
  ],
  sources: [
    { label: 'CODATA 2018: G, ħ, c, k_B; Planck length, mass and time', url: 'https://physics.nist.gov/cuu/Constants/' },
    { label: 'Wald, General Relativity (1984), Appendix F (units and dimensions)', url: 'https://press.uchicago.edu/ucp/books/book/chicago/G/bo5952261.html' },
    { label: 'Peters & Mathews (1963), Gravitational radiation from point masses in a Keplerian orbit, Phys. Rev. 131, 435', url: 'https://doi.org/10.1103/PhysRev.131.435' },
    { label: 'Hawking (1975), Particle creation by black holes, Commun. Math. Phys. 43, 199', url: 'https://doi.org/10.1007/BF02345020' },
  ],
});
