// Planck’s quantum hypothesis — oscillators (and the cavity's modes) hold
// energy only in steps ε = hf, so a mode's mean energy is hf/(e^(hf/kT) − 1)
// instead of kT; times the mode count this is Planck's law, which contains
// Wien's and Stefan's laws with b and σ fixed by h, c and k. The CMB is the
// showcase (COBE/FIRAS; T = 2.72548 K, Fixsen 2009). Every number is
// computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, H, KB, QE, H_EVS, SIGMA, WIEN_B, WIEN_X, WIEN_NU, T_CMB, T_SUN } from './_constants.js';
import { seg, label, frame, r6 } from './_diagrams.js';
import { planckLambda, peakLambda } from '../../src/viz/model/mp-blackbody.js';

const t = String.raw;
const HK = (H * C) / KB;                         // hc/k, m K
const xOf = (lam, T) => HK / (lam * T);          // hf/kT for a mode of wavelength λ
const share = (x) => x / Math.expm1(x);          // ⟨E⟩/kT = x/(eˣ − 1)
const KT300 = (KB * 300) / QE;                   // eV
const HOK = (WIEN_B * WIEN_X) / C;               // h/k, K s, from b
const K_FIT = (15 * C * C * SIGMA * HOK ** 3) / (2 * Math.PI ** 5);
const CMB_FIRAS = 160.2e9;                       // Hz, the measured peak of B_ν
const Z_REC = 1090;                              // 1 + z at recombination

/**
 * An oscillator's energy ladder: levels 0, hf, 2hf, … (drawn in units of hf),
 * each with a bar for its Boltzmann weight e^(−n hf/kT), and kT marked.
 * x = hf/kT.
 */
function ladder(x, caption, { spacingLabel = 'one quantum, hf' } = {}) {
  const N = 5, kTy = 1 / x;
  const curves = [], points = [], shade = [];
  for (let n = 0; n <= N; n++) {
    curves.push(seg(0, n, 3, n, 'ink2', 2.2));
    points.push(label(0, n, n === 0 ? '0' : n === 1 ? 'hf' : `${n}hf`, 'ink2', -8, 0, 'right'));
    const p = Math.exp(-n * x);
    if (p > 0.003) shade.push({ fn: `${r6(n + 0.2)}`, lower: `${r6(n - 0.2)}`, from: 3.7, to: r6(3.7 + 4.3 * p), color: 'accent', alpha: 0.6 });
  }
  if (kTy < N + 0.5) {
    curves.push(seg(-0.25, kTy, 8.4, kTy, 'warn', 1.5, true));
    points.push(label(8.4, kTy, 'kT', 'warn', 6, 0));
  } else points.push(label(8.4, N + 0.55, `kT ≈ ${kTy >= 100 ? Math.round(kTy) : +kTy.toPrecision(2)} quanta up`, 'warn', 0, 0, 'right'));
  points.push(label(5.9, N + 0.55, 'Boltzmann weight', 'accent', 0, 0, 'center'));
  return {
    type: 'graph',
    params: frame([-1.5, 9.6], [-0.6, N + 1.0], {
      aspect: 'wide', curves, points, shade,
      arrows: [{ from: [3.25, 0.06], to: [3.25, 0.94], color: 'gold', width: 2, label: spacingLabel, labelDx: 8, labelDy: 10 }],
    }),
    caption: caption ?? 'An oscillator’s allowed energies, in steps of one quantum hf, with the relative chance of finding it on each level (bars). The dashed line marks kT. Levels to scale; bars below 0.3% of the ground level’s are not drawn.',
  };
}

/** Planck's mean energy against hf/kT, with the classical value. */
const shareGraph = (pts = [], caption) => ({
  type: 'graph',
  params: {
    x: [0, 8], y: [0, 1.12], aspect: 'wide', xlabel: 'hf / kT', ylabel: '⟨E⟩ / kT',
    curves: [{ fn: 'x/(e^x - 1)', domain: [0.001, 8], color: 'accent', width: 2.6, label: 'Planck: x/(eˣ − 1)', labelAt: 2.2, labelDx: 10, labelDy: -6 }],
    hlines: [{ y: 1, label: 'classical: kT for every mode', color: 'bad' }],
    points: pts,
  },
  caption: caption ?? 'A mode’s average energy in units of kT, against the size of its quantum. Small quanta (left) give the classical kT; big quanta (right) leave the mode almost always empty.',
});

