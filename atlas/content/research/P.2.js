// Miniature project 2 — the Pantheon+ Hubble diagram: measure H₀ and Ωm.
// A guided mini-paper on a SYNTHETIC subset: 40 type Ia supernova distance
// moduli drawn from flat ΛCDM with the published H₀ = 73.04 km/s/Mpc
// (SH0ES, Riess et al. 2022) and Ωm = 0.334 (Pantheon+, Brout et al. 2022),
// scatter 0.15 mag, already calibrated (as if with SH0ES's Cepheid zero
// point). Steps: the distance-modulus model by numerical integration, a χ²
// grid in (H₀, Ωm), Δχ² = 1 profile ranges, the H₀–Ωm degeneracy, the
// absolute-magnitude degeneracy that makes H₀ a calibration problem (→ P.7),
// χ²/ν, and the comparison with Pantheon+ (0.334 ± 0.018, statistics plus
// systematics on ~1500 supernovae) and with Planck (67.4 ± 0.5): the Hubble
// tension, 4.9σ. Transfer: a gravitational-wave standard siren.
// Fitting and χ² are lab.A5–A6; numbers quoted from the Explore were copied
// from running it in this Atlas's Pyodide.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { gaussFn } from './_rs.js';
import { r6, SRC2 } from './_rs2.js';

const t = String.raw;
const C = 299792.458;
// μ(z) in flat ΛCDM by Simpson's rule
function dLof(z, H0, Om) {
  const n = 200, h = z / n; let s = 0;
  for (let i = 0; i <= n; i++) { const x = i * h, w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2; s += w / Math.sqrt(Om * (1 + x) ** 3 + 1 - Om); }
  return (1 + z) * (C / H0) * s * h / 3;
}
const muOf = (z, H0, Om) => 5 * Math.log10(dLof(z, H0, Om) * 1e6 / 10);

// a constructed noisy Hubble diagram for pictures (its own seeded generator; not the Explore's data)
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let q = s; q = Math.imul(q ^ (q >>> 15), q | 1); q ^= q + Math.imul(q ^ (q >>> 7), q | 61); return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; }
const PIC = (() => { const u = rng(11); const g = () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u()); return Array.from({ length: 30 }, () => { const lz = -2 + 2.18 * u(); const z = 10 ** lz; return [lz, muOf(z, 73.04, 0.334) + 0.15 * g()]; }); })();
const modelDots = (H0, Om, color, when) => Array.from({ length: 90 }, (_, i) => { const lz = -2 + i * 2.2 / 89; return { x: r6(lz), y: r6(muOf(10 ** lz, H0, Om)), r: 1.3, color, ...(when ? { when } : {}) }; });
const hubblePic = (caption, { extra = [], models = true } = {}) => ({
  type: 'graph',
  params: {
    x: [-2.1, 0.3], y: [32, 46.5], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'redshift z', ylabel: 'distance modulus μ (mag)', xticks: 3, yticks: 4,
    points: [...(models ? [...modelDots(73.04, 0.334, 'accent'), ...modelDots(73.04, 1.0, 'ink4')] : []), ...PIC.map(([x, y]) => ({ x: r6(x), y: r6(y), color: 'gold', r: 3.2 })), ...extra],
    legend: models ? [{ label: 'Ωm = 0.334 (ΛCDM)', color: 'accent' }, { label: 'Ωm = 1, no Λ', color: 'ink4' }, { label: 'synthetic supernovae', color: 'gold', point: true }] : [{ label: 'synthetic supernovae', color: 'gold', point: true }],
    legendAt: 'tl',
  },
  caption,
});
// the same diagram relative to a matter-only universe, where Λ shows
const residPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-2.1, 0.3], y: [-0.6, 1.0], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'redshift z', ylabel: 'μ − μ(Ωm = 1) (mag)', xticks: 3, yticks: 4,
    points: [
      ...Array.from({ length: 90 }, (_, i) => { const lz = -2 + i * 2.2 / 89; return { x: r6(lz), y: r6(muOf(10 ** lz, 73.04, 0.334) - muOf(10 ** lz, 73.04, 1.0)), r: 1.3, color: 'accent' }; }),
      ...PIC.map(([x, y]) => ({ x: r6(x), y: r6(y - muOf(10 ** x, 73.04, 1.0)), color: 'gold', r: 3.2 })),
    ],
    hlines: [{ y: 0, color: 'ink4' }],
    legend: [{ label: 'Ωm = 0.334 (ΛCDM)', color: 'accent' }, { label: 'Ωm = 1, no Λ (zero line)', color: 'ink4' }, { label: 'synthetic supernovae', color: 'gold', point: true }],
    legendAt: 'tl',
  },
  caption,
});
const tensionPic = (caption) => ({
  type: 'graph',
  params: {
    x: [64, 78], y: [0, 0.9], aspect: 'wide', axesAt: 'edge', xlabel: 'H₀ (km/s/Mpc)', ylabel: '', yticks: 0, xticks: 7,
    curves: [{ fn: gaussFn(67.4, 0.5), color: 'violet', width: 2.2, label: 'Planck 2018', labelAt: 65.4, labelDy: -8 }, { fn: gaussFn(73.04, 1.04), color: 'gold', width: 2.2, label: 'SH0ES 2022', labelAt: 74.4, labelDy: -10 }],
    shade: [{ fn: gaussFn(67.4, 0.5), lower: '0', from: 65, to: 70, color: 'violet', alpha: 0.18 }, { fn: gaussFn(73.04, 1.04), lower: '0', from: 69, to: 77.5, color: 'gold', alpha: 0.18 }],
  },
  caption,
});

