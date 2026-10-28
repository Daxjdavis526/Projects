// The Fresnel model behind sims/op-fresnel.js (PHYS 4650 O3.3–O3.4): the
// textbook values (4 % at normal incidence on glass, Brewster's zero, the
// critical angle), R + T = 1 at every angle for both polarizations, |r| = 1
// beyond θ_c, Stokes's relations, the single-interface layer solver against
// the closed forms, continuity of the field and of its scaled derivative at
// both boundaries of a gap, frustrated TIR against the barrier formula, the
// evanescent decay length, a metal's reflectance, and the sim's validator.
//   node atlas/test/op-fresnel.test.mjs

import * as M from '../src/viz/model/op-fresnel.js';
import { validate, defaults } from '../src/viz/sims/op-fresnel.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b));
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const D = M.DEG;

// textbook values
const f0 = M.coefficients(1, 1.5, 0);
check('R at normal incidence on n = 1.5 is 4%', close(f0.R, 0.04, 1e-12), f0.R);
check('r_s = −0.2 and r_p = +0.2 at normal incidence (Hecht signs)', near(f0.rs[0], -0.2, 1e-12) && near(f0.rp[0], 0.2, 1e-12));
const tb = M.brewster(1, 1.5);
check('r_p vanishes at Brewster', Math.abs(M.coefficients(1, 1.5, tb).rp[0]) < 1e-12);
check('Brewster for air→glass 1.5 is 56.31°', near(tb / D, 56.3099, 1e-3));
check('critical angle glass 1.5 → air is 41.81°', near(M.critical(1.5, 1) / D, 41.8103, 1e-3));
check('no critical angle going into denser medium', Number.isNaN(M.critical(1, 1.5)));

// energy and Stokes
for (const [n1, n2] of [[1, 1.5168], [1.5168, 1], [1.33, 1.5], [2.42, 1], [1, 2.42]]) {
  for (let a = 0; a < 90; a += 3.7) {
    const f = M.coefficients(n1, n2, a * D);
    check(`R+T=1 s ${n1}→${n2} ${a.toFixed(1)}°`, near(f.Rs + f.Ts, 1, 1e-12), `${f.Rs + f.Ts}`);
    check(`R+T=1 p ${n1}→${n2} ${a.toFixed(1)}°`, near(f.Rp + f.Tp, 1, 1e-12), `${f.Rp + f.Tp}`);
    if (f.tir) {
      check(`|r_s| = 1 beyond θc ${n1}→${n2} ${a}`, near(M.abs(f.rs), 1, 1e-12));
      check(`|r_p| = 1 beyond θc ${n1}→${n2} ${a}`, near(M.abs(f.rp), 1, 1e-12));
    } else {
      // Stokes: t t′ − r r′... use 1 + r_s = t_s
      check(`1 + r_s = t_s ${n1}→${n2} ${a}`, near(1 + f.rs[0], f.ts[0], 1e-12));
      // Stokes relation r′ = −r (reverse direction, refraction angle)
      const th2 = Math.asin((n1 * Math.sin(a * D)) / n2);
      const g = M.coefficients(n2, n1, th2);
      check(`Stokes r′_s = −r_s ${n1}→${n2} ${a}`, near(g.rs[0], -f.rs[0], 1e-12));
      check(`Stokes t t′ = 1 − r² (s) ${n1}→${n2} ${a}`, near(f.ts[0] * g.ts[0], 1 - f.rs[0] ** 2, 1e-12));
      check(`Stokes t t′ = 1 − r² (p) ${n1}→${n2} ${a}`, near(f.tp[0] * g.tp[0], 1 - f.rp[0] ** 2, 1e-12));
    }
  }
}
// grazing incidence reflects everything
check('R → 1 at grazing incidence', M.coefficients(1, 1.5, 89.999 * D).R > 0.999);

// the layer solver with d = 0 matches the closed forms (s: E field; p: H field, r_H = r_p, t_H = (n₂/n₁)t_p)
for (const [n1, n2] of [[1, 1.5], [1.5, 1], [1.33, 1.7]]) {
  for (const a of [0, 20, 40, 41.5, 50, 70]) {
    const f = M.coefficients(n1, n2, a * D);
    const Ls = M.layer({ n1, n2: n1, n3: n2, th: a * D, d: 0, lambda: 500e-9, pol: 's' });
    const Lp = M.layer({ n1, n2: n1, n3: n2, th: a * D, d: 0, lambda: 500e-9, pol: 'p' });
    check(`layer d=0 r_s ${n1}→${n2} ${a}`, M.abs(M.sub(Ls.r, f.rs)) < 1e-12, `${Ls.r} vs ${f.rs}`);
    check(`layer d=0 r_p ${n1}→${n2} ${a}`, M.abs(M.sub(Lp.r, f.rp)) < 1e-12, `${Lp.r} vs ${f.rp}`);
    if (!f.tir) {
      check(`layer d=0 t_s ${n1}→${n2} ${a}`, M.abs(M.sub(Ls.t, f.ts)) < 1e-12);
      check(`layer d=0 t_p(H) = (n₂/n₁) t_p ${n1}→${n2} ${a}`, M.abs(M.sub(Lp.t, M.scl(f.tp, n2 / n1))) < 1e-12);
      check(`layer d=0 T_s ${n1}→${n2} ${a}`, near(Ls.T, f.Ts, 1e-12));
      check(`layer d=0 T_p ${n1}→${n2} ${a}`, near(Lp.T, f.Tp, 1e-12));
    }
  }
}

