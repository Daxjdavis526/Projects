// Physical units: parse "kg·m/s²", "J/(kg K)", "km/h", "μs", and quantities
// such as "3.0e8 m/s" or "4.5 × 10^3 N". Every unit reduces to a factor times
// a dimension vector over the SI base (m, kg, s, A, K, mol, cd), so any
// dimensionally equivalent answer can be accepted and compared in SI.
// Exact SI values (2019 redefinition) and CODATA 2022 where a value is measured.

import { parse as parseExpr, compile, normalise, ParseError } from './expr.js';

export const BASE = ['m', 'kg', 's', 'A', 'K', 'mol', 'cd'];
const D = (m = 0, kg = 0, s = 0, A = 0, K = 0, mol = 0, cd = 0) => [m, kg, s, A, K, mol, cd];
const ZERO = D();

const E_CHARGE = 1.602176634e-19;           // C, exact
const DAY = 86400;
const JULIAN_YEAR = 365.25 * DAY;           // IAU light-year convention

// symbol → [factor to SI, dims]. Order matters only for documentation.
export const UNITS = {
  m: [1, D(1)], g: [1e-3, D(0, 1)], s: [1, D(0, 0, 1)], A: [1, D(0, 0, 0, 1)], K: [1, D(0, 0, 0, 0, 1)],
  mol: [1, D(0, 0, 0, 0, 0, 1)], cd: [1, D(0, 0, 0, 0, 0, 0, 1)],
  N: [1, D(1, 1, -2)], J: [1, D(2, 1, -2)], W: [1, D(2, 1, -3)], Pa: [1, D(-1, 1, -2)], Hz: [1, D(0, 0, -1)],
  C: [1, D(0, 0, 1, 1)], V: [1, D(2, 1, -3, -1)], ohm: [1, D(2, 1, -3, -2)], Ω: [1, D(2, 1, -3, -2)],
  F: [1, D(-2, -1, 4, 2)], H: [1, D(2, 1, -2, -2)], T: [1, D(0, 1, -2, -1)], Wb: [1, D(2, 1, -2, -1)],
  S: [1, D(-2, -1, 3, 2)], Bq: [1, D(0, 0, -1)], Gy: [1, D(2, 0, -2)], Sv: [1, D(2, 0, -2)],
  eV: [E_CHARGE, D(2, 1, -2)], L: [1e-3, D(3)], l: [1e-3, D(3)],
  min: [60, D(0, 0, 1)], h: [3600, D(0, 0, 1)], hr: [3600, D(0, 0, 1)], day: [DAY, D(0, 0, 1)],
  d: [DAY, D(0, 0, 1)], yr: [JULIAN_YEAR, D(0, 0, 1)], y: [JULIAN_YEAR, D(0, 0, 1)],
  au: [1.495978707e11, D(1)], AU: [1.495978707e11, D(1)], ly: [9.4607304725808e15, D(1)],
  pc: [3.0856775814913673e16, D(1)], Å: [1e-10, D(1)], angstrom: [1e-10, D(1)],
  rad: [1, ZERO], sr: [1, ZERO], deg: [Math.PI / 180, ZERO], '°': [Math.PI / 180, ZERO],
  rev: [2 * Math.PI, ZERO], rpm: [2 * Math.PI / 60, D(0, 0, -1)],
  atm: [101325, D(-1, 1, -2)], bar: [1e5, D(-1, 1, -2)], torr: [101325 / 760, D(-1, 1, -2)],
  mmHg: [133.322387415, D(-1, 1, -2)], psi: [6894.757293168361, D(-1, 1, -2)],
  cal: [4.184, D(2, 1, -2)], Wh: [3600, D(2, 1, -2)], erg: [1e-7, D(2, 1, -2)], dyn: [1e-5, D(1, 1, -2)],
  u: [1.66053906892e-27, D(0, 1)], Da: [1.66053906892e-27, D(0, 1)],
  Msun: [1.98841e30, D(0, 1)], 'M☉': [1.98841e30, D(0, 1)], Mearth: [5.9722e24, D(0, 1)],
  G: [1e-4, D(0, 1, -2, -1)],   // gauss; only reached as a whole token ("G"), never as a prefix
  c: [299792458, D(1, 0, -1)],  // "c" as a speed unit: 0.6 c
  mph: [0.44704, D(1, 0, -1)], kph: [1 / 3.6, D(1, 0, -1)], ft: [0.3048, D(1)], in: [0.0254, D(1)],
  mi: [1609.344, D(1)], lb: [0.45359237, D(0, 1)], lbf: [4.4482216152605, D(1, 1, -2)],
  percent: [0.01, ZERO], '%': [0.01, ZERO],
};

