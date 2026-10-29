// Miniature project 7 — Gaia parallaxes and the distance ladder.
// A guided mini-paper on a SYNTHETIC Gaia-like catalogue: 150 Pleiades
// members at 136.0 pc (Gaia DR2's distance modulus 5.667, Babusiaux et al.
// 2018) and 80 stars of a far cluster "B" at 2500 pc, on one made-up straight
// main sequence, with per-star parallax errors and DR3's −17 μas zero point
// (Lindegren et al. 2021). Rungs: parallax → the Pleiades' distance
// (135.8 ± 0.3 pc) → absolute magnitudes (the main sequence calibrated) →
// cluster B by main-sequence fitting (2495 ± 8 pc). Against that, B's own
// parallaxes: their mean gives 2419 ± 152 pc, but inverting star by star and
// averaging gives −2611 pc — four negative parallaxes. The Hipparcos
// controversy (120.2 ± 1.5 pc, van Leeuwen 2009, against VLBI's 136.2 ± 1.2,
// Melis et al. 2014: 8.3σ) as the cautionary tale; ladder errors propagate
// to every rung (→ P.2's H₀). Numbers from the Explore were copied from
// running it in Pyodide.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { gaussFn } from './_rs.js';
import { r6, SRC2 } from './_rs2.js';

const t = String.raw;
const OUT = { p1: 7.362, sp1: 0.014, d1: 135.8, sd1: 0.3, a: 0.51, b: 3.0, DM2: 11.985, sDM2: 0.007, d2: 2495, sd2: 8, d2p: 2419, sd2p: 152, inv: -2611, neg: 4 };

// the parallax geometry: Earth's orbit and a nearby star, angle hugely exaggerated
const plxPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-1.6, 6.4], y: [-1.3, 1.3], aspect: 'wide', equal: true, axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', dash: [4, 4], width: 1.2 }, { param: ['6*t', '1 - t'], t: [0, 1], color: 'accent', width: 1.4 }, { param: ['6*t', '-1 + t'], t: [0, 1], color: 'accent', width: 1.4 }, { param: ['0', '-1 + 2*t'], t: [0, 1], color: 'gold', width: 1.6 }],
    points: [{ x: 0, y: 0, color: 'gold', r: 7, label: 'Sun', labelDx: -34, labelDy: 0 }, { x: 0, y: 1, color: 'accent', r: 4, label: 'Earth, January', labelDx: 6, labelDy: -10 }, { x: 0, y: -1, color: 'accent', r: 4, label: 'Earth, July', labelDx: 6, labelDy: 14 }, { x: 6, y: 0, color: 'ink', r: 5, label: 'star', labelDx: 8, labelDy: -8 }, { x: 0.25, y: 0.5, r: 0, label: '1 AU', color: 'gold', labelDx: 0, labelDy: 0 }],
  },
  caption,
});
// parallax measurements of one faint, far star: a Gaussian that reaches below zero
const noisyPic = (p, s, caption) => ({
  type: 'graph',
  params: {
    x: [-1, 1.8], y: [0, 1.15 / (s * Math.sqrt(2 * Math.PI))], aspect: 'wide', axesAt: 'edge', xlabel: 'measured parallax (mas)', ylabel: '', yticks: 0, xticks: 7,
    curves: [{ fn: gaussFn(p, s), color: 'accent', width: 2.2 }],
    shade: [{ fn: gaussFn(p, s), lower: '0', from: -1, to: 0, color: 'bad', alpha: 0.35 }],
    vlines: [{ x: p, label: 'true', color: 'good' }, { x: 0, color: 'ink3' }],
  },
  caption,
});
// rungs of the ladder as bars on a log distance axis
const ladderPic = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 10], y: [0.4, 3.8], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'distance (pc)', ylabel: '', yticks: 0, xticks: 5,
    shade: [{ fn: '3.35', lower: '2.85', from: 0.3, to: 4, color: 'accent', alpha: 0.5 }, { fn: '2.35', lower: '1.85', from: 2, to: 7.5, color: 'violet', alpha: 0.45 }, { fn: '1.35', lower: '0.85', from: 6.5, to: 9.7, color: 'gold', alpha: 0.5 }],
    points: [{ x: 0.35, y: 3.1, r: 0, label: 'parallax (Gaia)', color: 'ink', labelDx: 0, labelDy: 0 }, { x: 2.1, y: 2.1, r: 0, label: 'main sequences, Cepheids', color: 'ink', labelDx: 0, labelDy: 0 }, { x: 6.6, y: 1.1, r: 0, label: 'type Ia supernovae', color: 'ink', labelDx: 0, labelDy: 0 }, { x: r6(Math.log10(136)), y: 3.1, color: 'gold', r: 5 }],
  },
  caption,
});

