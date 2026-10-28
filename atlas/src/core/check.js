// The answer checker. Every graded response in the Atlas passes through here,
// and the same functions validate the whole question bank in Node: every
// answer key must pass and every distractor must fail.
//
// Results have three statuses:
//   correct    — counts as a right answer
//   incorrect  — counts as an attempt; feedback names the likely slip
//   invalid    — could not be read (a typo, a missing bracket); never counts
// Symbolic answers are compared by evaluating both expressions at random
// points in an author-declared domain (WeBWorK's method), so any equivalent
// form is accepted: x(x+1) = x² + x, sin 2x = 2 sin x cos x.

import { parse, compile, toTeX, canon, ParseError } from './expr.js';
import { parseQuantity, parseUnit, sameDims, describeDims, UnitError } from './units.js';
import { makeRng } from './rng.js';

export const DEFAULT_REL = 0.01;          // 1% for measured/computed numbers
const EXPR_REL = 1e-6, EXPR_ABS = 1e-9;   // symbolic answers must agree to 6 digits

export const close = (a, b, rel = EXPR_REL, abs = EXPR_ABS) =>
  Math.abs(a - b) <= abs + rel * Math.max(Math.abs(a), Math.abs(b));

const ok = (feedback = '', extra = {}) => ({ status: 'correct', correct: true, feedback, ...extra });
const no = (feedback = '', extra = {}) => ({ status: 'incorrect', correct: false, feedback, ...extra });
const bad = (feedback, extra = {}) => ({ status: 'invalid', correct: false, feedback, ...extra });

/** Grade any item response. `item` is a normalised item (see item.js). */
export function grade(item, response) {
  switch (item.type) {
    case 'mcq': return gradeChoice(item, response);
    case 'multi': return gradeMulti(item, response);
    case 'numeric': return gradeNumeric(item, response);
    case 'expression': return gradeExpression(item, response);
    case 'order': return gradeOrder(item, response);
    case 'match': case 'label': return gradeMatch(item, response);
    case 'point': return gradePoint(item, response);
    case 'slider': return gradeSlider(item, response);
    default: throw new Error(`No grader for item type ${item.type}`);
  }
}

// ─── choices ───────────────────────────────────────────────────────────────

export function gradeChoice(item, idx) {
  if (idx === null || idx === undefined || idx < 0) return bad('Choose an answer first.');
  if (idx === item.answer) return ok();
  const why = item.why?.[idx];
  return no(why || '', { chosen: idx });
}

export function gradeMulti(item, picked) {
  const set = new Set(picked || []);
  if (!set.size) return bad('Select at least one option.');
  const want = new Set(item.answer);
  const missing = [...want].filter((i) => !set.has(i));
  const extra = [...set].filter((i) => !want.has(i));
  if (!missing.length && !extra.length) return ok();
  const msg = [];
  if (extra.length) msg.push(`${extra.length === 1 ? 'One option you chose is' : `${extra.length} options you chose are`} not correct.`);
  if (missing.length) msg.push(`${missing.length === 1 ? 'One correct option is' : `${missing.length} correct options are`} missing.`);
  const why = extra.map((i) => item.why?.[i]).filter(Boolean);
  return no([...msg, ...why].join(' '));
}

export function gradeOrder(item, seq) {
  if (!seq || seq.length !== item.items.length) return bad('Place every step.');
  const right = seq.every((v, k) => v === k);   // items are authored in the correct order
  if (right) return ok();
  const firstWrong = seq.findIndex((v, k) => v !== k);
  return no(`The sequence goes wrong at position ${firstWrong + 1}.`, { firstWrong });
}

export function gradeMatch(item, map) {
  const n = item.left.length;
  if (!map || Object.keys(map).length < n) return bad('Match every item.');
  let wrong = 0;
  for (let i = 0; i < n; i++) if (map[i] !== item.answer[i]) wrong++;
  return wrong === 0 ? ok() : no(`${wrong} of ${n} ${wrong === 1 ? 'match is' : 'matches are'} wrong.`, { wrong });
}

export function gradePoint(item, p) {
  if (!p) return bad('Place the point first.');
  const tx = item.tol?.x ?? 0.1, ty = item.tol?.y ?? 0.1;
  const dx = Math.abs(p.x - item.answer.x), dy = Math.abs(p.y - item.answer.y);
  if (dx <= tx && dy <= ty) return ok();
  return no(dx > tx && dy > ty ? 'Both coordinates are off.' : dx > tx ? 'The horizontal position is off.' : 'The vertical position is off.');
}

