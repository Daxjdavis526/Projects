// The one-dimensional Schrödinger model behind the mp-schrodinger simulation.
//   node atlas/test/mp-schrodinger.test.mjs

import * as S from '../src/viz/model/mp-schrodinger.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));
const grid = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

// constants
check('ħ²/2mₑ = 0.038 10 eV nm²', near(S.T0, 0.0380998, 1e-5), String(S.T0));
check('an electron in a 1 nm box has E₁ = 0.376 eV', near(S.boxEnergy(1, 1), 0.37603, 1e-4), String(S.boxEnergy(1, 1)));
check('Eₙ grows as n²', near(S.boxEnergy(3, 0.7) / S.boxEnergy(1, 0.7), 9, 1e-12));

// infinite well: normalised, orthogonal, analytic probabilities
{
  const L = 1.3, xs = grid(0, L, 4000);
  for (const n of [1, 2, 5]) check(`box ψ${n} is normalised`, near(S.trapz(xs, xs.map((x) => S.boxPsi(n, x, L) ** 2)), 1, 1e-5));
  check('box ψ₁ ⟂ ψ₂', Math.abs(S.trapz(xs, xs.map((x) => S.boxPsi(1, x, L) * S.boxPsi(2, x, L)))) < 1e-6);
  check('P(middle third) for n = 1 is 1/3 + √3/2π', near(S.boxProb(1, L / 3, (2 * L) / 3, L), 1 / 3 + Math.sqrt(3) / (2 * Math.PI), 1e-12));
  check('P(middle third) for n = 2 is 1/3 − √3/4π', near(S.boxProb(2, L / 3, (2 * L) / 3, L), 1 / 3 - Math.sqrt(3) / (4 * Math.PI), 1e-12));
}

// finite well: the transcendental roots, normalisation, the infinite limit, and agreement with finite differences
{
  const V0 = 5, L = 1;
  const lev = S.finiteLevels(V0, L);
  check('a 5 eV, 1 nm well holds ⌈2z₀/π⌉ states', lev.length === S.boundCount(V0, L), `${lev.length} vs ${S.boundCount(V0, L)}`);
  check('… which is 4', lev.length === 4, String(lev.length));
  for (const l of lev) {
    const tan = l.parity === 'even' ? l.k * Math.tan((l.k * L) / 2) : -l.k / Math.tan((l.k * L) / 2);
    check(`level ${l.n} solves its matching condition`, near(tan, l.kappa, 1e-8), `${tan} vs ${l.kappa}`);
    check(`level ${l.n} lies below the infinite well's`, l.E < S.boxEnergy(l.n, L) && l.E < V0);
    const xs = grid(-3, 4, 20000);
    check(`finite-well ψ${l.n} is normalised`, near(S.trapz(xs, xs.map((x) => S.finitePsi(l, x, L) ** 2)), 1, 1e-4));
    check(`finite-well ψ${l.n} is positive just inside the left wall`, S.finitePsi(l, 0.002, L) > 0);
    // ψ and ψ′ continuous at the wall
    const e = 1e-7, ins = S.finitePsi(l, e, L), out = S.finitePsi(l, -e, L);
    const din = (S.finitePsi(l, 2e-6, L) - S.finitePsi(l, 1e-6, L)) / 1e-6, dout = (S.finitePsi(l, -1e-6, L) - S.finitePsi(l, -2e-6, L)) / 1e-6;
    check(`finite-well ψ${l.n} and ψ′ are continuous at the wall`, Math.abs(ins - out) < 1e-5 && near(din, dout, 2e-3), `${din} ${dout}`);
  }
  const deep = S.finiteLevels(1e5, L);
  check('a very deep finite well approaches the infinite one', near(deep[0].E, S.boxEnergy(1, L), 0.005) && near(deep[2].E, S.boxEnergy(3, L), 0.005), `${deep[0].E}`);
  check('any finite well, however shallow, holds one state', S.finiteLevels(0.001, 0.1).length === 1);
  // the same well by finite differences
  const fd = S.solveFD((x) => (x > 0 && x < L ? 0 : V0), -2.5, 3.5, { N: 3000, count: 4 });
  for (let i = 0; i < 4; i++) check(`finite differences reproduce level ${i + 1}`, near(fd.E[i], lev[i].E, 2e-3), `${fd.E[i]} vs ${lev[i].E}`);
  // electron in a GaAs well (effective mass): more states for a lighter particle
  check('a lighter effective mass fits fewer states', S.finiteLevels(0.3, 10, 0.067).length < S.finiteLevels(0.3, 10, 1).length);
}

