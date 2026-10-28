// Dimensional analysis and scaling as research tools: the Buckingham π count
// (with the rank of the dimension matrix, not the number of base units),
// collapsing data onto one curve, similarity between a model and the real
// thing, scaling laws across masses (ISCO frequency, Schwarzschild radius),
// and the exaggerate-and-extrapolate technique for Mercury's perihelion,
// with values computed by this course's own RK4 integration of the R4.1
// model (4 000 steps per orbit; see the comment at EXAG).
import { lesson, mcq, num } from '../../src/core/content.js';
import { SRC } from './_rs.js';

const t = String.raw;
const L10 = Math.log10;
const G = 6.6743e-11, C = 299792458, MSUN = 1.98847e30;
const FISCO1 = C ** 3 / (6 ** 1.5 * Math.PI * G * MSUN);           // Hz for 1 M☉
const RS1 = 2 * G * MSUN / C ** 2 / 1000;                            // km for 1 M☉

// Mercury's advance per orbit divided by λ, in arcsec, from RK4 integration of
// r'' = −r/r³ (1 + 3λδL²/r²) with δ = 2.5499×10⁻⁸, e = 0.20563 (4 000 steps per
// orbit, perihelia located by bisection on r·v, averaged over 4 orbits).
// The first-order formula 6πδ/(1 − e²) gives 0.1035174″.
const EXAG = [[10, 0.10351766], [100, 0.10351947], [1000, 0.1035382], [3000, 0.10357987], [10000, 0.10372604], [30000, 0.10414632]];
const FORMULA = 0.1035174;
const SLOPE = (0.10357987 - 0.1035382) / 2000;   // per unit λ, from the two runs nearest the linear regime

const exagPic = (caption, { fit = true } = {}) => ({
  type: 'graph',
  params: {
    x: [0.7, 4.7], y: [0.1034, 0.1043], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'exaggeration λ', ylabel: 'advance ÷ λ (arcsec/orbit)', xticks: 4, yticks: 4,
    curves: fit ? [{ fn: `${FORMULA} + ${SLOPE.toExponential(4)}*10^x`, color: 'accent', dash: [6, 4] }] : [],
    hlines: [{ y: FORMULA, label: 'first-order formula', color: 'gold' }],
    points: EXAG.map(([l, v]) => ({ x: +L10(l).toFixed(4), y: v, color: 'accent', r: 4.5 })),
  },
  caption,
});