export function gradeSlider(item, v) {
  if (v === null || v === undefined || Number.isNaN(v)) return bad('Set the slider first.');
  const [lo, hi] = item.answer;
  if (v >= lo && v <= hi) return ok();
  return no(v < lo ? 'Too low.' : 'Too high.');
}

// ─── numbers, with or without units ────────────────────────────────────────

/**
 * Numeric item fields:
 *   answer     the value, in `units` if given
 *   units      'm/s^2' etc.; null for pure numbers
 *   unitMode   'given' (the unit is printed beside the box; a typed compatible unit is converted)
 *              'typed' (the learner must type a unit; any compatible one is accepted)
 *   tol        { rel, abs } — default 1% relative
 *   sigfigs    reminder only: a right value with different precision still counts
 *   errors     [{ value, feedback }] known wrong answers, in the same units
 */
export function gradeNumeric(item, input) {
  const text = String(input ?? '').trim();
  if (!text) return bad('Type an answer first.');
  let q;
  try { q = parseQuantity(text); } catch (e) {
    return bad(e instanceof ParseError || e instanceof UnitError ? `${e.message}.` : 'Could not read that number.');
  }
  const mode = item.units ? (item.unitMode || 'given') : 'none';
  let expectedUnit = null;
  if (item.units) expectedUnit = parseUnit(item.units);
  let value;                                  // learner's value in the item's units
  if (q.unit) {
    if (!expectedUnit) {
      if (q.unit.dims.some((d) => d !== 0)) return bad('This answer is a pure number — leave the unit off.');
      value = q.si;
    } else if (!sameDims(q.unit.dims, expectedUnit.dims)) {
      return no(`That unit measures ${describeDims(q.unit.dims)}, but the answer is ${describeDims(expectedUnit.dims)}.`, { unitError: true });
    } else {
      // Hz and rad/s share a dimension but differ by 2π: cycles are not radians
      const cyc = (u) => /Hz/.test(u || ''), ang = (u) => /rad|rpm/.test(u || '');
      if ((cyc(q.unitText) && ang(item.units)) || (ang(q.unitText) && cyc(item.units))) {
        return no('Hz counts cycles per second and rad/s counts radians: they differ by a factor of 2π (ω = 2πf). Give the answer in the unit asked for.', { unitError: true });
      }
      value = q.si / expectedUnit.factor;
      // a temperature, not a difference: °C and K differ by an offset as well as a name
      // (an item marked difference: true asks for a change, where they are the same number)
      const isC = (u) => /^\s*(°C|degC)\s*$/.test(u || ''), isK = (u) => /^\s*K\s*$/.test(u || '');
      if (item.difference) { /* a change of 1 K is a change of 1 °C */ }
      else if (isC(q.unitText) && isK(item.units)) value += 273.15;
      else if (isK(q.unitText) && isC(item.units)) value -= 273.15;
    }
  } else {
    if (mode === 'typed') return bad(`Include a unit — the answer is ${describeDims(expectedUnit.dims) === 'dimensionless' ? 'a ratio' : 'a ' + describeDims(expectedUnit.dims)}.`);
    value = q.value;
  }
  const rel = item.tol?.rel ?? DEFAULT_REL;
  const abs = item.tol?.abs ?? 0;
  const target = item.answer;
  const near = (a, b) => Math.abs(a - b) <= abs + rel * Math.abs(b) || (b === 0 && Math.abs(a) <= (abs || 1e-12));
  if (near(value, target)) {
    const note = sigfigNote(q.numberText, item.sigfigs);
    return ok(note, { value });
  }
  // known errors first, then generic slips
  for (const e of item.errors || []) {
    if (near(value, e.value)) return no(e.feedback, { value, known: true });
  }
  return no(genericNumericSlip(value, target, rel, abs), { value });
}

