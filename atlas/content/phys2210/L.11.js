// Lab 11 (virtual): springs and simple harmonic motion — one spring constant
// measured two independent ways (Hooke's law at rest, and the period of the
// bounce), with a test of whether they agree; an intercept that is physics
// (the spring's own moving mass), not error; a forgotten hanger that moves
// only the intercept; and an error the two methods share, which agreement
// can never reveal.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, pmTeX, plot, apparatus, compare, SOURCES } from './_lab.js';

const t = String.raw;
const G = 9.8, K = 4 * Math.PI ** 2, MH = 0.05, MS = 0.04;

// the worked example: the dynamic run (seed 58) and a static run on the same spring (seed 558)
const EX = (() => {
  const rows = B.makeData('spring-dynamic', { seed: 58 }).rows;
  const an = B.analyse('spring-dynamic', rows);
  const f = an.series[0].fit, q = an.results[0];
  const qs = B.analyse('spring-static', B.makeData('spring-static', { seed: 558 }).rows).results[0];
  // the moving mass a/b, with the covariance of a and b
  const me = f.a / f.b;
  const sme = Math.sqrt((f.sa / f.b) ** 2 + ((f.a * f.sb) / f.b ** 2) ** 2 - (2 * f.a * f.cov) / f.b ** 3);
  // the comparison as a reader would do it, from the values as quoted (2 decimals)
  const d2 = (x) => +x.toFixed(2);
  const z = Math.abs(d2(q.value) - d2(qs.value)) / Math.hypot(d2(q.sigma), d2(qs.sigma));
  return { rows, f, q, qs, me, sme, z, r3: rows[2] };
})();

// k from each load on its own, k = 4π²M/T²: biased low by the spring's moving mass
const KI = EX.rows.map((q) => {
  const M = q.s + MH, T = q.R[0] / 10, k = (K * M) / T ** 2;
  return { M, k, s: (k * 2 * 0.005) / T };
});

// two timings of one load at different amplitudes (seed 14: 9.02 s and 9.05 s)
const AMP = B.makeData('spring-dynamic', { seed: 14, settings: [0.25, 0.25] }).rows.map((q) => q.R[0]);

// a seeded dynamic run; `ok` can reject runs that would read oddly in a prompt
const bounce = (r, sys = null, ok = () => true) => {
  for (let k = 0; ; k++) {
    const rows = B.makeData('spring-dynamic', { seed: r.int(1, 999999), sys }).rows;
    const an = B.analyse('spring-dynamic', rows, { sys });
    if (k > 40 || ok(an)) return { rows, an };
  }
};

// a static run with the hanger left out of the load (seed 71)
const HANG = (() => {
  const rows = B.makeData('spring-static', { seed: 71, sys: 'hanger' }).rows;
  const an = B.analyse('spring-static', rows, { sys: 'hanger' });
  return { rows, f: an.series[0].fit, q: an.results[0] };
})();