const PRELUDE = t`import numpy as np
C = 299792.458                     # speed of light, km/s

def mu_model(z, H0, Om):
    """Distance modulus in flat Lambda-CDM (trapezoid rule on a fine grid)."""
    zg = np.linspace(0, z.max(), 2001)
    Einv = 1 / np.sqrt(Om * (1 + zg)**3 + 1 - Om)
    I = np.concatenate([[0], np.cumsum((Einv[1:] + Einv[:-1]) / 2 * np.diff(zg))])
    dL = (1 + z) * (C / H0) * np.interp(z, zg, I)          # Mpc
    return 5 * np.log10(dL * 1e6 / 10)

# SYNTHETIC distance moduli: 40 supernovae drawn from flat Lambda-CDM with
# the published H0 = 73.04 (SH0ES) and Om = 0.334 (Pantheon+), scatter 0.15 mag
rng = np.random.default_rng(2022)
z = np.sort(10 ** rng.uniform(np.log10(0.01), np.log10(1.5), 40))
sig = np.full(z.size, 0.15)
mu = mu_model(z, 73.04, 0.334) + sig * rng.normal(size=z.size)
`;
const EXPLORE = PRELUDE + t`
# chi-squared on a grid of (H0, Om)
H0s = np.arange(68, 78.01, 0.1)
Oms = np.arange(0.05, 0.701, 0.01)
chi2 = np.array([[np.sum(((mu - mu_model(z, h, o)) / sig)**2) for h in H0s] for o in Oms])
i, j = np.unravel_index(np.argmin(chi2), chi2.shape)
print(f"best fit: H0 = {H0s[j]:.1f} km/s/Mpc, Om = {Oms[i]:.2f}")
print(f"chi2 = {chi2[i, j]:.1f} for {z.size - 2} degrees of freedom")

# 68% ranges from the profile: where chi2 rises by 1 above its minimum
inH = H0s[chi2.min(axis=0) <= chi2.min() + 1]
inO = Oms[chi2.min(axis=1) <= chi2.min() + 1]
print(f"H0 from {inH.min():.1f} to {inH.max():.1f};  Om from {inO.min():.2f} to {inO.max():.2f}")

import atlas.plot as plt
zz = np.geomspace(0.01, 1.5, 200)
plt.scatter(np.log10(z), mu, label="synthetic supernovae")
plt.plot(np.log10(zz), mu_model(zz, H0s[j], Oms[i]), label="best fit")
plt.plot(np.log10(zz), mu_model(zz, H0s[j], 1.0), label="same H0, Om = 1")
plt.xlabel("log10 z"); plt.ylabel("distance modulus (mag)"); plt.legend(); plt.show()
`;
const OUT = { H0: 74.2, Om: 0.36, chi2: 43.4, dof: 38, Hlo: 73.2, Hhi: 75.1, Olo: 0.32, Ohi: 0.41 };