function genericNumericSlip(v, t, rel, abs) {
  const near = (a, b) => Math.abs(a - b) <= abs + Math.max(rel, 0.005) * Math.abs(b);
  // a ratio is a pure number: the item's absolute tolerance (in its units) does not apply
  const nearRatio = (r, x) => Math.abs(r - x) <= Math.max(rel, 0.005) * Math.abs(x);
  if (t !== 0 && near(-v, t)) return 'The size is right but the sign is wrong.';
  if (t !== 0) {
    const r = v / t;
    for (const k of [-6, -3, -2, -1, 1, 2, 3, 6]) {
      if (nearRatio(r, 10 ** k)) return `That is off by a factor of 10${k > 0 ? '' : '⁻'}${String(Math.abs(k)).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])} — check unit conversions and powers of ten.`;
    }
    if (nearRatio(r, 2) || nearRatio(r, 0.5)) return 'Off by a factor of 2 — check for a missing or extra ½ or 2.';
    if (nearRatio(r, 180 / Math.PI) || nearRatio(r, Math.PI / 180)) return 'That looks like degrees and radians mixed up.';
    if (near(v, t * t) || near(v * v, t)) return 'That looks like a square or square root slipped in or out.';
  }
  return '';
}

/** Count significant figures in a typed number ("0.00450" → 3, "4500" → 2, "4.50e3" → 3). */
export function countSigFigs(numberText) {
  const m = /^[-+]?(\d*)\.?(\d*)(?:[eE][-+]?\d+)?$/.exec(String(numberText).trim().replace(/\s/g, ''));
  if (!m) return null;
  const [, intPart, frac] = m;
  const hasPoint = /\./.test(numberText);
  let digits = (intPart + frac).replace(/^0+/, '');
  if (!hasPoint) digits = digits.replace(/0+$/, '');
  return Math.max(digits.length, 1);
}

function sigfigNote(numberText, want) {
  if (!want) return '';
  const n = countSigFigs(numberText);
  if (n === null || Math.abs(n - want) <= 1) return '';
  return `Right value. The data support ${want} significant figures, so report it that way.`;
}

// ─── expressions ───────────────────────────────────────────────────────────

/**
 * Expression item fields:
 *   answer   key expression (string)
 *   vars     { x: [lo, hi], ... } sampling domain per variable (default [-2, 2])
 *   mode     'exact' | 'constant' (antiderivatives: equal up to + C) | 'equation' (lhs = rhs, up to a factor)
 *   wrt      'constant' mode: the variable integrated over (default: the first in vars) —
 *            the constant may depend on every other variable; '*' for a true constant
 *            (a potential function, defined up to one number)
 *   errors   [{ answer, feedback }] known wrong forms
 *   forbid   function names the learner may not use (e.g. ['abs'])
 *   form     'expanded' (no bracketed sum multiplied, divided by, raised to a power or negated)
 *            | 'factored' (a product, not a sum, at the top level): checked once the
 *            value is right, so "expand" and "factor" tasks can't be answered by
 *            typing the question back
 */
const ungroup = (n) => (n && n.t === 'group' ? ungroup(n.a) : n);
const isSum = (n) => { n = ungroup(n); return !!n && (n.t === '+' || n.t === '-'); };
// a bracketed sum that is multiplied, raised to a power or negated: not yet expanded
function unexpanded(n) {
  if (!n || typeof n !== 'object') return false;
  if (n.t === '*' && (isSum(n.a) || isSum(n.b))) return true;
  if (n.t === '^' && isSum(n.a)) return true;
  if (n.t === 'neg' && isSum(n.a)) return true;
  if (n.t === '/' && isSum(n.b)) return true;   // a quotient by a sum: the division is still to be done
  return [n.a, n.b, ...(n.args || [])].some(unexpanded);
}
function formProblem(ast, form) {
  if (form === 'expanded' && unexpanded(ast)) return 'That has the right value, but it is not expanded: multiply out every bracket and collect like terms.';
  if (form === 'factored') {
    let root = ungroup(ast);
    while (root.t === 'neg') root = ungroup(root.a);
    if (isSum(root)) return 'That has the right value, but it is not factored: write it as a product of factors.';
  }
  return null;
}

