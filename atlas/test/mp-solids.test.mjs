// The solids model behind the mp-junction simulation and the PHYS 2710
// lessons on solids (MP12): Kronig–Penney bands, the Fermi gas,
// semiconductors, the p–n junction, solar cells and superconductors.
//   node atlas/test/mp-solids.test.mjs

import * as S from '../src/viz/model/mp-solids.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-3) => Math.abs(a - b) <= rel * Math.abs(b);

// ---- Kronig–Penney
check('with no barriers every energy is allowed (bands touch)', S.kpBands(0, 4).every(([lo, hi], k) => near(lo, k * Math.PI, 1e-12) || (k === 0 && lo === 0)));
for (const P of [0.5, 3 * Math.PI / 2, 4, 10]) {
  const B = S.kpBands(P, 4);
  check(`P = ${P.toFixed(2)}: each band ends at x = kπ`, B.every(([, hi], k) => near(hi, (k + 1) * Math.PI, 1e-12)));
  check(`P = ${P.toFixed(2)}: |f| = 1 at every band bottom`, B.every(([lo]) => Math.abs(Math.abs(S.kpF(lo, P)) - 1) < 1e-9));
  check(`P = ${P.toFixed(2)}: inside a band |f| ≤ 1, inside a gap |f| > 1`, B.every(([lo, hi], k) => S.kpAllowed((lo + hi) / 2, P) && (k === 0 || !S.kpAllowed(k * Math.PI + 0.5 * (lo - k * Math.PI), P))));
  check(`P = ${P.toFixed(2)}: the curve of band 1 runs from k = 0 to the zone edge`, (() => { const c = S.kpBandCurve(P, 1); return Math.abs(c[0][0]) < 1e-6 && Math.abs(c.at(-1)[0] - 1) < 1e-6; })());
}
// the bottom of band 2 solves tan(x/2) = −x/P; for P = 3π/2 that is x = 3π/2 exactly
check('P = 3π/2: band 2 starts at x = 3π/2 (tan(x/2) = −x/P)', near(S.kpBands(3 * Math.PI / 2, 2)[1][0], 1.5 * Math.PI, 1e-9));
check('stronger barriers narrow the bands', S.kpBands(10, 1)[0][0] > S.kpBands(2, 1)[0][0]);
check('E₁ = h²/8ma² is 6.02 eV for a = 0.25 nm (the ground state of a 0.25 nm box)', near(S.kpE1(0.25), 6.0165, 1e-4), String(S.kpE1(0.25)));

// ---- the Fermi gas
check('copper (8.47 × 10²⁸ m⁻³): E_F = 7.03 eV', near(S.fermiEnergy(8.47e28), 7.033, 1e-3), String(S.fermiEnergy(8.47e28)));
check('copper: v_F = 1.57 × 10⁶ m/s, T_F = 81 600 K', near(S.fermiSpeed(7.033), 1.5729e6, 1e-3) && near(S.fermiTemp(7.033), 81614, 1e-3));
check('density from E_F inverts E_F from density', near(S.densityFromEF(S.fermiEnergy(5.86e28)), 5.86e28, 1e-9));
check('Fermi–Dirac: ½ at μ, symmetric about it', S.fermiDirac(7, 7, 300) === 0.5 && near(S.fermiDirac(7.1, 7, 300) + S.fermiDirac(6.9, 7, 300), 1, 1e-12));
check('copper’s collision time is 2.5 × 10⁻¹⁴ s and mean free path 39 nm', near(S.collisionTime(8.47e28, 1.68e-8), 2.494e-14, 2e-3) && near(S.fermiSpeed(7.033) * S.collisionTime(8.47e28, 1.68e-8), 39.2e-9, 3e-3));