export default lesson({
  id: 'phys2710.MP1.2',
  title: 'Planck’s quantum hypothesis',
  minutes: 14, difficulty: 3,
  intro: t`In October 1900 Max Planck found a formula that fitted every blackbody measurement. In December he derived it — by assuming that the oscillators in the cavity walls can hold energy only in whole multiples of a smallest amount, **a quantum $\varepsilon = hf$**. A mode of frequency $f$ then carries an average energy $\langle E\rangle = hf/(e^{hf/kT} - 1)$ instead of classical physics’ $kT$, and the spectrum becomes

$$B_\lambda(T) = \frac{2hc^2}{\lambda^5}\,\frac{1}{e^{hc/\lambda kT} - 1}$$

When $hf \ll kT$ the quanta are too small to notice and $\langle E\rangle \to kT$: the Rayleigh–Jeans law returns. When $hf \gg kT$ a mode can rarely afford even one quantum, so its share is **frozen out** — no catastrophe. Planck later called the step an act of desperation; it took Einstein (1905) to say that light itself comes in quanta.

> You watched the classical law fail in [Blackbody radiation and the ultraviolet catastrophe](#/lesson/phys2710.MP1.1). This is what replaced it.`,
  symbols: [
    { tex: 'B_\\lambda(T)', text: 'spectral radiance per unit wavelength at temperature $T$, in W sr⁻¹ m⁻³' },
    { tex: 'h', text: t`Planck’s constant, $6.626\,070\,15\times10^{-34}$ J s exactly (since 2019 it defines the kilogram) — or $4.136\times10^{-15}$ eV s` },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s` },
    { tex: '\\lambda', text: 'the wavelength, in m; a mode of wavelength $\\lambda$ has frequency $f = c/\\lambda$' },
    { tex: 'k', text: t`Boltzmann’s constant, $1.380\,649\times10^{-23}$ J/K exactly; $kT$ is $0.0259$ eV at 300 K` },
    { tex: 'T', text: 'the absolute temperature, in K' },
    { tex: 'e', text: 'Euler’s number, 2.718…: $e^{hc/\\lambda kT}$ comes from the Boltzmann factors of the oscillator’s levels' },
    { tex: '\\varepsilon = hf', text: 'the quantum: the smallest step of energy an oscillator of frequency $f$ can take or give' },
  ],
  why: t`Planck’s $h$ sets the scale of every quantum effect that follows — photons, atoms, solids — and his formula is how we read the temperature of the cosmic microwave background, the most perfect blackbody ever measured.`,
  visual: {
    type: 'mp-blackbody',
    title: 'Planck’s law, from 2.7 K to 30 000 K',
    lead: t`Log–log axes, to scale, so every temperature fits on one plot. The orange curve is Planck’s law at the slider’s $T$; the grey ones are the cosmic microwave background, a person and the Sun. Dashed: the Rayleigh–Jeans and Wien laws at the same $T$.`,
    tasks: [
      'Slide T up: the new curve lies above every cooler one at every wavelength, and its peak climbs the dashed line λmax T = b as T⁵.',
      'Follow Rayleigh–Jeans, a straight line of slope −4: Planck’s curve peels away below it once one quantum hc/λ costs more than about kT.',
      'Choose per frequency and the CMB: the peak sits at 160 GHz, while the photons at the wavelength peak have c/λmax = 282 GHz.',
    ],
    params: { T: 5772, axis: 'log', curves: ['planck', 'rj', 'wien'], compare: ['cmb', 'body', 'sun'] },
    caption: t`Planck’s law for a perfect blackbody, to scale on the log–log view. Wien’s 1896 law (dotted violet) matches at short wavelengths and Rayleigh–Jeans (dashed red) at long ones; only Planck’s matches everywhere. Colours are approximate.`,
  },
  example: {
    prompt: t`An oscillator of frequency $f$ may hold energy $0, \varepsilon, 2\varepsilon, 3\varepsilon, \ldots$ with $\varepsilon = hf$. In equilibrium at temperature $T$, the chance of finding it with energy $n\varepsilon$ is proportional to the Boltzmann factor $e^{-n\varepsilon/kT}$. Find its average energy $\langle E\rangle$.`,
    visual: shareGraph([{ x: r6(xOf(550e-9, T_SUN)), y: r6(share(xOf(550e-9, T_SUN))), color: 'gold', label: 'green light in the Sun', labelDx: 10, labelDy: -12 }]),
    steps: [
      { label: 'Name the weights', text: t`Write $x = e^{-\varepsilon/kT}$, a number between 0 and 1. The level $n$ then has weight $x^n$: the ground level 1, the next $x$, then $x^2$, and so on.` },
      { label: 'Add them up', text: t`The weights form a geometric series: $\displaystyle\sum_{n=0}^{\infty} x^n = \frac{1}{1 - x}$.` },
      { label: 'Weight the energies', text: t`$\langle E\rangle = \dfrac{\sum n\varepsilon\,x^n}{\sum x^n}$. Differentiate the geometric series and multiply by $x$: $\displaystyle\sum_{n=0}^{\infty} n x^n = x\frac{d}{dx}\frac{1}{1 - x} = \frac{x}{(1 - x)^2}$.` },
      { label: 'Divide', text: t`$\langle E\rangle = \varepsilon\,\dfrac{x/(1 - x)^2}{1/(1 - x)} = \dfrac{\varepsilon x}{1 - x} = \dfrac{\varepsilon}{1/x - 1} = \dfrac{hf}{e^{hf/kT} - 1}$.` },
      { label: 'The two limits', text: t`If $hf \ll kT$, $e^{hf/kT} - 1 \approx hf/kT$ and $\langle E\rangle \approx kT$ — equipartition, the classical answer. If $hf \gg kT$, $\langle E\rangle \approx hf\,e^{-hf/kT}$, which plunges to zero: the mode is frozen out.` },
      { label: 'Planck’s law', text: t`Multiply by the number of cavity modes per unit volume per hertz, $8\pi f^2/c^3$, and you have the energy density $u(f) = \dfrac{8\pi h f^3}{c^3}\,\dfrac{1}{e^{hf/kT} - 1}$; per unit wavelength and per steradian it becomes $B_\lambda(T)$ above.` },
      { label: 'Sense check', text: t`Green light (550 nm) in the 5772 K Sun has $hf/kT = ${fmt(xOf(550e-9, T_SUN), 3)}$, so its modes hold only $${fmt(share(xOf(550e-9, T_SUN)), 2)}\,kT$ each — the gold point. In a 300 K room the same modes have $hf/kT = ${fmt(xOf(550e-9, 300), 3)}$ and hold $${tex(share(xOf(550e-9, 300)), 1)}\,kT$: nothing, which is why the walls of your room do not glow.` },
    ],
    answer: t`$\langle E\rangle = \dfrac{hf}{e^{hf/kT} - 1}$: $kT$ for small quanta, exponentially small for large ones.`,
  },
  practice: [
    num({
      id: 'one-quantum', difficulty: 1,
      gen(r) {
        const [what, f, fText, unit] = r.pick([
          ['green light', 5.45e14, t`5.45\times10^{14}`, 'eV'],
          ['a microwave oven’s radiation', 2.45e9, t`2.45\times10^{9}`, 'μeV'],
          ['an FM radio broadcast', 1.0e8, t`1.0\times10^{8}`, 'μeV'],
          ['copper K-alpha X-rays', 1.94e18, t`1.94\times10^{18}`, 'keV'],
        ]);
        const eV = H_EVS * f, scale = { eV: 1, μeV: 1e6, keV: 1e-3 }[unit];
        const ratio = eV / KT300;
        return {
          prompt: t`How much energy is one quantum $hf$ of ${what}, at $f = ${fText}$ Hz? Answer in ${unit}. ($h = 4.136\times10^{-15}$ eV s.)`,
          answer: eV * scale, units: unit, tol: { rel: 0.01 },
          errors: [{ value: (f / H_EVS) * scale, feedback: t`Multiply, do not divide: $\varepsilon = hf$.` }],
          hints: [t`$\varepsilon = hf = (4.136\times10^{-15}\ \text{eV s})\times(${fText}\ \text{Hz})$.`],
          teach: t`One quantum of frequency $f$ carries $hf$; with $h = 4.136\times10^{-15}$ eV s, visible light gives about 2 eV.`,
          explain: t`$hf = ${tex(eV, 3)}$ eV. Compare $kT = 0.0259$ eV at room temperature: ${ratio > 1 ? t`one quantum is $${ratio > 1e3 ? tex(ratio, 2) : fmt(ratio, 2)}$ times $kT$, so at 300 K these modes are frozen out (bars in the picture).` : t`one quantum is only $${tex(ratio, 2)}$ of $kT$, so at 300 K these modes behave classically, each holding about $kT$.`}`,
          visual: ladder(ratio, t`An oscillator at this frequency in a 300 K room: its energy levels, the chance of finding it on each, and $kT$ (dashed). Levels to scale.`),
        };
      },
    }),
    num({
      id: 'mean-share', difficulty: 2,
      gen(r) {
        const [what, lam, T, note] = r.pick([
          ['a 10 μm infrared mode in a room at 300 K', 10e-6, 300, 'Thermal infrared at room temperature is partly frozen: this is why a room glows in the infrared but not in visible light.'],
          ['a 1.0 mm microwave mode of the 2.725 K cosmic microwave background', 1e-3, T_CMB, 'Even the CMB’s brightest wavelengths are well into the quantum regime.'],
          ['a 3.0 μm mode inside a 1500 K furnace', 3e-6, 1500, 'Hotter cavities unfreeze shorter wavelengths: kT grows while hc/λ stays put.'],
          ['a 550 nm green mode at the Sun’s 5772 K', 550e-9, T_SUN, 'Even in the Sun, visible modes hold only a few per cent of the classical share.'],
        ]);
        const x = xOf(lam, T), ans = share(x);
        return {
          prompt: t`Planck’s mean energy of a mode is $\langle E\rangle = \dfrac{hf}{e^{hf/kT} - 1}$. For ${what}, what is $\langle E\rangle/kT$ — the fraction of the classical share it actually holds? (Use $hc/k = 1.439\times10^{-2}$ m K, so $hf/kT = hc/\lambda kT$.)`,
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: x, feedback: t`That is $hf/kT$ itself. The mean energy is $\langle E\rangle/kT = x/(e^x - 1)$ with $x = hf/kT$.` },
            { value: Math.exp(-x), feedback: t`$e^{-x}$ is the weight of the first level alone. Planck’s average over all levels is $x/(e^x - 1)$.` },
          ],
          hints: [t`First $x = hc/\lambda kT = \dfrac{1.439\times10^{-2}}{\lambda T}$ with $\lambda$ in metres.`, t`$x = ${fmt(x, 4)}$; then $\langle E\rangle/kT = x/(e^x - 1)$.`],
          teach: t`Planck’s mode energy, in units of $kT$, is $x/(e^x - 1)$ with $x = hf/kT$: near 1 for small quanta, near $xe^{-x}$ for large ones.`,
          explain: t`$x = ${fmt(x, 4)}$, so $\langle E\rangle/kT = ${fmt(x, 4)}/(e^{${fmt(x, 4)}} - 1) = ${fmt(ans, 3)}$. ${note}`,
          visual: ladder(x, 'This mode’s ladder of allowed energies, with the chance of finding it on each level and kT marked. Levels to scale.'),
        };
      },
    }),
    mcq({
      id: 'small-quanta', difficulty: 2,
      prompt: t`For a mode whose quantum is tiny compared with the thermal energy, $hf \ll kT$, Planck’s mean energy $\dfrac{hf}{e^{hf/kT} - 1}$ becomes approximately:`,
      visual: ladder(0.15, 'A mode with hf = 0.15 kT: closely spaced levels, many of them well populated, and kT far above the ground level. Levels to scale.'),
      choices: [t`$kT$`, '0', t`$hf$`, t`$\tfrac12 kT$`],
      answer: 0,
      why: {
        1: 'Zero is the opposite limit, hf ≫ kT, where a mode can rarely afford even one quantum.',
        2: t`$hf$ is the size of one step; when steps are tiny the oscillator spreads over many of them, and its average is far bigger than one step.`,
        3: t`Equipartition’s $\tfrac12 kT$ is per quadratic term; a mode of oscillation has two (like kinetic and potential energy), so it gets $kT$.`,
      },
      hints: [t`For small $u$, $e^u \approx 1 + u$.`, t`So $e^{hf/kT} - 1 \approx hf/kT$.`],
      teach: 'When the quanta are much smaller than kT, Planck’s formula reduces to the classical equipartition value kT.',
      explain: t`With $e^{hf/kT} - 1 \approx hf/kT$, $\langle E\rangle \approx \dfrac{hf}{hf/kT} = kT$. Planck’s law therefore agrees with Rayleigh–Jeans at long wavelengths — exactly where the old law had matched the data.`,
    }),
    num({
      id: 'cmb-temp', difficulty: 2,
      prompt: t`COBE’s FIRAS instrument found that the cosmic microwave background, measured per unit frequency, peaks at $160.2$ GHz. For a blackbody $\nu_{\max} = (5.879\times10^{10}\ \text{Hz/K})\,T$ — the frequency form of Wien’s law. What is the CMB’s temperature?`,
      answer: CMB_FIRAS / WIEN_NU, units: 'K', tol: { rel: 0.005 },
      errors: [{ value: WIEN_B / (C / CMB_FIRAS), feedback: t`You converted 160.2 GHz to a wavelength and used $b/\lambda$. But the frequency peak and the wavelength peak are different photons: use $\nu_{\max}/T = 5.879\times10^{10}$ Hz/K.` }],
      hints: [t`$T = \nu_{\max}/(5.879\times10^{10}\ \text{Hz/K})$.`],
      teach: t`For a blackbody per unit frequency, the peak frequency is proportional to temperature: $\nu_{\max} = 5.879\times10^{10}\ \text{Hz/K}\times T$.`,
      explain: t`$T = \dfrac{1.602\times10^{11}}{5.879\times10^{10}} = ${fmt(CMB_FIRAS / WIEN_NU, 4)}$ K. The best value today is $${T_CMB}$ K, and FIRAS found the spectrum matches Planck’s law to within 50 parts per million of its peak — the most perfect blackbody ever measured.`,
      visual: { type: 'mp-blackbody', params: { T: T_CMB, axis: 'nu', peak: true, controls: false, readout: false, swatch: false }, caption: 'A 2.725 K blackbody per unit frequency, as FIRAS measured the CMB. The grey dot marks c/λmax: the photons at the peak of the per-wavelength curve.' },
    }),
    mcq({
      id: 'peak-mismatch', difficulty: 3, kind: 'error',
      prompt: t`A student reasons: “The CMB’s spectrum per unit wavelength peaks at $\lambda_{\max} = 1.063$ mm, so its spectrum per unit frequency must peak at $c/\lambda_{\max} = 282$ GHz.” FIRAS measured the frequency peak at 160 GHz. What is wrong with the reasoning?`,
      visual: { type: 'mp-blackbody', params: { T: T_CMB, axis: 'lambda', controls: false, readout: false, swatch: false }, caption: 'The same 2.725 K blackbody, per unit wavelength.' },
      choices: [
        t`$B_\lambda$ and $B_\nu$ are different functions — equal steps in wavelength and in frequency are not equal ranges of photons — so their peaks fall at different photons and $\lambda_{\max}\nu_{\max} \ne c$`,
        'The CMB has travelled through the expanding universe, so λν = c does not hold for it',
        'FIRAS measured a different temperature from the wavelength measurements',
        'Wien’s law applies only to stars, not to microwaves',
      ],
      answer: 0,
      why: {
        1: 'Expansion stretches every wavelength, but each photon still obeys λν = c. The error is in assuming the two peaks are the same photon.',
        2: 'One 2.725 K blackbody gives both numbers: b/T = 1.063 mm and 5.879 × 10¹⁰ Hz/K × T = 160 GHz.',
        3: 'Wien’s law holds for any blackbody; the CMB obeys it exactly — in each variable separately.',
      },
      hints: ['Per unit wavelength, a band 1 nm wide is a different slice of photons at 1 mm than per unit frequency, where a band is 1 Hz wide.', t`$B_\nu = B_\lambda\,\lambda^2/c$: multiplying by $\lambda^2$ moves the maximum.`],
      teach: 'A spectrum per unit wavelength and per unit frequency peak at different photons, so λmax·νmax is not c.',
      explain: t`Since $d\nu = c\,d\lambda/\lambda^2$, $B_\nu = B_\lambda\,\lambda^2/c$ — a different function of the same photons, with its maximum elsewhere. For any blackbody $\lambda_{\max}\nu_{\max} = ${fmt((WIEN_B * WIEN_NU) / C, 3)}\,c$; for the CMB, $1.063\ \text{mm}\times160.2\ \text{GHz} = ${tex(1.063e-3 * 160.2e9, 3)}$ m/s.`,
    }),
    num({
      id: 'h-and-k', difficulty: 3,
      prompt: t`In 1900 the measured constants were Wien’s $b$ and Stefan’s $\sigma$, not $h$ and $k$. Planck’s law predicts $b = \dfrac{hc}{4.965\,k}$ and $\sigma = \dfrac{2\pi^5k^4}{15h^3c^2}$. Using today’s $b = 2.897\,772\times10^{-3}$ m K and $\sigma = 5.670\,374\times10^{-8}\ \text{W m}^{-2}\,\text{K}^{-4}$, find Boltzmann’s constant $k$.`,
      answer: K_FIT, units: 'J/K', tol: { rel: 0.005 },
      errors: [{ value: HOK, feedback: t`That is $h/k$, the first step. Now put $h = (h/k)\,k$ into $\sigma$ and solve for $k$.` }],
      hints: [t`From $b$: $\dfrac{h}{k} = \dfrac{4.965\,b}{c} = ${tex(HOK, 4)}$ K s.`, t`Write $\sigma = \dfrac{2\pi^5 k}{15c^2(h/k)^3}$, so $k = \dfrac{15c^2\sigma\,(h/k)^3}{2\pi^5}$.`],
      teach: 'Planck’s law ties the two measured blackbody constants, b and σ, to h and k — so measuring the spectrum measures h and k.',
      explain: t`$k = \dfrac{15\,(2.998\times10^8)^2\,(5.670\times10^{-8})\,(${tex(HOK, 4)})^3}{2\pi^5} = ${tex(K_FIT, 4)}$ J/K, and then $h = k\times(h/k) = ${tex(K_FIT * HOK, 4)}$ J s. Planck did this in 1901 with the data of his day and got $h = 6.55\times10^{-34}$ J s and $k = 1.346\times10^{-23}$ J/K — within a few per cent — and from $k$ the first good values of Avogadro’s number and of the electron’s charge.`,
      visual: { type: 'mp-blackbody', params: { T: 5772, axis: 'log', window: 'fit', controls: false, readout: false, swatch: false }, caption: 'Two features of every blackbody curve: where its peak sits (Wien’s b) and how much area lies under it (Stefan’s σ). Planck’s law fixes both from h, c and k.' },
    }),
    code({
      id: 'wien-root', difficulty: 2,
      prompt: t`Planck’s law per unit wavelength peaks where $x = hc/\lambda kT$ solves $x = 5\,(1 - e^{-x})$ — an equation with no algebraic solution. Finish the function \`wien_x()\` so that it finds the root by **fixed-point iteration**: start at $x = 5$ and repeat $x \leftarrow 5\,(1 - e^{-x})$ fifty times. The program then prints Wien’s constant $b = hc/(xk)$.`,
      starter: t`import math

h = 6.62607015e-34   # J s
c = 299792458        # m/s
k = 1.380649e-23     # J/K

def wien_x():
    x = 5.0
    # repeat x = 5(1 - e^(-x)) fifty times
    return x

print(h * c / (wien_x() * k), "m K")
`,
      answer: t`import math

h = 6.62607015e-34
c = 299792458
k = 1.380649e-23

def wien_x():
    x = 5.0
    for _ in range(50):
        x = 5 * (1 - math.exp(-x))
    return x

print(h * c / (wien_x() * k), "m K")`,
      tests: [
        { name: t`\`wien_x()\` returns $4.965\,114\,23$ to eight decimal places`, code: 'abs(wien_x() - 4.965114231744276) < 1e-8' },
        { name: t`the program prints $b = 2.8978\times10^{-3}$ m K`, code: '"0.0028977" in _stdout' },
      ],
      hints: [t`A loop does the repeating: \`for _ in range(50):\` with the update indented under it.`, t`The update is \`x = 5 * (1 - math.exp(-x))\`; return \`x\` after the loop.`],
      teach: t`Equations like $x = 5(1 - e^{-x})$ have no closed form, but a few lines of iteration find the root to machine precision.`,
      explain: t`Each round shrinks the error by about $5e^{-x} \approx 0.035$, so the loop settles on $x = ${WIEN_X.toFixed(9)}$ within a dozen rounds, and $b = hc/(xk) = ${tex(WIEN_B, 5)}$ m K — exact, because $h$, $c$ and $k$ are now exact by definition.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-colour-ratio', difficulty: 2,
      gen(r) {
        const [star, T] = r.pick([['Rigel', 12100], ['Sirius A', 9940], ['the Sun', T_SUN], ['Betelgeuse', 3600]]);
        const ratio = planckLambda(400e-9, T) / planckLambda(700e-9, T);
        return {
          prompt: t`Treat ${star} as a ${T} K blackbody. By what factor is its spectral radiance $B_\lambda$ at 400 nm (violet) larger than at 700 nm (red)? Use Planck’s law with $hc/k = 1.439\times10^{-2}$ m K.`,
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: (700 / 400) ** 4, feedback: t`That is the classical Rayleigh–Jeans ratio, $(700/400)^4$, whatever the temperature. Planck’s law adds the factor $\dfrac{e^{x_{700}} - 1}{e^{x_{400}} - 1}$.` }],
          hints: [t`$\dfrac{B_\lambda(400)}{B_\lambda(700)} = \left(\dfrac{700}{400}\right)^5\dfrac{e^{x_{700}} - 1}{e^{x_{400}} - 1}$ with $x = hc/\lambda kT$.`],
          teach: 'Planck’s law fixes how a blackbody’s brightness changes across the spectrum — the basis of measuring a star’s temperature from its colour.',
          explain: t`$x_{400} = ${fmt(xOf(400e-9, T), 4)}$ and $x_{700} = ${fmt(xOf(700e-9, T), 4)}$, so the ratio is $${fmt((700 / 400) ** 5, 4)}\times\dfrac{e^{${fmt(xOf(700e-9, T), 4)}} - 1}{e^{${fmt(xOf(400e-9, T), 4)}} - 1} = ${fmt(ratio, 3)}$. ${ratio > 1 ? 'More violet than red: a hot, bluish star.' : 'More red than violet: a cool, reddish star.'} Astronomers turn such colour ratios back into temperatures.`,
          visual: { type: 'mp-blackbody', params: { T, axis: 'lambda', peak: false, controls: false, readout: false }, caption: t`The spectrum of a ${T} K blackbody; the visible band is marked under the curve.` },
        };
      },
    }),
    mcq({
      id: 'cp-frozen', difficulty: 2,
      prompt: 'According to Planck, why do the walls of a room at 300 K not fill it with visible light?',
      visual: ladder(xOf(550e-9, 300), 'A 550 nm mode in a 300 K room: its first quantum lies far above kT (dashed), so the mode almost never holds any energy. Levels to scale.'),
      choices: [
        t`A visible quantum ($\approx 2$ eV) is about 90 times $kT$ ($0.026$ eV), so the Boltzmann factor $e^{-hf/kT}$ leaves those modes almost always empty`,
        'The walls absorb all the visible light they emit',
        'There are fewer modes at visible frequencies than in the infrared',
        'Visible light cannot exist at temperatures below about 1000 K',
      ],
      answer: 0,
      why: {
        1: 'Emission and absorption balance in equilibrium; the question is how much visible radiation the equilibrium contains — almost none.',
        2: 'The opposite: the number of modes per hertz grows as f², so there are more visible modes. Each one is simply empty.',
        3: 'Visible light exists at any temperature; a 300 K body emits a little — about 10⁻³⁵ of the classical amount per mode.',
      },
      hints: ['Compare one visible quantum with kT at room temperature.'],
      teach: 'Modes whose quantum hf is much larger than kT are frozen out: Boltzmann’s factor makes even one quantum improbable.',
      explain: t`At 550 nm, $hf = 2.25$ eV while $kT = 0.0259$ eV, so $hf/kT \approx 87$ and $\langle E\rangle \approx hf\,e^{-87} \approx ${tex(share(xOf(550e-9, 300)), 1)}\,kT$. Classical equipartition would have given every one of those modes $kT$ — and the room would glow white.`,
    }),
    num({
      id: 'cp-recombination', difficulty: 3, transfer: true,
      prompt: t`The CMB was released when the universe became transparent, at a redshift where every wavelength has since stretched by a factor $1 + z = ${Z_REC}$. Stretching every wavelength by one factor keeps Planck’s shape and divides the temperature by that factor. Today $T = ${T_CMB}$ K. At what wavelength did the CMB’s spectrum peak when it was released?`,
      answer: peakLambda(T_CMB * Z_REC) * 1e9, units: 'nm', tol: { rel: 0.01 },
      errors: [
        { value: peakLambda(T_CMB) * 1e9 * Z_REC, feedback: 'Back then the universe was hotter and the light bluer: divide today’s peak wavelength by 1090, do not multiply.' },
        { value: peakLambda(T_CMB) * 1e9, feedback: 'That is today’s peak, 1.063 mm. The question asks for the peak when the light was released.' },
      ],
      hints: [t`Then the temperature was $T = ${T_CMB}\ \text{K}\times${Z_REC}$.`, t`Use Wien’s law: $\lambda_{\max} = b/T$ with $b = 2.898\times10^{-3}$ m K.`],
      teach: 'Cosmic expansion stretches a blackbody into a cooler blackbody: T falls as 1/(1 + z) and the peak wavelength grows as (1 + z).',
      explain: t`$T = ${T_CMB}\times${Z_REC} = ${Math.round(T_CMB * Z_REC)}$ K, about as hot as a lamp filament, and $\lambda_{\max} = \dfrac{2.898\times10^{-3}}{${Math.round(T_CMB * Z_REC)}} = ${fmt(peakLambda(T_CMB * Z_REC) * 1e9, 3)}$ nm, in the near infrared: the young universe glowed a dull orange. Equivalently, today’s 1.063 mm divided by ${Z_REC}.`,
      visual: { type: 'mp-blackbody', params: { T: Math.round(T_CMB * Z_REC), axis: 'log', window: 'fit', compare: ['cmb'], hide: ['peak'], controls: false, readout: false }, caption: 'The CMB today (grey, labelled) and when it was released (orange), to scale on log–log axes: the same Planck shape, shifted along the line of peaks.' },
    }),
  ],
  sources: [
    { label: 'Planck (1901), On the law of distribution of energy in the normal spectrum, Annalen der Physik 4, 553', url: 'https://doi.org/10.1002/andp.19013090310' },
    { label: 'Fixsen et al. (1996), The cosmic microwave background spectrum from the full COBE FIRAS data set, ApJ 473, 576', url: 'https://arxiv.org/abs/astro-ph/9605054' },
    { label: 'Fixsen (2009), The temperature of the cosmic microwave background, ApJ 707, 916', url: 'https://arxiv.org/abs/0911.1955' },
    { label: 'OpenStax University Physics Vol. 3, §6.1 Blackbody radiation', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-1-blackbody-radiation' },
  ],
});