export function gradeExpression(item, input) {
  const text = String(input ?? '').trim();
  if (!text) return bad('Type an expression first.');
  const domains = normaliseDomains(item.vars);
  const names = Object.keys(domains);
  let student;
  try { student = parseSide(text, names, item.mode); } catch (e) {
    return bad(e instanceof ParseError ? `${e.message}.` : 'Could not read that expression.');
  }
  for (const f of item.forbid || []) {
    if (usesFunction(student.ast, f)) return bad(`Write this without ${f}.`);
  }
  const key = parseSide(item.answer, names, item.mode);
  const preview = student.tex;
  const cmp = compareExpr(student, key, domains, item.mode || 'exact', item.seed ?? 12345, item.wrt);
  if (cmp.verdict === 'equal') {
    const wrong = formProblem(student.ast, item.form);
    return wrong ? no(wrong, { preview, form: true }) : ok('', { preview });
  }
  if (cmp.verdict === 'undefined') return no('Your expression is undefined at points where the answer is defined — check for a division by zero or a square root of a negative.', { preview });
  for (const e of item.errors || []) {
    const err = parseSide(e.answer, names, item.mode);
    if (compareExpr(student, err, domains, item.mode || 'exact', 7, item.wrt).verdict === 'equal') return no(e.feedback, { preview, known: true });
  }
  // generic slips
  if (/\blog\b/.test(text)) {
    try {
      const alt = parseSide(text.replace(/\blog\b/g, 'ln'), names, item.mode);
      if (compareExpr(alt, key, domains, item.mode || 'exact', 9, item.wrt).verdict === 'equal') {
        return no('In the Atlas, log means log base 10. Use ln for the natural logarithm.', { preview });
      }
    } catch { /* ignore */ }
  }
  if (cmp.ratio !== null && item.mode !== 'equation') {
    if (close(cmp.ratio, -1, 1e-6)) return no('The sign is wrong.', { preview });
    if (close(cmp.ratio, 2, 1e-6) || close(cmp.ratio, 0.5, 1e-6)) return no('Off by a factor of 2.', { preview });
    return no(`Your expression is a constant multiple (×${fmtShort(cmp.ratio)}) of the answer — check the coefficient.`, { preview });
  }
  if (cmp.diff !== null && (item.mode || 'exact') === 'exact') {
    return no('Your expression differs from the answer by a constant.', { preview });
  }
  return no('', { preview });
}

const fmtShort = (x) => (Math.abs(x) >= 1e4 || Math.abs(x) < 1e-3 ? x.toExponential(2) : String(+x.toFixed(4)));

function normaliseDomains(vars) {
  if (!vars) return {};
  if (Array.isArray(vars)) return Object.fromEntries(vars.map((v) => [canon(v), [-2, 2]]));
  return Object.fromEntries(Object.entries(vars).map(([k, v]) => [canon(k), v]));
}

function parseSide(text, names, mode) {
  if (mode === 'equation') {
    const parts = String(text).split('=');
    if (parts.length !== 2) throw new ParseError('Write one equation with a single “=” sign');
    const l = parse(parts[0], { vars: names }), r = parse(parts[1], { vars: names });
    const fl = compile(l), fr = compile(r);
    return { ast: { t: '-', a: l, b: r }, f: (env) => fl(env) - fr(env), tex: `${toTeX(l)} = ${toTeX(r)}` };
  }
  if (String(text).includes('=')) throw new ParseError('Give an expression, not an equation');
  const ast = parse(text, { vars: names });
  return { ast, f: compile(ast), tex: toTeX(ast) };
}

function usesFunction(node, name) {
  if (node.t === 'fn' && node.name === name) return true;
  for (const k of ['a', 'b']) if (node[k] && usesFunction(node[k], name)) return true;
  return (node.args || []).some((a) => usesFunction(a, name));
}

/**
 * Compare two compiled expressions at random points.
 * verdict: 'equal' | 'different' | 'undefined'; also reports a constant ratio or
 * difference when one exists, so the grader can name the slip.
 */