// oscillator: Hermite functions, energies, the classical density
{
  const hw = 0.3, b = S.oscLength(hw), xs = grid(-12 * b, 12 * b, 20000);
  check('H₃(ξ) = 8ξ³ − 12ξ', near(S.hermite(3, 0.7), 8 * 0.343 - 12 * 0.7, 1e-12));
  for (const n of [0, 1, 4, 10]) check(`oscillator ψ${n} is normalised`, near(S.trapz(xs, xs.map((x) => S.oscPsi(n, x, b) ** 2)), 1, 1e-6));
  check('oscillator ψ₀ ⟂ ψ₂', Math.abs(S.trapz(xs, xs.map((x) => S.oscPsi(0, x, b) * S.oscPsi(2, x, b)))) < 1e-8);
  check('ψ₅ is the Hermite form', near(S.oscPsi(5, 0.8 * b, b), S.hermite(5, 0.8) * Math.exp(-0.32) / Math.sqrt(2 ** 5 * 120 * Math.sqrt(Math.PI) * b), 1e-10));
  const fd = S.solveFD((x) => 0.5 * hw * (x / b) ** 2, -10 * b, 10 * b, { N: 2000, count: 5 });
  for (let n = 0; n < 5; n++) check(`finite differences give (n + ½)ħω for n = ${n}`, near(fd.E[n], S.oscEnergy(n, hw), 1e-3), `${fd.E[n]}`);
  const A = S.oscTurning(0, b);
  const out = 1 - S.trapz(xs.filter((x) => Math.abs(x) <= A), xs.filter((x) => Math.abs(x) <= A).map((x) => S.oscPsi(0, x, b) ** 2));
  check('the ground state spends 15.7% of its probability outside the turning points (erfc 1)', Math.abs(out - 0.157299) < 1e-3, String(out));
  const c = grid(-0.999 * A, 0.999 * A, 20000);
  check('the classical density integrates to 1', Math.abs(S.trapz(c, c.map((x) => S.oscClassical(x, A))) - 1) < 0.03);
  // Δx Δp = ħ/2 in the ground state (Δp from ⟨p²⟩ = −ħ²∫ψψ″)
  const m = S.moments(xs, xs.map((x) => S.oscPsi(0, x, b) ** 2));
  check('ground state Δx = b/√2', near(m.sd, b / Math.SQRT2, 1e-5));
}

// finite differences against the exact box, and the double well's doublets
{
  const fd = S.solveFD(() => 0, 0, 1, { N: 1500, count: 4 });
  for (let n = 1; n <= 4; n++) check(`finite differences give the box's E${n}`, near(fd.E[n - 1], S.boxEnergy(n, 1), 1e-4), `${fd.E[n - 1]}`);
  const i = Math.round(0.3 * 1500);
  check('finite-difference ψ₂ matches √(2/L) sin(2πx/L)', near(fd.psi[1][i], S.boxPsi(2, fd.x[i], 1), 1e-3));
  const dw = S.solveFD(S.doubleWellV(2, 0.2, 2), 0, 2, { N: 1500, count: 4 });
  check('a high barrier splits the double well into near-degenerate pairs', dw.E[1] - dw.E[0] < 0.2 * (dw.E[2] - dw.E[1]), dw.E.join(', '));
  const sym = (p, s) => p.every((v, i) => Math.abs(v - s * p[p.length - 1 - i]) < 1e-6);
  check('the lower state of each pair is even, the upper odd', sym(dw.psi[0], 1) && sym(dw.psi[1], -1) && sym(dw.psi[2], 1) && sym(dw.psi[3], -1));
}

