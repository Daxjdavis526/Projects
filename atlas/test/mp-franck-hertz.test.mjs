// The Franck–Hertz model behind the mp-franck-hertz simulation.
//   node atlas/test/mp-franck-hertz.test.mjs

import * as FH from '../src/viz/model/mp-franck-hertz.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

check('mercury’s 4.886 eV level emits at 253.7 nm', Math.abs(FH.photonNm(FH.GASES.hg.E1) - 253.73) < 0.01, String(FH.photonNm(FH.GASES.hg.E1)));
check('an electron gives a mercury atom at most about 10⁻⁵ of its energy elastically', Math.abs(FH.elasticShare(5.48579909e-4, 200.592) - 1.094e-5) < 0.01e-5, String(FH.elasticShare(5.48579909e-4, 200.592)));

// without any spread or overshoot the bookkeeping is exact
check('no current until the electrons can climb the retarding voltage', FH.anodeFraction(1.4, 4.886, 1.5, 0.6, 0) === 0 && FH.anodeFraction(1.6, 4.886, 1.5, 0.6, 0) === 1);
check('just past E₁ + Vr electrons that excited an atom are turned back', FH.anodeFraction(4.886 + 1.0, 4.886, 1.5, 1e-6, 0) < 1e-6);
check('fractions lie between 0 and 1', [0.5, 3, 5, 6, 9.9, 14, 22, 29].every((U) => { const f = FH.anodeFraction(U, 4.886, 1.5, 0.6, 0.3); return f >= 0 && f <= 1 + 1e-12; }));
// the probabilities of exciting 0, 1, 2 … atoms add to one: with Vr = 0 and no spread every electron arrives
check('every electron arrives when nothing retards it', [3, 7, 12.3, 20].every((U) => Math.abs(FH.anodeFraction(U, 4.886, -1e-9, 0.6, 0) - 1) < 1e-9));

for (const [gas, opts] of [['hg', { Vr: 1.5 }], ['hg', { Vr: 1.5, contact: 2.1 }], ['hg', { Vr: 0.8 }], ['ne', { Vr: 4 }]]) {
  const G = FH.GASES[gas], c = FH.curve(gas, opts, 1500), p = FH.peaks(c);
  const tag = `${gas} ${JSON.stringify(opts)}`;
  check(`${tag}: several peaks`, p.length >= 4, p.join(' '));
  const sp = p.slice(1).map((x, i) => x - p[i]);
  check(`${tag}: peaks are spaced by E₁ (within 2%)`, sp.every((s) => Math.abs(s / G.E1 - 1) < 0.02), sp.join(' '));
  check(`${tag}: the first peak sits at E₁ plus the contact potential`, Math.abs(p[0] - G.E1 - (opts.contact || 0)) < 0.03 * G.E1, String(p[0]));
  // just after each peak the current falls well below it
  const dip = (v) => Math.min(...Array.from({ length: 50 }, (_, k) => FH.anodeCurrent(v + (k / 49) * 0.5 * G.E1, gas, opts)));
  check(`${tag}: deep dips after the peaks`, p.slice(0, 3).every((v) => dip(v) < 0.7 * FH.anodeCurrent(v, gas, opts)), p.slice(0, 3).map((v) => (dip(v) / FH.anodeCurrent(v, gas, opts)).toFixed(2)).join(' '));
  check(`${tag}: later peaks are higher`, p.slice(1).every((v, i) => FH.anodeCurrent(v, gas, opts) > FH.anodeCurrent(p[i], gas, opts)));
}
check('a typical electron at 20 V in mercury excites 4 atoms, at 1/5, 2/5 … of the way', FH.excitations(20, 4.886) === 4 && Math.abs(FH.excitationPlaces(20, 4.886)[1] - 2 * 4.886 / 20) < 1e-12);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