// ---- semiconductors and the junction
check('silicon’s intrinsic density rises about 346 times from 300 K to 400 K', near(S.intrinsicRatio(300, 400, 1.12), 346.2, 1e-3), String(S.intrinsicRatio(300, 400, 1.12)));
check('V_bi = 0.714 V for silicon doped 10¹⁶ cm⁻³ on each side', near(S.builtIn(1e16, 1e16, 1e10), 0.7143, 1e-3));
const D = S.depletion(1e22, 1e22, 0.7143, 11.7);
check('that junction is 0.43 μm wide, half on each side', near(D.W, 4.298e-7, 2e-3) && near(D.xp, D.xn, 1e-12));
const D2 = S.depletion(1e22, 1e24, 0.8, 11.7);
check('a one-sided junction lies almost all in the lightly doped side, with equal charge on each', D2.xp > 50 * D2.xn && near(D2.xp * 1e22, D2.xn * 1e24, 1e-9));
check('the band profile runs 0 → 1, continuous and smooth at x = 0', S.profile(-1, 0.3, 0.1) === 0 && S.profile(1, 0.3, 0.1) === 1 && near(S.profile(-1e-12, 0.3, 0.1), S.profile(1e-12, 0.3, 0.1), 1e-9) && near(S.profile(0, 0.3, 0.1), 0.75, 1e-12));
check('ideal diode: 59.5 mV per decade at 300 K', near(S.diode(0.6 + S.kT(300) * Math.LN10, 1e-12) / S.diode(0.6, 1e-12), 10, 1e-6) && near(S.kT(300) * Math.LN10, 0.05953, 1e-3));
check('reverse bias saturates at −I₀', near(S.diode(-1, 1e-12), -1e-12, 1e-9));
const IL = 0.039, I0 = 1e-12, M = S.mpp(I0, IL);
check('V_oc of a silicon-like cell is 0.63 V; the maximum power point lies below it', near(S.vOC(I0, IL), 0.6305, 1e-3) && M.V > 0.5 && M.V < S.vOC(I0, IL));
check('at the maximum power point d(IV)/dV = 0', Math.abs(-(M.V + 1e-5) * S.cell(M.V + 1e-5, I0, IL) + (M.V - 1e-5) * S.cell(M.V - 1e-5, I0, IL)) < 1e-9);
check('one sun gives an ideal silicon cell about 39 mA/cm²; a wider gap fewer', near(S.sunJsc(1.12, 1000), 39.1, 0.01) && S.sunJsc(1.42) < S.sunJsc(1.12));
check('model cells: GaAs beats silicon, which beats germanium (an optimum near 1.4 eV)', (() => { const p = (k) => { const j = S.junction(k, 0, 1); return S.mpp(j.I0, j.IL).P; }; return p('gaas') > p('si') && p('si') > p('ge') && p('gaas') > p('ingan'); })());
check('silicon’s gap absorbs light shorter than 1107 nm; GaAs emits at 873 nm', near(S.ledNm(1.12), 1107, 1e-3) && near(S.ledNm(1.42), 873.1, 1e-3));
check('the model diodes turn on near E_g − 0.5 V (10 mA): Si 0.60 V, GaAs 0.90 V', near(S.kT() * Math.log(1e-2 / S.junction('si', 0).I0), 0.595, 3e-3) && near(S.kT() * Math.log(1e-2 / S.junction('gaas', 0).I0), 0.895, 3e-3));
check('forward bias shrinks the depletion region, reverse bias widens it', S.junction('si', 0.5).W < S.junction('si', 0).W && S.junction('si', -2).W > S.junction('si', 0).W);

// ---- superconductors
check('lead at 4.2 K: B_c = 0.0529 T', near(S.critField(4.2, 7.193, 0.0803), 0.05292, 1e-3));
check('critTemp inverts critField', near(S.critTemp(S.critField(3, 7.193, 0.0803), 7.193, 0.0803), 3, 1e-9));
check('the flux quantum h/2e = 2.068 × 10⁻¹⁵ Wb', near(S.FLUX_QUANTUM, 2.0678e-15, 1e-4));
check('BCS gap of niobium (9.25 K): 2Δ = 2.81 meV', near(S.pairGap(9.25), 2.812e-3, 1e-3));
check('London moment of a rotor at 70 Hz: 5.0 nT', near(S.londonField(70), 5.0013e-9, 1e-3));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
