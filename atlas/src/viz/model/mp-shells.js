// Many-electron atoms, DOM-free (tested in test/mp-shells.test.mjs): the
// elements hydrogen to radon, their ground-state electron configurations and
// first ionization energies, and the bookkeeping of the exclusion principle —
// each subshell (n, l) holds 2(2l + 1) electrons, one per (m_l, m_s).
//
// Configurations: the Madelung (n + l, then n) filling order, with the
// ground-state exceptions listed by the NIST Atomic Spectra Database (Cr, Cu,
// Nb, Mo, Ru, Rh, Pd, Ag, La, Ce, Gd, Pt, Au). Within a subshell, Hund’s
// rule: one electron in each m_l (spin up) before any pairs. The filling order
// is a bookkeeping rule, not an energy scale: once 3d is occupied it lies
// below 4s, which is why transition-metal ions lose their 4s electrons first.
//
// Ionization energies: NIST ASD (Kramida, Ralchenko, Reader & NIST ASD Team),
// in eV, for the neutral atom’s ground state. Used by the mp-shells
// simulation and the PHYS 2710 lessons on the exclusion principle and the
// periodic table.

export const RYD = 13.605693122990;        // eV, the Rydberg energy (CODATA 2022)

// [symbol, name, first ionization energy in eV], Z = 1 … 86
const RAW = [
  ['H', 'hydrogen', 13.598434], ['He', 'helium', 24.587389],
  ['Li', 'lithium', 5.391715], ['Be', 'beryllium', 9.322699], ['B', 'boron', 8.298019], ['C', 'carbon', 11.260288],
  ['N', 'nitrogen', 14.53413], ['O', 'oxygen', 13.618055], ['F', 'fluorine', 17.42282], ['Ne', 'neon', 21.564541],
  ['Na', 'sodium', 5.139077], ['Mg', 'magnesium', 7.646236], ['Al', 'aluminium', 5.985769], ['Si', 'silicon', 8.151683],
  ['P', 'phosphorus', 10.486686], ['S', 'sulfur', 10.36001], ['Cl', 'chlorine', 12.967633], ['Ar', 'argon', 15.759611],
  ['K', 'potassium', 4.340664], ['Ca', 'calcium', 6.111316], ['Sc', 'scandium', 6.56149], ['Ti', 'titanium', 6.82812],
  ['V', 'vanadium', 6.746187], ['Cr', 'chromium', 6.76651], ['Mn', 'manganese', 7.434038], ['Fe', 'iron', 7.902468],
  ['Co', 'cobalt', 7.88101], ['Ni', 'nickel', 7.639878], ['Cu', 'copper', 7.72638], ['Zn', 'zinc', 9.394197],
  ['Ga', 'gallium', 5.999302], ['Ge', 'germanium', 7.899435], ['As', 'arsenic', 9.78855], ['Se', 'selenium', 9.752392],
  ['Br', 'bromine', 11.81381], ['Kr', 'krypton', 13.999606],
  ['Rb', 'rubidium', 4.177128], ['Sr', 'strontium', 5.694867], ['Y', 'yttrium', 6.21726], ['Zr', 'zirconium', 6.634126],
  ['Nb', 'niobium', 6.75885], ['Mo', 'molybdenum', 7.09243], ['Tc', 'technetium', 7.11938], ['Ru', 'ruthenium', 7.3605],
  ['Rh', 'rhodium', 7.4589], ['Pd', 'palladium', 8.336839], ['Ag', 'silver', 7.576234], ['Cd', 'cadmium', 8.99382],
  ['In', 'indium', 5.786356], ['Sn', 'tin', 7.343918], ['Sb', 'antimony', 8.608389], ['Te', 'tellurium', 9.009808],
  ['I', 'iodine', 10.45126], ['Xe', 'xenon', 12.129844],
  ['Cs', 'caesium', 3.893906], ['Ba', 'barium', 5.211665], ['La', 'lanthanum', 5.5769], ['Ce', 'cerium', 5.5386],
  ['Pr', 'praseodymium', 5.4702], ['Nd', 'neodymium', 5.525], ['Pm', 'promethium', 5.577], ['Sm', 'samarium', 5.64371],
  ['Eu', 'europium', 5.670385], ['Gd', 'gadolinium', 6.1498], ['Tb', 'terbium', 5.8638], ['Dy', 'dysprosium', 5.93905],
  ['Ho', 'holmium', 6.0215], ['Er', 'erbium', 6.1077], ['Tm', 'thulium', 6.18431], ['Yb', 'ytterbium', 6.25416],
  ['Lu', 'lutetium', 5.425871], ['Hf', 'hafnium', 6.825069], ['Ta', 'tantalum', 7.549571], ['W', 'tungsten', 7.86403],
  ['Re', 'rhenium', 7.83352], ['Os', 'osmium', 8.43823], ['Ir', 'iridium', 8.96702], ['Pt', 'platinum', 8.95883],
  ['Au', 'gold', 9.225554], ['Hg', 'mercury', 10.437504], ['Tl', 'thallium', 6.108287], ['Pb', 'lead', 7.41668],
  ['Bi', 'bismuth', 7.285516], ['Po', 'polonium', 8.41807], ['At', 'astatine', 9.31751], ['Rn', 'radon', 10.7485],
];
export const ZMAX = RAW.length;            // 86
export const NOBLE = [2, 10, 18, 36, 54, 86];
const L_LETTER = 'spdf';

