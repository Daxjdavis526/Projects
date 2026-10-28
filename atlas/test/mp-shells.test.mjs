// The many-electron-atom model behind the mp-shells simulation.
//   node atlas/test/mp-shells.test.mjs

import * as S from '../src/viz/model/mp-shells.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

check('86 elements, hydrogen to radon', S.ZMAX === 86 && S.symbol(1) === 'H' && S.symbol(86) === 'Rn' && S.symbol(26) === 'Fe' && S.symbol(79) === 'Au');
check('Madelung order begins 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p', S.ORDER.slice(0, 15).map(([n, l]) => S.subshellName(n, l)).join(' ') === '1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p');
check('a subshell holds 2(2l + 1); a shell 2n²', [0, 1, 2, 3].map(S.capacity).join() === '2,6,10,14' && [1, 2, 3, 4].every((n) => Array.from({ length: n }, (_, l) => S.capacity(l)).reduce((a, b) => a + b) === 2 * n * n));

for (let Z = 1; Z <= S.ZMAX; Z++) {
  const c = S.configuration(Z);
  const n = c.reduce((s, x) => s + x.count, 0);
  if (n !== Z) check(`Z = ${Z}: the configuration holds Z electrons`, false, String(n));
  if (c.some((x) => x.count > S.capacity(x.l) || x.count < 1)) check(`Z = ${Z}: no subshell over-full`, false, S.configText(Z));
  const q = S.quantumNumbers(Z), keys = new Set(q.map((e) => `${e.n},${e.l},${e.ml},${e.ms}`));
  if (keys.size !== Z) check(`Z = ${Z}: no two electrons share all four quantum numbers`, false);
  if (q.some((e) => Math.abs(e.ml) > e.l || e.l >= e.n)) check(`Z = ${Z}: allowed quantum numbers`, false);
}
check('every configuration is valid (no failures above)', true);

const cfg = (Z) => S.configText(Z);
check('oxygen: [He] 2s² 2p⁴', cfg(8) === '[He] 2s² 2p⁴', cfg(8));
check('iron: [Ar] 3d⁶ 4s²', cfg(26) === '[Ar] 3d⁶ 4s²', cfg(26));
check('chromium: [Ar] 3d⁵ 4s¹ (an exception)', cfg(24) === '[Ar] 3d⁵ 4s¹' && S.isException(24), cfg(24));
check('copper: [Ar] 3d¹⁰ 4s¹ (an exception)', cfg(29) === '[Ar] 3d¹⁰ 4s¹', cfg(29));
check('gallium: [Ar] 3d¹⁰ 4s² 4p¹', cfg(31) === '[Ar] 3d¹⁰ 4s² 4p¹', cfg(31));
check('palladium: [Kr] 4d¹⁰', cfg(46) === '[Kr] 4d¹⁰', cfg(46));
check('gold: [Xe] 4f¹⁴ 5d¹⁰ 6s¹', cfg(79) === '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', cfg(79));
check('gadolinium: [Xe] 4f⁷ 5d¹ 6s²', cfg(64) === '[Xe] 4f⁷ 5d¹ 6s²', cfg(64));
check('lanthanum: [Xe] 5d¹ 6s²', cfg(57) === '[Xe] 5d¹ 6s²', cfg(57));
check('neon in full: 1s² 2s² 2p⁶', S.configText(10, { core: false }) === '1s² 2s² 2p⁶');
check('TeX form of iron', S.configTeX(26) === '[\\mathrm{Ar}]\\,\\mathrm{3d}^{6}\\,\\mathrm{4s}^{2}', S.configTeX(26));

