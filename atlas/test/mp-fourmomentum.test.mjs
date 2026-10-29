// The four-momentum model behind the mp-collide simulation.
//   node atlas/test/mp-fourmomentum.test.mjs

import * as R from '../src/viz/model/mp-fourmomentum.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-300);
const mp = R.PARTICLES.p.m, mn = R.PARTICLES.n.m, md = R.PARTICLES.d.m, mpi0 = R.PARTICLES.pi0.m;

// masses (CODATA 2022 and PDG 2024)
check('m_p c² = 938.272 089 43 MeV', mp === 938.27208943);
check('m_d c² = 1875.612 945 MeV', md === 1875.612945);
check('every particle has a mass', Object.values(R.PARTICLES).every((q) => q.m >= 0));

// a particle's four-momentum
for (const [m, K] of [[mp, 1], [mp, 938], [R.PARTICLES.e.m, 15], [mp, 6.8e6]]) {
  const P = R.fourFromK(m, K);
  check(`m = ${m}, K = ${K}: E − m = K`, near(P[0] - m, K, 1e-9));
  // (E − p)(E + p) loses digits when E ≫ m: about 10⁻⁸ for an LHC proton
  check(`m = ${m}, K = ${K}: E² − p² = m²`, near(R.mass(P), m, 1e-7));
  const g = 1 + K / m, b = Math.sqrt(1 - 1 / (g * g));
  check(`m = ${m}, K = ${K}: p = γβm`, near(P[1], g * b * m, 1e-7), `${P[1]} vs ${g * b * m}`);
  check(`m = ${m}, K = ${K}: β = p/E`, near(R.velocity(P), b, 1e-9));
  check(`m = ${m}, K = ${K}: γ = E/m`, near(R.gammaOf(P), g, 1e-7));
}
check('a photon is massless', R.mass([5, 5]) === 0 && R.mass([5, -5]) === 0);

// boosts: the mass and the Minkowski product are the same in every frame
const P1 = [1500, 900], P2 = [2000, -1200];
for (const y of [-2.3, -0.4, 0.1, 0.8, 3.5]) {
  const a = R.boost(P1, y), b = R.boost(P2, y);
  check(`boost ${y}: mass invariant`, near(R.mass(a), R.mass(P1), 1e-9));
  check(`boost ${y}: E₁E₂ − p₁p₂ invariant`, near(R.dot(a, b), R.dot(P1, P2), 1e-9));
  check(`boost ${y}: system mass invariant`, near(R.invariantMass([a, b]), R.invariantMass([P1, P2]), 1e-9));
  check(`boost ${y}: rapidities subtract`, near(R.rapidity(a), R.rapidity(P1) - y, 1e-9));
}
check('boosting by a particle’s rapidity puts it at rest', Math.abs(R.boost(P1, R.rapidity(P1))[1]) < 1e-9 && near(R.boost(P1, R.rapidity(P1))[0], R.mass(P1)));
check('boost by y then −y is the identity', near(R.boost(R.boost(P1, 0.7), -0.7)[1], P1[1], 1e-12));
// velocity addition falls out of rapidity addition
{
  const u = 0.6, v = 0.7;
  const P = R.fourFromP(1, Math.sinh(Math.atanh(u)));
  check('boosting a 0.6c particle by −0.7c gives (0.6 + 0.7)/(1 + 0.42)', near(R.velocity(R.boost(P, -Math.atanh(v))), (u + v) / (1 + u * v), 1e-12));
}

// the centre of momentum
{
  const S = R.situation({ mode: 'fixed', beam: 'p', target: 'p', K: 6200 });
  const cm = R.boost(S.total, S.ycm);
  check('in the CM frame the total has no momentum', Math.abs(cm[1]) < 1e-9 * cm[0]);
  check('in the CM frame the total energy is √s', near(cm[0], S.M, 1e-12));
  check('√s formula for a fixed target', near(S.M, R.sqrtSFixed(mp, mp, 6200), 1e-12));
  check('collider: s = 1 is a frame moving at 0.5c, s = 2 at 0.8c', near(Math.tanh(R.frameRapidity({ mode: 'collider' }, 1)), 0.5, 1e-12) && near(Math.tanh(R.frameRapidity({ mode: 'collider' }, 2)), 0.8, 1e-12));
  check('equal masses: s = 2 is the beam’s rest frame', Math.abs(R.boost(S.parts[0].P, R.frameRapidity(S, 2))[1]) < 1e-9);
  check('equal masses: in the beam frame the target has the beam’s lab energy', near(R.boost(S.parts[1].P, R.frameRapidity(S, 2))[0], 6200 + mp, 1e-12));
}

