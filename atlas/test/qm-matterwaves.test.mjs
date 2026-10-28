// The matter-wave model behind the qm-slits simulation.
//   node atlas/test/qm-matterwaves.test.mjs

import * as W from '../src/viz/model/qm-matterwaves.js';
import { HBAR } from '../src/viz/model/qm-light.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

// de Broglie wavelengths quoted in the research notes (non-relativistic electrons)
check('54 eV electron: 0.1669 nm (Davisson–Germer)', Math.abs(W.lambdaNonRel('electron', 54) * 1e9 - 0.1669) < 0.0001, String(W.lambdaNonRel('electron', 54) * 1e9));
check('100 eV electron: 0.1226 nm', Math.abs(W.lambdaNonRel('electron', 100) * 1e9 - 0.1226) < 0.0001);
check('1 keV electron: 0.0388 nm', Math.abs(W.lambdaNonRel('electron', 1000) * 1e9 - 0.0388) < 0.0001);
check('relativistic and Newtonian agree at 54 eV to 1 part in 10⁴', near(W.lambdaFromK('electron', 54), W.lambdaNonRel('electron', 54), 1e-4));
check('200 keV electron (a TEM): 2.508 pm relativistic, 2.742 pm by Newton', Math.abs(W.lambdaFromK('electron', 2e5) * 1e12 - 2.508) < 0.001 && Math.abs(W.lambdaNonRel('electron', 2e5) * 1e12 - 2.742) < 0.001, `${W.lambdaFromK('electron', 2e5) * 1e12} ${W.lambdaNonRel('electron', 2e5) * 1e12}`);
check('50 keV electron: 5.36 pm', Math.abs(W.lambdaFromK('electron', 5e4) * 1e12 - 5.355) < 0.002, String(W.lambdaFromK('electron', 5e4) * 1e12));
check('thermal neutron, 0.0253 eV: 0.180 nm', Math.abs(W.lambdaFromK('neutron', 0.0253) * 1e9 - 0.1798) < 0.0005, String(W.lambdaFromK('neutron', 0.0253) * 1e9));
check('2200 m/s neutron: 0.180 nm', Math.abs(W.lambdaFromV(W.PARTICLES.neutron.m, 2200) * 1e9 - 0.1798) < 0.0005);
check('a 0.145 kg baseball at 40 m/s: about 1.1e-34 m', Math.abs(W.lambdaFromV(0.145, 40) / 1.142e-34 - 1) < 0.002, String(W.lambdaFromV(0.145, 40)));
check('C₆₀ at 220 m/s: about 2.5 pm', Math.abs(W.lambdaFromV(W.PARTICLES.c60.m, 220) * 1e12 - 2.5) < 0.05, String(W.lambdaFromV(W.PARTICLES.c60.m, 220) * 1e12));
check('kFromLambda inverts lambdaFromK', near(W.kFromLambda('electron', W.lambdaFromK('electron', 3000)), 3000, 1e-9));
check('an electron and a proton of equal energy: λe/λp = √(mp/me) ≈ 42.85 when slow', Math.abs(W.lambdaNonRel('electron', 10) / W.lambdaNonRel('proton', 10) - 42.85) < 0.01);

// slit patterns
const P = { lambda: 5e-12, a: 0.5e-6, d: 2e-6 };
check('central maximum is 1 for one and two slits', near(W.intensity(0, { ...P, mode: 'single' }), 1) && near(W.intensity(0, { ...P, mode: 'double' }), 1));
check('single slit is dark at sin θ = λ/a', W.intensity(W.firstZero(P.lambda, P.a), { ...P, mode: 'single' }) < 1e-12);
check('two slits are dark halfway between bright fringes, sin θ = λ/2d', W.intensity(Math.asin(P.lambda / (2 * P.d)), { ...P, mode: 'double' }) < 1e-12);
check('next bright fringe at sin θ = λ/d, under the envelope', near(W.intensity(W.fringeAngle(P.lambda, P.d), { ...P, mode: 'double' }), W.intensity(W.fringeAngle(P.lambda, P.d), { ...P, mode: 'single' }), 1e-9));
check('pattern is symmetric', near(W.intensity(3e-6, { ...P, mode: 'double' }), W.intensity(-3e-6, { ...P, mode: 'double' })));
check('which-slit information removes the fringes: the envelope remains', near(W.intensity(1.3e-6, { ...P, mode: 'which' }), W.intensity(1.3e-6, { ...P, mode: 'single' })));
check('narrowing a slit widens the pattern (first zero moves out)', W.firstZero(P.lambda, 0.25e-6) > W.firstZero(P.lambda, 0.5e-6));

// sampling: the fraction landing inside the central single-slit maximum is about 90%
{
  const th0 = W.firstZero(P.lambda, P.a), pdf = (x) => W.intensity(x, { ...P, mode: 'single' });
  const sample = W.makeSampler(pdf, -4 * th0, 4 * th0);
  const n = 20000;
  let inside = 0;
  for (let i = 0; i < n; i++) { const x = sample((i + 0.5) / n); if (Math.abs(x) < th0) inside++; }
  // the exact fraction of [sin β/β]² inside the first zeros, out of the range ±4 zeros
  let num = 0, den = 0;
  for (let i = 0; i <= 8000; i++) { const x = -4 * th0 + (8 * th0 * i) / 8000; const w = pdf(x); den += w; if (Math.abs(x) < th0) num += w; }
  check('sampled hits reproduce the pattern (central maximum share)', Math.abs(inside / n - num / den) < 0.003, `${inside / n} vs ${num / den}`);
  check('samples stay in range', sample(0) >= -4 * th0 && sample(0.999999) <= 4 * th0);
}

// the uncertainty principle for a Gaussian packet
check('σx·σp = ħ/2 for a Gaussian packet', near(1e-10 * W.packetSigmaP(1e-10), HBAR / 2));
{
  // numerically: the position spread of a normal |ψ|² is σx
  const s = 2.0;
  let m2 = 0, norm = 0;
  for (let i = -6000; i <= 6000; i++) { const x = i * 0.005, w = W.gaussian(x, s); m2 += x * x * w * 0.005; norm += w * 0.005; }
  check('the packet is normalized and has the stated spread', Math.abs(norm - 1) < 1e-6 && Math.abs(Math.sqrt(m2) - s) < 1e-4);
}
check('electron confined to 0.1 nm: Δv ≥ 5.8e5 m/s', Math.abs(W.minDeltaV(1e-10, W.PARTICLES.electron.m) / 5.788e5 - 1) < 0.002, String(W.minDeltaV(1e-10, W.PARTICLES.electron.m)));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