export default lesson({
  id: 'phys2210.L.11',
  title: 'Springs and simple harmonic motion',
  minutes: 16, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A spring hangs from a stand with a 0.050 kg hanger on its end, and you add slotted masses. The bench computes every reading with realistic scatter. You will measure the spring constant $k$ two independent ways, with different instruments:

**Static.** Hang a load and read the stretch $x$ off a metre stick. At rest the spring holds up the weight, $kx = Mg$, so the weight $F = Mg$ plotted against $x$ is a line of slope $k$.

**Dynamic.** Set the load bouncing and time ten oscillations. Simple harmonic motion has $T = 2\pi\sqrt{M/k}$ — but the spring’s own coils move too, adding about a third of its mass:

$$T^2 = \frac{4\pi^2}{k}\left(M + \frac{m_s}{3}\right)$$

The slope gives $k$; the intercept is not an error but the spring’s moving mass. If the two values of $k$ agree within their uncertainties, each method has checked the other. (Lab skills trained: measuring one quantity two independent ways and testing their agreement, and reading physics from an intercept.)`,
  symbols: [
    { tex: 'k', text: 'the spring constant (stiffness), in N/m: the force per metre of stretch' },
    { tex: 'm', text: 'the slotted masses added to the hanger, in kg' },
    { tex: 'M', text: 'the hanging mass: $m$ plus the 0.050 kg hanger, in kg' },
    { tex: 'x', text: 'the extension: how far the spring has stretched beyond its natural length, read on a metre stick to ±1.5 mm, in m' },
    { tex: 'F = Mg', text: 'the weight of the load, in N, with $g = 9.80$ m/s²: the force stretching the spring at rest' },
    { tex: 'T', text: 'the period of one bounce, in s: the stopwatch time for ten, $t_{10}$, divided by 10' },
    { tex: 'm_s', text: 'the mass of the spring itself, 0.040 kg. Its top coils hardly move while its bottom coils move with the load: in effect a third of it bounces (exactly a third when the load is much heavier than the spring)' },
  ],
  why: 'Skylab’s astronauts measured their body mass in orbit by timing their own oscillation on a spring-mounted chair: the dynamic method needs only inertia, so it works where nothing has weight.',
  visual: {
    type: 'lab-bench',
    title: 'One spring, two methods',
    lead: t`The table holds one reading per load. Switch the method between the static stretch and the timed bounce, and compare the two values of $k$.`,
    tasks: [
      'Static: F against x is a straight line through the origin, and its slope is k, about 15 N/m. Note k ± σ from the readout.',
      'Switch to Dynamic: T² against M is straight too, but it crosses M = 0 above zero — a third of the spring is bouncing. Does this k agree with the static one?',
      'Turn on the systematic (the hanger left out of the load) in either method: the line shifts without tilting, so k survives and only the intercept is wrong.',
    ],
    params: { exp: ['spring-static', 'spring-dynamic'], seed: 33 },
  },
  example: {
    prompt: t`Six loads, each timed for ten oscillations. A least-squares fit of $T^2$ against $M$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{s}^2/\text{kg}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{s}^2`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. A static run on the same spring gave $k = ${pmTeX(EX.qs.value, EX.qs.sigma, t`\text{N/m}`)}$. Find $k$ from the bounce, test whether the two methods agree, and explain the intercept.`,
    visual: plot('spring-dynamic', EX.rows, { table: true, residuals: true, caption: 'T² against M with ±1σ error bars, the least-squares line, and residuals.' }),
    steps: [
      { label: 'One point', text: t`At $M = ${(EX.r3.s + MH).toFixed(3)}$ kg, $t_{10} = ${EX.r3.R[0].toFixed(2)}$ s, so $T = ${(EX.r3.R[0] / 10).toFixed(3)}$ s and $T^2 = ${((EX.r3.R[0] / 10) ** 2).toFixed(3)}\ \text{s}^2$, with error bar $\sigma_{T^2} = 2T\sigma_T = 2(${(EX.r3.R[0] / 10).toFixed(3)})(0.005) = ${(2 * (EX.r3.R[0] / 10) * 0.005).toFixed(4)}\ \text{s}^2$.` },
      { label: 'Spring constant', text: t`$k = \dfrac{4\pi^2}{\text{slope}} = \dfrac{39.48}{${EX.f.b.toFixed(4)}} = ${EX.q.value.toFixed(2)}$ N/m, with $\sigma_k = k\,\sigma_b/b = ${EX.q.sigma.toFixed(2)}$ N/m.` },
      { label: 'Agreement', text: t`Static against dynamic: $\dfrac{|${EX.qs.value.toFixed(2)} - ${EX.q.value.toFixed(2)}|}{\sqrt{${EX.qs.sigma.toFixed(2)}^2 + ${EX.q.sigma.toFixed(2)}^2}} = ${EX.z.toFixed(2)}$ combined standard uncertainties apart — well inside 2. A metre stick and a stopwatch, two different physical laws, one $k$.` },
      { label: 'The intercept', text: t`$${EX.f.a.toFixed(4)}\ \text{s}^2$ is about ${Math.round(EX.f.a / EX.f.sa)} standard errors above zero, so something else is bouncing. Divided by the slope it is a mass: $m_s/3 = a/b = ${pmTeX(EX.me, EX.sme, t`\text{kg}`)}$, so $m_s = ${pmTeX(3 * EX.me, 3 * EX.sme, t`\text{kg}`)}$. The spring weighs 0.040 kg on a balance: the intercept is the spring’s own moving mass.` },
      { label: 'Watch the hanger', text: t`$M$ includes the 0.050 kg hanger. Leave it out and every point slides 0.050 kg to the left: the intercept would grow to $${(EX.f.a + EX.f.b * MH).toFixed(3)}\ \text{s}^2$ while the slope, and $k$, stayed put.` },
    ],
    answer: t`$k = ${pmTeX(EX.q.value, EX.q.sigma, t`\text{N/m}`)}$ from the bounce, ${EX.z.toFixed(1)}σ from the static $${pmTeX(EX.qs.value, EX.qs.sigma, t`\text{N/m}`)}$: the methods agree. The intercept is the spring’s moving mass, $m_s \approx ${(3 * EX.me).toFixed(3)}$ kg.`,
  },
  practice: [
    num({
      id: 'hooke-k', difficulty: 1,
      gen(r) {
        const m = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3]);
        const x = B.makeData('spring-static', { seed: r.int(1, 999999), settings: [m] }).rows[0].R[0];
        const M = m + MH;
        return {
          prompt: t`With $m = ${m.toFixed(3)}$ kg of slotted masses on the 0.050 kg hanger, the spring is stretched by $x = ${x.toFixed(3)}$ m. What spring constant does this one reading give?`,
          answer: (M * G) / x, units: 'N/m', tol: { rel: 0.005 },
          errors: [{ value: (m * G) / x, feedback: 'The hanger hangs on the spring too: the load is M = m + 0.050 kg.' }, { value: M / x, feedback: 'That is kilograms per metre. Hooke’s law balances a force: use the weight Mg.' }],
          hints: [t`At rest the spring holds up the weight: $kx = Mg$, with $M = m + 0.050$ kg.`],
          teach: 'At rest the spring’s pull kx balances the weight Mg of everything hanging on it — hanger included.',
          explain: t`$k = \dfrac{Mg}{x} = \dfrac{(${M.toFixed(3)})(9.80)}{${x.toFixed(3)}} = ${((M * G) / x).toFixed(1)}$ N/m.`,
          visual: apparatus('spring-static', { at: m, data: [[m, x]] }, `The spring with ${m.toFixed(3)} kg on the hanger, and the stretch read on the metre stick. Not to scale.`),
        };
      },
    }),
    num({
      id: 'k-from-period', difficulty: 2,
      gen(r) {
        const { rows, an } = bounce(r);
        const f = an.series[0].fit, b = +f.b.toFixed(3), a = +f.a.toFixed(3);
        return {
          prompt: t`A fit of $T^2$ against $M$ gives slope $${b.toFixed(3)}\ \text{s}^2/\text{kg}$ and intercept $${a.toFixed(3)}\ \text{s}^2$. What is the spring constant?`,
          answer: K / b, units: 'N/m', tol: { rel: 0.003 },
          errors: [{ value: K * b, feedback: t`Invert: the slope is $4\pi^2/k$, so $k = 4\pi^2/\text{slope}$.` }, { value: (2 * Math.PI) / b, feedback: t`The slope of $T^2$ carries $(2\pi)^2 = 4\pi^2$, not $2\pi$.` }],
          hints: [t`$T^2 = \dfrac{4\pi^2}{k}(M + m_s/3)$: the slope is $4\pi^2/k$.`],
          teach: 'The slope of T² against M is 4π²/k; the intercept belongs to the spring’s mass and does not enter k.',
          explain: t`$k = 4\pi^2/\text{slope} = 39.478/${b.toFixed(3)} = ${(K / b).toFixed(2)}$ N/m. The intercept plays no part: it is the spring’s own moving mass.`,
          visual: plot('spring-dynamic', rows, { caption: 'T² against M with the least-squares line.' }),
        };
      },
    }),
    num({
      id: 'spring-mass', difficulty: 2,
      gen(r) {
        // a run whose intercept is within 1.5σ of the true moving mass, so the comparison in the answer is honest
        const { rows, an } = bounce(r, null, (q) => { const f = q.series[0].fit; return Math.abs((3 * f.a) / f.b - MS) < (1.5 * 3 * f.sa) / f.b; });
        const f = an.series[0].fit, a = +f.a.toFixed(4), b = +f.b.toFixed(3);
        return {
          prompt: t`A fit of $T^2$ against $M$ gives intercept $${a.toFixed(4)}\ \text{s}^2$ and slope $${b.toFixed(3)}\ \text{s}^2/\text{kg}$. If the intercept is the spring’s moving mass $m_s/3$, how heavy is the spring?`,
          answer: (3 * a) / b, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: a / b, feedback: t`That is the mass that moves with the load — a third of the spring. Multiply by 3 for $m_s$.` }, { value: 3 * a, feedback: 'The intercept is in s². Divide by the slope (s²/kg) to turn it into a mass.' }],
          hints: [t`At $M = 0$ the line reads $T^2 = \text{slope}\times m_s/3$.`, t`So $m_s = 3\times\text{intercept}/\text{slope}$.`],
          teach: 'The intercept of T² against M, divided by the slope, is the extra mass that bounces: about a third of the spring.',
          explain: t`$m_s/3 = ${a.toFixed(4)}/${b.toFixed(3)} = ${(a / b).toFixed(4)}$ kg, so $m_s = ${((3 * a) / b).toFixed(3)}$ kg. The intercept is uncertain by about $\pm${f.sa.toFixed(4)}\ \text{s}^2$, so this is $\pm${((3 * f.sa) / b).toFixed(3)}$ kg — consistent with the 0.040 kg a balance gives.`,
          visual: plot('spring-dynamic', rows, { caption: 'T² against M with the least-squares line. Where does it cross M = 0?' }),
        };
      },
    }),
    mcq({
      id: 'hanger-static', difficulty: 2,
      prompt: t`A student’s load column lists only the slotted masses — the 0.050 kg hanger is left out — and they plot $F = mg$ against $x$. Compared with including the hanger, the fit gives:`,
      choices: [
        t`The same slope $k$, but an intercept near $-0.49$ N: every force is short by the same $(0.050)(9.80)$ N`,
        t`A smaller $k$, because every force is too small`,
        t`A curved plot and a large $\chi^2/\text{dof}$`,
        'No visible change: the hanger is too light to matter',
      ],
      answer: 0,
      why: {
        1: 'Every force is short by the same 0.49 N, so the line moves down without tilting — and the slope is the change in F over the change in x.',
        2: 'A constant shift keeps every point on a straight line: the residuals do not change at all.',
        3: t`0.49 N is not small here: the intercept lands about ${Math.round(Math.abs(HANG.f.a) / HANG.f.sa)} standard errors below zero.`,
      },
      hints: [t`Each plotted force is $mg$ instead of $(m + 0.050\ \text{kg})\,g$. Is the shortfall the same for every point?`, 'A shift that is the same for every point moves a line without tilting it.'],
      teach: 'Leaving a constant part of the load out of the table shifts the line: the intercept absorbs it, and the slope — k — is untouched.',
      explain: t`$mg = kx - (0.050)(9.80)$: the line keeps slope $k$ and crosses $x = 0$ at $-0.49$ N. This run gives intercept $${pmTeX(HANG.f.a, HANG.f.sa, t`\text{N}`)}$ and $k = ${pmTeX(HANG.q.value, HANG.q.sigma, t`\text{N/m}`)}$ — the same $k$ as with the hanger counted.`,
      visual: plot('spring-static', HANG.rows, { sys: true, caption: 'F = mg (slotted masses only) against x, with ±1σ bars on x and the least-squares line. Where does it cross x = 0?' }),
    }),
    num({
      id: 'agree', difficulty: 2,
      gen(r) {
        let s, d, z;
        for (let k = 0; k < 60; k++) {
          const seed = r.int(1, 999999);
          const qs = B.analyse('spring-static', B.makeData('spring-static', { seed }).rows).results[0];
          const qd = B.analyse('spring-dynamic', B.makeData('spring-dynamic', { seed: seed + 1 }).rows).results[0];
          s = { v: +qs.value.toFixed(2), s: +qs.sigma.toFixed(2) };
          d = { v: +qd.value.toFixed(2), s: +qd.sigma.toFixed(2) };
          z = Math.abs(s.v - d.v) / Math.hypot(s.s, d.s);
          if (z > 0.3 && z < 2.5) break;
        }
        const dk = Math.abs(s.v - d.v);
        return {
          prompt: t`Static: $k = ${s.v.toFixed(2)} \pm ${s.s.toFixed(2)}$ N/m. Dynamic: $k = ${d.v.toFixed(2)} \pm ${d.s.toFixed(2)}$ N/m. How many combined standard uncertainties apart are they?`,
          answer: z, tol: { rel: 0.02 },
          errors: [{ value: dk / (s.s + d.s), feedback: t`Independent uncertainties add in quadrature: $\sqrt{\sigma_1^2 + \sigma_2^2}$, not $\sigma_1 + \sigma_2$.` }, { value: dk / Math.max(s.s, d.s), feedback: t`Both values are uncertain: divide by the combined uncertainty $\sqrt{\sigma_1^2 + \sigma_2^2}$.` }],
          hints: [t`The difference of two independent results has uncertainty $\sqrt{\sigma_1^2 + \sigma_2^2}$.`],
          teach: 'Two independent results agree when their difference is within about two combined standard uncertainties, √(σ₁² + σ₂²).',
          explain: t`$\dfrac{|${s.v.toFixed(2)} - ${d.v.toFixed(2)}|}{\sqrt{${s.s.toFixed(2)}^2 + ${d.s.toFixed(2)}^2}} = \dfrac{${dk.toFixed(2)}}{${Math.hypot(s.s, d.s).toFixed(3)}} = ${z.toFixed(2)}$ — ${z < 2 ? 'under 2: the two methods agree' : 'over 2: a disagreement worth chasing before you trust either value'}.`,
          visual: compare([{ v: s.v, s: s.s, label: 'static' }, { v: d.v, s: d.s, label: 'dynamic' }], { xlabel: 'k (N/m)', caption: 'The two results for k with ±1σ (solid) and ±2σ (dashed) bars.' }),
        };
      },
    }),
    mcq({
      id: 'row-by-row', difficulty: 3,
      prompt: t`Working out $k = 4\pi^2 M/T^2$ separately for each load gives values that climb with the load, from ${KI[0].k.toFixed(1)} N/m at $M = ${KI[0].M.toFixed(3)}$ kg to ${KI[KI.length - 1].k.toFixed(1)} N/m at $${KI[KI.length - 1].M.toFixed(3)}$ kg. The static $F$–$x$ plot of the same spring is a clean straight line. What explains the trend?`,
      choices: [
        t`The spring’s own mass bounces too: each period belongs to $M + m_s/3$, so $4\pi^2 M/T^2$ falls short of $k$ — most for the lightest loads`,
        'The spring stiffens as it is stretched further',
        'Random timing error: average the six values and it cancels',
        'The heavier loads were timed more carefully',
      ],
      answer: 0,
      why: {
        1: t`Then the static $F$–$x$ plot would curve upward. It is straight: $k$ is the same at every stretch.`,
        2: 'Random error scatters both ways; these values climb steadily. Averaging them would bake the bias into the answer.',
        3: 'Care changes the scatter, not a steady trend — and each timing is good to the same ±0.05 s.',
      },
      hints: [t`$T^2 = \dfrac{4\pi^2}{k}\left(M + \dfrac{m_s}{3}\right)$. What does $4\pi^2 M/T^2$ equal, then?`, t`It is $k\,\dfrac{M}{M + m_s/3}$: always below $k$, and closer for larger $M$.`],
      teach: 'Point-by-point results that drift with the setting signal an omitted term; a straight-line fit with a free intercept absorbs it.',
      explain: t`$4\pi^2 M/T^2 = k\,M/(M + m_s/3)$, which climbs toward $k$ as $M$ grows. With $k \approx 15.0$ N/m and $m_s/3 = 0.0133$ kg it is $15.0\times0.100/0.1133 = 13.2$ N/m at the lightest load and $14.4$ N/m at the heaviest — just the trend in the data. The fit of $T^2$ against $M$ puts the spring’s mass in the intercept and gets $k = ${EX.q.value.toFixed(2)}$ N/m from the slope.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 0.4], y: [12.8, 15.6], xlabel: 'M (kg)', ylabel: 'k = 4π²M/T² (N/m)',
          alt: 'The spring constant worked out from each load separately, rising with the load toward the static value',
          curves: KI.map((q) => ({ param: [String(+q.M.toFixed(3)), `${(q.k - q.s).toFixed(4)} + ${(2 * q.s).toFixed(4)}*t`], t: [0, 1], color: 'accent', width: 1.6 })),
          points: KI.map((q) => ({ x: +q.M.toFixed(3), y: +q.k.toFixed(3), r: 3.6, color: 'accent' })),
          hlines: [{ y: +EX.qs.value.toFixed(2), label: `static k = ${EX.qs.value.toFixed(2)} N/m`, color: 'good' }],
        },
        caption: 'k worked out from each load on its own (±1σ bars), against the static value from the F–x fit (dashed).',
      },
    }),
    code({
      id: 'polyfit-spring', difficulty: 2,
      gen(r) {
        const { rows } = bounce(r);
        const M = rows.map((q) => +(q.s + MH).toFixed(3)), t10 = rows.map((q) => +q.R[0].toFixed(2));
        const f = B.fitLine(M, t10.map((x) => (x / 10) ** 2));
        const data = t`import numpy as np

M = np.array([${M.map((v) => v.toFixed(3)).join(', ')}])     # kg: slotted masses + 0.050 kg hanger
t10 = np.array([${t10.map((v) => v.toFixed(2)).join(', ')}])     # s, ten oscillations
`;
        return {
          prompt: t`Fit $T^2$ against $M$ with \`np.polyfit\`. Set \`k\` from the slope, and \`ms\` to the spring mass the intercept implies: three times intercept ÷ slope.`,
          starter: t`${data}
T = t10 / 10
# fit T**2 against M; then set k and ms
k = 0.0
ms = 0.0
print(k, ms)
`,
          answer: t`${data}
T = t10 / 10
slope, intercept = np.polyfit(M, T**2, 1)
k = 4 * np.pi**2 / slope
ms = 3 * intercept / slope
print(f"k = {k:.2f} N/m, spring mass = {ms:.3f} kg")
`,
          tests: [
            { name: `k is 4π²/slope (${(K / f.b).toFixed(2)} N/m)`, code: `abs(k - ${K / f.b}) < 1e-6` },
            { name: `ms is 3 × intercept/slope (${((3 * f.a) / f.b).toFixed(3)} kg)`, code: `abs(ms - ${(3 * f.a) / f.b}) < 1e-9` },
          ],
          hints: [t`\`slope, intercept = np.polyfit(M, T**2, 1)\`.`, t`\`k = 4 * np.pi**2 / slope\` and \`ms = 3 * intercept / slope\`.`],
          teach: 'np.polyfit on T² against M gives k from the slope and the spring’s moving mass from the intercept.',
          explain: t`$k = ${(K / f.b).toFixed(2)}$ N/m, and the intercept implies $m_s = ${((3 * f.a) / f.b).toFixed(3)}$ kg. A balance gives 0.040 kg; the intercept pins $m_s$ down only to about ±0.01 kg, so judge the agreement against that.`,
          visual: plot('spring-dynamic', rows, { fit: false, caption: 'The data your program fits.' }),
        };
      },
    }),
    mcq({
      id: 'amplitude-check', difficulty: 2,
      prompt: t`To test whether the bounce is simple harmonic, you time ten oscillations of the same 0.300 kg load twice: at a small amplitude (about 1 cm), $t_{10} = ${AMP[0].toFixed(2)}$ s; at a large one (about 5 cm), $t_{10} = ${AMP[1].toFixed(2)}$ s. Each timing is good to ±0.05 s. What do you conclude?`,
      choices: [
        t`No amplitude dependence is detected: the ${(AMP[1] - AMP[0]).toFixed(2)} s difference is well inside its ±0.07 s uncertainty, as simple harmonic motion predicts`,
        t`The period grows with amplitude: ${AMP[1].toFixed(2)} s is longer than ${AMP[0].toFixed(2)} s`,
        'The stopwatch needs more decimal places to decide',
        'The spring is not obeying Hooke’s law',
      ],
      answer: 0,
      why: {
        1: 'A difference smaller than its own uncertainty is not evidence of anything: time the pair again and the order could easily flip.',
        2: 'The ±0.05 s is your reaction time, not the display’s resolution. More digits on the display would not steady your thumb: more significant figures are not more accuracy.',
        3: 'A Hookean spring gives a period independent of amplitude — exactly what these timings are consistent with.',
      },
      hints: [t`The uncertainty of a difference is $\sqrt{0.05^2 + 0.05^2}$.`, t`Is ${(AMP[1] - AMP[0]).toFixed(2)} s large compared with that?`],
      teach: 'A difference counts as a real effect only when it is large compared with its own uncertainty, √(σ₁² + σ₂²).',
      explain: t`The difference is $${(AMP[1] - AMP[0]).toFixed(2)} \pm 0.07$ s: less than half its uncertainty. These timings are consistent with an amplitude-independent period — and could reveal only an effect bigger than about $2\times0.07 = 0.14$ s in $t_{10}$, roughly 1.5% of the period. To test more finely, time more oscillations.`,
      visual: compare([{ v: AMP[0], s: 0.05, label: 'small amplitude' }, { v: AMP[1], s: 0.05, label: 'large amplitude' }], { xlabel: 't₁₀ (s)', caption: 'The two timings with ±1σ (solid) and ±2σ (dashed) bars.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-skylab', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([480, 520, 600]), T0 = r.pick([0.85, 0.9, 0.95]), m0 = r.pick([58, 66, 74, 81]);
        const T = +Math.sqrt(T0 * T0 + (K * m0) / k).toFixed(2);
        const m = (k * (T * T - T0 * T0)) / K;
        const r4 = (x) => +x.toFixed(4);
        return {
          prompt: t`In orbit nothing has weight, so Skylab’s crews measured body mass on a chair mounted on springs, by timing its oscillation. Suppose the empty chair oscillates with period $T_0 = ${T0.toFixed(2)}$ s and, with an astronaut strapped in, $T = ${T.toFixed(2)}$ s. The springs’ constant is $k = ${k}$ N/m. What is the astronaut’s mass?`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: (k * T * T) / K, feedback: t`That is astronaut plus chair. The empty-chair period measures the chair’s share: subtract $T_0^2$.` }, { value: (k * (T - T0) ** 2) / K, feedback: t`Square each period first: $T^2$ is what grows in proportion to the mass.` }],
          hints: [t`$T^2 = \dfrac{4\pi^2}{k}(m_\text{chair} + m)$ and $T_0^2 = \dfrac{4\pi^2}{k}m_\text{chair}$.`, t`Subtract: $m = \dfrac{k}{4\pi^2}\left(T^2 - T_0^2\right)$.`],
          teach: 'Oscillation weighs by inertia, not weight: m = k(T² − T₀²)/4π² works where a scale cannot.',
          explain: t`$m = \dfrac{${k}}{39.48}\left(${T.toFixed(2)}^2 - ${T0.toFixed(2)}^2\right) = ${m.toFixed(1)}$ kg. A spring scale would read zero in free fall; the period depends on inertia, which free fall cannot switch off.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, r4(1.8 * m)], y: [0, r4(1.25 * T * T)], xlabel: 'mass on the chair (kg)', ylabel: 'T² (s²)',
              alt: 'T squared against the mass on the chair: a straight line starting at the empty-chair value',
              curves: [{ fn: `${r4(T0 * T0)} + ${r4(K / k)}*x`, color: 'accent' }],
              points: [{ x: 0, y: r4(T0 * T0), r: 4, color: 'gold', label: 'empty chair', labelDx: 8, labelDy: 16 }],
              hlines: [{ y: r4(T * T), label: `T² = ${(T * T).toFixed(2)} s², astronaut aboard`, color: 'good' }],
            },
            caption: 'T² = T₀² + (4π²/k)m: each kilogram on the chair adds the same amount to T². No weight is involved, only inertia.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-shared', difficulty: 3,
      prompt: t`Your static and dynamic values of $k$ agree to within ${EX.z.toFixed(1)}σ. Then you learn that every slotted mass, and the hanger, is 3% heavier than its label says. What follows?`,
      choices: [
        'Both values of k are about 3% too low — and their agreement could never have shown it, because both methods used the same masses',
        'Only the static k is wrong: the dynamic method does not use the weight of the masses',
        'Nothing: the two methods agreed, so both are right',
        'Both values of k are about 3% too high',
      ],
      answer: 0,
      why: {
        1: t`The dynamic method needs the masses too, as inertia: $T^2 = 4\pi^2 M/k$ (plus the spring’s share). Heavier masses than you thought bounce more slowly, so its $k$ is low by the same factor.`,
        2: 'Agreement tests only the errors the two methods do not share. A mistake common to both moves them together.',
        3: 'The real loads were heavier than you assumed, so the spring is stiffer than you computed: k came out low, not high.',
      },
      hints: [t`Static: $k = Mg/x$. If the true $M$ is 3% larger, is the true $k$ larger or smaller than yours?`, t`Dynamic: the same $M$ sets the slope of $T^2$ against $M$.`],
      teach: 'Two methods test each other only for the errors they do not share; a common input can bias both alike.',
      explain: 'Static: for the same stretch the true force is 3% larger than you assumed, so the true k is 3% larger. Dynamic: for the same period the true bouncing mass is 3% larger, so again the true k is 3% larger. Both came out low by the same factor and still agree. Only an independent standard — checking the masses on a calibrated balance — catches it.',
      visual: compare([{ v: EX.qs.value, s: EX.qs.sigma, label: 'static' }, { v: EX.q.value, s: EX.q.sigma, label: 'dynamic' }], { xlabel: 'k (N/m)', caption: `Static and dynamic k with ±1σ (solid) and ±2σ (dashed) bars: ${EX.z.toFixed(1)}σ apart.` }),
    }),
    num({
      id: 'cp-missing-mass', difficulty: 3,
      gen(r) {
        // a run whose intercept is within 1.5σ of the hanger, so the answer’s story holds
        const { rows, an } = bounce(r, 'hanger', (q) => { const f = q.series[0].fit; return Math.abs(f.a / f.b - MS / 3 - MH) < (1.5 * f.sa) / f.b; });
        const f = an.series[0].fit, a = +f.a.toFixed(3), b = +f.b.toFixed(3);
        const miss = a / b - MS / 3;
        return {
          prompt: t`A student’s $M$ column lists only the slotted masses: the hanger was forgotten. Their fit of $T^2$ against $M$ gives intercept $${a.toFixed(3)}\ \text{s}^2$ and slope $${b.toFixed(3)}\ \text{s}^2/\text{kg}$. The spring’s mass is $m_s = 0.040$ kg, a third of which bounces. How much bouncing mass is missing from their column, in kg?`,
          answer: miss, units: 'kg', tol: { rel: 0.02 },
          errors: [{ value: a / b, feedback: t`That is all the mass the intercept stands for, including the third of the spring that bounces. Subtract $m_s/3$.` }, { value: a / b - MS, feedback: t`Only about a third of the spring moves with the load: subtract $m_s/3$, not $m_s$.` }],
          hints: [t`At $M = 0$ the line reads $T^2 = \dfrac{4\pi^2}{k}\left(\text{missing} + \dfrac{m_s}{3}\right)$, and the slope is $4\pi^2/k$.`, t`So the missing mass is intercept/slope $- m_s/3$.`],
          teach: 'An intercept divided by the slope is a mass: subtract the parts you can account for, and what is left is what the table missed.',
          explain: t`intercept/slope $= ${(a / b).toFixed(4)}$ kg; take away $m_s/3 = 0.0133$ kg and $${miss.toFixed(4)}$ kg is left — the 0.050 kg hanger, within the intercept’s uncertainty of about $\pm${(f.sa / f.b).toFixed(3)}$ kg. The slope, and so $k$, was never affected.`,
          visual: plot('spring-dynamic', rows, { sys: true, caption: 'T² against the student’s M (slotted masses only), with the least-squares line.' }),
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 2 (comparing two measured numbers) and ch. 8 (least squares)'),
    SOURCES.openstax('15.1', '15-1-simple-harmonic-motion', 'Simple harmonic motion'),
    { label: 'E. E. Rodríguez & G. A. Gesnouin, “Effective mass of an oscillating spring”, The Physics Teacher 45, 100 (2007)', url: 'https://doi.org/10.1119/1.2432087' },
    SOURCES.polyfit,
    SOURCES.aapt,
  ],
});