// thresholds
check('Bevatron: p + p → p + p + p + p̄ needs K = 6 m_p c² = 5629.6 MeV', near(R.thresholdFixed(mp, mp, 4 * mp), 6 * mp, 1e-12) && near(6 * mp, 5629.63, 1e-6));
{
  const S = R.situation({ ...R.SCENARIOS.bevatron, K: 6 * mp });
  check('at the Bevatron threshold √s = 4 m_p', near(S.M, 4 * mp, 1e-12));
  check('the scenario reports the same threshold', near(S.Kth, 6 * mp, 1e-12));
}
check('π⁰ production: K = m_π(4m_p + m_π)/(2m_p) = 279.66 MeV', near(R.thresholdFixed(mp, mp, 2 * mp + mpi0), (mpi0 * (4 * mp + mpi0)) / (2 * mp), 1e-12) && Math.abs(R.thresholdFixed(mp, mp, 2 * mp + mpi0) - 279.66) < 0.01);
check('head-on, each proton needs only K = m_p for a p̄', near(R.thresholdCollider(mp, 4 * mp), mp, 1e-12));
check('head-on collider √s = 2E for equal beams', near(R.sqrtSCollider(mp, mp, 6.8e6), 2 * (6.8e6 + mp), 1e-12));
check('an LHC beam on a proton at rest: √s = 113.0 GeV', Math.abs(R.sqrtSFixed(mp, mp, 6.8e6) - 112978) < 2, String(R.sqrtSFixed(mp, mp, 6.8e6)));
check('fixed target: √s = √(2m(K + 2m)) for equal masses', near(R.sqrtSFixed(mp, mp, 6.8e6), Math.sqrt(2 * mp * (6.8e6 + 2 * mp)), 1e-12));
{
  const B = mp + mn - md;
  check('deuteron binding energy 2.2246 MeV', Math.abs(B - 2.22457) < 1e-4, String(B));
  check('photodisintegration threshold = B + B²/(2m_d)', near(R.thresholdFixed(0, md, mp + mn), B + (B * B) / (2 * md), 1e-9));
}
{
  const Eg = 6.34e-10; // MeV: a typical CMB photon
  const E = R.thresholdOnPhoton(mp, Eg, mp + mpi0);
  // s = m_p² + 2E_γ(E + p): written out, because E − p would vanish in double precision at 10²⁰ eV
  const s = mp * mp + 2 * Eg * (E + Math.sqrt(E * E - mp * mp));
  check('cosmic-ray proton on a CMB photon: the threshold makes exactly p + π⁰', near(Math.sqrt(s), mp + mpi0, 1e-9), `${Math.sqrt(s)}`);
  check('… at about 1.1 × 10²⁰ eV', Math.abs(E * 1e6 / 1e20 - 1.07) < 0.01, String(E * 1e6));
  check('… ≈ ((m_p + m_π)² − m_p²)/(4E_γ)', near(E, ((mp + mpi0) ** 2 - mp * mp) / (4 * Eg), 1e-6));
}

// decays
{
  const d = R.twoBody(R.PARTICLES.Lambda.m, mp, R.PARTICLES['pi-'].m);
  check('Λ → p π⁻ at rest: p* = 100.6 MeV/c', Math.abs(d.p - 100.58) < 0.02, String(d.p));
  check('Λ → p π⁻: energies add to M', near(d.E1 + d.E2, R.PARTICLES.Lambda.m, 1e-12));
  check('Λ → p π⁻: each daughter on its mass shell', near(R.mass([d.E1, d.p]), mp, 1e-9) && near(R.mass([d.E2, d.p]), R.PARTICLES['pi-'].m, 1e-9));
  check('a decay below threshold is impossible', R.twoBody(100, 60, 50) === null);
  for (const K of [0, 500, 3000]) {
    const S = R.situation({ ...R.SCENARIOS.lambda, K });
    const tot = R.sum(S.parts.map((q) => q.P));
    check(`Λ decay in flight (K = ${K}): daughters add to the parent`, near(tot[0], S.total[0], 1e-12) && Math.abs(tot[1] - S.total[1]) < 1e-9 * tot[0]);
    check(`Λ decay in flight (K = ${K}): daughters stay on their mass shells`, near(R.mass(S.parts[0].P), mp, 1e-9) && near(R.mass(S.parts[1].P), R.PARTICLES['pi-'].m, 1e-6));
  }
}

// every scenario is consistent
for (const [k, S0] of Object.entries(R.SCENARIOS)) {
  const S = R.situation(S0);
  check(`${k}: invariant mass is the mass of the total`, near(S.M, R.mass(S.total), 1e-12));
  check(`${k}: the range contains the default K`, S0.K >= S0.range[0] && S0.K <= S0.range[1]);
  for (const s of [...R.frameRange(S.mode), 1]) {
    const y = R.frameRapidity(S, s);
    check(`${k}: frame s = ${s} keeps the invariant mass`, near(R.invariantMass(S.parts.map((q) => R.boost(q.P, y))), S.M, 1e-6));
  }
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