export default lesson({
  id: 'research.P.2',
  title: 'The Pantheon+ Hubble diagram: measure H₀ and Ωm',
  minutes: 25, difficulty: 3,
  intro: t`**The question.** How fast is the universe expanding today ($H_0$), and how much of it is matter ($\Omega_m$)? Type Ia supernovae are standard candles: their apparent brightness gives a distance, their spectrum a redshift. The Pantheon+ compilation (about 1700 light curves of 1550 supernovae) fits these with flat ΛCDM and finds $\Omega_m = 0.334 \pm 0.018$; with the SH0ES Cepheid calibration, $H_0 = 73.04 \pm 1.04$ km/s/Mpc.

**The data here are synthetic**: 40 distance moduli drawn from flat ΛCDM with exactly those published values and a scatter of 0.15 mag — so this project tests the *method*, and how much 40 supernovae can say. The model connects redshift to distance modulus:

$$\mu = 5\log_{10}\frac{d_L}{10\ \text{pc}}, \qquad d_L = (1+z)\,\frac{c}{H_0}\int_0^z \frac{dz'}{\sqrt{\Omega_m(1+z')^3 + 1 - \Omega_m}}$$`,
  symbols: [
    { tex: '\\mu', text: 'the distance modulus: apparent minus absolute magnitude, in magnitudes' },
    { tex: 'd_L', text: 'the luminosity distance, in parsecs (or megaparsecs, $1\\ \\text{Mpc} = 10^6$ pc): the distance that makes the inverse-square law hold' },
    { tex: 'z', text: 'the redshift: how much the light’s wavelength has been stretched, $\\lambda_{\\text{obs}}/\\lambda_{\\text{emit}} - 1$' },
    { tex: 'H_0', text: 'the Hubble constant, the expansion rate today, in km/s per Mpc' },
    { tex: '\\Omega_m', text: 'the fraction of the critical density in matter; in a flat universe the rest, $1 - \\Omega_m$, is the cosmological constant' },
    { tex: 'c', text: 'the speed of light, $299\\,792.458$ km/s' },
  ],
  why: t`The supernova Hubble diagram discovered the accelerating universe — and today it sits at the centre of the Hubble tension, the largest disagreement in cosmology.`,
  visual: {
    type: 'code-runner',
    title: 'Fit the Hubble diagram',
    lead: t`Run it: the program draws 40 synthetic supernovae, computes $\chi^2$ on a grid of $H_0$ and $\Omega_m$, reads off the best fit and the 68% ranges, and plots the Hubble diagram with the fit and a matter-only universe for contrast. It takes a few seconds.`,
    tasks: ['Compare the two curves at z ≈ 1: Λ makes distant supernovae about half a magnitude fainter than Ωm = 1 would.', 'Change the seed 2022 and rerun: the best fit moves by about its stated range.', 'Change 40 to 160 supernovae: the ranges shrink by about half, as 1/√N.'],
    params: { code: EXPLORE, rows: 20 },
    caption: 'Synthetic data from the published flat ΛCDM model with 0.15 mag Gaussian scatter and no systematic errors. Real Pantheon+ distances carry a full covariance matrix of statistical and systematic errors.',
  },
  example: {
    prompt: t`Write the mini-paper’s result and comparison: the best fit, its uncertainty, the quality of the fit, and how it stands against Pantheon+ and Planck.`,
    visual: residPic('The Hubble diagram relative to a matter-only universe with the same H₀: distant supernovae are fainter (higher) than it allows — the signature of Λ. The points are a separate illustrative synthetic draw, not the Explore’s data.'),
    steps: [
      { label: 'Best fit', text: t`The $\chi^2$ grid has its minimum at $H_0 = ${OUT.H0}$ km/s/Mpc, $\Omega_m = ${OUT.Om}$.` },
      { label: 'Uncertainty', text: t`Where the profile $\chi^2$ rises by 1: $H_0$ from ${OUT.Hlo} to ${OUT.Hhi}, $\Omega_m$ from ${OUT.Olo} to ${OUT.Ohi}. So $H_0 = 74.2 \pm 1.0$ and $\Omega_m = 0.36 \pm 0.05$ — both within about $1\sigma$ of the values the data were made from.` },
      { label: 'Fit quality', text: t`$\chi^2 = ${OUT.chi2}$ for ${OUT.dof} degrees of freedom: $\chi^2/\nu = ${(OUT.chi2 / OUT.dof).toFixed(2)}$, a probability of about 0.25 of a worse value by chance. The model and the 0.15 mag errors describe the data.` },
      { label: 'Scale up', text: t`Statistical errors fall as $1/\sqrt{N}$: 1550 supernovae instead of 40 would shrink $\pm 0.05$ to about $\pm ${(0.05 * Math.sqrt(40 / 1550)).toFixed(3)}$. Pantheon+ quotes $\pm 0.018$: the difference is **systematic error** — calibration, dust, selection — which more supernovae do not reduce.` },
      { label: 'Compare', text: t`Our $H_0$ was built in from the SH0ES calibration, so it can only agree with 73.04. The live question is Planck’s $67.4 \pm 0.5$ from the cosmic microwave background — about $5\sigma$ away. Supernovae alone cannot settle it, because $H_0$ depends on their calibration.` },
    ],
    answer: t`$H_0 = 74.2 \pm 1.0$ km/s/Mpc and $\Omega_m = 0.36 \pm 0.05$ from 40 synthetic supernovae, $\chi^2/\nu = 1.14$: the method recovers the input within its errors. A real result needs the real data and their systematic covariance.`,
  },
  practice: [
    num({
      id: 'distance', difficulty: 1,
      gen(r) {
        const m = r.pick([33.5, 35.2, 36.8, 38.1, 40.4, 42.0]);
        const ans = 10 ** ((m + 5) / 5) / 1e6;
        return {
          prompt: t`A supernova has distance modulus $\mu = ${m}$ mag. What is its luminosity distance, in megaparsecs?`,
          visual: hubblePic('The Hubble diagram: every 5 magnitudes of μ is a factor of 10 in distance.'),
          answer: ans, units: 'Mpc', tol: { rel: 0.01 },
          errors: [{ value: 10 ** (m / 5) / 1e6, feedback: t`Invert carefully: $d_L/10\ \text{pc} = 10^{\mu/5}$, so $d_L = 10^{\mu/5 + 1}$ pc.` }, { value: 10 ** ((m + 5) / 5), feedback: 'That is in parsecs; divide by 10⁶ for megaparsecs.' }],
          hints: [t`$d_L = 10 \times 10^{\mu/5}$ pc.`, t`$1\ \text{Mpc} = 10^6$ pc.`],
          teach: t`Five magnitudes of distance modulus is a factor of ten in distance.`,
          explain: t`$d_L = 10^{(${m} + 5)/5}$ pc $= ${ans < 1000 ? ans.toFixed(0) : (ans / 1000).toFixed(2) + '\\times10^{3}'}$ Mpc.`,
        };
      },
    }),
    num({
      id: 'hubble-law', difficulty: 2,
      gen(r) {
        const z = r.pick([0.015, 0.02, 0.025, 0.03]), H = r.pick([68, 70, 72, 74]);
        const m = +muOf(z, H, 0.334).toFixed(2), d = 10 ** ((m + 5) / 5) / 1e6, ans = C * z / d;
        return {
          prompt: t`A nearby supernova at $z = ${z}$ has $\mu = ${m}$ mag. Using the Hubble law $cz = H_0 d$ (valid for $z \ll 1$), estimate $H_0$ in km/s/Mpc.`,
          visual: hubblePic('At low redshift the Hubble diagram is a straight line on these axes: distance proportional to z.'),
          answer: ans, units: 'km/s/Mpc', tol: { rel: 0.01 },
          errors: [{ value: z * C / (10 ** (m / 5) / 1e6), feedback: t`Check the distance: $d = 10^{(\mu + 5)/5}$ pc.` }],
          hints: [t`First the distance: $d = 10^{(${m} + 5)/5}$ pc, in Mpc.`, t`Then $H_0 = cz/d$ with $c = 299\,792$ km/s.`],
          teach: 'At low redshift a supernova’s distance and velocity give the Hubble constant directly.',
          explain: t`$d = ${d.toFixed(1)}$ Mpc and $cz = ${(C * z).toFixed(0)}$ km/s, so $H_0 = ${ans.toFixed(1)}$ km/s/Mpc. The supernova’s μ was made from the full ΛCDM distance with $H_0 = ${H}$: the straight Hubble law is off by ${((H / ans - 1) * 100).toFixed(1)}% even at this redshift, which is why careful analyses use the full model.`,
        };
      },
    }),
    code({
      id: 'mu-code', difficulty: 3,
      prompt: t`Write \`mu_model(z, H0, Om)\` for an **array** of redshifts \`z\`: integrate $1/\sqrt{\Omega_m(1+z')^3 + 1 - \Omega_m}$ from 0 to each $z$ (the trapezoid rule on a fine grid is plenty), form $d_L$ in Mpc, and return $\mu = 5\log_{10}(d_L/10\ \text{pc})$.`,
      starter: t`import numpy as np
C = 299792.458                     # km/s

def mu_model(z, H0, Om):
    pass

print(mu_model(np.array([0.01, 0.1, 0.5, 1.0]), 70, 0.3))
`,
      answer: t`import numpy as np
C = 299792.458                     # km/s

def mu_model(z, H0, Om):
    zg = np.linspace(0, z.max(), 2001)
    Einv = 1 / np.sqrt(Om * (1 + zg)**3 + 1 - Om)
    I = np.concatenate([[0], np.cumsum((Einv[1:] + Einv[:-1]) / 2 * np.diff(zg))])
    dL = (1 + z) * (C / H0) * np.interp(z, zg, I)      # Mpc
    return 5 * np.log10(dL * 1e6 / 10)

print(mu_model(np.array([0.01, 0.1, 0.5, 1.0]), 70, 0.3))
`,
      tests: [
        { name: 'μ(z = 0.5) = 42.26 for H₀ = 70, Ωm = 0.3', code: 'abs(mu_model(np.array([0.5]), 70, 0.3)[0] - 42.2612) < 0.005' },
        { name: 'μ(z = 0.01) = 33.18 for H₀ = 70, Ωm = 0.3', code: 'abs(mu_model(np.array([0.01, 0.5]), 70, 0.3)[0] - 33.1753) < 0.005' },
        { name: 'doubling H₀ makes every μ smaller by 5 log₁₀ 2', code: 'np.allclose(mu_model(np.array([0.1, 1.0]), 70, 0.3) - mu_model(np.array([0.1, 1.0]), 140, 0.3), 5 * np.log10(2))' },
        { name: 'more matter, nearer supernovae at z = 1', code: 'mu_model(np.array([1.0]), 70, 1.0)[0] < mu_model(np.array([1.0]), 70, 0.3)[0]' },
      ],
      hints: [t`Make a grid \`zg = np.linspace(0, z.max(), 2001)\` and the integrand \`1 / np.sqrt(Om*(1+zg)**3 + 1 - Om)\`.`, t`A cumulative trapezoid gives the integral at every grid point; \`np.interp(z, zg, I)\` reads it at each $z$. Then $d_L = (1+z)(c/H_0)I$ in Mpc and $\mu = 5\log_{10}(d_L\times10^6/10)$.`],
      teach: 'The model is the heart of the fit: test it against a known value and its scalings before fitting anything.',
      explain: t`$\mu(0.5) = 42.26$ for $H_0 = 70$, $\Omega_m = 0.3$ is a standard check value. The scaling test is exact: $d_L \propto 1/H_0$, so $\mu$ shifts by $5\log_{10}2 = 1.505$ mag. More matter decelerates the expansion more, so a supernova at a given redshift is closer — and brighter.`,
    }),
    num({
      id: 'mb-shift', difficulty: 3,
      gen(r) {
        const dm = r.pick([0.03, 0.05, 0.08, 0.1, 0.2]);
        const ans = (10 ** (dm / 5) - 1) * 100;
        return {
          prompt: t`A supernova’s distance modulus is its apparent magnitude minus the absolute magnitude $M_B$ that the calibration supplies. If $M_B$ is too faint by $${dm}$ mag, every $\mu$ comes out $${dm}$ mag too small, so every distance too small. By what percentage is $H_0$ then too large?`,
          visual: hubblePic('Shifting every point down by the same amount mimics a larger H₀: the shape, which fixes Ωm, is untouched.'),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (10 ** (dm / 2.5) - 1) * 100, feedback: t`Distance goes as $10^{\mu/5}$, not $10^{\mu/2.5}$ (that is flux).` }, { value: dm * 100, feedback: 'Magnitudes are logarithmic: convert the shift into a distance factor first.' }],
          hints: [t`A shift $\delta\mu$ changes every distance by the factor $10^{\delta\mu/5}$.`, t`$H_0 \propto 1/d$, so $H_0$ changes by the same factor.`],
          teach: t`$H_0$ from supernovae is only as good as their calibration: a magnitude offset $\delta$ scales $H_0$ by $10^{\delta/5}$.`,
          explain: t`$10^{${dm}/5} = ${(1 + ans / 100).toFixed(4)}$: $H_0$ is ${ans.toFixed(1)}% too large. The whole Hubble tension, 73 against 67.4, is a factor of ${(73.04 / 67.4).toFixed(3)} — a calibration error of $${(5 * Math.log10(73.04 / 67.4)).toFixed(2)}$ mag would mimic it, which is why the Cepheid and parallax rungs ([P.7](#/lesson/research.P.7)) are scrutinized so hard.`,
        };
      },
    }),
    code({
      id: 'lowz', difficulty: 2,
      prompt: t`Estimate $H_0$ from the **nearby** supernovae alone: keep those with $z < 0.1$, fix $\Omega_m = 0.334$ (nearby distances hardly depend on it), compute $\chi^2$ for every $H_0$ in \`np.arange(68, 78.01, 0.1)\`, and set \`H0_low\` to the one with the smallest $\chi^2$.`,
      starter: PRELUDE + t`
H0s = np.arange(68, 78.01, 0.1)
H0_low = None
print(H0_low)
`,
      answer: PRELUDE + t`
H0s = np.arange(68, 78.01, 0.1)
low = z < 0.1
chi2 = [np.sum(((mu[low] - mu_model(z[low], h, 0.334)) / sig[low])**2) for h in H0s]
H0_low = H0s[int(np.argmin(chi2))]
print(H0_low, low.sum())
`,
      tests: [
        { name: 'H₀ from the 25 nearby supernovae is 74.0', code: 'H0_low is not None and abs(H0_low - 74.0) < 0.15' },
        { name: 'it lies within 3 km/s/Mpc of the value the data were made from', code: 'H0_low is not None and abs(H0_low - 73.04) < 3' },
      ],
      hints: ['`low = z < 0.1` is a mask; `mu[low]`, `z[low]` and `sig[low]` keep the nearby ones.', 'Make a list of χ² values, one per H₀, then `H0s[int(np.argmin(chi2))]`.'],
      teach: 'Nearby supernovae measure H₀ almost independently of Ωm, which is why H₀ analyses use them.',
      explain: t`The 25 supernovae below $z = 0.1$ give $H_0 = 74.0$, close to the two-parameter fit. Try $\Omega_m = 0.25$ or $0.45$ instead: $H_0$ moves by only a few tenths.`,
    }),
    mcq({
      id: 'calibration', difficulty: 2,
      prompt: 'Why can supernovae on their own measure Ωm but not H₀?',
      visual: residPic('Moving every point up or down together changes H₀ (or the calibration); bending the high-redshift end changes Ωm. Illustrative synthetic points.'),
      choices: [t`$H_0$ and the supernovae’s absolute magnitude $M_B$ enter only as one combination, a vertical shift of the diagram; the shape that fixes $\Omega_m$ does not depend on either`, 'Nearby supernovae are too faint to measure', t`$\Omega_m$ is measured by the cosmic microwave background, not by supernovae`, t`$H_0$ changes with time, so it cannot be measured`],
      answer: 0,
      why: { 1: 'Nearby supernovae are the brightest ones; the issue is knowing how bright they are intrinsically.', 2: 'Supernovae measure Ωm well on their own: the Pantheon+ value is from supernovae alone.', 3: t`$H_0$ is defined as today’s value; it is measurable.` },
      hints: [t`What does changing $M_B$ by a constant do to every point? What does changing $H_0$ do?`],
      teach: t`Supernovae measure relative distances; turning them into $H_0$ needs an absolute calibration from another rung of the distance ladder.`,
      explain: t`Both $H_0$ and $M_B$ move every point up or down by the same amount, so the data cannot separate them. SH0ES fixes $M_B$ with Cepheids whose own scale comes from parallaxes — the ladder of [P.7](#/lesson/research.P.7).`,
    }),
    mcq({
      id: 'chi2nu', difficulty: 2,
      prompt: t`The fit gives $\chi^2 = 43.4$ for 38 degrees of freedom. What does that say?`,
      visual: { type: 'graph', params: { x: [10, 70], y: [0, 0.06], aspect: 'wide', axesAt: 'edge', xlabel: 'χ² for 38 degrees of freedom', ylabel: '', yticks: 0, xticks: 6, curves: [{ fn: 'exp(18*ln(x) - x/2 - 19*ln(2) - ln(gamma(19)))', color: 'accent', width: 2.2 }], shade: [{ fn: 'exp(18*ln(x) - x/2 - 19*ln(2) - ln(gamma(19)))', lower: '0', from: 43.4, to: 70, color: 'gold', alpha: 0.3 }], vlines: [{ x: 43.4, label: '43.4', color: 'gold' }] }, caption: 'The χ² distribution for 38 degrees of freedom; the shaded tail is the chance of a value at least this large if the model and errors are right.' },
      choices: ['The model and the stated errors fit the data acceptably (about a 25% chance of a larger χ²)', 'The fit is poor: χ² should be 0', 'The fit is suspiciously good', 'The errors must be doubled'],
      answer: 0,
      why: { 1: 'With real scatter χ² is about the number of degrees of freedom, never 0.', 2: 'That would be χ²/ν well below 1 — such as 0.44 — the sign of overestimated or correlated errors.', 3: 'Doubling the errors would make χ²/ν about 0.29: far too good.' },
      hints: [t`$\chi^2/\nu$ should be near 1, within about $\sqrt{2/\nu}$.`],
      teach: t`$\chi^2/\nu$ near 1, within $\sqrt{2/\nu}$, says the model and the errors are consistent with the data.`,
      explain: t`$\chi^2/\nu = 1.14$, and $\sqrt{2/38} = 0.23$: well inside the expected range. See [χ² and reduced χ²](#/lesson/lab.A6.1).`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-om', difficulty: 3,
      prompt: t`Fix $H_0$ at the SH0ES value, 73.04, and scan $\Omega_m$ over \`np.arange(0.05, 0.7, 0.001)\`. Set \`Om_best\` to the value with the smallest $\chi^2$, and \`Om_lo\`, \`Om_hi\` to the smallest and largest $\Omega_m$ whose $\chi^2$ is within 1 of that minimum.`,
      starter: PRELUDE + t`
Oms = np.arange(0.05, 0.7, 0.001)
Om_best = Om_lo = Om_hi = None
print(Om_best, Om_lo, Om_hi)
`,
      answer: PRELUDE + t`
Oms = np.arange(0.05, 0.7, 0.001)
chi2 = np.array([np.sum(((mu - mu_model(z, 73.04, o)) / sig)**2) for o in Oms])
Om_best = Oms[np.argmin(chi2)]
inside = Oms[chi2 <= chi2.min() + 1]
Om_lo, Om_hi = inside.min(), inside.max()
print(Om_best, Om_lo, Om_hi)
`,
      tests: [
        { name: 'the best fit is Ωm ≈ 0.396', code: 'Om_best is not None and abs(Om_best - 0.396) < 0.003' },
        { name: 'the range brackets the best fit', code: 'Om_lo is not None and Om_lo < Om_best < Om_hi' },
        { name: 'the range is about ±0.04 wide', code: 'Om_lo is not None and 0.06 < Om_hi - Om_lo < 0.10' },
      ],
      hints: ['Build an array of χ², one per Ωm, with H₀ fixed at 73.04.', '`Oms[chi2 <= chi2.min() + 1]` keeps the values inside the range; take its min and max.'],
      teach: 'Fixing one parameter of a degenerate pair shifts the other: always say what was held fixed.',
      explain: t`With $H_0$ held at 73.04, $\Omega_m = 0.40 \pm 0.04$ — higher than the two-parameter fit’s 0.36, because these data prefer a slightly larger $H_0$, and a higher $\Omega_m$ compensates. It sits $1.5\sigma$ above the 0.334 the data were drawn from: a fluctuation, and a reminder that degeneracies move answers.`,
    }),
    num({
      id: 'cp-tension', difficulty: 2,
      prompt: t`SH0ES measures $H_0 = 73.04 \pm 1.04$ km/s/Mpc; Planck’s fit to the cosmic microwave background gives $67.4 \pm 0.5$. How many combined standard deviations apart are they?`,
      visual: tensionPic('The two measurements as Gaussians of their quoted uncertainties.'),
      answer: (73.04 - 67.4) / Math.hypot(1.04, 0.5), tol: { rel: 0.01 },
      errors: [{ value: (73.04 - 67.4) / (1.04 + 0.5), feedback: 'Independent uncertainties combine in quadrature, not by adding.' }, { value: (73.04 - 67.4) / 1.04, feedback: 'Both values are uncertain: combine both errors.' }],
      hints: [t`Difference $\div \sqrt{\sigma_1^2 + \sigma_2^2}$.`],
      teach: 'The size of a disagreement is the difference divided by the combined uncertainty.',
      explain: t`$(73.04 - 67.4)/\sqrt{1.04^2 + 0.5^2} = ${((73.04 - 67.4) / Math.hypot(1.04, 0.5)).toFixed(1)}\sigma$. Either one measurement has an unrecognized systematic error, or ΛCDM is missing something — the Hubble tension.`,
    }),
    num({
      id: 'cp-siren', difficulty: 2, transfer: true,
      gen(r) {
        const d = r.pick([38, 41, 44, 47]), v = r.pick([2800, 2950, 3100]);
        const ans = v / d;
        return {
          prompt: t`Gravitational waves give distance without any calibration ladder: the waveform fixes the source’s true luminosity. Suppose a neutron-star merger’s waves give $d_L = ${d}$ Mpc, and its host galaxy moves away at ${v} km/s in the Hubble flow (illustrative numbers). What is $H_0$, in km/s/Mpc?`,
          visual: tensionPic('Two methods disagree; a standard siren has independent systematics, so it can arbitrate once enough are found.'),
          answer: ans, units: 'km/s/Mpc', tol: { rel: 0.01 },
          errors: [{ value: d / v, feedback: 'H₀ is velocity divided by distance.' }],
          hints: ['Use the Hubble law: v = H₀ d.'],
          teach: 'A standard siren measures distance from gravitational-wave physics alone, an independent route to H₀.',
          explain: t`$H_0 = ${v}/${d} = ${ans.toFixed(1)}$ km/s/Mpc. The first standard siren, GW170817, gave $70^{+12}_{-8}$ — not yet precise enough to decide the tension, but free of the supernova ladder entirely.`,
        };
      },
    }),
  ],
  sources: [SRC2.brout, SRC2.scolnic, SRC2.shoes, SRC2.planck, { label: 'LIGO Scientific and Virgo Collaborations et al., “A gravitational-wave standard siren measurement of the Hubble constant”, Nature 551, 85 (2017), arXiv:1710.05835', url: 'https://doi.org/10.1038/nature24471' }, { label: 'D. W. Hogg, “Distance measures in cosmology” (1999), arXiv:astro-ph/9905116', url: 'https://arxiv.org/abs/astro-ph/9905116' }],
});