// Units that never take prefixes (min is not milli-in, cd is candela, etc.)
const NO_PREFIX = new Set(['min', 'h', 'hr', 'day', 'd', 'yr', 'y', 'au', 'AU', 'ly', 'deg', '°', 'rev', 'rpm',
  'atm', 'mmHg', 'psi', 'mph', 'kph', 'ft', 'in', 'mi', 'lb', 'lbf', 'percent', '%', 'Msun', 'M☉', 'Mearth',
  'Å', 'angstrom', 'c', 'G', 'u', 'torr', 'cal', 'dyn', 'erg', 'l']);

export const PREFIXES = {
  Q: 1e30, R: 1e27, Y: 1e24, Z: 1e21, E: 1e18, P: 1e15, T: 1e12, G: 1e9, M: 1e6, k: 1e3, h: 1e2, da: 1e1,
  d: 1e-1, c: 1e-2, m: 1e-3, μ: 1e-6, µ: 1e-6, u: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15, a: 1e-18, z: 1e-21,
  y: 1e-24, r: 1e-27, q: 1e-30,
};
const PREFIX_KEYS = Object.keys(PREFIXES).sort((a, b) => b.length - a.length);

export class UnitError extends Error {}

/** Look up one unit symbol, with or without an SI prefix. */
export function lookupUnit(sym) {
  if (UNITS[sym]) return { factor: UNITS[sym][0], dims: UNITS[sym][1].slice() };
  for (const p of PREFIX_KEYS) {
    if (sym.length > p.length && sym.startsWith(p)) {
      const base = sym.slice(p.length);
      if (UNITS[base] && !NO_PREFIX.has(base)) {
        return { factor: PREFIXES[p] * UNITS[base][0], dims: UNITS[base][1].slice() };
      }
    }
  }
  return null;
}

const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };

/**
 * Parse a unit expression such as "kg m/s^2", "N·m", "J/(kg·K)", "m s⁻¹".
 * @returns {{factor:number, dims:number[]}}
 */
export function parseUnit(src) {
  let s = String(src).trim()
    .replace(/[·⋅∙*]/g, ' ').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => '^' + [...m].map((c) => SUP[c]).join(''))
    .replace(/\s*\^\s*/g, '^').replace(/\s*\/\s*/g, '/').replace(/\(\s*/g, '(').replace(/\s*\)/g, ')');
  if (!s) throw new UnitError('No unit');
  let i = 0;
  const peek = () => s[i];
  function product() {
    let acc = { factor: 1, dims: D() };
    let first = true;
    for (;;) {
      while (peek() === ' ') i++;
      if (i >= s.length || peek() === ')') return acc;
      let op = '*';
      if (peek() === '/') { op = '/'; i++; while (peek() === ' ') i++; }
      else if (!first && !/[A-Za-zμµΩÅ°%(☉]/.test(peek())) throw new UnitError(`Unexpected “${peek()}” in unit`);
      const f = factor();
      acc = op === '*' ? mul(acc, f) : div(acc, f);
      first = false;
    }
  }
  function factor() {
    let base;
    if (peek() === '(') {
      i++;
      base = product();
      if (peek() !== ')') throw new UnitError('Missing “)” in unit');
      i++;
    } else {
      const m = /^(?:[A-Za-zμµΩÅ°%☉]+)/.exec(s.slice(i));
      if (!m) throw new UnitError(`Expected a unit at “${s.slice(i)}”`);
      i += m[0].length;
      base = lookupUnit(m[0]);
      if (!base) throw new UnitError(`Unknown unit “${m[0]}”`);
    }
    if (peek() === '^') {
      i++;
      const e = /^\(?(-?\d+(?:\/\d+)?)\)?/.exec(s.slice(i));
      if (!e) throw new UnitError('A unit power must be a whole number');
      i += e[0].length;
      const [n, d = '1'] = e[1].split('/');
      base = pow(base, parseInt(n, 10) / parseInt(d, 10));
    } else {
      // m2, s-1 style powers written without a caret
      const e = /^(-?\d+)/.exec(s.slice(i));
      if (e) { i += e[0].length; base = pow(base, parseInt(e[1], 10)); }
    }
    return base;
  }
  const out = product();
  if (i < s.length) throw new UnitError(`Unexpected “${s.slice(i)}” in unit`);
  return out;
}