/** The subshells in Madelung order: n + l, then n. */
export const ORDER = (() => {
  const out = [];
  for (let s = 1; s <= 8; s++) for (let n = Math.ceil((s + 1) / 2); n <= s; n++) { const l = s - n; if (l >= 0 && l <= 3 && l < n) out.push([n, l]); }
  return out;
})();
export const capacity = (l) => 2 * (2 * l + 1);
export const subshellName = (n, l) => `${n}${L_LETTER[l]}`;

// Ground states that break the Madelung order (NIST ASD): the changed subshell counts
const EXCEPTIONS = {
  24: { '3d': 5, '4s': 1 }, 29: { '3d': 10, '4s': 1 },
  41: { '4d': 4, '5s': 1 }, 42: { '4d': 5, '5s': 1 }, 44: { '4d': 7, '5s': 1 }, 45: { '4d': 8, '5s': 1 }, 46: { '4d': 10, '5s': 0 }, 47: { '4d': 10, '5s': 1 },
  57: { '4f': 0, '5d': 1 }, 58: { '4f': 1, '5d': 1 }, 64: { '4f': 7, '5d': 1 },
  78: { '5d': 9, '6s': 1 }, 79: { '5d': 10, '6s': 1 },
};
export const isException = (Z) => Z in EXCEPTIONS;

/** Madelung filling alone: [{ n, l, count }] in filling order, empty subshells left out. */
export function madelung(Z) {
  const out = [];
  let left = Z;
  for (const [n, l] of ORDER) {
    if (left <= 0) break;
    const c = Math.min(capacity(l), left);
    out.push({ n, l, count: c });
    left -= c;
  }
  return out;
}

/** The ground-state configuration: [{ n, l, count }] in filling (Madelung) order, with the real exceptions. */
export function configuration(Z) {
  const base = madelung(Z);
  const ex = EXCEPTIONS[Z];
  if (!ex) return base;
  const map = new Map(base.map((s) => [subshellName(s.n, s.l), s.count]));
  for (const [k, v] of Object.entries(ex)) map.set(k, v);
  return ORDER.map(([n, l]) => ({ n, l, count: map.get(subshellName(n, l)) || 0 })).filter((s) => s.count > 0);
}

/** The noble-gas core below an element (0 for hydrogen and helium’s own shell). */
export function coreOf(Z) {
  let c = 0;
  for (const g of NOBLE) if (g < Z) c = g;
  return c;
}
/** The period (row of the table), counted by noble gases (palladium, [Kr] 4d¹⁰, is in period 5). */
export const periodOf = (Z) => NOBLE.findIndex((g) => Z <= g) + 1;
/** The largest principal quantum number occupied in the ground state. */
export const outerN = (Z) => Math.max(...configuration(Z).map((s) => s.n));

/** The subshells beyond the noble-gas core, in filling order. */
export function valence(Z) {
  const core = coreOf(Z);
  const coreSet = new Set(configuration(core || 0).map((s) => subshellName(s.n, s.l)));
  return configuration(Z).filter((s) => !(core && coreSet.has(subshellName(s.n, s.l)) && s.count === capacity(s.l)));
}

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = (k) => String(k).split('').map((d) => SUP[d]).join('');
/** Subshells written in order of n, then l, as chemists and NIST do: 3d⁶ 4s². */
const byN = (list) => [...list].sort((a, b) => a.n - b.n || a.l - b.l);

