// The blackbody model behind the mp-blackbody simulation.
//   node atlas/test/mp-blackbody.test.mjs

import * as B from '../src/viz/model/mp-blackbody.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));
/** Simpson's rule on [a, b] with n (even) intervals. */
function simpson(f, a, b, n = 4000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

// the constants, all exact in the 2019 SI (CODATA 2022 lists them to these digits)
check('σ = 5.670 374 419 × 10⁻⁸ W m⁻² K⁻⁴', near(B.SIGMA, 5.670374419e-8, 1e-9), String(B.SIGMA));
check('Wien’s x solves x = 5(1 − e⁻ˣ): 4.965 114 231 7', near(B.WIEN_X, 4.9651142317, 1e-10) && near(B.WIEN_X, 5 * (1 - Math.exp(-B.WIEN_X)), 1e-14));
check('Wien’s b = 2.897 771 955 × 10⁻³ m K', near(B.WIEN_B, 2.897771955e-3, 1e-9), String(B.WIEN_B));
check('the frequency form: ν_max/T = 5.878 925 757 × 10¹⁰ Hz/K', near(B.WIEN_NU, 5.878925757e10, 1e-9), String(B.WIEN_NU));

for (const T of [2.72548, 306, 2800, 5772, 25000]) {
  const tag = `T = ${T} K`;
  // the peak: a numerical search agrees with b/T
  const lm = B.peakLambda(T);
  const left = B.planckLambda(lm * 0.999, T), mid = B.planckLambda(lm, T), right = B.planckLambda(lm * 1.001, T);
  check(`${tag}: B_λ peaks at b/T`, mid > left && mid > right);
  const nm = B.peakNu(T);
  check(`${tag}: B_ν peaks at ν_max`, B.planckNu(nm, T) > B.planckNu(nm * 0.999, T) && B.planckNu(nm, T) > B.planckNu(nm * 1.001, T));
  // the area under the curve is σT⁴/π (integrate in log λ to cover the whole range)
  const total = simpson((u) => { const l = Math.exp(u); return B.planckLambda(l, T) * l; }, Math.log(lm / 40), Math.log(lm * 2000), 8000);
  check(`${tag}: ∫B_λ dλ = σT⁴/π`, near(total, B.exitance(T) / Math.PI, 2e-4), `${total} vs ${B.exitance(T) / Math.PI}`);
  // per-wavelength and per-frequency forms describe the same light: B_λ = B_ν c/λ²
  for (const f of [0.3, 1, 4]) {
    const l = lm * f;
    check(`${tag}: B_λ(${f}λ_max) = B_ν·c/λ²`, near(B.planckLambda(l, T), B.planckNu(B.C / l, T) * B.C / (l * l), 1e-12));
  }
  // the classical limits: Rayleigh–Jeans at long wavelength, Wien at short; RJ ≥ Planck ≥ Wien everywhere
  check(`${tag}: Planck → Rayleigh–Jeans at λ = 1000 λ_max (ratio 1 − x/2, x = 0.005)`, near(B.planckLambda(1000 * lm, T), B.rjLambda(1000 * lm, T), 3e-3));
  check(`${tag}: Planck → Wien at λ = λ_max/10`, near(B.planckLambda(lm / 10, T), B.wienLambda(lm / 10, T), 1e-15 + 1e-12));
  let ordered = true;
  for (let f = 0.05; f < 50; f *= 1.3) { const l = lm * f; if (!(B.rjLambda(l, T) >= B.planckLambda(l, T) && B.planckLambda(l, T) >= B.wienLambda(l, T))) ordered = false; }
  check(`${tag}: Rayleigh–Jeans ≥ Planck ≥ Wien at every wavelength`, ordered);
  // the share of power below λ: 25.0% below the peak, half below λT = 4.1072 × 10⁻³ m K
  check(`${tag}: a quarter of the power lies below λ_max`, Math.abs(B.fractionBelow(lm, T) - 0.2501) < 2e-4, String(B.fractionBelow(lm, T)));
  check(`${tag}: half lies below λT = 4.1072 mm K`, Math.abs(B.fractionBelow(4.1072e-3 / T, T) - 0.5) < 2e-4, String(B.fractionBelow(4.1072e-3 / T, T)));
  // the series and the Simpson branch of the fraction agree where they meet (x = 1, λ = hc/kT)
  const lx1 = (B.H * B.C) / (B.KB * T);
  check(`${tag}: the fraction is continuous at hc/λkT = 1`, Math.abs(B.fractionBelow(lx1 * 0.99999, T) - B.fractionBelow(lx1 * 1.00001, T)) < 1e-5);
  check(`${tag}: the fraction agrees with direct integration at 2λ_max`,
    Math.abs(B.fractionBelow(2 * lm, T) - simpson((u) => { const l = Math.exp(u); return B.planckLambda(l, T) * l; }, Math.log(lm / 40), Math.log(2 * lm), 6000) / (B.exitance(T) / Math.PI)) < 2e-5);
}

// real numbers the lessons use
check('the Sun (5772 K) peaks at 502.0 nm', Math.abs(B.peakLambda(5772) * 1e9 - 502.04) < 0.01);
check('the CMB (2.72548 K) peaks at 1.0632 mm and 160.23 GHz', Math.abs(B.peakLambda(2.72548) * 1e3 - 1.0632) < 1e-4 && Math.abs(B.peakNu(2.72548) / 1e9 - 160.23) < 0.01);
check('λ_max ν_max is 0.568c, not c', Math.abs((B.peakLambda(5772) * B.peakNu(5772)) / B.C - 0.5683) < 1e-4);
check('the CMB’s energy density is 4.17 × 10⁻¹⁴ J/m³', Math.abs(B.energyDensity(2.72548) - 4.175e-14) < 0.005e-14, String(B.energyDensity(2.72548)));
check('the CMB’s B_ν peak is 384 MJy/sr (FIRAS: about 385)', Math.abs(B.peakBNu(2.72548) / 1e-20 - 383.9) < 0.5, String(B.peakBNu(2.72548) / 1e-20));
check('the Sun emits 6.29 × 10⁷ W/m², and 4πR²σT⁴ is its luminosity, 3.828 × 10²⁶ W', near(B.exitance(5772) * 4 * Math.PI * 6.957e8 ** 2, 3.828e26, 2e-4));
const vis = B.visibleFraction(5772);
check('about 44% of a 5772 K blackbody’s power lies in 380–750 nm (37% in 400–700 nm)', vis > 0.43 && vis < 0.445 && Math.abs(B.bandFraction(400e-9, 700e-9, 5772) - 0.366) < 0.002, String(vis));
check('a 2800 K filament puts under 10% of its power in the visible', B.visibleFraction(2800) < 0.1 && B.visibleFraction(2800) > 0.05, String(B.visibleFraction(2800)));
check('a person (306 K) emits essentially nothing visible', B.visibleFraction(306) < 1e-20);
// Planck's mean energy: kT for hν ≪ kT, frozen out for hν ≫ kT
check('mean energy → kT for a 1 GHz mode at 300 K', near(B.meanEnergy(1e9, 300), B.KB * 300, 1e-4));
check('mean energy of a visible mode at 300 K is utterly negligible', B.meanEnergy(5.45e14, 300) / (B.KB * 300) < 1e-35);
check('mean energy is kT·x/(eˣ − 1)', near(B.meanEnergy(3e13, 2000), B.KB * 2000 * ((B.H * 3e13) / (B.KB * 2000)) / Math.expm1((B.H * 3e13) / (B.KB * 2000)), 1e-12));

// colours: near-white at 6500 K, warm below, cool above, changing smoothly
const rgb = (T) => B.blackbodyRGB(T);
const [r65, g65, b65] = rgb(6500);
check('6500 K is nearly white', Math.min(r65, g65, b65) > 230, rgb(6500).join(','));
const [r3, g3, b3] = rgb(3000);
check('3000 K is warm: red > green > blue', r3 === 255 && g3 > b3 && b3 < 200, rgb(3000).join(','));
const [r10, , b10] = rgb(10000);
check('10 000 K is bluish: blue > red', b10 === 255 && r10 < b10, rgb(10000).join(','));
let mono = true, prev = Infinity;
for (let T = 1500; T <= 20000; T *= 1.15) { const [r, , b] = rgb(T); const q = r / Math.max(1, b); if (q > prev + 1e-9) mono = false; prev = q; }
check('red/blue falls steadily as T rises', mono);
const [x65, y65] = B.chromaticity(6504);
check('the Planckian locus at 6504 K lies near D65 (x 0.313, y 0.324)', Math.abs(x65 - 0.3135) < 0.006 && Math.abs(y65 - 0.3237) < 0.006, `${x65} ${y65}`);
for (const [k, o] of Object.entries(B.OBJECTS)) check(`object ${k} has a label, a name and a temperature`, o.label && o.name && o.T > 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
