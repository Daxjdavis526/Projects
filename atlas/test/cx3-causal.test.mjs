// The causality model behind sims/cx3-causal.js: the response function of a
// damped oscillator, its response in time from residues against direct
// numerical Fourier inversion (zero before the kick when the poles are
// below the axis, a response before the kick when they are above), and the
// Kramers–Kronig reconstruction against a numerical principal-value
// Hilbert transform — exact for a causal response, wrong for an acausal one.
//   node atlas/test/cx3-causal.test.mjs

import * as M from '../src/viz/model/cx3-causal.js';
import * as S from '../src/viz/sims/cx3-causal.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// the damped oscillator: χ = 1/(ω₀² − ω² − iγω)
{
  const w0 = 1.3, g = 0.4, Om = Math.sqrt(w0 * w0 - (g * g) / 4);
  const P = M.tidy([{ re: Om, im: -g / 2 }]);
  const ws = [-2.2, -0.4, 0, 0.9, 1.25, 3.1];
  check('χ is 1/(ω₀² − ω² − iγω)', ws.every((w) => { const c = M.chi([w, 0], P), d = 1 / ((w0 * w0 - w * w) ** 2 + g * g * w * w); return near(c[0], (w0 * w0 - w * w) * d, 1e-12) && near(c[1], g * w * d, 1e-12); }));
  check('G is e^{−γt/2} sin(Ωt)/Ω after the kick', [0.3, 1, 2.5, 7].every((t) => near(M.G(t, P), Math.exp((-g * t) / 2) * Math.sin(Om * t) / Om, 1e-12)));
  check('G is zero before the kick', [-0.3, -2, -9].every((t) => M.G(t, P) === 0));
  check('G′(0⁺) = 1: a unit impulse', near((M.G(1e-6, P) - M.G(0, P)) / 1e-6, 1, 1e-5));
  for (const t of [-3, -0.7, 0.8, 2.6]) check(`G(${t}) agrees with direct Fourier inversion`, Math.abs(M.Gnumeric(t, P) - M.G(t, P)) < 2e-3, `${M.Gnumeric(t, P)} vs ${M.G(t, P)}`);
  // residues reproduce G
  const t = 2.2, R = M.residues(t, P, 'lower');
  const S0 = R.reduce((s, r) => [s[0] + r.res[0], s[1] + r.res[1]], [0, 0]);   // G = −i S: real part Im S, imaginary part −Re S = 0
  check('G = −i × (the sum of the lower residues)', near(S0[1], M.G(t, P), 1e-12) && Math.abs(S0[0]) < 1e-12);
  check('no residues in the upper half-plane', M.residues(-2, P, 'upper').length === 0);
  // Kramers–Kronig
  for (const w of [-1.7, 0, 0.6, 1.3, 2.4]) {
    const h = M.hilbertNumeric((x) => M.chi([x, 0], P)[1], w);
    check(`KK rebuilds Re χ(${w}) from Im χ`, Math.abs(h - M.chi([w, 0], P)[0]) < 2e-3, `${h} vs ${M.chi([w, 0], P)[0]}`);
    check(`the closed form agrees at ${w}`, near(M.kkReal(w, P), M.chi([w, 0], P)[0], 1e-12));
  }
  check('static response 1/ω₀² = (2/π)∫ Im χ/ω dω', Math.abs(M.hilbertNumeric((x) => M.chi([x, 0], P)[1], 0) - 1 / (w0 * w0)) < 2e-3);
  check('causal', M.causal(P));
}
// poles above the axis
{
  const P = M.tidy([{ re: 1.1, im: 0.25, amp: 2 }]);
  check('acausal: zero after the kick', [0.5, 3].every((t) => M.G(t, P) === 0));
  check('acausal: −A e^{bt} sin(at)/a before it', [-0.5, -3].every((t) => near(M.G(t, P), (-2 * Math.exp(0.25 * t) * Math.sin(1.1 * t)) / 1.1, 1e-12)));
  for (const t of [-2.5, 1.5]) check(`acausal G(${t}) agrees with Fourier inversion`, Math.abs(M.Gnumeric(t, P) - M.G(t, P)) < 3e-3, `${M.Gnumeric(t, P)} vs ${M.G(t, P)}`);
  const w = 0.7, h = M.hilbertNumeric((x) => M.chi([x, 0], P)[1], w);
  check('acausal: KK gives −Re χ', near(h, -M.chi([w, 0], P)[0], 3e-3) && near(M.kkReal(w, P), -M.chi([w, 0], P)[0], 1e-12), `${h}`);
  check('not causal', !M.causal(P));
}
// two pairs, mixed
{
  const P = M.tidy([{ re: 0.8, im: -0.1 }, { re: 1.9, im: -0.3, amp: 0.5 }]);
  check('two pairs: G is the sum', near(M.G(3, P), Math.exp(-0.3) * Math.sin(2.4) / 0.8 + 0.5 * Math.exp(-0.9) * Math.sin(5.7) / 1.9, 1e-12));
  check('two pairs: agrees with Fourier inversion', Math.abs(M.Gnumeric(3, P) - M.G(3, P)) < 2e-3);
  check('tidy keeps poles off the axes', M.tidy([{ re: 0, im: 0 }])[0].re > 0 && M.tidy([{ re: 1, im: 0 }])[0].im !== 0);
}
// the simulation's validate
{
  check('validate accepts the defaults', S.validate({ ...S.defaults }).length === 0, S.validate({ ...S.defaults }).join('; '));
  check('validate rejects a pole on the axis', S.validate({ ...S.defaults, poles: [{ re: 1, im: 0 }] }).length > 0);
  check('validate rejects TeX in names', S.validate({ ...S.defaults, names: { w: '\\omega' } }).length > 0);
}

console.log(`cx3-causal: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