/** The configuration as plain text: "1s² 2s² 2p⁴", or with the core: "[Ar] 3d⁶ 4s²". */
export function configText(Z, { core = true } = {}) {
  const c = core ? coreOf(Z) : 0;
  const list = core ? valence(Z) : configuration(Z);
  const body = byN(list).map((s) => `${subshellName(s.n, s.l)}${sup(s.count)}`).join(' ');
  return c ? `[${RAW[c - 1][0]}] ${body}` : body;
}
/** The configuration as TeX, upright: \mathrm{1s}^{2}\,\mathrm{2s}^{2} … or [\mathrm{Ar}]\,\mathrm{3d}^{6}\,\mathrm{4s}^{2}. */
export function configTeX(Z, { core = true } = {}) {
  const c = core ? coreOf(Z) : 0;
  const list = core ? valence(Z) : configuration(Z);
  const body = byN(list).map((s) => `\\mathrm{${subshellName(s.n, s.l)}}^{${s.count}}`).join('\\,');
  return c ? `[\\mathrm{${RAW[c - 1][0]}}]\\,${body}` : body;
}

/**
 * Hund’s rule within a subshell of `count` electrons: one up-spin in each of
 * the 2l + 1 orbitals (m_l = +l, l − 1, …, −l) before any are paired.
 * Returns [{ ml, up, down }] in that order.
 */
export function boxes(l, count) {
  const m = 2 * l + 1, out = [];
  for (let i = 0; i < m; i++) out.push({ ml: l - i, up: count > i, down: count > m + i });
  return out;
}
export const unpairedIn = (l, count) => (count <= 2 * l + 1 ? count : 2 * (2 * l + 1) - count);
/** Unpaired electrons in the ground state (by Hund’s rule, subshell by subshell). */
export const unpaired = (Z) => configuration(Z).reduce((s, x) => s + unpairedIn(x.l, x.count), 0);

/**
 * The electrons’ quantum numbers (n, l, m_l, m_s) in the order the Aufbau
 * principle and Hund’s rule place them (filling subshell by subshell), for
 * the ground-state configuration. No two are the same: that is the exclusion principle.
 */
export function quantumNumbers(Z) {
  const out = [];
  for (const { n, l, count } of configuration(Z)) {
    const m = 2 * l + 1;
    for (let k = 0; k < count; k++) out.push({ n, l, ml: l - (k % m), ms: k < m ? 0.5 : -0.5 });
  }
  return out;
}

export function element(Z) {
  const [sym, name, ie] = RAW[Z - 1];
  return { Z, sym, name, ie };
}
export const ionization = (Z) => RAW[Z - 1][2];
export const symbol = (Z) => RAW[Z - 1][0];

/** The block: the subshell the Madelung order is filling at this Z (s, p, d or f). */
export function blockOf(Z) {
  if (Z === 2) return 's';
  const last = madelung(Z).at(-1);
  return L_LETTER[last.l];
}

/**
 * Position in the 18-column table: { row, col } with row 1–6 for the periods
 * and row 8 for the f-block strip (lanthanum to ytterbium, IUPAC’s 2021
 * layout, with lutetium in group 3). col is 1–18 (3–16 for the f-strip’s 14 cells).
 */
export function position(Z) {
  const p = periodOf(Z);
  if (Z === 1) return { row: 1, col: 1 };
  if (Z === 2) return { row: 1, col: 18 };
  if (Z >= 57 && Z <= 70) return { row: 8, col: 3 + (Z - 57) };
  const start = coreOf(Z) + 1, k = Z - start;               // k-th element of its period, from 0
  if (p <= 3) return { row: p, col: k < 2 ? k + 1 : k + 11 };
  if (p <= 5) return { row: p, col: k + 1 };
  // period 6: Cs, Ba, then the f-strip (14), then Lu … Rn in groups 3–18
  return { row: 6, col: k < 2 ? k + 1 : k - 14 + 1 };
}

/**
 * The effective charge the outermost electron would need, in a hydrogen-like
 * level of principal number n, to be bound by the measured ionization energy:
 * IE = Z_eff² · R / n². A teaching model: real valence electrons penetrate the
 * core, so this Z_eff mixes screening with penetration.
 */
export const zEff = (Z) => outerN(Z) * Math.sqrt(ionization(Z) / RYD);

/** Ionization energies that are lower than the element before them (the dips: B, O, Na, Al, S, K, …). */
export const dips = (zmax = ZMAX) => Array.from({ length: zmax - 1 }, (_, i) => i + 2).filter((Z) => ionization(Z) < ionization(Z - 1));
