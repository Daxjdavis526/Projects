// Miniature project 3 — Kepler-10b: a planet from a light curve.
// A guided mini-paper on a SYNTHETIC Kepler-like light curve: 40 days at a
// 30-minute cadence, a box-shaped transit with Kepler-10b's published period
// (0.837495 d, Batalha et al. 2011) and radius ratio (k = 0.01261, Dumusque
// et al. 2014), 100 ppm white noise and a 300 ppm stellar wobble. Steps:
// detrend with a running median longer than the transit → box search over
// trial periods → fold → depth = k² → R_p = k R★ (R★ = 1.065 ± 0.009 R☉) →
// compare with 1.47 R⊕ (Dumusque) and 1.42 R⊕ (Batalha, as quoted by
// Dumusque). Also: a too-narrow filter that eats the transit (159 → 23 ppm),
// period aliases (P/2 halves the depth), the bulk density with the two
// published masses, and injection–recovery against Kepler's 7.1σ threshold.
// Numbers quoted from the Explore were copied from running it in Pyodide.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { r6, SRC2 } from './_rs2.js';

const t = String.raw;
const P_TRUE = 0.837495, K_TRUE = 0.01261, DEPTH = K_TRUE ** 2 * 1e6;     // ppm
const RSUN_REARTH = 6.957e8 / 6.3781e6;                                    // IAU nominal radii: 109.08
const OUT = { P: 0.8375, snr: 17.7, t0: 0.298, depth: 159, derr: 8, nin: 174, k: 0.01259, Rp: 1.46, sRp: 0.04 };

// a constructed folded light curve for pictures (its own seeded generator)
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let q = s; q = Math.imul(q ^ (q >>> 15), q | 1); q ^= q + Math.imul(q ^ (q >>> 7), q | 61); return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; }
const FOLD = (() => { const u = rng(10); const g = () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u()); return Array.from({ length: 160 }, () => { const h = -5 + 10 * u(); return [h, (Math.abs(h) < 0.9 ? -DEPTH : 0) + 100 * g()]; }); })();
const foldPic = (caption, { model = true, depth = DEPTH, pts = FOLD } = {}) => ({
  type: 'graph',
  params: {
    x: [-5, 5], y: [-500, 350], aspect: 'wide', axesAt: 'edge', xlabel: 'hours from mid-transit', ylabel: 'flux change (ppm)', xticks: 5, yticks: 4,
    points: pts.map(([x, y]) => ({ x: r6(x), y: r6(y), r: 2.2, color: 'ink3' })),
    ...(model ? { curves: [{ fn: `-${depth.toFixed(1)}*step(0.9 - abs(x))`, color: 'gold', width: 2.4, samples: 3000 }] } : {}),
  },
  caption,
});
const periodPic = (caption, marks = true) => ({
  type: 'graph',
  params: {
    x: [0.35, 1.75], y: [0, 22], aspect: 'wide', axesAt: 'edge', xlabel: 'trial period (days)', ylabel: 'box SNR', xticks: 7, yticks: 4,
    curves: [{ fn: `2.5 + 15.2*exp(-((x - ${P_TRUE})/0.0015)^2) + 6.3*exp(-((x - ${P_TRUE / 2})/0.0012)^2) + 10.3*exp(-((x - ${2 * P_TRUE})/0.0025)^2) + 0.6*sin(37*x)*sin(91*x)`, color: 'accent', width: 1.8, samples: 4000 }],
    ...(marks ? { points: [{ x: P_TRUE / 2, y: 9.3, r: 0, label: 'P/2', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: -6 }, { x: 2 * P_TRUE, y: 13.3, r: 0, label: '2P', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: -6 }] } : {}),
  },
  caption,
});