// a gap: energy conservation, continuity, and frustrated TIR against the closed form
const lam = 633e-9;
for (const pol of ['s', 'p']) {
  for (const [n1, n2, n3] of [[1.5168, 1, 1.5168], [1.5, 1.33, 1.7], [1, 1.38, 1.52]]) {
    for (const a of [0, 30, 45, 60]) {
      for (const d of [0, 50e-9, 200e-9, 633e-9, 1.4e-6]) {
        const th = a * D;
        if (n1 * Math.sin(th) >= n3) continue;          // no transmitted wave at all
        const L = M.layer({ n1, n2, n3, th, d, lambda: lam, pol });
        check(`gap R+T=1 ${pol} ${n1}|${n2}|${n3} ${a}° d=${d}`, near(L.R + L.T, 1, 1e-10), `${L.R + L.T}`);
        // continuity of ψ and of (1/w)ψ′ at y = 0 and y = −d
        const w = (n) => (pol === 'p' ? n * n : 1);
        const h = 1e-16, hd = 1e-13, x = 0.3e-6;
        for (const [yb, na, nb] of [[0, n1, n2], [-d, n2, n3]]) {
          if (d === 0 && yb !== 0) continue;
          const nA = d === 0 ? n1 : na, nB = d === 0 ? n3 : nb;
          const up = L.field(x, yb + h), dn = L.field(x, yb - h);
          check(`gap ψ continuous ${pol} ${a}° d=${d} y=${yb}`, M.abs(M.sub(up, dn)) < 1e-6, `${up} ${dn}`);
          const dpsi = (y) => M.scl(M.sub(L.field(x, y + hd), L.field(x, y - hd)), 1 / (2 * hd));
          const dU = M.scl(dpsi(yb + 2 * hd), 1 / w(nA)), dD = M.scl(dpsi(yb - 2 * hd), 1 / w(nB));
          const scale = (2 * Math.PI / lam) * Math.max(n1, n2, n3);
          check(`gap ψ′/w continuous ${pol} ${a}° d=${d} y=${yb}`, M.abs(M.sub(dU, dD)) < 1e-4 * scale, `${M.abs(M.sub(dU, dD)) / scale}`);
        }
      }
    }
  }
}
for (const a of [45, 50, 60, 75]) {
  for (const d of [20e-9, 100e-9, 300e-9, 800e-9]) {
    const th = a * D, L = M.layer({ n1: 1.5168, n2: 1, n3: 1.5168, th, d, lambda: lam, pol: 's' });
    const T = M.ftirS(1.5168, 1, th, d, lam);
    check(`FTIR s matches barrier formula ${a}° d=${d}`, close(L.T, T, 1e-9), `${L.T} vs ${T}`);
  }
  const L0 = M.layer({ n1: 1.5168, n2: 1, n3: 1.5168, th: a * D, d: 0, lambda: lam, pol: 'p' });
  check(`FTIR gap 0 transmits all ${a}°`, near(L0.T, 1, 1e-12));
  // far apart: T falls as e^{−2κd}
  const K = M.kappa(1.5168, 1, a * D, lam);
  const T1 = M.layer({ n1: 1.5168, n2: 1, n3: 1.5168, th: a * D, d: 3e-6, lambda: lam, pol: 'p' }).T;
  const T2 = M.layer({ n1: 1.5168, n2: 1, n3: 1.5168, th: a * D, d: 3.2e-6, lambda: lam, pol: 'p' }).T;
  check(`FTIR p decays as e^(−2κd) ${a}°`, close(T2 / T1, Math.exp(-2 * K * 0.2e-6), 1e-3), `${T2 / T1} vs ${Math.exp(-2 * K * 0.2e-6)}`);
}

// evanescent field: decays as e^{κy} into the second medium, single interface
{
  const th = 60 * D, L = M.layer({ n1: 1.5168, n2: 1.5168, n3: 1, th, d: 0, lambda: lam, pol: 's' });
  const K = M.kappa(1.5168, 1, th, lam);
  const a = M.abs(L.field(0, -100e-9)), b = M.abs(L.field(0, -300e-9));
  check('evanescent field falls as e^(−κ|y|)', close(b / a, Math.exp(-K * 200e-9), 1e-9));
  check('penetration depth = 1/κ', close(M.penetration(1.5168, 1, th, lam), 1 / K, 1e-12));
  check('penetration depth at 60° in BK7→air, 633 nm ≈ 118 nm', near(M.penetration(1.5168, 1, th, lam) * 1e9, 118.28, 0.05), M.penetration(1.5168, 1, th, lam) * 1e9);
  check('no evanescent wave below θc', M.penetration(1.5168, 1, 30 * D, lam) === Infinity);
  // the surface field is |t| at y = 0 and the incident + reflected sum there
  check('field continuous at the surface (single interface)', M.abs(M.sub(L.field(0, 1e-17), L.field(0, -1e-17))) < 1e-9);
}

// a metal at normal incidence: aluminium at 550 nm (n ≈ 0.958 + 6.69i) reflects about 92%
check('aluminium reflects ~92% at 550 nm', near(M.normalR(1, [0.958, 6.69]), 0.9212, 2e-3), M.normalR(1, [0.958, 6.69]));
check('normalR of a real index matches coefficients', near(M.normalR(1, 1.5168), M.coefficients(1, 1.5168, 0).R, 1e-14));

// the validator
check('defaults validate', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('evanescent view validates', validate({ view: 'evanescent', n1: 1.5168, n2: 1, angle: 60, gap: 0.3 }).length === 0, validate({ view: 'evanescent', n1: 1.5168, n2: 1, angle: 60, gap: 0.3 }).join('; '));
check('a bad view is caught', validate({ view: 'nope' }).length > 0);
check('a bad angle is caught', validate({ angle: 95 }).length > 0);
check('an unknown hide key is caught', validate({ hide: ['zzz'] }).length > 0);
check('a bad gap is caught', validate({ view: 'evanescent', gap: 5 }).length > 0);

console.log(`op-fresnel: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
