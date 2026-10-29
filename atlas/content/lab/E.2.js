// Millikan's oil drop — the lab view: drops timed falling under gravity and
// rising in a field; radius and charge from the two speeds with Stokes's
// drag law and Cunningham's slip correction (the real systematic: without it
// small drops read high by (1 + b/pa)^{3/2}); charges assigned whole numbers
// by a scan over e (and the trap at e/2); e from the slope of q against n;
// Millikan's own extrapolation, (q/n)^{2/3} against 1/(pa); his 1913 value
// against CODATA and the viscosity behind the difference. A stratospheric
// aerosol's settling speed as the transfer. Every number is computed from
// the seeded model the labe-rig simulation draws with (_labe.js).
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, tex, table, SIMNOTE, SRC } from './_labe.js';
import { compare } from '../phys2210/_lab.js';

const t = String.raw;
const P0 = M.EXPERIMENTS.millikan.defaults;
const E0 = P0.V / P0.d;                          // V/m
const e = M.K.e;
const um = (x) => (x * 1e6).toFixed(3);

// Millikan 1913: e = (4.774 ± 0.009)×10⁻¹⁰ esu; 1 esu (statcoulomb) = 1/(10 c[m/s]) C = 3.3356×10⁻¹⁰ C
const ESU = 1 / (10 * M.K.c);
const MIL = { v: 4.774e-10 * ESU, s: 0.009e-10 * ESU };

// ── the worked example: the run with seed 4; its second drop analysed in full ──
const EX = M.run('millikan', { seed: 4 });
const D = EX.R[1];
const vf = P0.s / D.tf, vr = P0.s / D.tr;
const a0 = Math.sqrt((9 * P0.eta * vf) / (2 * P0.rho * P0.g));
const a1 = a0 / Math.sqrt(M.slip(P0, a0));
const Cfin = M.slip(P0, D.aC);
const Dn = EX.d.x[1];
const eFit = EX.results[0];

/** One seeded drop: its reading (rows give the same drop to the rig's raw view). */
const drop = (seed) => M.readRows('millikan', M.makeRows('millikan', { seed, settings: [null] }))[0];