const PRELUDE = t`import numpy as np

# SYNTHETIC Gaia-like catalogue of two star clusters. Each star has a colour
# (BP-RP), an apparent G magnitude and a parallax with its error. Stars follow
# one made-up straight main sequence, M_G = 0.5 + 3.0 * colour, with 0.05 mag
# scatter. Every parallax carries Gaia DR3's zero-point offset: 17 micro-arcsec too small.
rng = np.random.default_rng(2019)
ZP = -0.017                                          # mas, added to every parallax
def cluster(n, d_pc, depth_pc, err_lo, err_hi):
    d = d_pc + depth_pc * rng.normal(size=n)         # each star's true distance
    colour = rng.uniform(0.5, 2.0, n)
    G = 0.5 + 3.0 * colour + 5 * np.log10(d / 10) + 0.05 * rng.normal(size=n)
    err = np.exp(rng.uniform(np.log(err_lo), np.log(err_hi), n))         # mas
    plx = 1000 / d + err * rng.normal(size=n) + ZP                        # mas
    return colour, G, plx, err

# the Pleiades, at 136.0 pc (Gaia DR2: distance modulus 5.667), and a far cluster "B"
c1, G1, plx1, e1 = cluster(150, 136.0, 2.0, 0.02, 0.30)
c2, G2, plx2, e2 = cluster(80, 2500.0, 15.0, 0.05, 0.60)
`;
const RUNG1 = t`
p1 = plx1 - ZP                                       # zero point corrected
mean_p = p1.mean(); se_p = p1.std(ddof=1) / np.sqrt(p1.size)
d1 = 1000 / mean_p
`;
const EXPLORE = PRELUDE + t`
# rung 1: the Pleiades' distance from parallax, after correcting the zero point
p1 = plx1 - ZP
mean_p = p1.mean(); se_p = p1.std(ddof=1) / np.sqrt(p1.size)
d1 = 1000 / mean_p
print(f"Pleiades: mean parallax {mean_p:.3f} +/- {se_p:.3f} mas -> {d1:.1f} +/- {d1 * se_p / mean_p:.1f} pc")

# rung 2: calibrate the main sequence: absolute magnitude against colour
M1 = G1 - 5 * np.log10(d1 / 10)
slope, icept = np.polyfit(c1, M1, 1)
print(f"main sequence: M_G = {icept:.2f} + {slope:.2f} x colour")

# rung 3: cluster B's distance by main-sequence fitting
DM2 = np.mean(G2 - (icept + slope * c2))
d2 = 10 ** ((DM2 + 5) / 5)
sDM2 = np.hypot(np.std(G2 - (icept + slope * c2), ddof=1) / np.sqrt(G2.size), 5 / np.log(10) * se_p / mean_p)
print(f"cluster B by main-sequence fitting: distance modulus {DM2:.3f} +/- {sDM2:.3f} -> {d2:.0f} +/- {d2 * np.log(10) / 5 * sDM2:.0f} pc")

# cluster B's own parallaxes: average them, or invert star by star?
p2 = plx2 - ZP
print(f"cluster B by mean parallax: {1000 / p2.mean():.0f} +/- {1000 / p2.mean() * p2.std(ddof=1) / np.sqrt(p2.size) / p2.mean():.0f} pc;  "
      f"mean of 1/parallax: {np.mean(1000 / p2):.0f} pc;  negative parallaxes: {np.sum(p2 < 0)}")

import atlas.plot as plt
plt.scatter(c1, G1, label="Pleiades")
plt.scatter(c2, G2 - DM2 + 5 * np.log10(d1 / 10), label="cluster B, shifted by the fitted distance moduli")
plt.xlabel("colour BP-RP"); plt.ylabel("G magnitude, as if at the Pleiades"); plt.legend(); plt.show()
`;