export function compareExpr(s, k, domains, mode = 'exact', seed = 1, wrt = null) {
  const rng = makeRng(seed);
  const names = Object.keys(domains);
  // wrt: '*' asks for a true constant (a potential of a gradient field), the same at every point
  if (mode === 'constant' && names.length > 1 && wrt !== '*') return upToConstant(s, k, domains, rng, names.includes(wrt) ? wrt : names[0]);
  const pts = [];
  for (let tries = 0; pts.length < 10 && tries < 200; tries++) {
    const env = {};
    for (const n of names) { const [lo, hi] = domains[n]; env[n] = lo + (hi - lo) * rng.next(); }
    const kv = k.f(env);
    if (!Number.isFinite(kv)) continue;
    pts.push({ env, kv, sv: s.f(env) });
    if (!names.length) break;                    // a constant needs only one point
  }
  if (!pts.length) return { verdict: 'different', ratio: null, diff: null };
  if (pts.some((p) => !Number.isFinite(p.sv))) return { verdict: 'undefined', ratio: null, diff: null };
  const scale = Math.max(1e-12, ...pts.map((p) => Math.abs(p.kv)));
  if (mode === 'constant') {
    const d0 = pts[0].sv - pts[0].kv;
    const equal = pts.every((p) => Math.abs(p.sv - p.kv - d0) <= 1e-7 * Math.max(scale, Math.abs(p.sv), 1));
    return { verdict: equal ? 'equal' : 'different', ratio: ratioOf(pts), diff: null };
  }
  if (mode === 'equation') {
    const r = ratioOf(pts, true);
    return { verdict: r !== null && Math.abs(r) > 1e-12 ? 'equal' : 'different', ratio: r, diff: null };
  }
  const equal = pts.every((p) => close(p.sv, p.kv, EXPR_REL, EXPR_ABS * Math.max(1, scale)));
  if (equal) return { verdict: 'equal', ratio: 1, diff: 0 };
  const d0 = pts[0].sv - pts[0].kv;
  const constDiff = pts.length > 1 && pts.every((p) => Math.abs(p.sv - p.kv - d0) <= 1e-7 * Math.max(scale, 1));
  return { verdict: 'different', ratio: ratioOf(pts), diff: constDiff ? d0 : null };
}

// Antiderivatives: equal up to a constant of integration, which may depend on every
// variable except the one integrated over. The points come in groups that share the
// other variables and differ only in that one.
function upToConstant(s, k, domains, rng, wrt) {
  const others = Object.keys(domains).filter((n) => n !== wrt);
  const all = [];
  let groups = 0;
  for (let g = 0; g < 4; g++) {
    const base = {};
    for (const n of others) { const [lo, hi] = domains[n]; base[n] = lo + (hi - lo) * rng.next(); }
    const pts = [];
    for (let tries = 0; pts.length < 5 && tries < 80; tries++) {
      const [lo, hi] = domains[wrt];
      const env = { ...base, [wrt]: lo + (hi - lo) * rng.next() };
      const kv = k.f(env);
      if (Number.isFinite(kv)) pts.push({ env, kv, sv: s.f(env) });
    }
    if (pts.some((p) => !Number.isFinite(p.sv))) return { verdict: 'undefined', ratio: null, diff: null };
    if (pts.length < 2) continue;
    groups++;
    all.push(...pts);
    const scale = Math.max(1e-12, ...pts.map((p) => Math.abs(p.kv)));
    const d0 = pts[0].sv - pts[0].kv;
    if (!pts.every((p) => Math.abs(p.sv - p.kv - d0) <= 1e-7 * Math.max(scale, Math.abs(p.sv), 1))) return { verdict: 'different', ratio: ratioOf(all), diff: null };
  }
  return groups ? { verdict: 'equal', ratio: null, diff: null } : { verdict: 'different', ratio: null, diff: null };
}

// A constant ratio s/k across all points, or null. Points where k ≈ 0 must have s ≈ 0.
function ratioOf(pts, allowAnySign = false) {
  let r = null;
  for (const p of pts) {
    if (Math.abs(p.kv) < 1e-12) { if (Math.abs(p.sv) > 1e-9) return null; continue; }
    const q = p.sv / p.kv;
    if (r === null) r = q;
    else if (!close(q, r, 1e-6, 1e-12)) return null;
  }
  if (r !== null && !allowAnySign && Math.abs(r - 1) < 1e-9) return null;
  return r;
}

/** Live preview for an answer box: TeX of how the input was read, or the parse error. */
export function previewExpression(text, vars) {
  const names = Object.keys(normaliseDomains(vars));
  try {
    if (String(text).includes('=')) {
      const [l, r] = String(text).split('=');
      return { tex: `${toTeX(parse(l, { vars: names }))} = ${toTeX(parse(r, { vars: names }))}` };
    }
    return { tex: toTeX(parse(text, { vars: names })) };
  } catch (e) {
    return { error: e.message };
  }
}