// little pictures for the π-count cases
const PICS = {
  pendulum: { type: 'graph', params: { x: [0, 95], y: [0.98, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'amplitude θ₀ (degrees)', ylabel: 'T ÷ 2π√(L/g)', xticks: 5, yticks: 4, curves: [{ fn: '1 + (x*pi/180)^2/16 + 11*(x*pi/180)^4/3072', domain: [0, 90], color: 'accent' }] }, caption: 'Every pendulum, any length, any g, any mass, on one curve (series to fourth order; it is 0.3% low at 90°).' },
  isco: { type: 'graph', params: { x: [0, 7], y: [-4, 4], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'mass (solar masses)', ylabel: 'GW frequency at ISCO (Hz)', xticks: 7, yticks: 4, curves: [{ fn: `${L10(FISCO1).toFixed(4)} - x`, color: 'accent' }] }, caption: 'One straight line of slope −1 on log–log axes: f ∝ 1/M.' },
  rs: { type: 'graph', params: { x: [0, 12], y: [0, 38], aspect: 'wide', axesAt: 'edge', xlabel: 'mass (solar masses)', ylabel: 'Schwarzschild radius (km)', xticks: 6, yticks: 4, curves: [{ fn: `${RS1.toFixed(4)}*x`, color: 'accent' }] }, caption: 'The Schwarzschild radius grows in proportion to the mass.' },
  wave: { type: 'graph', params: { x: [0, 200], y: [0, 20], aspect: 'wide', axesAt: 'edge', xlabel: 'wavelength (m)', ylabel: 'speed (m/s)', xticks: 4, yticks: 4, curves: [{ fn: 'sqrt(9.81*x/(2*pi))', color: 'accent' }] }, caption: 'Deep-water waves: speed rises as the square root of wavelength.' },
};
const CASES = [
  { key: 'pendulum', what: t`a pendulum’s period $T$, which might depend on its length $L$, the gravitational acceleration $g$, the bob’s mass $m$ and the amplitude $\theta_0$`, n: 5, k: 3, groups: t`$T\sqrt{g/L}$ and $\theta_0$ (no group can contain $m$, so the period cannot depend on it)` },
  { key: 'isco', what: t`the gravitational-wave frequency $f$ at a binary’s innermost stable circular orbit, which might depend on $G$, the total mass $M$ and $c$`, n: 4, k: 3, groups: t`$fGM/c^3$ alone — so $fGM/c^3$ is a constant and $f \propto 1/M$` },
  { key: 'rs', what: t`the radius $r$ of a black hole’s horizon, which might depend on $G$, its mass $M$ and $c$`, n: 4, k: 3, groups: t`$rc^2/(GM)$ alone — so $r \propto GM/c^2$` },
  { key: 'wave', what: t`the speed $v$ of deep-water waves, which might depend on their wavelength $\lambda$ and the gravitational acceleration $g$`, n: 3, k: 2, groups: t`$v/\sqrt{g\lambda}$ alone — so $v \propto \sqrt{g\lambda}$` },
];

export default lesson({
  id: 'research.R4.2',
  title: 'Dimensional analysis and scaling as research tools',
  minutes: 14, difficulty: 3,
  intro: t`Before you compute anything, dimensions tell you **which combinations** of your inputs the answer can depend on. The Buckingham π theorem counts them: a relation among $n$ quantities whose dimensions involve $k$ independent combinations of base units can be rewritten as a relation among

$$N_\pi = n - k$$

dimensionless groups. A researcher uses this in four ways: to **shrink the parameter space** before simulating (sweep $N_\pi$ groups, not $n$ variables); to **collapse data** from different set-ups onto one curve, which is a test as well as a summary; to make a small model **similar** to the real thing by matching its groups; and to **predict how results scale** — which is what makes it safe to exaggerate a tiny effect and scale it back.`,
  symbols: [
    { tex: 'n', text: 'the number of quantities in the relation, the answer included' },
    { tex: 'k', text: 'the rank of their dimension matrix: how many independent combinations of mass, length, time (…) they involve — usually, but not always, the number of base units that appear' },
    { tex: 'N_\\pi', text: 'the number of independent dimensionless groups the answer can depend on' },
  ],
  why: t`A simulation run is expensive; dimensional analysis tells you which runs are really different before you pay for them.`,
  visual: {
    ...exagPic('Computed with this course’s own model (R4.1): RK4, 4 000 steps per orbit, perihelia averaged over 4 orbits. Gold: the first-order formula 6πGM/(c²a(1 − e²)). Dashed: a straight-line fit in λ through the runs at 1000 and 3000.'),
    title: 'Exaggerate, then scale back',
    lead: t`Mercury’s GR advance per orbit is $0.1035''$ — hard to resolve numerically. Multiply the GR term by $\lambda$, integrate, and divide the advance by $\lambda$. Dimensional analysis says the advance depends only on $\delta = GM/(c^2a)$ and $e$, and to first order is proportional to $\delta$ — so the points should lie on the gold line. Do they?`,
    tasks: ['Up to λ ≈ 1000 the points sit on the formula to 0.02%: the scaling holds.', 'By λ = 30 000 the advance per λ is 0.6% high: second-order terms in λδ have appeared.', 'The dashed line, extended back to λ → 0, lands on the gold line: extrapolation removes the second-order bias.'],
  },
  example: {
    prompt: t`Use dimensional analysis to explain why the exaggerate-and-extrapolate method works for Mercury’s perihelion, and how to check it.`,
    visual: exagPic('The computed advance per λ against λ (log axis), the first-order formula (gold) and a straight-line fit in λ (dashed).'),
    steps: [
      { label: 'List the quantities', text: t`The advance per orbit $\Delta\phi$ (an angle: dimensionless), $GM$ ($\text{m}^3\,\text{s}^{-2}$), $c$ (m/s), $a$ (m), and $e$ (dimensionless): $n = 5$. Only length and time appear, so $k = 2$.` },
      { label: 'Form the groups', text: t`$N_\pi = 5 - 2 = 3$: $\Delta\phi$, $e$, and $\delta = GM/(c^2 a)$. So $\Delta\phi = F(\delta, e)$ — the orbit’s size and the Sun’s mass enter only through $\delta$.` },
      { label: 'Weak field', text: t`For Mercury $\delta = 2.55\times10^{-8}$. Expanding, $F = \delta\,f_1(e) + \delta^2 f_2(e) + \dots$, and GR gives $f_1 = 6\pi/(1 - e^2)$. Exaggerating the GR term by $\lambda$ replaces $\delta$ by $\lambda\delta$ in the correction, so $\Delta\phi/\lambda = \delta f_1 + \lambda\delta^2 f_2 + \dots$` },
      { label: 'Check the scaling', text: t`So $\Delta\phi/\lambda$ should be flat in $\lambda$, with a small linear rise. The computed points do exactly that: $0.103\,52''$ at $\lambda = 10$, $0.103\,54''$ at 1000, $0.104\,15''$ at 30 000.` },
      { label: 'Extrapolate', text: t`A straight line in $\lambda$ through the runs at 1000 and 3000 meets $\lambda = 0$ at $${(0.1035382 - 1000 * SLOPE).toFixed(7)}''$; the formula gives $${FORMULA}''$. The method works — **because** the check was made, not because it was assumed.` },
    ],
    answer: t`$\Delta\phi = F(GM/c^2a, e)$, linear in $\delta$ at leading order, so $\Delta\phi/\lambda$ is constant until $\lambda\delta$ grows; the runs confirm it, and a linear extrapolation to $\lambda \to 0$ recovers $${FORMULA}''$ per orbit.`,
  },
  practice: [
    num({
      id: 'pi-count', difficulty: 2,
      gen(r) {
        const c = r.pick(CASES);
        return {
          prompt: t`How many independent dimensionless groups can describe ${c.what}?`,
          visual: PICS[c.key],
          answer: c.n - c.k, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: c.n, feedback: 'That is the number of quantities. Subtract the number of independent dimensions.' }, { value: c.n - c.k + 1, feedback: 'Count the independent dimensions again: every base unit that appears counts once.' }].filter((e) => e.value !== c.n - c.k),
          hints: [t`Count the quantities (the answer included): $n = ${c.n}$.`, t`Count the base units that appear: $k = ${c.k}$. Then $N_\pi = n - k$.`],
          teach: 'Buckingham π: n quantities with k independent dimensions make n − k dimensionless groups.',
          explain: t`$N_\pi = ${c.n} - ${c.k} = ${c.n - c.k}$: ${c.groups}.`,
        };
      },
    }),
    num({
      id: 'isco', difficulty: 2,
      gen(r) {
        const M = r.pick([10, 20, 65, 150]);
        const ans = FISCO1 / M;
        return {
          prompt: t`Dimensional analysis gives $f \propto c^3/(GM)$ for the gravitational-wave frequency at the innermost stable circular orbit, and for a total mass of $1\,M_\odot$ it is $${FISCO1.toFixed(0)}$ Hz (from $f = c^3/(6^{3/2}\pi GM)$). What is it for a binary of total mass $${M}\,M_\odot$?`,
          visual: PICS.isco,
          answer: ans, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: FISCO1 * M, feedback: 'The frequency falls as the mass grows: f ∝ 1/M.' }, { value: FISCO1 / Math.sqrt(M), feedback: 'The scaling is 1/M, not 1/√M.' }],
          hints: ['A scaling law lets you skip every constant: compare with the 1 M☉ case.', t`$f = ${FISCO1.toFixed(0)}\ \text{Hz} \times (1/${M})$.`],
          teach: 'Once a result scales as a power of one variable, one computed case gives all the others.',
          explain: t`$${FISCO1.toFixed(0)}/${M} = ${ans.toFixed(0)}$ Hz.${M >= 65 ? ' Heavier binaries merge at lower frequency — GW150914 ended near the bottom of LIGO’s sensitive band.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'why-works', difficulty: 3,
      prompt: t`Why is it legitimate to multiply Mercury’s GR term by $\lambda = 1000$, measure the advance, and divide by 1000?`,
      visual: exagPic('The computed advance per λ: flat until λ is large.', { fit: false }),
      choices: [
        t`The advance depends on the physics only through $\lambda\delta$ and, while $\lambda\delta \ll 1$, is proportional to it — and the runs at several $\lambda$ confirm the proportionality`,
        'Because numerical errors cancel when you divide by λ',
        'Because GR is a linear theory',
        'Because the result is checked against the formula anyway, so the method does not matter',
      ],
      answer: 0,
      why: { 1: 'Dividing by λ scales errors too; the method works because the physics scales, and the errors shrink relative to a larger effect.', 2: 'GR is nonlinear; only its leading weak-field correction is linear in δ.', 3: 'The point of a numerical test is to be independent of the formula; the method must be justified on its own.' },
      hints: ['Which dimensionless group carries the relativistic effect?', 'What is the leading term of the advance in that group?'],
      teach: 'Exaggerating a small effect is safe when a scaling law says how it scales — and runs at several strengths confirm it.',
      explain: t`$\Delta\phi = F(\lambda\delta, e) \approx \lambda\delta\,f_1(e)$ while $\lambda\delta \ll 1$ (here $\lambda\delta = 2.6\times10^{-5}$). Runs at several $\lambda$ check that the advance per $\lambda$ is flat — the computed points deviate by only 0.02% at $\lambda = 1000$.`,
    }),
    num({
      id: 'extrapolate', difficulty: 3,
      gen(r) {
        const pairs = [[1000, 3000], [3000, 10000], [1000, 10000]];
        const [l1, l2] = r.pick(pairs);
        const v1 = EXAG.find((p) => p[0] === l1)[1], v2 = EXAG.find((p) => p[0] === l2)[1];
        const b = (v2 - v1) / (l2 - l1), ans = v1 - b * l1;
        return {
          prompt: t`Exaggerated runs give an advance per $\lambda$ of $${v1}''$ at $\lambda = ${l1}$ and $${v2}''$ at $\lambda = ${l2}$ (per orbit). Assuming it varies linearly with $\lambda$, extrapolate to $\lambda = 0$. Give 7 significant figures.`,
          visual: exagPic('The computed runs (blue) and the first-order formula (gold).', { fit: false }),
          answer: ans, units: 'arcsec', tol: { rel: 2e-6 },
          errors: [{ value: v1, feedback: 'That is the λ = ' + l1 + ' run itself; extrapolate the trend back to λ = 0.' }],
          hints: [t`Slope $b = (${v2} - ${v1})/(${l2} - ${l1})$ per unit $\lambda$.`, t`Intercept $= ${v1} - b \times ${l1}$.`],
          teach: 'When an exaggerated result has a known form in the exaggeration parameter, a fit in that parameter removes the bias.',
          explain: t`$b = ${b.toExponential(4).replace(/e(-?\d+)/, '\\times10^{$1}')}$, so the intercept is $${ans.toFixed(7)}''$, against the formula’s $${FORMULA}''$ — agreement to ${Math.abs(ans - FORMULA) / FORMULA < 1e-6 ? 'better than one part in a million' : `${(1e6 * Math.abs(ans - FORMULA) / FORMULA).toFixed(0)} parts per million`}.`,
        };
      },
    }),
    mcq({
      id: 'collapse', difficulty: 2,
      prompt: t`You time pendulums of lengths 0.5 m, 1 m and 2 m on Earth and on the Moon, at amplitudes from 5° to 90°. Which plot should put **all** the data on one curve?`,
      visual: PICS.pendulum,
      choices: [t`$T\sqrt{g/L}$ against $\theta_0$`, t`$T$ against $\theta_0$`, t`$T$ against $L$`, t`$T/L$ against $g$`],
      answer: 0,
      why: { 1: 'Different lengths and different g give different periods at the same amplitude.', 2: 'Different amplitudes and g scatter the points.', 3: t`$T/L$ is not dimensionless; it still depends on how you chose the units, and on $\theta_0$.` },
      hints: ['Find the dimensionless groups first.', t`From $T$, $L$, $g$, $m$, $\theta_0$: the groups are $T\sqrt{g/L}$ and $\theta_0$.`],
      teach: 'Plot dimensionless group against dimensionless group and every set-up falls on one curve — if your list of variables was complete.',
      explain: t`$T\sqrt{g/L} = F(\theta_0)$. If some points refuse to collapse, a variable is missing from the list (air drag, a heavy string) — the collapse is a test, not just a tidy plot.`,
    }),
    num({
      id: 'similarity', difficulty: 3,
      gen(r) {
        const s = r.pick([4, 5, 8, 10]), v = r.pick([20, 30, 40]);
        const ans = s * v;
        return {
          prompt: t`A nozzle’s flow is to be studied at $1/${s}$ scale in the same gas at the same temperature and pressure. Matching the Reynolds number $\text{Re} = \rho v D/\mu$ requires what flow speed in the model, if the full-size flow runs at $${v}$ m/s?`,
          visual: { type: 'graph', params: { x: [0, ans * 1.2], y: [0, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'flow speed (m/s)', ylabel: 'Re ÷ Re (full size)', xticks: 5, yticks: 4, curves: [{ fn: `x/${v}`, color: 'gold', label: 'full size', labelAt: v * 0.9, labelDx: -60 }, { fn: `x/${s * v}`, color: 'accent', label: `1/${s} model`, labelAt: ans * 0.9, labelDx: -70, labelDy: 14 }], hlines: [{ y: 1, color: 'ink3' }] }, caption: 'Reynolds number against speed for the two sizes, as a fraction of the full-size value at its design speed.' },
          answer: ans, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: v / s, feedback: 'A smaller model needs a higher speed to keep ρvD/μ fixed.' }, { value: v, feedback: 'At the same speed, the model’s Re is smaller by the scale factor.' }],
          hints: [t`$\rho$ and $\mu$ are unchanged, so $vD$ must stay the same.`, t`$D$ shrinks by $${s}$, so $v$ must grow by $${s}$.`],
          teach: 'Similarity: match the dimensionless groups and the model behaves like the real thing.',
          explain: t`$v_{\text{model}} = ${s} \times ${v} = ${ans}$ m/s. Often you cannot match every group at once — here the Mach number would rise ${s}-fold — and choosing which group to match is a research decision you must report.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      prompt: t`A rocket nozzle’s thrust $F$ may depend on the chamber pressure $p_c$, the throat area $A_t$, the ambient pressure $p_a$, the ratio of specific heats $\gamma$ and the area ratio $\varepsilon$. How many independent dimensionless groups describe it? (Careful: count independent dimensions — force and pressure differ by exactly an area.)`,
      visual: { type: 'graph', params: { x: [0, 10], y: [-3.3, 3.3], aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['t', '1.6 - 1.0*exp(-((t - 4)^2)/1.2) + 0.25*step(t - 4)*(t - 4)'], t: [0.5, 9.5], color: 'accent' }, { param: ['t', '-(1.6 - 1.0*exp(-((t - 4)^2)/1.2) + 0.25*step(t - 4)*(t - 4))'], t: [0.5, 9.5], color: 'accent' }], points: [{ x: 1.5, y: 0, r: 0, label: 'chamber: pc', color: 'ink', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 4, y: 0, r: 0, label: 'throat: At', color: 'ink', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 8.2, y: 0, r: 0, label: 'exit: ε = Ae/At', color: 'ink', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 9.8, y: -3.05, r: 0, label: 'ambient pa', color: 'ink2', labelAlign: 'right', labelDx: 0, labelDy: 0 }] }, caption: 'A schematic converging–diverging nozzle (shape not to scale).' },
      answer: 4, tol: { rel: 0, abs: 0.1 },
      errors: [{ value: 3, feedback: 'Mass, length and time all appear, but F, p and A are not independent: F/(pA) is already dimensionless. The dimension matrix has rank 2.' }, { value: 6, feedback: 'That is the number of quantities; subtract the rank of their dimension matrix.' }],
      hints: [t`Quantities: $F$, $p_c$, $A_t$, $p_a$, $\gamma$, $\varepsilon$ — so $n = 6$.`, t`$[F] = \text{M L T}^{-2}$, $[p] = \text{M L}^{-1}\text{T}^{-2}$, $[A] = \text{L}^2$: since $[F] = [p][A]$, only two combinations are independent, $k = 2$.`],
      teach: 'k is the rank of the dimension matrix: count independent combinations, not base units.',
      explain: t`$N_\pi = 6 - 2 = 4$: the thrust coefficient $C_F = F/(p_c A_t)$, and $p_a/p_c$, $\gamma$, $\varepsilon$. Rocket engineers indeed tabulate $C_F(\gamma, \varepsilon, p_a/p_c)$ — one chart for every engine size.`,
    }),
    num({
      id: 'cp-rs', difficulty: 2,
      gen(r) {
        const opts = [[4.3e6, 'Sagittarius A*, the Milky Way’s central black hole (about 4.3 million solar masses)'], [6.5e9, 'M87*, imaged by the Event Horizon Telescope (about 6.5 billion solar masses)'], [62, 'the remnant of GW150914 (about 62 solar masses)']];
        const [M, what] = r.pick(opts);
        const ans = RS1 * M;
        return {
          prompt: t`The Schwarzschild radius scales as $r_s = 2GM/c^2$, which is $${RS1.toFixed(3)}$ km for one solar mass. What is it, in km, for ${what}?`,
          visual: PICS.rs,
          answer: ans, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: RS1 / M, feedback: 'The radius grows with mass: multiply.' }],
          hints: [t`$r_s \propto M$: multiply the one-solar-mass value by the mass in solar masses.`],
          teach: 'A linear scaling law turns one computed case into all of them.',
          explain: t`$${RS1.toFixed(3)} \times ${M >= 1e5 ? `${(M / 10 ** Math.floor(L10(M))).toFixed(1)}\\times10^{${Math.floor(L10(M))}}` : M} = ${ans >= 1e5 ? `${(ans / 10 ** Math.floor(L10(ans))).toFixed(2)}\\times10^{${Math.floor(L10(ans))}}` : ans.toFixed(0)}$ km.`,
        };
      },
    }),
    mcq({
      id: 'cp-too-far', difficulty: 3,
      prompt: t`A student exaggerates Mercury’s GR term by $\lambda = 10^{5}$ and divides the advance by $10^{5}$, getting a value about 2% above the formula. What went wrong?`,
      visual: exagPic('The computed advance per λ rises with λ once λδ is no longer tiny.', { fit: false }),
      choices: [
        t`At $\lambda\delta \approx 2.5\times10^{-3}$, second-order terms matter; the linear scaling no longer holds, so the runs must stay at smaller $\lambda$ or be extrapolated`,
        'The integrator has a bug, since the formula is exact',
        'Exaggeration never works; only λ = 1 is meaningful',
        'The answer is right, and the formula is 2% wrong',
      ],
      answer: 0,
      why: { 1: 'The formula is first order in δ; it is the exaggerated run that has left the regime where first order suffices.', 2: 'The runs at λ ≤ 1000 match to 0.02%; it works inside its range.', 3: 'For real Mercury, λδ = 2.5 × 10⁻⁸ and the formula is excellent.' },
      hints: ['Which dimensionless number decides whether the first-order term dominates?', 'Compute λδ.'],
      teach: 'A scaling argument has a range of validity set by a dimensionless group; check where you are in it.',
      explain: t`With $\lambda = 10^5$, $\lambda\delta = 2.5\times10^{-3}$, and the computed trend (about $2\times10^{-7}$ relative excess per unit $\lambda$) predicts roughly 2% — exactly the student’s excess. Use smaller $\lambda$, or several values and an extrapolation.`,
    }),
  ],
  sources: [SRC.will,
    { label: 'E. Buckingham, “On physically similar systems; illustrations of the use of dimensional equations”, Phys. Rev. 4, 345 (1914)', url: 'https://doi.org/10.1103/PhysRev.4.345' },
    { label: 'G. P. Sutton & O. Biblarz, Rocket Propulsion Elements, 9th ed. (Wiley, 2017), ch. 3 (thrust coefficient)', url: 'https://www.wiley.com/en-us/Rocket+Propulsion+Elements%2C+9th+Edition-p-9781118753910' }],
});