// Hund's rule
check('Hund: nitrogen has 3 unpaired electrons, oxygen 2, neon 0', S.unpaired(7) === 3 && S.unpaired(8) === 2 && S.unpaired(10) === 0);
check('Hund: chromium has 6 unpaired, iron 4, manganese 5, copper 1', S.unpaired(24) === 6 && S.unpaired(26) === 4 && S.unpaired(25) === 5 && S.unpaired(29) === 1);
check('Hund: gadolinium has 8 unpaired', S.unpaired(64) === 8);
check('boxes: 2p⁴ is ↑↓, ↑, ↑', JSON.stringify(S.boxes(1, 4).map((b) => [b.up, b.down])) === JSON.stringify([[true, true], [true, false], [true, false]]));

// the table
const pos = (Z) => { const p = S.position(Z); return `${p.row},${p.col}`; };
check('positions: H 1,1  He 1,18  B 2,13  Ne 2,18  K 4,1  Fe 4,8  Kr 4,18  Ag 5,11', [[1, '1,1'], [2, '1,18'], [5, '2,13'], [10, '2,18'], [19, '4,1'], [26, '4,8'], [36, '4,18'], [47, '5,11']].every(([Z, p]) => pos(Z) === p), [1, 2, 5, 10, 19, 26, 36, 47].map(pos).join(' '));
check('positions: Cs 6,1  La f-strip  Lu 6,3  Au 6,11  Rn 6,18', pos(55) === '6,1' && pos(57) === '8,3' && pos(70) === '8,16' && pos(71) === '6,3' && pos(79) === '6,11' && pos(86) === '6,18');
const cells = new Set(Array.from({ length: S.ZMAX }, (_, i) => pos(i + 1)));
check('no two elements share a cell', cells.size === S.ZMAX);
check('periods: Pd ([Kr] 4d¹⁰) is in period 5, K in 4, Rn in 6', S.periodOf(46) === 5 && S.periodOf(19) === 4 && S.periodOf(86) === 6 && S.periodOf(2) === 1 && S.outerN(46) === 4);
check('groups 1 and 18: the same outer configuration down the column', [3, 11, 19, 37, 55].every((Z) => S.valence(Z).at(-1).l === 0 && S.valence(Z).at(-1).count === 1) && [10, 18, 36, 54, 86].every((Z) => S.configuration(Z).at(-1).l === 1 && S.configuration(Z).at(-1).count === 6));
check('blocks: Na s, Fe d, Br p, Nd f, Lu d', S.blockOf(11) === 's' && S.blockOf(26) === 'd' && S.blockOf(35) === 'p' && S.blockOf(60) === 'f' && S.blockOf(71) === 'd' && S.blockOf(2) === 's');

// ionization energies: the shell structure in the data
const ie = S.ionization;
check('noble gases are the peaks of their periods', [[2, 1], [10, 3], [18, 11], [36, 19], [54, 37], [86, 55]].every(([g, a]) => Array.from({ length: g - a + 1 }, (_, i) => a + i).every((Z) => Z === g || ie(Z) < ie(g)) || g === 2));
check('alkali metals are the minima of their periods', [[3, 10], [11, 18], [19, 36], [37, 54], [55, 86]].every(([a, g]) => Array.from({ length: g - a + 1 }, (_, i) => a + i).every((Z) => Z === a || ie(Z) > ie(a))));
check('the drop from each noble gas to the next alkali is more than 7 eV', [[2, 3], [10, 11], [18, 19], [36, 37], [54, 55]].every(([g, a]) => ie(g) - ie(a) > 7));
const d = S.dips(36);
check('period 2 and 3 dips: B, O, Na, Al, S (a new p subshell, then the first pairing)', [5, 8, 11, 13, 16].every((Z) => d.includes(Z)) && !d.includes(6) && !d.includes(7), d.join(' '));
check('Z_eff of sodium’s 3s electron is about 1.84', Math.abs(S.zEff(11) - 1.844) < 0.005, String(S.zEff(11)));
check('hydrogen’s Z_eff is 1 (to 0.03%: the reduced mass)', Math.abs(S.zEff(1) - 1) < 3e-4, String(S.zEff(1)));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
