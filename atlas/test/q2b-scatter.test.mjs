// The partial-wave model behind the q2b-scatter simulation (lengths in units of a).
//   node atlas/test/q2b-scatter.test.mjs

import * as S from '../src/viz/model/q2b-scatter.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

// spherical Bessel functions against closed forms
for (const x of [0.3, 1.7, 6.2, 15]) {
  const j = S.sphj(3, x), n = S.sphn(3, x), s = Math.sin(x), c = Math.cos(x);
  check(`j₁(${x})`, near(j[1], s / x ** 2 - c / x, 1e-10));
  check(`j₂(${x})`, near(j[2], (3 / x ** 2 - 1) * s / x - 3 * c / x ** 2, 1e-9));
  check(`n₁(${x})`, near(n[1], -c / x ** 2 - s / x, 1e-12));
  const i = S.sphi(2, x);
  check(`i₁(${x})`, near(i[1], (x * Math.cosh(x) - Math.sinh(x)) / x ** 2, 1e-9));
}
check('j₂₀(1) is tiny but right', near(S.sphj(20, 1)[20], 7.537795722236873e-26, 1e-8), String(S.sphj(20, 1)[20]));

// hard sphere: δ₀ = −ka; σ → 4πa² at low energy and toward 2πa² at high energy
check('hard sphere δ₀ = −ka', near(S.phaseShifts('hard', 0.7)[0], -0.7, 1e-12));
check('hard sphere σ → 4πa² as ka → 0', near(S.crossSections(S.phaseShifts('hard', 0.01), 0.01).total, 4, 1e-3), String(S.crossSections(S.phaseShifts('hard', 0.01), 0.01).total));
const hi = S.crossSections(S.phaseShifts('hard', 40), 40).total;
check('hard sphere σ approaches 2πa² at ka = 40', hi > 2 && hi < 2.2, String(hi));

// the optical theorem Im f(0) = kσ/4π, for every target
for (const [tg, ka, g] of [['hard', 2.5, 0], ['well', 1.3, 2.2], ['barrier', 0.8, 1.5], ['barrier', 3, 1.5]]) {
  const d = S.phaseShifts(tg, ka, g), sig = S.crossSections(d, ka).total * Math.PI;   // in a²
  const [, im] = S.amplitude(d, ka, 0);
  check(`optical theorem: ${tg}, ka = ${ka}`, near(im, (ka * sig) / (4 * Math.PI), 1e-10), `${im} vs ${(ka * sig) / (4 * Math.PI)}`);
  // and ∫|f|² dΩ = σ
  let s = 0; const N = 2000;
  for (let i = 0; i < N; i++) { const th = (Math.PI * (i + 0.5)) / N; s += S.diffCross(d, ka, th) * Math.sin(th); }
  check(`∫ dσ/dΩ dΩ = σ: ${tg}, ka = ${ka}`, near(2 * Math.PI * s * (Math.PI / N), sig, 1e-5));
}

// square well s-wave: tan δ₀ closed form, and the zero-energy resonance at g = π/2
{
  const ka = 0.6, g = 1.9, Ka = Math.sqrt(ka * ka + g * g);
  const d0 = Math.atan((ka * Math.tan(Ka) - Ka * Math.tan(ka)) / (Ka + ka * Math.tan(ka) * Math.tan(Ka)));
  check('well δ₀ matches the s-wave formula', near(S.phaseShifts('well', ka, g)[0], d0, 1e-10), `${S.phaseShifts('well', ka, g)[0]} vs ${d0}`);
  const sres = S.crossSections(S.phaseShifts('well', 0.01, Math.PI / 2), 0.01).total;
  check('well at g = π/2: s-wave unitarity limit 4/(ka)² (σ in πa²)', near(sres, 4 / 1e-4, 1e-3), String(sres));
  // scattering length of the well: a_s/a = 1 − tan g / g; σ → 4π a_s²
  const g2 = 1.2, as = 1 - Math.tan(g2) / g2, slo = S.crossSections(S.phaseShifts('well', 1e-3, g2), 1e-3).total;
  check('well low-energy σ = 4π a_s²', near(slo, 4 * as * as, 1e-3), `${slo} vs ${4 * as * as}`);
}

// Born: agrees with the exact answer for a weak well, not a strong one
{
  const ka = 1.5, g = 0.3, d = S.phaseShifts('well', ka, g);
  const errs = [0.3, 1, 2].map((th) => Math.abs(S.amplitude(d, ka, th)[0] - S.bornAt('well', g, ka, th)) / Math.abs(S.bornAt('well', g, ka, 0)));
  check('Born matches a weak well (g = 0.3) to a few per cent', Math.max(...errs) < 0.03, errs.join(', '));
  const D = S.phaseShifts('well', ka, 2.5), e2 = Math.abs(S.amplitude(D, ka, 0.5)[0] - S.bornAt('well', 2.5, ka, 0.5)) / Math.abs(S.bornAt('well', 2.5, ka, 0.5));
  check('Born fails for a strong well (g = 2.5)', e2 > 0.3, String(e2));
  check('Born total for the weak well', near(S.bornTotal('well', 0.3, ka), S.crossSections(d, ka).total, 0.05));
  check('Born at Q = 0 is g²/3', near(S.bornSquare(2, 0), 4 / 3, 1e-12) && near(S.bornSquare(2, 1e-2), 4 * (Math.sin(1e-2) - 1e-2 * Math.cos(1e-2)) / 1e-6, 1e-6));
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