// scattering: closed form, flux conservation, continuity
{
  for (const [E, V0, w] of [[0.5, 1, 1], [0.2, 1, 0.5], [1.5, 1, 0.8], [4, 10, 0.1]]) {
    const s = S.barrier(E, V0, w);
    check(`barrier E = ${E}, V₀ = ${V0}, w = ${w}: T matches the closed form`, near(s.T, S.barrierT(E, V0, w), 1e-9), `${s.T} vs ${S.barrierT(E, V0, w)}`);
    check(`barrier E = ${E}: R + T = 1`, Math.abs(s.R + s.T - 1) < 1e-9);
    const a = S.scatterPsi(s, w - 1e-9), b = S.scatterPsi(s, w + 1e-9);
    check(`barrier E = ${E}: ψ is continuous at the far edge`, Math.abs(a.re - b.re) < 1e-6 && Math.abs(a.im - b.im) < 1e-6);
    check(`barrier E = ${E}: |ψ|² beyond the barrier is T`, near(S.scatterPsi(s, w + 0.7).abs2, s.T, 1e-9));
  }
  const e = S.barrier(0.5, 1, 1);
  check('an electron at 0.5 eV through 1 nm of 1 eV barrier: T = 1/351 = 2.85×10⁻³', near(e.T, 1 / (1 + Math.sinh(Math.sqrt(0.5 / S.T0)) ** 2), 1e-12) && e.T > 2.8e-3 && e.T < 2.9e-3, String(e.T));
  check('the thick-barrier estimate is within 1% there', near(S.barrierTApprox(0.5, 1, 1), e.T, 0.01), `${S.barrierTApprox(0.5, 1, 1)}`);
  check('E = V₀ exactly is handled', Math.abs(S.barrier(1, 1, 0.5).T - S.barrierT(1, 1, 0.5)) < 1e-6);
  const st = S.step(2, 1);
  const k1 = Math.sqrt(2 / S.T0), k2 = Math.sqrt(1 / S.T0);
  check('a step: R = ((k₁ − k₂)/(k₁ + k₂))²', near(st.R, ((k1 - k2) / (k1 + k2)) ** 2, 1e-9));
  check('a step below its height reflects everything', Math.abs(S.step(0.5, 1).R - 1) < 1e-12 && S.step(0.5, 1).T === 0);
  // two barriers: resonant transmission reaches 1 at some energy below V₀
  let best = 0;
  for (let E = 0.01; E < 1; E += 0.0005) best = Math.max(best, S.scatter(E, [0, 1, 0, 1, 0], [0, 0.3, 2.3, 2.6]).T);
  check('a double barrier has a resonance with T near 1', best > 0.9, String(best));
}

// a superposition sloshes at (E₂ − E₁)/h
{
  const L = 1, E1 = S.boxEnergy(1, L), E2 = S.boxEnergy(2, L), xs = grid(0, L, 2000);
  const mean = (t) => S.moments(xs, xs.map((x) => S.superDensity(S.boxPsi(1, x, L), S.boxPsi(2, x, L), E1, E2, t))).mean;
  const T = S.H_EVFS / (E2 - E1);
  check('⟨x⟩ starts left of centre for (ψ₁ + ψ₂)/√2', mean(0) < 0.5 * L);
  check('… returns after one period h/(E₂ − E₁)', Math.abs(mean(T) - mean(0)) < 1e-9);
  check('… and is mirrored after half a period', Math.abs(mean(T / 2) - (L - mean(0))) < 1e-6);
  check('⟨x⟩ swings by ±16L/9π² about the centre', near(0.5 * L - mean(0), (16 * L) / (9 * Math.PI * Math.PI), 1e-4), String(0.5 - mean(0)));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