const PRELUDE = t`import numpy as np
from scipy.ndimage import median_filter

# SYNTHETIC Kepler-like light curve: one point every 30 minutes for 40 days,
# a box-shaped transit with Kepler-10b's published period and radius ratio,
# 100 ppm white noise and a slow 300 ppm stellar wobble
P_TRUE, K_TRUE, DUR = 0.837495, 0.01261, 1.8 / 24     # days, Rp/R*, days
rng = np.random.default_rng(4)
t = np.arange(0, 40, 0.5 / 24)                           # days
phase = (t - 0.3 + P_TRUE / 2) % P_TRUE - P_TRUE / 2      # days from mid-transit
flux = 1 - K_TRUE**2 * (np.abs(phase) < DUR / 2)
flux += 300e-6 * np.sin(2 * np.pi * t / 11.3) + 100e-6 * rng.normal(size=t.size)

def box_search(t, f, P, dur):
    """Fold at period P; return (SNR, mid-transit time) of the deepest dip of width dur."""
    nb = int(np.ceil(4 * P / dur))                        # 4 bins per transit width
    b = (t % P / P * nb).astype(int) % nb
    n = np.bincount(b, minlength=nb)
    s = np.bincount(b, f - 1, minlength=nb)
    n4 = sum(np.roll(n, -k) for k in range(4))            # points in each 4-bin box
    s4 = sum(np.roll(s, -k) for k in range(4))
    snr = -s4 / np.maximum(n4, 1) * np.sqrt(n4) / np.std(f)
    i = np.argmax(snr)
    return snr[i], (i + 2) / nb * P
`;
const EXPLORE = PRELUDE + t`
# 1. detrend: divide by a running median one day wide (much longer than a transit)
detr = flux / median_filter(flux, size=49, mode="nearest")

# 2. search periods from 0.5 to 1.5 days
periods = np.arange(0.5, 1.5, 0.0005)
power = np.array([box_search(t, detr, P, DUR)[0] for P in periods])
P = periods[np.argmax(power)]
snr, t0 = box_search(t, detr, P, DUR)
print(f"best period {P:.4f} d (SNR {snr:.1f}), mid-transit at t = {t0:.3f} d")

# 3. fold and measure the depth
ph = (t - t0 + P / 2) % P - P / 2
inn, out = np.abs(ph) < DUR / 2, np.abs(ph) > DUR
depth = np.mean(detr[out]) - np.mean(detr[inn])
err = np.std(detr[out]) * np.sqrt(1 / inn.sum() + 1 / out.sum())
print(f"depth {depth * 1e6:.0f} +/- {err * 1e6:.0f} ppm from {inn.sum()} in-transit points")

# 4. radius: Rp = sqrt(depth) * R_star, R_star = 1.065 R_sun, 1 R_sun = 109.08 R_earth
k = np.sqrt(depth)
Rp = k * 1.065 * 109.08
sRp = Rp * np.hypot(0.5 * err / depth, 0.009 / 1.065)
print(f"Rp/R* = {k:.5f};  Rp = {Rp:.2f} +/- {sRp:.2f} Earth radii")

import atlas.plot as plt
plt.plot(periods, power); plt.xlabel("trial period (days)"); plt.ylabel("box SNR"); plt.show()
plt.figure()
plt.scatter(ph * 24, (detr - 1) * 1e6); plt.xlabel("hours from mid-transit"); plt.ylabel("flux change (ppm)"); plt.show()
`;
const DETR = t`detr = flux / median_filter(flux, size=49, mode="nearest")
P, t0 = 0.8375, 0.298          # from the period search
`;

