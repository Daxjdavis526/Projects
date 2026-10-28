// The wave-packet model behind the mp-packet simulation.
//   node atlas/test/mp-packet.test.mjs

import * as W from '../src/viz/model/mp-packet.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

/** |ψ|² sampled on a grid, and its mean and spread. */
function profile(comps, disp, t, x0, x1, n = 4000) {
  const xs = [], ys = [];
  for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; xs.push(x); ys.push(W.psi(x, t, comps, disp).abs ** 2); }
  return W.moments(xs, ys);
}

const k0 = 6, sk = 0.8, comps = W.components(k0, sk, 241);
check('the amplitudes’ spread in k is σk', near(W.spreadK(comps), sk, 0.02), String(W.spreadK(comps)));
const p0 = profile(comps, 'free', 0, -6, 6);
check('at t = 0 a Gaussian packet has Δx = 1/(2Δk)', near(p0.sd, 1 / (2 * sk), 0.02) && Math.abs(p0.mean) < 1e-6, `${p0.sd}`);
check('ψ is 1 at the centre at t = 0', near(W.psi(0, 0, comps, 'free').abs, 1, 1e-12));

// free particle: moves at v_g = k₀, spreads as σ₀√(1 + (t/2σ₀²)²)
for (const t of [0.5, 1.5, 3]) {
  const p = profile(comps, 'free', t, k0 * t - 12, k0 * t + 12);
  check(`free particle, t = ${t}: the centre moves at the group velocity k₀`, Math.abs(p.mean - k0 * t) < 0.01, String(p.mean));
  check(`free particle, t = ${t}: the width follows σ₀√(1 + (t/2σ₀²)²)`, near(p.sd, W.gaussWidth(p0.sd, 1, t), 0.02), `${p.sd} vs ${W.gaussWidth(p0.sd, 1, t)}`);
}
// no dispersion: rigid motion at c = 1
{ const p = profile(comps, 'none', 4, -2, 10); check('no dispersion: the packet moves at c without changing shape', Math.abs(p.mean - 4) < 0.01 && near(p.sd, p0.sd, 0.005), `${p.mean} ${p.sd}`); }
// the other two dispersions move at their group velocities
for (const disp of ['water', 'massive']) {
  const D = W.DISPERSIONS[disp], t = 6 / D.vg(k0);
  const p = profile(comps, disp, t, D.vg(k0) * t - 8, D.vg(k0) * t + 8);
  check(`${disp}: the envelope moves at dω/dk`, Math.abs(p.mean - D.vg(k0) * t) < 0.05, `${p.mean} vs ${D.vg(k0) * t}`);
  // group velocity is the derivative of ω, phase velocity ω/k
  const h = 1e-5;
  check(`${disp}: vg is dω/dk and vp is ω/k`, near((D.w(k0 + h) - D.w(k0 - h)) / (2 * h), D.vg(k0), 1e-6) && near(D.w(k0) / k0, D.vp(k0), 1e-12));
}
check('free particle: vg = 2vp', near(W.DISPERSIONS.free.vg(k0), 2 * W.DISPERSIONS.free.vp(k0), 1e-12));
check('deep water: vg = vp/2', near(W.DISPERSIONS.water.vg(k0), W.DISPERSIONS.water.vp(k0) / 2, 1e-12));
check('relativistic: vp·vg = c² with vg < c < vp', near(W.DISPERSIONS.massive.vg(k0) * W.DISPERSIONS.massive.vp(k0), 1, 1e-12) && W.DISPERSIONS.massive.vg(k0) < 1);
// few waves make a periodic train, not a single packet: |ψ| returns to 1 one period 2π/δk away
{
  const c5 = W.components(k0, sk, 5), dk = c5[1].k - c5[0].k;
  check('five waves repeat every 2π/δk', near(W.psi((2 * Math.PI) / dk, 0, c5, 'none').abs, 1, 1e-9));
}

// the three shapes: normalised densities whose spreads match the formulas, and Δx·Δk ≥ ½
function integrate(f, a, b, n = 200000) { let s = 0; const h = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h); return s * h; }
for (const key of Object.keys(W.SHAPES)) {
  const S = W.SHAPES[key], a = 1.3;
  const N = integrate((x) => S.rho(x, a), -12 * a, 12 * a);
  const sx = Math.sqrt(integrate((x) => x * x * S.rho(x, a), -12 * a, 12 * a) / N);
  check(`${key}: |ψ|² is normalised`, near(N, 1, 1e-4), String(N));
  check(`${key}: Δx matches its formula`, near(sx, S.sx(a), 1e-3), `${sx} vs ${S.sx(a)}`);
  check(`${key}: |ψ|² is the square of ψ (up to normalisation)`, near(S.rho(0.3 * a, a) / S.rho(0.1 * a, a), (S.psi(0.3 * a, a) / S.psi(0.1 * a, a)) ** 2, 1e-9));
  const K = 600 / a;                                         // the box’s and the exponential’s |φ|² fall only as 1/k⁴
  const Nk = integrate((k) => S.phi2(k, a), -K, K, 600000);
  const sk2 = integrate((k) => k * k * S.phi2(k, a), -K, K, 600000) / Nk;
  check(`${key}: Δk matches its formula`, near(Math.sqrt(sk2), S.sk(a), 0.01), `${Math.sqrt(sk2)} vs ${S.sk(a)}`);
}
check('Δx·Δk: Gaussian ½, box 0.568, exponential 0.707', near(W.product('gauss'), 0.5, 1e-12) && Math.abs(W.product('box') - 0.5679) < 1e-4 && near(W.product('exp'), Math.SQRT1_2, 1e-12));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