export default lesson({
  id: 'research.P.7',
  title: 'Gaia parallaxes and the distance ladder',
  minutes: 22, difficulty: 3,
  intro: t`**The question.** How far away is the Pleiades — and how does a parallax measured there become a distance to stars a hundred times farther, where parallaxes drown in noise? Gaia’s second data release put the cluster at a distance modulus of 5.667, about 136 pc, settling a long dispute: Hipparcos had said 120 pc.

**The catalogue here is synthetic**: 150 Pleiades-like stars at 136.0 pc and 80 stars of a cluster “B” at 2500 pc, all on one made-up straight main sequence, with Gaia-like parallax errors and the $-17\ \mu\text{as}$ zero-point offset of Gaia’s third release. A star’s distance and parallax are reciprocal,

$$d\,[\text{pc}] = \frac{1}{\varpi\,[\text{arcsec}]}, \qquad m - M = 5\log_{10}\frac{d}{10\ \text{pc}}$$

and the distance modulus $m - M$ carries a calibration from one rung of the ladder to the next.`,
  symbols: [
    { tex: 'd', text: 'the distance, in parsecs ($1\\ \\text{pc} = 3.086\\times10^{16}$ m $= 3.26$ light-years)' },
    { tex: '\\varpi', text: 'the parallax: half the yearly back-and-forth shift of a star against distant background objects, in arcseconds (Gaia quotes milliarcseconds, mas)' },
    { tex: 'm', text: 'the apparent magnitude: how bright the star looks (larger is fainter)' },
    { tex: 'M', text: 'the absolute magnitude: how bright it would look from 10 pc' },
  ],
  why: t`Every extragalactic distance — and so the Hubble constant of [P.2](#/lesson/research.P.2) — rests on parallaxes at the bottom of the ladder.`,
  visual: {
    type: 'code-runner',
    title: 'Climb three rungs',
    lead: t`Run it: correct the parallaxes’ zero point, average the Pleiades’ parallaxes into a distance, calibrate absolute magnitudes along the main sequence, then find cluster B’s distance by fitting its main sequence — and compare with what B’s own, much noisier parallaxes say.`,
    tasks: ['Look at the last line: averaging the inverted parallaxes of B gives a negative distance.', 'Remove the zero-point correction (use plx1 instead of p1): the Pleiades move 0.3 pc farther, and so does every rung above.', 'Shrink cluster B’s parallax errors (0.05, 0.60 to 0.01, 0.05): now its parallaxes agree with the main-sequence distance, star by star.'],
    params: { code: EXPLORE, rows: 20 },
    caption: 'Synthetic catalogue: one perfect straight main sequence shared by both clusters, Gaussian parallax errors, a single global zero point. Real clusters differ in age, composition and dust, and Gaia’s zero point varies with magnitude, colour and position.',
  },
  example: {
    prompt: t`Write the mini-paper’s results: the Pleiades’ distance with its uncertainty, cluster B’s distance by main-sequence fitting, and what B’s parallaxes alone give; compare with Gaia DR2 (136 pc) and Hipparcos (120.2 ± 1.5 pc).`,
    visual: ladderPic('The distance ladder on a log scale (pc): each method is calibrated where it overlaps the one below. The gold dot is the Pleiades. Ranges indicative.'),
    steps: [
      { label: 'Rung 1', text: t`Adding back the 0.017 mas zero point, the 150 parallaxes average $${OUT.p1} \pm ${OUT.sp1}$ mas, so $d = 1000/${OUT.p1} = ${OUT.d1} \pm ${OUT.sd1}$ pc — the 136.0 pc the data were made with, within $1\sigma$.` },
      { label: 'Rung 2', text: t`With that distance every Pleiad gets an absolute magnitude, $M = m - 5\log_{10}(d/10)$; a straight line through them gives $M_G = ${OUT.a} + ${OUT.b.toFixed(2)}\times$ colour.` },
      { label: 'Rung 3', text: t`Cluster B’s stars sit $m - M = ${OUT.DM2} \pm ${OUT.sDM2}$ mag below that line: $d = 10^{(${OUT.DM2} + 5)/5} = ${OUT.d2} \pm ${OUT.sd2}$ pc.` },
      { label: 'B’s parallaxes', text: t`At 2500 pc the parallax is 0.4 mas, comparable with the errors. Their mean gives $${OUT.d2p} \pm ${OUT.sd2p}$ pc — consistent but twenty times less precise. Inverting each and averaging gives ${OUT.inv} pc, because ${OUT.neg} parallaxes are negative.` },
      { label: 'Compare', text: t`Our $${OUT.d1} \pm ${OUT.sd1}$ pc agrees with Gaia DR2’s 136 pc and VLBI’s $136.2 \pm 1.2$; Hipparcos’s $120.2 \pm 1.5$ is $8\sigma$ away — the controversy Gaia ended. Every rung above inherits whichever is right.` },
    ],
    answer: t`Pleiades $${OUT.d1} \pm ${OUT.sd1}$ pc; cluster B $${OUT.d2} \pm ${OUT.sd2}$ pc by main-sequence fitting, against $${OUT.d2p} \pm ${OUT.sd2p}$ pc from its own parallaxes — the ladder is more precise than direct parallaxes once the parallaxes are noisy.`,
  },
  practice: [
    num({
      id: 'invert', difficulty: 1,
      gen(r) {
        const p = r.pick([768.1, 379.2, 7.36, 21.1, 2.5]);
        const ans = 1000 / p;
        return {
          prompt: t`A star’s parallax is $${p}$ mas. How far away is it, in parsecs?`,
          visual: plxPic('Earth’s orbit seen from above; the star’s direction changes over half a year. The angle is hugely exaggerated.'),
          answer: ans, units: 'pc', tol: { rel: 0.005 },
          errors: [{ value: 1 / p, feedback: 'Convert milliarcseconds to arcseconds first: d = 1/ϖ needs ϖ in arcseconds.' }, { value: p / 1000, feedback: 'Distance is the reciprocal of parallax.' }],
          hints: [t`$${p}$ mas $= ${p / 1000}''$.`, t`$d = 1/\varpi$ with $\varpi$ in arcseconds.`],
          teach: 'One parsec is the distance at which 1 AU subtends one arcsecond: d = 1/ϖ.',
          explain: t`$d = 1/${p / 1000} = ${ans < 10 ? ans.toFixed(3) : ans.toFixed(1)}$ pc.${p === 768.1 ? ' That is Proxima Centauri’s parallax: the nearest star.' : ''}`,
        };
      },
    }),
    num({
      id: 'zeropoint', difficulty: 2,
      gen(r) {
        const p = r.pick([7.36, 2.0, 1.0, 0.4, 0.2]);
        const ans = ((p + 0.017) / p - 1) * 100;
        return {
          prompt: t`Gaia DR3 parallaxes are on average $17\ \mu\text{as}$ ($0.017$ mas) too small. For a star whose catalogue parallax is $${p}$ mas, by what percentage does ignoring this make its distance too **large**?`,
          visual: noisyPic(Math.min(p, 1.2), 0.2, 'A measured parallax scatters about the truth; a zero-point offset shifts the whole distribution.'),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 0.017 * 100, feedback: 'The offset is absolute (in mas), so its relative effect depends on the parallax itself.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The corrected parallax is $${p} + 0.017$ mas.`, t`The distance scales as $1/\varpi$: compare $1/${p}$ with $1/${(p + 0.017).toFixed(3)}$.`],
          teach: 'A fixed parallax offset matters more the smaller the parallax: negligible nearby, decisive far away.',
          explain: t`$${(p + 0.017).toFixed(3)}/${p} = ${((p + 0.017) / p).toFixed(4)}$: the uncorrected distance is ${((p + 0.017) / p * 100 - 100).toFixed(2)}% too large.${p >= 7 ? ' For the Pleiades, about 0.3 pc.' : p <= 0.4 ? ' For distant stars the zero point is as important as the noise.' : ''}`,
        };
      },
    }),
    code({
      id: 'rung1', difficulty: 2,
      prompt: t`Rung 1: correct the Pleiades’ parallaxes \`plx1\` for the zero point (subtract \`ZP\`, which is negative), set \`mean_p\` to their mean and \`se_p\` to its standard error (sample standard deviation over $\sqrt N$), and \`d1\` to the distance in parsecs, \`1000 / mean_p\`.`,
      starter: PRELUDE + t`
mean_p = se_p = d1 = None
print(mean_p, se_p, d1)
`,
      answer: PRELUDE + RUNG1 + t`print(mean_p, se_p, d1)
`,
      tests: [
        { name: 'the mean parallax is 7.362 mas', code: 'mean_p is not None and abs(mean_p - 7.3616) < 0.001' },
        { name: 'the distance is 135.8 pc', code: 'd1 is not None and abs(d1 - 135.84) < 0.05' },
        { name: 'the standard error is about 0.014 mas', code: 'se_p is not None and abs(se_p - 0.014) < 0.002' },
      ],
      hints: ['`p1 = plx1 - ZP` (subtracting a negative offset adds 0.017 mas).', '`mean_p = p1.mean()`, `se_p = p1.std(ddof=1) / np.sqrt(p1.size)`, `d1 = 1000 / mean_p`.'],
      teach: 'Average the parallaxes, then invert: the mean of a cluster’s parallaxes is an unbiased estimate, its inverse a good distance when the error is small.',
      explain: t`$\bar\varpi = 7.362 \pm 0.014$ mas, $d = 135.8 \pm 0.3$ pc. The scatter includes the cluster’s own depth (about 2 pc, so 0.1 mas), which is why the standard error comes from the spread rather than the quoted errors.`,
    }),
    mcq({
      id: 'inversion', difficulty: 3,
      prompt: t`Cluster B is at 2500 pc (parallax 0.4 mas) and its stars have parallax errors up to 0.6 mas. Inverting each star’s parallax and averaging gives $-2611$ pc. Why?`,
      visual: noisyPic(0.4, 0.3, 'Repeated measurements of a 0.4 mas parallax with a 0.3 mas error: about one in eleven comes out negative (red).'),
      choices: ['1/ϖ is violently non-linear near ϖ = 0: small or negative measured parallaxes give huge or negative “distances” that dominate the average', 'Gaia measured some stars behind the Sun', 'The zero-point correction was applied twice', 'Cluster B is too far for any distance estimate'],
      answer: 0,
      why: { 1: 'A negative parallax is a measurement error: noise pushed the estimate below zero, which no real star has.', 2: 'One correction of 0.017 mas cannot produce a sign change in the average of 80 distances.', 3: 'Main-sequence fitting gives it to 0.3%; and the mean parallax works too, with a larger error.' },
      hints: ['What does 1/x do to a value near zero, or below it?', 'Average in the space where the errors are Gaussian.'],
      teach: 'Never invert noisy parallaxes star by star: average parallaxes, or use a likelihood with a prior on distance.',
      explain: t`Parallax errors are Gaussian in $\varpi$, not in $1/\varpi$. Averaging the parallaxes first (or fitting distance with a proper likelihood) keeps the estimate well-behaved: here $${OUT.d2p} \pm ${OUT.sd2p}$ pc.`,
    }),
    num({
      id: 'dm', difficulty: 2,
      gen(r) {
        const DM = r.pick([5.667, 3.389, 9.2, 11.985, 18.48]);
        const ans = 10 ** ((DM + 5) / 5);
        return {
          prompt: t`A cluster’s main sequence sits $m - M = ${DM}$ magnitudes below the calibrated one. What is its distance, in parsecs?`,
          visual: ladderPic('Distance moduli carry a calibration up the ladder.'),
          answer: ans, units: 'pc', tol: { rel: 0.005 },
          errors: [{ value: 10 ** (DM / 5), feedback: t`$d = 10\ \text{pc} \times 10^{(m-M)/5} = 10^{(m - M + 5)/5}$ pc.` }, { value: 10 ** ((DM + 5) / 2.5), feedback: 'Distance modulus uses 5 log₁₀, not 2.5 log₁₀.' }],
          hints: [t`Solve $m - M = 5\log_{10}(d/10\ \text{pc})$ for $d$.`],
          teach: 'Each 5 magnitudes of distance modulus multiplies the distance by 10.',
          explain: t`$d = 10^{(${DM} + 5)/5} = ${ans < 1e4 ? ans.toFixed(0) : (ans / 1000).toFixed(0) + '\\,000'}$ pc.${DM === 5.667 ? ' The Pleiades, from Gaia DR2.' : DM === 3.389 ? ' The Hyades, from Gaia DR2.' : DM === 18.48 ? ' About the distance of the Large Magellanic Cloud.' : ''}`,
        };
      },
    }),
    num({
      id: 'hipparcos', difficulty: 2,
      prompt: t`Hipparcos (van Leeuwen 2009) put the Pleiades at $120.2 \pm 1.5$ pc; a VLBI radio parallax (Melis et al. 2014) at $136.2 \pm 1.2$ pc. How many combined standard deviations apart are they?`,
      visual: { type: 'graph', params: { x: [112, 144], y: [0, 0.36], aspect: 'wide', axesAt: 'edge', xlabel: 'Pleiades distance (pc)', ylabel: '', yticks: 0, xticks: 8, curves: [{ fn: gaussFn(120.2, 1.5), color: 'violet', width: 2.2, label: 'Hipparcos', labelAt: 117, labelDy: -14 }, { fn: gaussFn(136.2, 1.2), color: 'gold', width: 2.2, label: 'VLBI', labelAt: 138.5, labelDy: -10 }] }, caption: 'The two published distances as Gaussians of their quoted errors.' },
      answer: (136.2 - 120.2) / Math.hypot(1.5, 1.2), tol: { rel: 0.01 },
      errors: [{ value: 16 / 2.7, feedback: 'Combine the errors in quadrature, not by adding them.' }],
      hints: [t`$\Delta/\sqrt{\sigma_1^2 + \sigma_2^2}$.`],
      teach: 'A precise measurement with an unrecognized systematic error can be confidently wrong.',
      explain: t`$16/\sqrt{1.5^2 + 1.2^2} = ${(16 / Math.hypot(1.5, 1.2)).toFixed(1)}\sigma$. Gaia sided with VLBI. The Hipparcos error bar was honest about noise, but not about a systematic effect that is still debated.`,
    }),
    mcq({
      id: 'propagate', difficulty: 3,
      prompt: 'Suppose the Pleiades’ distance were wrong by 1% (too far). What happens to the main-sequence distance of cluster B, and to everything calibrated from it?',
      visual: ladderPic('Each rung is calibrated by the one below it.'),
      choices: ['Every one comes out 1% too far as well: a calibration error at the bottom of the ladder shifts every rung by the same factor', 'Nothing: B is measured independently', 'B’s distance is 1% too near, compensating', 'The error averages out over many clusters'],
      answer: 0,
      why: { 1: 'B’s distance uses absolute magnitudes calibrated with the Pleiades’ distance; it is not independent.', 2: 'A too-large distance makes the calibrated stars too luminous, so B, of the same apparent brightness, is placed too far.', 3: 'A shared calibration error is systematic: every cluster shares it, so it never averages away.' },
      hints: [t`If $d_1$ is too large, $M = m - 5\log_{10}(d_1/10)$ is too bright.`, 'Cluster B’s stars, matched to too-bright absolute magnitudes, must then be placed farther away.'],
      teach: 'Systematic errors climb the ladder: a calibration error at the bottom is shared by every distance above it.',
      explain: t`A 1% distance error is $0.0217$ mag in the distance modulus, carried into every absolute magnitude and so into every distance above. This is why the Hubble-tension debate (P.2) turns on parallax zero points and Cepheid calibrations.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-msfit', difficulty: 3,
      prompt: t`Rungs 2 and 3. Using \`d1\` (given), compute the Pleiades’ absolute magnitudes \`M1\` $= G - 5\log_{10}(d_1/10)$ and fit a straight line \`M1\` against colour \`c1\` with \`np.polyfit\`. Then set \`DM2\` to the mean of cluster B’s \`G2\` minus the line evaluated at its colours \`c2\`, and \`d2\` to its distance in parsecs.`,
      starter: PRELUDE + RUNG1 + t`
DM2 = d2 = None
print(DM2, d2)
`,
      answer: PRELUDE + RUNG1 + t`
M1 = G1 - 5 * np.log10(d1 / 10)
slope, icept = np.polyfit(c1, M1, 1)
DM2 = np.mean(G2 - (icept + slope * c2))
d2 = 10 ** ((DM2 + 5) / 5)
print(DM2, d2)
`,
      tests: [
        { name: 'cluster B’s distance modulus is 11.985', code: 'DM2 is not None and abs(DM2 - 11.985) < 0.002' },
        { name: 'its distance is 2495 pc', code: 'd2 is not None and abs(d2 - 2495) < 3' },
        { name: 'within 1% of the 2500 pc the data were made with', code: 'd2 is not None and abs(d2 / 2500 - 1) < 0.01' },
      ],
      hints: ['`M1 = G1 - 5 * np.log10(d1 / 10)`, then `slope, icept = np.polyfit(c1, M1, 1)`.', '`DM2 = np.mean(G2 - (icept + slope * c2))` and `d2 = 10 ** ((DM2 + 5) / 5)`.'],
      teach: 'Main-sequence fitting transfers a parallax distance to a cluster too far for parallaxes.',
      explain: t`$m - M = 11.985$, so $d = 2495$ pc, eighteen times farther than the calibrating cluster and twenty times more precise than B’s own parallaxes. Real main-sequence fitting must also correct for dust, age and composition, which this synthetic catalogue leaves out.`,
    }),
    num({
      id: 'cp-probe', difficulty: 3, transfer: true,
      gen(r) {
        const b = r.pick([47, 100, 150]), [star, d] = r.pick([['Proxima Centauri', 1.302], ['Wolf 359', 2.41], ['Barnard’s Star', 1.83]]);
        const ans = b / d;                           // arcsec: baseline in AU over distance in pc
        return {
          prompt: t`A spacecraft ${b} AU from the Sun photographs ${star} (about ${d} pc away) at the same moment as a telescope on Earth. Seen against the far background, by how many **arcseconds** do the two images of the star differ? (Treat the baseline as perpendicular to the line of sight.)`,
          visual: plxPic('Parallax with a longer baseline: the same geometry, with a spacecraft in place of Earth’s orbit. Angles exaggerated.'),
          answer: ans, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: 'The parallax ϖ is defined for a 1 AU baseline; here the whole shift is baseline/distance, with nothing halved.' }, { value: 1 / d, feedback: 'That is the parallax for a 1 AU baseline; scale it by the baseline.' }],
          hints: ['1 AU at 1 pc subtends 1 arcsecond.', t`So $b$ AU at $d$ pc subtends $b/d$ arcseconds.`],
          teach: 'Parallax is triangulation: a longer baseline gives a bigger angle, which is why space probes can do it by eye.',
          explain: t`$${b}/${d} = ${ans.toFixed(1)}''$ — ${ans > 30 ? 'tens of arcseconds, visible in ordinary images. From Earth the same star shifts by less than one' : 'easily measured, far more than from Earth'}. A probe far out in the Solar System turns parallax into a demonstration anyone can see.`,
        };
      },
    }),
    mcq({
      id: 'cp-conclusion', difficulty: 2,
      prompt: 'Which conclusion does this project support?',
      visual: noisyPic(0.4, 0.3, 'Noisy parallaxes of distant stars: why the ladder is needed.'),
      choices: [
        'With synthetic Gaia-like data, averaging zero-point-corrected parallaxes recovers the Pleiades distance to 0.2%, and main-sequence fitting carries it to a cluster at 2500 pc with 0.3% precision — far better than that cluster’s own parallaxes',
        'We have measured the distance to the Pleiades as 135.8 pc',
        'Hipparcos was wrong because of the zero point',
        'Parallaxes are useless beyond 1000 pc',
      ],
      answer: 0,
      why: { 1: 'The catalogue was synthetic, generated at 136.0 pc.', 2: 'Hipparcos’s problem was a different, still-debated systematic; a 17 μas offset moves the Pleiades by only 0.3 pc, not 16 pc.', 3: 'Averaging many stars’ parallaxes still worked at 2500 pc, with a larger error.' },
      hints: ['What were the data, and what did each method achieve?'],
      teach: 'The ladder trades a direct but noisy measurement for a calibrated, more precise one — at the price of inherited systematics.',
      explain: 'Synthetic data validate the method: zero-point correction, averaging before inverting, and transferring the calibration. Run on the real Gaia catalogue, the same steps give the published cluster distances.',
    }),
  ],
  sources: [SRC2.babusiaux, SRC2.lindegren, { label: 'F. van Leeuwen, “Parallaxes and proper motions for 20 open clusters as based on the new Hipparcos catalogue”, A&A 497, 209 (2009)', url: 'https://doi.org/10.1051/0004-6361/200811382' }, { label: 'C. Melis et al., “A VLBI resolution of the Pleiades distance controversy”, Science 345, 1029 (2014), arXiv:1408.6544', url: 'https://doi.org/10.1126/science.1256101' }, { label: 'ESA Gaia archive documentation: credits and how to acknowledge Gaia data', url: 'https://gea.esac.esa.int/archive/documentation/credits.html' }],
});