export default lesson({
  id: 'research.P.3',
  title: 'Kepler-10b: a planet from a light curve',
  minutes: 25, difficulty: 3,
  intro: t`**The question.** Kepler-10b was the first planet the Kepler mission showed to be rocky. Its star dims by about 160 parts per million every 0.84 days. How big is the planet — and how much does that answer depend on each step between the raw brightness and the radius?

**The light curve here is synthetic**: 40 days of Kepler-like photometry (one point every 30 minutes; Kepler’s long cadence was 29.4 min), with a box-shaped transit at the published period and radius ratio, 100 ppm white noise and a slow stellar wobble. Real transits have rounded edges (limb darkening) that a full fit must model. A planet of radius $R_p$ crossing a star of radius $R_\star$ blocks the fraction

$$\delta = \left(\frac{R_p}{R_\star}\right)^2$$

of its light, so the depth gives the radius ratio and the star’s radius gives the planet’s.`,
  symbols: [
    { tex: '\\delta', text: 'the transit depth: the fractional drop in brightness, a pure number (often in parts per million, ppm)' },
    { tex: 'R_p', text: t`the planet’s radius, quoted in Earth radii ($R_\oplus = 6378$ km, equatorial)` },
    { tex: 'R_\\star', text: t`the star’s radius, in solar radii ($R_\odot = 695\,700$ km $= 109.08\,R_\oplus$); for Kepler-10, $1.065 \pm 0.009\,R_\odot$ from asteroseismology` },
  ],
  why: t`Transit photometry has found most of the known exoplanets, and the same detrend–search–fold–fit chain runs on TESS data today.`,
  visual: {
    type: 'code-runner',
    title: 'From light curve to radius',
    lead: t`Run it (about ten seconds): detrend, search 2000 trial periods with a box-shaped dip, fold at the best period, measure the depth and turn it into a radius. Two plots: the periodogram and the folded light curve.`,
    tasks: ['Read the periodogram: besides the true period there are weaker peaks at simple fractions of it — near 0.56 d (2/3 of it) and 1.26 d (3/2 of it).', 'Change the median filter size from 49 points to 3 and rerun: the depth collapses — the filter has eaten the transit.', 'Raise the noise from 100 ppm to 400 ppm (the `100e-6` in the flux line): the radius error grows, and the period search starts to struggle.'],
    params: { code: EXPLORE, rows: 20 },
    caption: 'Synthetic photometry: a box transit (no limb darkening, no ingress and egress), white noise and a sinusoidal wobble. Real Kepler data have gaps, correlated noise and systematics.',
  },
  example: {
    prompt: t`Write the result: period, depth, radius ratio and planet radius with uncertainties, compared with the published values (period $0.837\,495$ d; $R_p/R_\star = 0.01261$, $R_p = 1.47^{+0.03}_{-0.02}\,R_\oplus$).`,
    visual: foldPic('A folded transit: every orbit stacked on one time axis. The gold box is the model. An illustrative synthetic draw, not the Explore’s data.'),
    steps: [
      { label: 'Detrend', text: t`A running median one day wide follows the 11-day stellar wobble but cannot follow a 1.8-hour dip, so dividing by it flattens the star and keeps the transits.` },
      { label: 'Search', text: t`The box search peaks at $P = ${OUT.P}$ d with SNR ${OUT.snr}, against the published $0.837\,495$ d — agreement to the grid step, 0.0005 d. Forty days of data hold 48 transits.` },
      { label: 'Depth', text: t`Folded on that period: $\delta = ${OUT.depth} \pm ${OUT.derr}$ ppm from ${OUT.nin} in-transit points, so $R_p/R_\star = \sqrt{\delta} = ${OUT.k}$.` },
      { label: 'Radius', text: t`$R_p = ${OUT.k} \times 1.065 \times 109.08 = ${OUT.Rp}\,R_\oplus$. The depth’s 5% error becomes 2.5% in the radius ratio (a square root halves relative errors); the star adds 0.8%; together $\pm ${OUT.sRp}\,R_\oplus$.` },
      { label: 'Compare', text: t`$${OUT.Rp} \pm ${OUT.sRp}$ against $1.47^{+0.03}_{-0.02}\,R_\oplus$: consistent. Since the data were built from the published ratio, this checks the pipeline, not the planet.` },
    ],
    answer: t`$P = ${OUT.P}$ d; $\delta = ${OUT.depth} \pm ${OUT.derr}$ ppm; $R_p = ${OUT.Rp} \pm ${OUT.sRp}\,R_\oplus$ — the published radius recovered from synthetic photometry.`,
  },
  practice: [
    num({
      id: 'radius', difficulty: 1,
      gen(r) {
        const d = r.pick([84, 159, 250, 400, 1000]), Rs = r.pick([0.8, 1.0, 1.065, 1.2]);
        const ans = Math.sqrt(d * 1e-6) * Rs * RSUN_REARTH;
        return {
          prompt: t`A transit is $${d}$ ppm deep in front of a star of $${Rs}\,R_\odot$. What is the planet’s radius, in Earth radii? ($1\,R_\odot = 109.08\,R_\oplus$.)`,
          visual: foldPic('A folded transit; its depth is the fraction of the star’s disc the planet covers.', { depth: d, pts: FOLD.map(([x, y]) => [x, y + (Math.abs(x) < 0.9 ? DEPTH - d : 0)]) }),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: d * 1e-6 * Rs * RSUN_REARTH, feedback: t`The depth is the **square** of the radius ratio: take $\sqrt{\delta}$ first.` }, { value: Math.sqrt(d * 1e-6) * Rs, feedback: 'That is in solar radii; multiply by 109.08 for Earth radii.' }],
          hints: [t`$R_p/R_\star = \sqrt{${d}\times10^{-6}}$.`, t`Multiply by $${Rs} \times 109.08$.`],
          teach: 'The depth is an area ratio; the radius ratio is its square root.',
          explain: t`$\sqrt{${d}\times10^{-6}} = ${Math.sqrt(d * 1e-6).toFixed(4)}$, so $R_p = ${Math.sqrt(d * 1e-6).toFixed(4)} \times ${Rs} \times 109.08 = ${ans.toFixed(2)}\,R_\oplus$.`,
        };
      },
    }),
    num({
      id: 'period-times', difficulty: 2,
      gen(r) {
        const n = r.int(30, 140), t1 = +(r.float(0.2, 3, 0.0001)).toFixed(4);
        const t2 = +(t1 + n * P_TRUE).toFixed(4), ans = (t2 - t1) / n;
        return {
          prompt: t`One transit is centred at $t = ${t1}$ d and a later one at $t = ${t2}$ d, with ${n - 1} transits in between. What is the orbital period, in days?`,
          visual: foldPic('Folding works only at the right period: every transit then lands on the same phase.'),
          answer: ans, units: 'd', tol: { rel: 2e-5 },
          errors: [{ value: (t2 - t1) / (n - 1), feedback: `Count the gaps, not the transits in between: ${n - 1} transits in between means ${n} periods.` }, { value: (t2 - t1) / (n + 1), feedback: `The two named transits bracket ${n} gaps, not ${n + 1}.` }],
          hints: ['How many orbits separate the two transits?', `${n - 1} in between, so ${n} periods.`],
          teach: 'Timing transits far apart pins the period: the error is divided by the number of orbits between them.',
          explain: t`$(${t2} - ${t1})/${n} = ${ans.toFixed(6)}$ d. A timing error of a minute on each transit gives a period error of only about $${(1.41 / 1440 / n * 86400).toFixed(1)}$ s.`,
        };
      },
    }),
    code({
      id: 'depth-code', difficulty: 2,
      prompt: t`The detrended light curve \`detr\`, the period \`P\` and mid-transit time \`t0\` are given. Fold the data, select points with $|\text{phase}| < $ \`DUR/2\` (in transit) and $|\text{phase}| > $ \`DUR\` (out of transit), and set \`depth\` to the out-of-transit mean minus the in-transit mean, and \`depth_err\` to $s_{\text{out}}\sqrt{1/n_{\text{in}} + 1/n_{\text{out}}}$, where $s_{\text{out}}$ is the standard deviation of the out-of-transit points.`,
      starter: PRELUDE + DETR + t`
depth = depth_err = None
print(depth, depth_err)
`,
      answer: PRELUDE + DETR + t`
ph = (t - t0 + P / 2) % P - P / 2
inn, out = np.abs(ph) < DUR / 2, np.abs(ph) > DUR
depth = np.mean(detr[out]) - np.mean(detr[inn])
depth_err = np.std(detr[out]) * np.sqrt(1 / inn.sum() + 1 / out.sum())
print(depth * 1e6, depth_err * 1e6)
`,
      tests: [
        { name: 'the depth is 159 ppm', code: 'depth is not None and abs(depth * 1e6 - 159) < 1.5' },
        { name: 'its uncertainty is about 8 ppm', code: 'depth_err is not None and abs(depth_err * 1e6 - 8) < 1.5' },
        { name: 'the depth agrees with the published ratio squared within 2σ', code: 'depth is not None and abs(depth - 0.01261**2) < 2 * depth_err' },
      ],
      hints: ['`ph = (t - t0 + P / 2) % P - P / 2` gives each point’s time from the nearest mid-transit, in days.', 'Two boolean masks, `np.abs(ph) < DUR / 2` and `np.abs(ph) > DUR`; then means and `np.std`.'],
      teach: 'Folding stacks every transit, so the depth’s error shrinks as one over the square root of the number of in-transit points.',
      explain: t`$\delta = 159 \pm 8$ ppm. The gap between $\text{DUR}/2$ and $\text{DUR}$ keeps points near the edges, where a real transit is only partly deep, out of both averages.`,
    }),
    mcq({
      id: 'filter-width', difficulty: 2,
      prompt: t`You detrend with a running median only 3 points (1.5 hours) wide, instead of 49. The measured depth falls from 159 ppm to about 23 ppm. Why?`,
      visual: foldPic('The transit lasts 1.8 hours: about four points at a 30-minute cadence.'),
      choices: ['A filter narrower than the transit follows the dip itself, so dividing by it removes most of the transit along with the stellar wobble', 'A narrow filter adds noise, which hides the transit', 'The median of three points is biased high', 'The period search failed'],
      answer: 0,
      why: { 1: 'Noise alone would scatter the depth, not shrink it systematically by a factor of seven.', 2: 'The median is not biased for symmetric noise; the problem is what the filter tracks.', 3: 'The fold used the right period; the transit itself has been divided out.' },
      hints: ['How long is the transit compared with the filter?'],
      teach: 'Detrending filters must be much longer than the signal you want to keep.',
      explain: 'Any filter follows features longer than its window and ignores shorter ones. A one-day window follows the 11-day wobble but not the 1.8-hour transit; a 1.5-hour window follows the transit too, and divides it away. Always check a pipeline step on an injected signal.',
    }),
    mcq({
      id: 'alias', difficulty: 3,
      prompt: 'A search over a wider range of periods than the Explore’s has peaks near 0.419 d, 0.8375 d and 1.675 d. How do you decide which is the planet’s period?',
      visual: periodPic('A schematic periodogram: the true period and its aliases at half and double.'),
      choices: ['Fold at each: at 1.675 d there are two identical dips half a cycle apart, and at 0.419 d the dip is half as deep — so 0.8375 d is the period', 'Take the longest period, since planets rarely orbit so fast', 'Take the shortest, since it fits the most transits', 'Average the three'],
      answer: 0,
      why: { 1: 'Ultra-short periods are rare but real — Kepler-10b is one.', 2: 'At half the true period, every other predicted transit lands where there is none: the folded depth halves.', 3: 'Aliases are not measurements to average; only one is the period.' },
      hints: ['What does a fold at twice the period look like?', 'At half the period, how many of the predicted transits really happen?'],
      teach: 'Fold at the candidate period and its aliases: the true one gives one dip, at full depth.',
      explain: 'Folded on 0.419 d, only half the predicted transits occur, so the averaged dip is half as deep (in the Explore’s data, 72 ppm). Folded on 1.675 d, the real transits fall at two phases, half a cycle apart. Only 0.8375 d gives one full-depth dip.',
    }),
    code({
      id: 'radius-err', difficulty: 3,
      prompt: t`Write \`planet_radius(depth, depth_err, Rs, Rs_err)\` returning \`(Rp, Rp_err)\` in Earth radii, for a depth (a fraction, not ppm) and a stellar radius in solar radii ($1\,R_\odot = 109.08\,R_\oplus$). The errors are independent; remember what a square root does to a relative error.`,
      starter: t`import numpy as np

def planet_radius(depth, depth_err, Rs, Rs_err):
    pass

print(planet_radius(159e-6, 8e-6, 1.065, 0.009))
`,
      answer: t`import numpy as np

def planet_radius(depth, depth_err, Rs, Rs_err):
    Rp = np.sqrt(depth) * Rs * 109.08
    rel = np.hypot(0.5 * depth_err / depth, Rs_err / Rs)
    return Rp, Rp * rel

print(planet_radius(159e-6, 8e-6, 1.065, 0.009))
`,
      tests: [
        { name: 'a 159 ppm transit of a 1.065 R☉ star: 1.46 R⊕', code: 'abs(planet_radius(159e-6, 8e-6, 1.065, 0.009)[0] - 1.4649) < 0.001' },
        { name: 'its uncertainty is 0.039 R⊕', code: 'abs(planet_radius(159e-6, 8e-6, 1.065, 0.009)[1] - 0.0389) < 0.001' },
        { name: 'a depth error alone of 10% gives a 5% radius error', code: 'abs(planet_radius(1e-4, 1e-5, 1.0, 0.0)[1] / planet_radius(1e-4, 1e-5, 1.0, 0.0)[0] - 0.05) < 1e-9' },
      ],
      hints: [t`For $R_p \propto \delta^{1/2} R_\star$, relative errors combine as $\sqrt{(\tfrac12\sigma_\delta/\delta)^2 + (\sigma_{R_\star}/R_\star)^2}$.`, 'Return a tuple: `return Rp, Rp * rel`.'],
      teach: 'A power p multiplies a relative error by p: the square root halves the depth’s relative error.',
      explain: t`$R_p = 1.465 \pm 0.039\,R_\oplus$. Forgetting the $\tfrac12$ would double the depth’s share of the error — an over-cautious result is still a wrong one.`,
    }),
    num({
      id: 'density', difficulty: 2,
      gen(r) {
        const [who, M, R] = r.pick([['Batalha et al. (2011)', 4.56, 1.42], ['Dumusque et al. (2014)', 3.33, 1.47]]);
        const ans = 5.51 * M / R ** 3;
        return {
          prompt: t`${who} give Kepler-10b a mass of $${M}\,M_\oplus$ (from the star’s radial-velocity wobble) and a radius of $${R}\,R_\oplus$. Earth’s mean density is $5.51\ \text{g/cm}^3$. What is the planet’s mean density?`,
          visual: foldPic('The transit gives the radius; the mass needs a second method, radial velocities.'),
          answer: ans, units: 'g/cm^3', tol: { rel: 0.01 },
          errors: [{ value: 5.51 * M / R ** 2, feedback: t`Volume goes as $R^3$, not $R^2$.` }, { value: M / R ** 3, feedback: 'That is in units of Earth’s density; multiply by 5.51 g/cm³.' }],
          hints: [t`$\rho/\rho_\oplus = (M/M_\oplus)/(R/R_\oplus)^3$.`],
          teach: 'Mass from radial velocities and radius from transits together give a density — and the planet’s composition.',
          explain: t`$\rho = 5.51 \times ${M}/${R}^3 = ${ans.toFixed(1)}\ \text{g/cm}^3$. The two published values differ (8.8 against 5.8) mostly because the mass was remeasured; both are rocky, but a re-analysis moved the answer by more than its first error bar suggested.`,
        };
      },
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-injection', difficulty: 3,
      prompt: t`How small a planet could these data find? Write \`recovery_fraction(depth_ppm, n)\`: for seeds \`0 … n−1\`, make a light curve of pure noise (100 ppm, \`np.random.default_rng(seed)\`, the same times \`t\`) with a box transit of \`depth_ppm\` injected at the true period and phase (use \`phase\` and \`DUR\`), run \`box_search\` at \`P_TRUE\`, and return the fraction of seeds whose SNR is at least 7.1, Kepler’s detection threshold.`,
      starter: PRELUDE + t`
def recovery_fraction(depth_ppm, n):
    pass

print(recovery_fraction(159, 10), recovery_fraction(60, 20), recovery_fraction(10, 10))
`,
      answer: PRELUDE + t`
def recovery_fraction(depth_ppm, n):
    hits = 0
    for seed in range(n):
        r = np.random.default_rng(seed)
        f = 1 - depth_ppm * 1e-6 * (np.abs(phase) < DUR / 2) + 100e-6 * r.normal(size=t.size)
        if box_search(t, f, P_TRUE, DUR)[0] >= 7.1:
            hits += 1
    return hits / n

print(recovery_fraction(159, 10), recovery_fraction(60, 20), recovery_fraction(10, 10))
`,
      tests: [
        { name: 'a Kepler-10b-sized transit is always recovered', code: 'recovery_fraction(159, 10) == 1.0' },
        { name: 'a 10 ppm transit is never recovered', code: 'recovery_fraction(10, 10) == 0.0' },
        { name: 'a 60 ppm transit is recovered only sometimes', code: '0 < recovery_fraction(60, 20) < 1' },
      ],
      hints: ['Inside a loop over seeds, build the flux exactly as the prelude does, without the wobble, with the new depth.', '`box_search(t, f, P_TRUE, DUR)[0]` is the SNR; count those ≥ 7.1.'],
      teach: 'Injection and recovery measures what a pipeline can and cannot find — the completeness every survey result needs.',
      explain: t`Around 60 ppm the recovery is a coin toss: with 100 ppm noise and 40 days, that is the detection limit — about $${(Math.sqrt(60e-6) * RSUN_REARTH).toFixed(2)}\,R_\oplus$ around a Sun-sized star. Kepler’s planet-occurrence rates rest on exactly this kind of injection test.`,
    }),
    num({
      id: 'cp-earth', difficulty: 2, transfer: true,
      gen(r) {
        const [name, R] = r.pick([['Earth', 6371], ['Mars', 3390], ['Jupiter', 69911], ['Neptune', 24622]]);
        const ans = (R / 695700) ** 2 * 1e6;
        return {
          prompt: t`A distant observer watches ${name} (mean radius ${R.toLocaleString('en-US').replace(/,/g, ' ')} km) transit the Sun (radius 695 700 km). How deep is the transit, in parts per million?`,
          visual: foldPic('A transit seen from afar: the depth is the planet’s disc as a fraction of the star’s.', { model: false }),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: R / 695700 * 1e6, feedback: 'The depth is the ratio of areas: square the radius ratio.' }],
          hints: [t`$\delta = (R_p/R_\odot)^2$, then $\times 10^6$ for ppm.`],
          teach: 'Transit depth scales as the square of the planet’s size: small planets are hard.',
          explain: t`$(${R}/695\,700)^2 = ${ans < 1000 ? ans.toFixed(1) + '\\ \\text{ppm}' : (ans / 1e4).toFixed(2) + '\\%'}$. ${name === 'Earth' ? 'About half of Kepler-10b’s depth, and only once a year: finding true Earth analogues needs years of data and very quiet stars.' : 'Compare Kepler-10b’s 159 ppm.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-conclusion', difficulty: 2,
      prompt: 'Which conclusion does this project support?',
      visual: periodPic('The box search on the synthetic light curve, schematically.', false),
      choices: [
        'Our pipeline recovers the published period and a radius of 1.46 ± 0.04 R⊕ from synthetic photometry built with Kepler-10b’s parameters, and its detection limit with 100 ppm noise over 40 days is about 60 ppm',
        'We have independently confirmed that Kepler-10b is rocky',
        'Kepler-10b’s radius is 1.46 R⊕, so the published 1.47 R⊕ is slightly wrong',
        'Box-shaped transits fit Kepler data perfectly',
      ],
      answer: 0,
      why: { 1: 'Rocky needs a mass, which this project never measured — and the data were synthetic.', 2: 'The difference is a fraction of the error bar, and our data were built from the published ratio.', 3: 'Real transits have limb-darkened, rounded shapes; the box is a simplification of the synthetic data.' },
      hints: ['What were the data, and what was measured?'],
      teach: 'A pipeline validated on synthetic data supports claims about the pipeline, stated with its limits.',
      explain: 'The defensible claim is about the method: it recovers the input and has a measured detection limit. Run on the real Kepler light curve (with a limb-darkened model), it would make a claim about the planet.',
    }),
  ],
  sources: [SRC2.batalha, SRC2.dumusque, SRC2.iau2015, { label: 'Lightkurve tutorial: “Recover a known planet” (Kepler-10b)', url: 'https://github.com/lightkurve/lightkurve' }, { label: 'J. M. Jenkins et al., “Overview of the Kepler science processing pipeline”, ApJL 713, L87 (2010) (the 7.1σ detection threshold)', url: 'https://doi.org/10.1088/2041-8205/713/2/L87' }],
});