const mul = (a, b) => ({ factor: a.factor * b.factor, dims: a.dims.map((d, k) => d + b.dims[k]) });
const div = (a, b) => ({ factor: a.factor / b.factor, dims: a.dims.map((d, k) => d - b.dims[k]) });
const pow = (a, n) => ({ factor: a.factor ** n, dims: a.dims.map((d) => d * n) });

export const sameDims = (a, b) => a.every((d, k) => Math.abs(d - b[k]) < 1e-9);
export const isDimensionless = (dims) => dims.every((d) => Math.abs(d) < 1e-9);

const NAMED_DIMS = [
  ['length', D(1)], ['mass', D(0, 1)], ['time', D(0, 0, 1)], ['speed', D(1, 0, -1)],
  ['acceleration', D(1, 0, -2)], ['force', D(1, 1, -2)], ['energy', D(2, 1, -2)], ['power', D(2, 1, -3)],
  ['momentum', D(1, 1, -1)], ['pressure', D(-1, 1, -2)], ['frequency', D(0, 0, -1)], ['charge', D(0, 0, 1, 1)],
  ['voltage', D(2, 1, -3, -1)], ['electric field', D(1, 1, -3, -1)], ['magnetic field', D(0, 1, -2, -1)],
  ['area', D(2)], ['volume', D(3)], ['density', D(-3, 1)], ['angular momentum', D(2, 1, -1)],
  ['dimensionless', ZERO],
];
export function describeDims(dims) {
  for (const [name, d] of NAMED_DIMS) if (sameDims(d, dims)) return name;
  const parts = [];
  dims.forEach((d, k) => { if (d) parts.push(`${BASE[k]}${d === 1 ? '' : '^' + d}`); });
  return parts.join('·') || 'dimensionless';
}

/**
 * Split "3.0e8 m/s" into a numeric expression and a unit, and evaluate both.
 * The number part may be any constant expression (2pi, 3/4, sqrt(2), 6.0 × 10^3).
 * @returns {{value:number, unit:{factor,dims}|null, si:number, numberText:string, unitText:string}}
 */
export function parseQuantity(src) {
  const text = normalise(String(src).trim());
  if (!text) throw new ParseError('Empty answer');
  // candidate split points: before the first letter that starts a valid unit tail
  const tryNumber = (t) => {
    const ast = parseExpr(t, { vars: [] });
    const v = compile(ast)({});
    if (!Number.isFinite(v)) throw new ParseError('That number is not finite');
    return v;
  };
  // whole thing a pure number?
  try {
    const v = tryNumber(text);
    return { value: v, unit: null, si: v, numberText: text, unitText: '' };
  } catch (e) { /* fall through to number + unit */ }
  for (let k = 1; k < text.length; k++) {
    const ch = text[k];
    if (!/[A-Za-zμµΩÅ°%☉(]/.test(ch)) continue;
    const prev = text[k - 1];
    if (ch === '(' && prev !== ' ') continue;
    const numPart = text.slice(0, k).trim();
    const unitPart = text.slice(k).trim();
    if (!numPart || !unitPart) continue;
    let unit, value;
    try { unit = parseUnit(unitPart); } catch { continue; }
    try { value = tryNumber(numPart); } catch { continue; }
    return { value, unit, si: value * unit.factor, numberText: numPart, unitText: unitPart };
  }
  throw new ParseError('Could not read that as a number with a unit');
}

/** Convert a value from one unit to another (throws if dimensions differ). */
export function convert(value, from, to) {
  const a = typeof from === 'string' ? parseUnit(from) : from;
  const b = typeof to === 'string' ? parseUnit(to) : to;
  if (!sameDims(a.dims, b.dims)) throw new UnitError(`Cannot convert ${describeDims(a.dims)} to ${describeDims(b.dims)}`);
  return value * a.factor / b.factor;
}

/** TeX for a unit string as authors write it ("m/s^2" → \mathrm{m/s^{2}}). */
export function unitTeX(u) {
  if (!u) return '';
  return '\\mathrm{' + String(u)
    .replace(/\*/g, '\\cdot ').replace(/·/g, '\\cdot ')
    .replace(/\^\(?(-?\d+)\)?/g, '^{$1}')
    .replace(/μ|µ/g, '\\mu ').replace(/Ω|ohm/g, '\\Omega ').replace(/°/g, '^\\circ').replace(/%/g, '\\%')
    .replace(/ /g, '\\,') + '}';
}