export default lesson({
  id: 'lab.E.2',
  title: 'Millikan’s oil drop',
  minutes: 20, difficulty: 3,
  lab: true,
  intro: t`Between 1909 and 1913 Robert Millikan timed single oil drops a micrometre across as they fell under gravity between two plates, then rose when a field pulled on their charge. At its terminal speed a drop’s weight balances the drag of the air, so the fall speed $v_f$ gives its radius; the rise speed $v_r$ in the field $E$ then gives its charge. Every charge came out a whole multiple of one number, $e$. **The drag law is the hidden systematic**: drops this small slip between air molecules, and Stokes’s law has to be divided by Cunningham’s factor $1 + b/pa$.`,
  equation: t`q = \frac{6\pi\eta a\,(v_f + v_r)}{E\,(1 + b/pa)}, \qquad a = \sqrt{\frac{9\eta v_f}{2\rho g\,(1 + b/pa)}}`,
  symbols: [
    { tex: 'q', text: 'the drop’s charge, in C — a whole number $n$ times $e$' },
    { tex: '\\eta', text: 'the viscosity of air, in Pa s ($1.83\\times10^{-5}$ Pa s near 23 °C; it rises about 0.26% per kelvin)' },
    { tex: 'a', text: 'the drop’s radius, in m — about 0.4 to 0.8 μm here, far too small to see except as a point of scattered light' },
    { tex: 'v_f,\\ v_r', text: 'the terminal speeds falling with the field off and rising with it on, in m/s — a fixed distance divided by a stopwatch time' },
    { tex: 'E', text: 'the field between the plates, $V/d$, in V/m' },
    { tex: 'b', text: 'the slip constant, in Pa m: about $8.2\\times10^{-3}$ Pa m for air (an empirical number)' },
    { tex: 'p', text: 'the air pressure, in Pa' },
    { tex: '\\rho,\\ g', text: 'the oil’s density (886 kg/m³ here) and the gravitational acceleration (9.80 m/s²)' },
  ],
  why: t`Quantization shows up only if the analysis is right: a correction that depends on each drop’s size smears the whole-number pattern — the general lesson that a systematic need not be a single offset.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: drops timed in the field and out of it',
    lead: t`Each press times a new drop: its trace above (falls with the field off, rises with it on, jittered by Brownian motion), its charge in the table. The plot puts every charge against the whole number $n$ the analysis assigns it; the slope of the line through the origin is $e$.`,
    tasks: [
      'Time 12 more drops: the points stay on one line through the origin, and σ of e shrinks.',
      'Switch off the slip correction: every charge grows by 15–25%, by different amounts for different sizes — the slope lands far above e and χ²/ν balloons.',
      'Switch Plot to Millikan’s plot: the uncorrected (q/n)^⅔ against 1/(pa) is a straight line, and its intercept gives e without knowing b — though from a long extrapolation.',
    ],
    params: { exp: 'millikan', seed: 6, residuals: true, expected: true },
    caption: t`Simulated drops: $V = 500$ V across $d = 6.0$ mm, each timed over 0.50 mm, five transits each way averaged, with a 0.1 s reaction time and the Brownian scatter for its size at 296 K. Integers are assigned by scanning $e$ from 1.2 to $2.4\times10^{-19}$ C. ${SIMNOTE}`,
  },
  example: {
    prompt: t`One drop, timed over $s = 0.500$ mm (five transits each way, averaged), falls in $t_f = ${D.tf.toFixed(2)}$ s with the field off and rises in $t_r = ${D.tr.toFixed(2)}$ s with $500$ V across $6.0$ mm. Take $\eta = 1.83\times10^{-5}$ Pa s, $\rho = 886$ kg/m³, $b = 8.20\times10^{-3}$ Pa m, $p = 101.3$ kPa. Find its radius and charge — then $e$ from this drop and eleven others.`,
    visual: rigRaw('millikan', { seed: 4, settings: [null, null], at: 1 }, t`This drop’s height against time: three falls and three rises across the two graticule lines, jittered by Brownian motion. ${SIMNOTE}`),
    steps: [
      { label: 'Speeds', text: t`$v_f = 0.500\ \text{mm}/${D.tf.toFixed(2)}\ \text{s} = ${um(vf)}\ \mu\text{m/s}$ and $v_r = ${um(vr)}\ \mu\text{m/s}$.` },
      { label: 'Stokes radius', text: t`Weight balances drag at terminal speed: $\tfrac43\pi a^3\rho g = 6\pi\eta a v_f$, so $a_0 = \sqrt{9\eta v_f/2\rho g} = ${um(a0)}\ \mu\text{m}$. (Air’s buoyancy, 0.14% of the oil’s density, is left out.)` },
      { label: 'Slip', text: t`The mean free path of air molecules, about 0.07 μm, is not small beside the drop. Cunningham’s factor $C = 1 + b/pa_0 = ${M.slip(P0, a0).toFixed(3)}$ reduces the drag, so the drop is smaller than Stokes says: $a = a_0/\sqrt{C}$. Iterate — $${um(a1)}$, then $${um(D.aC)}\ \mu\text{m}$ — until it settles, with $C = ${Cfin.toFixed(3)}$.` },
      { label: 'Charge', text: t`With the field on, $qE = mg + 6\pi\eta a v_r/C$, and $mg = 6\pi\eta a v_f/C$: $q = 6\pi\eta a(v_f + v_r)/(EC) = ${tex(D.q, 4)}$ C, with $E = ${tex(E0, 3)}$ V/m.` },
      { label: 'Its uncertainty', text: t`Brownian motion moves this drop about $${(D.brown * 1e6).toFixed(0)}\ \mu\text{m}$ during a 0.5 mm fall — ${(100 * D.brown / P0.s).toFixed(0)}% of the distance — far more than the stopwatch’s 0.1 s. Averaged over five transits, $\sigma_q = ${tex(D.sq, 2)}$ C.` },
      { label: 'Twelve drops', text: t`Scanning $e$ for the value that makes every charge closest to a whole multiple assigns this drop $n = ${Dn}$. A weighted line through the origin of $q$ against $n$ for all twelve drops gives $e = (${resT(eFit)})\times10^{-19}$ C, with $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$.` },
      { label: 'Compare', text: t`CODATA: $e = 1.602\,176\,634\times10^{-19}$ C, exact since 2019. $z = ${eFit.z.toFixed(2)}$: agreement at the 0.6% level, which is what twelve drops and a 0.1 s stopwatch can do.` },
    ],
    answer: t`$a = ${um(D.aC)}\ \mu\text{m}$, $q = ${tex(D.q, 3)}$ C $\approx ${Dn}e$; from twelve drops $e = (${resT(eFit)})\times10^{-19}$ C.`,
  },
  practice: [
    num({
      id: 'stokes-radius', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), q = drop(seed);
        const vfx = P0.s / q.tf;
        const ans = Math.sqrt((9 * P0.eta * vfx) / (2 * P0.rho * P0.g)) * 1e6;
        return {
          prompt: t`A drop falls $0.500$ mm in $${q.tf.toFixed(2)}$ s at terminal speed. Using Stokes’s law alone (no slip correction), with $\eta = 1.83\times10^{-5}$ Pa s and oil of density 886 kg/m³, what is its radius? Answer in μm.`,
          visual: rigRaw('millikan', { seed, settings: [null] }, 'This drop’s trace: falls (field off) and rises (field on) across the graticule lines 0.5 mm apart.'),
          answer: ans, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((9 * P0.eta * vfx) / (P0.rho * P0.g)) * 1e6, feedback: t`Stokes drag $6\pi\eta a v$ against the weight $\tfrac43\pi a^3\rho g$ gives $a^2 = 9\eta v/(2\rho g)$ — you lost the 2.` }, { value: (9 * P0.eta * vfx) / (2 * P0.rho * P0.g) * 1e12, feedback: 'That is a² in μm². Take the square root.' }],
          hints: [t`At terminal speed, $\tfrac43\pi a^3\rho g = 6\pi\eta a v_f$.`, t`$a = \sqrt{9\eta v_f/(2\rho g)}$ with $v_f = 0.500\ \text{mm}/t_f$.`],
          teach: t`At terminal speed weight equals drag, so the fall speed alone fixes the radius: $a = \sqrt{9\eta v_f/2\rho g}$.`,
          explain: t`$v_f = ${um(vfx)}\ \mu\text{m/s}$, so $a = \sqrt{9\eta v_f/2\rho g}$ $= ${ans.toFixed(3)}\ \mu\text{m}$. The slip correction then shrinks it a few per cent.`,
        };
      },
    }),
    num({
      id: 'slip-factor', difficulty: 2,
      gen(r) {
        const a = r.pick([0.3, 0.4, 0.5, 0.6, 0.8, 1.0]), pk = r.pick([101.3, 86.0]);
        const C = 1 + P0.b / (pk * 1e3 * a * 1e-6);
        const ans = 100 * (C ** 1.5 - 1);
        return {
          prompt: t`For a drop of radius $${a.toFixed(1)}\ \mu\text{m}$ at $p = ${pk.toFixed(1)}$ kPa, with $b = 8.20\times10^{-3}$ Pa m, by what percentage does an analysis that ignores slip **overestimate** the drop’s charge? (The uncorrected charge is $q\,(1 + b/pa)^{3/2}$.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0.2, 1.6], y: [1, 1.6], xlabel: 'drop radius (μm)', ylabel: 'slip factor 1 + b/pa', axesAt: 'edge', curves: [{ fn: `1 + ${(P0.b / 101.3e3 * 1e6).toFixed(5)}/x`, color: 'accent', label: 'sea level', labelAt: 1.3, labelDy: 14 }, { fn: `1 + ${(P0.b / 86e3 * 1e6).toFixed(5)}/x`, color: 'violet', label: '86 kPa (about 1400 m up)', labelAt: 0.75, labelDx: 6, labelDy: -8 }] }, caption: t`Cunningham’s factor against radius (first-order form). The charge error is this factor to the power $3/2$.` },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * (C - 1), feedback: t`That is the drag error alone. The radius is wrong too ($a_0 = a\sqrt{C}$), and $q \propto a/C$ from the drag… together $q_0 = qC^{3/2}$.` }, { value: 100 * (C ** 2 - 1), feedback: t`The power is $3/2$, not 2: one $C$ from the drag, and $\sqrt C$ from the radius.` }],
          hints: [t`$C = 1 + b/(pa)$ with $p$ in Pa and $a$ in m.`, t`Overestimate $= C^{3/2} - 1$, as a percentage.`],
          teach: t`Ignoring slip overstates a drop’s charge by $(1 + b/pa)^{3/2}$ — most for the smallest drops and the thinnest air.`,
          explain: t`$C = 1 + 8.20\times10^{-3}/(${tex(pk * 1e3, 4)} \times ${tex(a * 1e-6, 2)})$ $= ${C.toFixed(4)}$, and $C^{3/2} = ${(C ** 1.5).toFixed(4)}$: ${ans.toFixed(1)}% too high. Because the error differs from drop to drop, it does not cancel in a ratio: it smears the whole-number pattern.`,
        };
      },
    }),
    num({
      id: 'charge-one', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 99999), q = drop(seed);
        const vfx = P0.s / q.tf, vrx = P0.s / q.tr, C = M.slip(P0, q.aC);
        const ans = (6 * Math.PI * P0.eta * q.aC * (vfx + vrx)) / (E0 * C);
        return {
          prompt: t`A drop’s slip-corrected radius is $a = ${um(q.aC)}\ \mu\text{m}$ (so $1 + b/pa = ${C.toFixed(4)}$). It falls at $v_f = ${um(vfx)}\ \mu\text{m/s}$ and rises at $v_r = ${um(vrx)}\ \mu\text{m/s}$ in a field of $${tex(E0, 3)}$ V/m. With $\eta = 1.83\times10^{-5}$ Pa s, what is its charge? Answer in C.`,
          visual: rigRaw('millikan', { seed, settings: [null] }, 'The drop’s trace: three falls, three rises.'),
          answer: ans, units: 'C', tol: { rel: 0.01 },
          errors: [
            { value: ans * C, feedback: t`Divide by the slip factor: the drag is $6\pi\eta a v/C$.` },
            { value: (6 * Math.PI * P0.eta * q.aC * vrx) / (E0 * C), feedback: t`With the field on, $qE$ holds up the weight *and* the drag: $qE = 6\pi\eta a(v_f + v_r)/C$. You left out the weight, which equals $6\pi\eta a v_f/C$.` },
            { value: (6 * Math.PI * P0.eta * q.aC * Math.abs(vfx - vrx)) / (E0 * C), feedback: t`Rising, the drag points down along with the weight: the speeds add, $v_f + v_r$.` },
          ].filter((x) => Math.abs(x.value - ans) > 0.02 * ans),
          hints: [t`Falling: $mg = 6\pi\eta a v_f/C$. Rising: $qE = mg + 6\pi\eta a v_r/C$.`, t`$q = 6\pi\eta a (v_f + v_r)/(EC)$.`],
          teach: t`The weight cancels out between the two speeds: $q = 6\pi\eta a(v_f + v_r)/(EC)$.`,
          explain: t`$q = 6\pi(1.83\times10^{-5})(${tex(q.aC, 4)})(${tex(vfx + vrx, 4)})/(${tex(E0, 3)} \times ${C.toFixed(4)}) = ${tex(ans, 4)}$ C $= ${(ans / e).toFixed(2)}\,e$.`,
        };
      },
    }),
    mcq({
      id: 'half-e', difficulty: 3,
      prompt: t`Twelve drops’ charges sit near the solid lines (multiples of $1.6\times10^{-19}$ C). Why must the scan for $e$ not be allowed down to $0.8\times10^{-19}$ C?`,
      visual: (() => {
        const A = M.run('millikan', { seed: 6 });
        return {
          type: 'graph',
          params: {
            aspect: 'wide', x: [0, 8], y: [-1, 1], xlabel: 'charge (10⁻¹⁹ C)', ylabel: '', yticks: 0, axesAt: 'edge',
            points: A.R.map((q, i) => ({ x: +(q.q / 1e-19).toFixed(4), y: +(0.6 * Math.sin(i * 2.4)).toFixed(3), color: 'accent', r: 4 })),
            vlines: [1, 2, 3, 4].map((k) => ({ x: +(1.602 * k).toFixed(3), color: 'good' })).concat([1, 3, 5, 7].map((k) => ({ x: +(0.801 * k).toFixed(3), color: 'ink3' }))),
          },
          caption: t`Each dot is one drop’s charge (spread vertically only so they do not overlap). Green: multiples of $e$. Grey: the odd multiples of $e/2$. ${SIMNOTE}`,
        };
      })(),
      choices: [
        t`Every multiple of $e$ is also a multiple of $e/2$, so $e/2$ fits the data at least as well; the data alone cannot rule out a smaller unit`,
        t`Below $1.2\times10^{-19}$ C the drops would have to carry more than ten electrons, which they cannot`,
        t`The χ² of the scan always rises as the trial value falls, so the minimum is automatically above it`,
        t`A charge smaller than $1.2\times10^{-19}$ C would make the drops rise too fast to time`,
      ],
      answer: 0,
      why: {
        1: 'Nothing stops a drop carrying more charges; the issue is that halving the unit doubles every n and still fits.',
        2: 'The opposite: a smaller trial unit leaves smaller leftovers, so χ² tends to fall as the unit shrinks — which is exactly why spurious fits appear at e/2, e/3 ….',
        3: 'The speeds are measured, not assumed; the unit we assign afterwards does not change them.',
      },
      hints: [t`If $q = 3e$, is it also a whole multiple of $e/2$?`, 'What evidence would distinguish a unit e from a unit e/2?'],
      teach: 'A quantization test can rule out a larger unit, never a smaller one: the evidence for e is that no charge ever lands halfway between its multiples.',
      explain: t`$ne = (2n)(e/2)$: a scan reaching $e/2$ finds a minimum there as good as at $e$. What Millikan’s data show is that no drop sat on an *odd* multiple of $e/2$ — the grey lines are empty. That is the real evidence; the scan’s range only encodes it. Quarks carry $\pm e/3$ and $\pm 2e/3$ but are never found free, and searches for free fractional charges with automated Millikan-style experiments have found none.`,
    }),
    num({
      id: 'e-from-n', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999);
        const A = M.run('millikan', { seed, settings: Array(6).fill(null) });
        const ns = A.d.x, qs = A.d.y.map((v) => +v.toFixed(3));
        const ans = qs.reduce((s, q, i) => s + q * ns[i], 0) / ns.reduce((s, n) => s + n * n, 0);
        const mean = qs.reduce((s, q, i) => s + q / ns[i], 0) / qs.length;
        return {
          prompt: t`Six drops, with the whole numbers already assigned (charges in units of $10^{-19}$ C):

${table([['n', ...ns.map(String)], ['q', ...qs.map((v) => v.toFixed(3))]])}

Taking every charge as equally uncertain, fit $q = ne$ by least squares through the origin. What is $e$, in units of $10^{-19}$ C?`,
          visual: rigPlot('millikan', { seed, settings: Array(6).fill(null), fit: false, residuals: false }, t`The six charges against $n$ (no fit drawn). ${SIMNOTE}`),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: mean, feedback: t`The mean of $q/n$ weights every drop alike, though a drop with $n = 3$ pins $e$ down three times better if all charges are equally uncertain. Least squares through the origin gives $\sum n q/\sum n^2$.` }].filter((x) => Math.abs(x.value - ans) > 0.003 * ans),
          hints: [t`Minimize $\sum (q_i - n_i e)^2$: set its derivative with respect to $e$ to zero.`, t`$e = \sum n_i q_i/\sum n_i^2$.`],
          teach: t`A line through the origin with equal errors has slope $\sum xy/\sum x^2$.`,
          explain: t`$\sum n q = ${qs.reduce((s, q, i) => s + q * ns[i], 0).toFixed(3)}$ and $\sum n^2 = ${ns.reduce((s, n) => s + n * n, 0)}$, so $e = ${ans.toFixed(4)}$. (The simulation weights each drop by its own σ, which differs with size.)`,
        };
      },
    }),
    num({
      id: 'millikan-plot', difficulty: 3,
      gen(r) {
        const seed = r.pick([4, 5, 6, 9, 11, 12, 14, 15, 17, 21]);
        const A = M.run('millikan', { seed, axes: 'mill' });
        const y0 = +A.fit.a.toFixed(4);
        const ans = y0 ** 1.5;
        return {
          prompt: t`Millikan’s own method: plot the *uncorrected* charge per electron as $(q_0/n)^{2/3}$ against $1/(pa_0)$. Since $q_0 = q(1 + b/pa)^{3/2}$, this is a straight line, $e^{2/3}(1 + b/pa)$. A run’s fit crosses $1/(pa_0) = 0$ at $${y0.toFixed(4)}$ in units of $(10^{-19}\ \text{C})^{2/3}$. What value of $e$ does that give, in units of $10^{-19}$ C?`,
          visual: rigPlot('millikan', { seed, axes: 'mill' }, t`Uncorrected charges per electron, raised to the 2/3 power, against $1/(pa_0)$; the fit extrapolates to infinitely large drops (or infinite pressure), where slip vanishes. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: y0, feedback: t`The axis is $e^{2/3}$: raise the intercept to the power $3/2$.` }, { value: y0 ** (2 / 3), feedback: t`Inverse of the wrong power: the intercept is $e^{2/3}$, so $e = (\text{intercept})^{3/2}$.` }],
          hints: ['At 1/(pa) = 0 the slip factor is exactly 1.', t`Intercept $= e^{2/3}$, so $e = \text{intercept}^{3/2}$.`],
          teach: 'Millikan’s plot needs no value of b: extrapolating to 1/(pa) = 0 means a drop so big, or air so dense, that slip vanishes.',
          explain: t`$e = ${y0.toFixed(4)}^{3/2} = ${ans.toFixed(3)}$. The extrapolation is long — from 1/(pa) near 12–20 back to 0 — so the uncertainty is several per cent with these drops; Millikan widened the range by changing the pressure. The slope over the intercept gives $b$ itself.`,
        };
      },
    }),
    num({
      id: 'viscosity', difficulty: 3,
      gen(r) {
        const x = r.pick([0.2, 0.3, 0.4, 0.5]);
        const ans = 100 * (1 - (1 - x / 100) ** 1.5);
        return {
          prompt: t`Ignoring the slip correction, the charge a drop analysis returns scales as $q \propto \eta^{3/2}$ (one $\eta$ from the drag, and $\sqrt\eta$ from the radius). If the value of air’s viscosity used is $${x}\%$ too low, by what percentage is $e$ too low?`,
          visual: compare([{ v: MIL.v / 1e-19, s: MIL.s / 1e-19, label: 'Millikan 1913', color: 'warn' }, { v: e / 1e-19, s: 0.0002, label: 'CODATA (exact)', color: 'good' }], { xlabel: 'e (10⁻¹⁹ C)', caption: t`Millikan’s 1913 result, $(4.774 \pm 0.009)\times10^{-10}$ esu $= (${pmT(MIL.v / 1e-19, MIL.s / 1e-19)})\times10^{-19}$ C, against today’s exact value. Bars: ±1σ (solid) and ±2σ (thin).` }),
          answer: ans, units: '%', tol: { rel: 0.02 },
          errors: [{ value: x, feedback: t`The power is $3/2$: a viscosity error is magnified by one and a half.` }, { value: x / 1.5, feedback: t`Multiply by $3/2$, do not divide: $\delta q/q = \tfrac32\,\delta\eta/\eta$.` }],
          hints: ['How does a small relative error in a quantity carry through a power law?', t`For $q \propto \eta^{3/2}$, $\delta q/q \approx \tfrac32\,\delta\eta/\eta$.`],
          teach: t`A power law multiplies a relative error by the power: $\delta q/q = \tfrac32\,\delta\eta/\eta$.`,
          explain: t`$\tfrac32 \times ${x}\% = ${ans.toFixed(2)}\%$ (exactly, $1 - (1 - ${x / 100})^{3/2}$). Millikan’s 1913 $e$ is ${(100 * (1 - MIL.v / e)).toFixed(2)}% below today’s value: a viscosity about 0.4% low accounts for it, and later work traced most of the shortfall to that number. His quoted σ did not include it — a systematic nobody had found yet.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mil-z', difficulty: 2,
      prompt: t`Millikan (1913) gave $e = (4.774 \pm 0.009)\times10^{-10}$ esu. One esu of charge is $3.3356\times10^{-10}$ C. How many of his standard uncertainties is his value from today’s exact $e = 1.602\,176\,634\times10^{-19}$ C? Give $z$ with its sign.`,
      visual: compare([{ v: MIL.v / 1e-19, s: MIL.s / 1e-19, label: 'Millikan 1913', color: 'warn' }, { v: e / 1e-19, s: 0.0002, label: 'CODATA (exact)', color: 'good' }], { xlabel: 'e (10⁻¹⁹ C)', caption: 'His result with ±1σ and ±2σ bars, against the exact modern value.' }),
      answer: (MIL.v - e) / MIL.s, tol: { rel: 0, abs: 0.1 },
      errors: [{ value: (100 * (MIL.v - e)) / e, feedback: 'That is the percentage difference. Divide the difference by his σ instead.' }],
      hints: ['Convert his value and his σ to coulombs first.', t`$z = (e_\text{Millikan} - e)/\sigma_\text{Millikan}$.`],
      teach: t`$z$ measures a difference in units of the stated uncertainty — and a large $|z|$ says the stated uncertainty missed something.`,
      explain: t`$4.774\times10^{-10} \times 3.3356\times10^{-10} = ${tex(MIL.v, 5)}$ C, $\sigma = ${tex(MIL.s, 2)}$ C, so $z = ${((MIL.v - e) / MIL.s).toFixed(1)}$. Over three σ: his budget left out the viscosity error. Feynman told the sequel: later measurements of $e$ crept up toward the right value in small steps, as people looked hardest for mistakes when a result disagreed with Millikan’s.`,
    }),
    mcq({
      id: 'cp-select', difficulty: 3,
      prompt: 'A student times thirty drops and keeps the eighteen whose charges come out close to a whole multiple of 1.60 × 10⁻¹⁹ C, rejecting the rest as “bad drops”. What is wrong?',
      visual: rigPlot('millikan', { seed: 8, flags: { slip: false }, expected: true }, t`An honest run analysed without the slip correction: charges off the line (gold) through the origin, CODATA dashed. Selecting drops near the dashed line would hide this. ${SIMNOTE}`),
      choices: [
        'The data now confirm the value used to select them: a systematic like a missing slip correction would be hidden, and σ of e would be too small',
        'Nothing, provided the rejected drops are listed in the notebook',
        'Eighteen drops are too few: the result is unbiased but its σ is larger',
        'Only drops with n = 1 should be kept, since they measure e directly',
      ],
      answer: 0,
      why: {
        1: 'Recording them is good practice, but the analysis still used a rule built on the expected answer. A rejection rule must be set in advance and must not depend on the result.',
        2: 'The problem is bias, not size: drops were kept because they agreed with the answer.',
        3: 'Drops with n = 1 are the least precise relative to e, and keeping only them is still a selection.',
      },
      hints: ['What would happen to the selected data set if every charge were systematically 20% high?', 'Did the rule for rejecting a drop depend on the value of e you hoped to find?'],
      teach: 'Choosing data by how well they agree with the expected answer guarantees agreement and hides systematics: set rejection rules before looking.',
      explain: t`Selecting on the answer is circular: the kept charges cluster near multiples of $1.60\times10^{-19}$ C *because* they were chosen to. A missing correction that moves every charge would go unnoticed, and the scatter — hence σ — is artificially small. A defensible rule depends on the measurement (a drop that changed charge mid-run, a timing interrupted), not on its result. A blind analysis hides the answer until the method is fixed.`,
    }),
    num({
      id: 'cp-strato', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([0.3, 0.5, 0.8]), alt = r.pick([[10, 26.5, 223], [15, 12.1, 217]]);
        const [km, pk, T] = alt;
        const eta = 1.716e-5 * (T / 273.15) ** 1.5 * (273.15 + 110.4) / (T + 110.4);    // Sutherland's law
        const rho = 1700, g = 9.77;
        const C = 1 + P0.b / (pk * 1e3 * a * 1e-6);
        const ans = ((2 * (a * 1e-6) ** 2 * rho * g) / (9 * eta)) * C * 1e6;
        return {
          prompt: t`A balloon-borne aerosol probe at about $${km}$ km altitude ($p = ${pk}$ kPa, $T = ${T}$ K, air viscosity $\eta = ${tex(eta, 3)}$ Pa s) studies sulfate droplets of radius $${a}\ \mu\text{m}$ and density 1700 kg/m³. With Millikan’s drag law and $b = 8.2\times10^{-3}$ Pa m (taken as unchanged), what is a droplet’s settling speed? Use $g = 9.77$ m/s². Answer in μm/s.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 2], y: [1, 4], xlabel: 'droplet radius (μm)', ylabel: 'slip factor', axesAt: 'edge', curves: [{ fn: `1 + ${(P0.b / 101.3e3 * 1e6).toFixed(5)}/x`, color: 'accent', label: 'ground (101 kPa)', labelAt: 1.6, labelDy: 14 }, { fn: `1 + ${(P0.b / (pk * 1e3) * 1e6).toFixed(5)}/x`, color: 'violet', label: `${km} km (${pk} kPa)`, labelAt: 1.2, labelDy: -10 }] }, caption: t`The slip factor $1 + b/pa$ at the ground and aloft. In thin air the first-order form becomes rough; it is used here as an estimate.` },
          answer: ans, units: 'um/s', tol: { rel: 0.01 },
          errors: [{ value: ans / C, feedback: t`That is Stokes’s speed. In thin air slip matters: multiply by $1 + b/pa = ${C.toFixed(2)}$.` }],
          hints: [t`Terminal speed with slip: $v = \dfrac{2a^2\rho g}{9\eta}\,(1 + b/pa)$.`, t`$1 + b/pa = 1 + 8.2\times10^{-3}/(${pk}\times10^3 \times ${a}\times10^{-6})$.`],
          teach: 'The same drag law that Millikan corrected sets how fast fine particles fall out of the stratosphere — and slip grows as the air thins.',
          explain: t`Stokes alone gives $${(ans / C).toFixed(1)}\ \mu\text{m/s}$; the slip factor $${C.toFixed(3)}$ makes it $${ans.toFixed(1)}\ \mu\text{m/s}$ — about $${(ans * 86400 / 1e6).toFixed(0)}$ m a day, so a droplet takes months to fall even a few kilometres; stratospheric volcanic sulfate lingers for a year or so. (Viscosity from Sutherland’s law; at these Knudsen numbers the full Cunningham formula differs from the first-order one by a few per cent.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'R. A. Millikan, On the elementary electrical charge and the Avogadro constant, Physical Review 2, 109 (1913)', url: 'https://doi.org/10.1103/PhysRev.2.109' },
    { label: 'R. P. Feynman, Cargo Cult Science (Caltech commencement address, 1974)', url: 'https://calteches.library.caltech.edu/51/2/CargoCult.htm' },
    SRC.codata,
    SRC.usu,
  ],
});
