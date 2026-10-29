// Every built lesson and every question in the Atlas, validated headlessly:
// structure, escape damage, TeX that KaTeX can render, generators run over
// many seeds, every answer key passing the grader and every distractor failing,
// and every visual naming a simulation that exists with parameters it accepts.
//   node atlas/test/content.test.mjs            all courses
//   node atlas/test/content.test.mjs math1220   one course
//   node atlas/test/content.test.mjs gr.S09.i   one lesson

import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { CATALOG, COURSES } from '../content/catalog.js';
import { validateCatalog } from '../src/core/catalog.js';
import { validateLesson, validateItem, instantiate, itemsOf } from '../src/core/content.js';
import { mathIn, escapeDamage, groupDigits } from '../src/core/markup.js';
import { scan, render as renderLoads } from '../tools/register.mjs';
import ACHIEVEMENTS from '../content/achievements.js';
import GALLERY from '../content/gallery.js';
import { parse, compile, canonEnv } from '../src/core/expr.js';
import { makeRng } from '../src/core/rng.js';

const require = createRequire(import.meta.url);
const katex = require('../vendor/katex-0.19.0/katex.min.js');
// typeset exactly as the browser does, thousands separators included
const tex = (src, display) => katex.renderToString(groupDigits(src), { displayMode: display, throwOnError: true, strict: 'ignore' });

const only = process.argv[2];
const VARIANTS = +(process.env.VARIANTS || 25);

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// simulations: a visual names sims/<type>.js; a sim that exports validate()
// checks its parameters (expressions parse, sliders in range, …)
const simCache = new Map();
async function checkVisual(where, spec) {
  if (!spec) return;
  if (typeof spec.type !== 'string') { check(`${where}: visual has a type`, false); return; }
  const file = new URL(`../src/viz/sims/${spec.type}.js`, import.meta.url);
  if (!existsSync(file)) { check(`${where}: visual type “${spec.type}” exists`, false, `no file src/viz/sims/${spec.type}.js`); return; }
  if (!simCache.has(spec.type)) simCache.set(spec.type, import(file.href));
  let mod;
  try { mod = await simCache.get(spec.type); } catch (e) { check(`${where}: sim ${spec.type} loads`, false, e.message); return; }
  if (typeof mod.mount !== 'function') { check(`${where}: sim ${spec.type} exports mount`, false); return; }
  // strings drawn on a canvas (labels) are never checked by KaTeX: catch escape damage here
  const strings = [];
  (function walk(v) { if (typeof v === 'string') strings.push(v); else if (v && typeof v === 'object') for (const x of Object.values(v)) walk(x); })(spec.params || {});
  const damaged = strings.find((x) => /[\t\f\v\b\r]/.test(x));
  if (damaged !== undefined) check(`${where}: visual text has no control characters`, false, `“${damaged.slice(0, 40).replace(/[\t\f\v\b\r]/g, '�')}” — a backslash was eaten by a JS string escape; use String.raw`);
  // calc-vectors3d draws its labels as TeX (no $): each must typeset
  if (spec.type === 'calc-vectors3d') {
    const P = spec.params || {};
    for (const el of ['vectors', 'points', 'planes', 'parallelograms', 'lines', 'curves', 'spheres'].flatMap((k) => P[k] || [])) {
      if (typeof el?.label !== 'string') continue;
      try { tex(el.label, false); } catch (e) { check(`${where}: calc-vectors3d label TeX`, false, `${el.label}: ${e.message}`); }
      const dmg = escapeDamage(el.label, { prose: false });
      if (dmg) check(`${where}: calc-vectors3d label`, false, `“${el.label}” ${dmg}`);
    }
  }
  // choice options (in any sim taking params.choices) are markup
  for (const c of (spec.params || {}).choices || []) for (const o of c.options || []) {
    const dmg = typeof o?.[1] === 'string' && escapeDamage(o[1]);
    if (dmg) check(`${where}: choice option text`, false, `“${o[1]}” ${dmg}`);
  }
  // a graph's canvas labels are plain text: TeX in them prints literally
  if (spec.type === 'graph') {
    const P = spec.params || {};
    for (const o of [...(P.curves || []), ...(P.points || []), ...(P.arrows || []), ...(P.vlines || []), ...(P.hlines || []), ...(P.legend || []), { label: P.xlabel }, { label: P.ylabel }]) {
      const L = o && o.label;
      if (typeof L !== 'string') continue;
      // (calculator-style powers such as e^(−x/3) read well enough, and Unicode has no better form)
      const bad = /\$|\\[A-Za-z]|(?<![\w])[A-Za-zα-ωΑ-Ω]{1,2}[_^](?:\{|[A-Za-z0-9α-ωΑ-Ω])|\)[_^](?:\{|[A-Za-z0-9])/.exec(L);
      if (bad) check(`${where}: graph label “${L}” is plain text`, false, `“${bad[0]}” would print literally on the canvas — use Unicode (², ₀, θ) and plain words`);
    }
  }
  if (mod.validate) {
    let p;
    try { p = mod.validate({ ...(mod.defaults || {}), ...(spec.params || {}) }); } catch (e) { p = [`validate threw: ${e.message}`]; }
    check(`${where}: ${spec.type} parameters`, p.length === 0, p.slice(0, 3).join('; '));
  }
  // control labels and their explanations are markup too (sliders, choices, readouts of any sim)
  const PP = spec.params || {};
  const arr = (v) => (Array.isArray(v) ? v : []);   // some sims take sliders: true or a list of names
  const controlText = [...arr(PP.sliders), ...arr(PP.choices)].flatMap((c) => (c && typeof c === 'object' ? [c.label, c.explain] : []))
    .concat(arr(PP.readouts).map((r) => (r && typeof r === 'object' ? r.label : null)));
  for (const s of [spec.lead, spec.caption, spec.explain, spec.note, spec.title, ...(spec.tasks || []), ...controlText.filter((x) => typeof x === 'string')]) {
    if (!s) continue;
    const dmg = escapeDamage(s);
    if (dmg) check(`${where}: visual text`, false, `“${String(s).slice(0, 40)}…” ${dmg}`);
    for (const m of mathIn(s)) { try { tex(m.tex, m.display); } catch (e) { check(`${where}: visual text TeX`, false, `${m.tex}: ${e.message}`); } }
  }
}

// A raw float spliced into any text of an instance — prompt, hints, a picture's labels
// and captions: 58.800000000000004 N, ε = 0.00009999999999999999
// …and so are code fields and a picture's expressions (fn: '0.98 + 0.030000000000000027*x' is never shown)
const CODE_KEYS = new Set(['code', 'starter', 'solution', 'tests', 'setup', 'expected', 'output', 'listing',
  'fn', 'expr', 'when', 'param', 'polar', 'sum', 'z', 'surface', 'P', 'Q', 'fx', 'fy', 'lower', 'upper', 'from', 'to', 'at', 'x', 'y', 'domain', 'value']);
function rawFloatText(item) {
  let hit = null;
  (function walk(v) {
    if (hit) return;
    // what Python prints is quoted on purpose: code fields and `code spans` are exempt
    if (typeof v === 'string') { const m = /\d\.\d*?(?:0{8,}[1-9]|9{8,}[0-8]|9{12,})\d*/.exec(v.replace(/```[\s\S]*?```|`[^`]*`/g, '')); if (m) hit = m[0]; }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!CODE_KEYS.has(k)) walk(x);
  })({ ...item, answer: undefined, errors: (item.errors || []).map((e) => e.feedback) });
  return hit ? `“${hit}” is a raw floating-point number in the item's text or picture labels — format it (N(), r6, toFixed)` : null;
}

// The player letters shuffled choices A–D, so a picture whose points are labelled
// A–D and choices that name them ("B is higher") read ambiguously: label them P, Q, R, S.
function letterClash(item) {
  if (!['mcq', 'multi'].includes(item.type) || item.fixedOrder || !item.visual) return null;
  const found = new Set();
  (function walk(v) {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) {
      if ((k === 'label' || k === 'name') && typeof x === 'string' && /^[A-D]$/.test(x.trim())) found.add(x.trim());
      else if (k === 'names' && Array.isArray(x)) x.forEach((n) => typeof n === 'string' && /^[A-D]$/.test(n) && found.add(n));
      else walk(x);
    }
  })(item.visual.params || {});
  if (found.size < 2) return null;
  const named = [...found].filter((l) => (item.choices || []).some((ch) => new RegExp(`(^|[^A-Za-z\\\\])${l}(?![A-Za-z])`).test(String(ch).replace(/\\[a-zA-Z]+/g, ''))));
  return named.length ? `the picture labels points ${[...found].sort().join(', ')} and the shuffled choices name ${named.join(', ')} — the player letters choices A–D too: relabel the picture P, Q, R, S (or set fixedOrder)` : null;
}

// ∫_a^b g by tanh–sinh quadrature, which shrugs off integrable endpoint
// singularities (x^(-2/3) at 0); infinite limits are mapped onto finite ones
function integral(g, a, b) {
  if (a === -Infinity && b === Infinity) return integral(g, -Infinity, 0) + integral(g, 0, Infinity);
  if (b === Infinity) return tanhSinh((t) => g(a + t / (1 - t)) / (1 - t) ** 2, 0, 1);
  if (a === -Infinity) return tanhSinh((t) => g(b - t / (1 - t)) / (1 - t) ** 2, 0, 1);
  return tanhSinh(g, a, b);
}
function bisected(g, a, b, whole, depth) {
  const m = (a + b) / 2, l = tanhSinh(g, a, m), r = tanhSinh(g, m, b);
  if (depth >= 24 || Math.abs(l + r - whole) <= 1e-10 * Math.max(1, Math.abs(whole))) return l + r;
  return bisected(g, a, m, l, depth + 1) + bisected(g, m, b, r, depth + 1);
}
function tanhSinh(g, a, b) {
  const h = 1 / 64, r = (b - a) / 2;
  let s = 0;
  for (let k = -256; k <= 256; k++) {
    const t = k * h, u = (Math.PI / 2) * Math.sinh(t);
    const w = ((Math.PI / 2) * Math.cosh(t)) / Math.cosh(u) ** 2;
    if (!(w > 1e-300)) continue;
    // distance from the nearer end, computed without cancellation
    const e = Math.exp(-2 * Math.abs(u)), d = (2 * e) / (1 + e);
    const x = u < 0 ? a + r * d : b - r * d;
    const y = g(x);
    if (Number.isFinite(y)) s += w * y;
  }
  return r * h * s;
}

// Calculus keys checked by calculus: an expression answer with `integrand`
// must differentiate back to it; one with `derivativeOf` must be the
// derivative of that; a numeric answer with `integrand` and `limits` must be
// the integral (numerically, to quadrature accuracy).
function calculusProblem(item) {
  if (!item.integrand && !item.derivativeOf) return null;
  const domains = item.vars && !Array.isArray(item.vars) ? item.vars : Object.fromEntries((item.vars || ['x']).map((v) => [v, [-2, 2]]));
  const names = Object.keys(domains);
  const wrt = item.wrt || names[0] || 'x';
  const f = (src) => { const g = compile(parse(String(src), { vars: names })); return (env) => g(canonEnv(env)); };
  const rng = makeRng(99);
  if (item.type === 'expression') {
    const A = f(item.answer), T = f(item.integrand || item.derivativeOf);
    let tested = 0;
    for (let k = 0; k < 60 && tested < 8; k++) {
      const env = {};
      for (const n of names) { const [lo, hi] = domains[n]; env[n] = lo + (hi - lo) * (0.05 + 0.9 * rng.next()); }
      const x = env[wrt], hh = 1e-4 * Math.max(1, Math.abs(x));
      const d = (F) => (F({ ...env, [wrt]: x + hh }) - F({ ...env, [wrt]: x - hh })) / (2 * hh);
      const [got, want] = item.integrand ? [d(A), T(env)] : [A(env), d(T)];
      if (![got, want].every(Number.isFinite)) continue;
      tested++;
      if (Math.abs(got - want) > 2e-5 * Math.max(1, Math.abs(want))) return `the key ${item.integrand ? 'differentiates to' : 'is'} ${got.toPrecision(6)} at ${wrt} = ${x.toPrecision(4)}, but the ${item.integrand ? 'integrand' : 'derivative'} is ${want.toPrecision(6)}`;
    }
    return tested ? null : 'the calculus check found no point where both sides are defined';
  }
  if (item.type === 'numeric' && item.integrand && item.limits) {
    const g = f(item.integrand);
    const val = (v) => (typeof v === 'number' ? v : compile(parse(String(v), { vars: [] }))({}));
    const [a, b] = item.limits.map(val);
    const G = (x) => g({ [wrt]: x });
    const tol = 1e-6, ans = item.answer;
    const off = (I) => Math.abs(I - ans) > tol * Math.max(1e-9, Math.abs(ans)) + 1e-9;
    let I = integral(G, a, b);
    // tanh-sinh is exponentially fast on smooth integrands but slow across an
    // interior kink (|x|, a piecewise rate): bisect until the halves agree
    if (off(I) && Number.isFinite(a) && Number.isFinite(b)) I = bisected(G, a, b, integral(G, a, b), 0);
    if (off(I)) return `the integral of ${item.integrand} over [${item.limits.join(', ')}] is ${I.toPrecision(7)} numerically, but the key is ${ans}`;
  }
  return null;
}

// the lesson registry must match the files on disk (whole-suite runs only:
// someone else may be halfway through writing a lesson in another course)
const loadsFile = new URL('../content/loads.js', import.meta.url);
if (!only) check('content/loads.js matches the lesson files (run node atlas/tools/register.mjs)', readFileSync(loadsFile, 'utf8') === renderLoads(scan()));
for (const { id } of scan().lessons) {
  if (only && !id.startsWith(only.split('.')[0] + '.')) continue;
  if (only && only.includes('.') && id !== only) continue;
  check(`lesson file ${id} has an entry in its course index`, !!CATALOG.lessons[id], 'rename the file to match an existing entry in content/<course>/index.js');
  check(`lesson file ${id} is registered (run node atlas/tools/register.mjs)`, !!CATALOG.lessons[id]?.ready);
}

// the catalog graph
check('catalog has no dangling prerequisites or cycles', validateCatalog(CATALOG).length === 0, validateCatalog(CATALOG).slice(0, 5).join('; '));
check('course ids are unique', new Set(COURSES.map((c) => c.id)).size === COURSES.length);
check('achievement ids are unique', new Set(ACHIEVEMENTS.map((a) => a.id)).size === ACHIEVEMENTS.length);
for (const c of COURSES) {
  for (const s of [c.summary, c.note, c.catalog]) {
    if (!s) continue;
    for (const m of mathIn(s)) { try { tex(m.tex, m.display); } catch (e) { check(`${c.id}: course text TeX`, false, `${m.tex}: ${e.message}`); } }
  }
}

check('gallery ids are unique', new Set(GALLERY.map((g) => g.id)).size === GALLERY.length, GALLERY.filter((g, i) => GALLERY.findIndex((x) => x.id === g.id) !== i).map((g) => g.id).join(', '));
if (!only) for (const g of GALLERY) {
  check(`gallery ${g.id}: track is math, physics or gr`, ['math', 'physics', 'gr'].includes(g.track), String(g.track));
  if (!g.lesson) { await checkVisual(`gallery ${g.id}`, g.spec); continue; }
  const L0 = CATALOG.lessons[g.lesson];
  check(`gallery ${g.id}: lesson ${g.lesson} is built`, !!L0?.ready);
  if (L0?.ready) check(`gallery ${g.id}: lesson ${g.lesson} has an Explore visual`, !!(await L0.load()).default.visual);
}

let lessons = 0, items = 0, instances = 0, withVisual = 0;
const lowVisual = [];
for (const L0 of Object.values(CATALOG.lessons)) {
  if (!L0.ready) continue;
  if (only && L0.course !== only && L0.id !== only) continue;
  let L;
  try { L = (await L0.load()).default; } catch (e) { check(`${L0.id}: module loads`, false, e.message); continue; }
  lessons++;
  check(`${L0.id}: module id matches its catalog entry`, L.id === L0.id, `module says ${L.id}`);
  const lp = validateLesson(L, tex);
  check(`${L0.id}: lesson structure`, lp.length === 0, lp.join('; '));
  let lessonItems = 0, lessonVisual = 0;
  await checkVisual(`${L0.id} visual`, L.visual);
  await checkVisual(`${L0.id} example`, L.example?.visual);
  for (const { def, context } of itemsOf(L)) {
    items++;
    const n = def.gen ? VARIANTS : 1;
    const seen = new Set();
    let firstProblem = null, hasVisual = false;
    for (let v = 0; v < n; v++) {
      let item;
      try { item = instantiate(L, def, v); } catch (e) { firstProblem = `variant ${v} threw: ${e.message}`; break; }
      instances++;
      seen.add(JSON.stringify([item.prompt, item.answer, item.choices, item.visual]));   // a variant differs in any of what the learner sees
      // a picture; or, for programming, the code itself: an exercise's editor and output,
      // or a listing to read in the prompt (counted before validation, so a broken item
      // does not also read as one without a picture)
      if (item.visual || item.diagram || item.type === 'code' || /(\\?`){3}/.test(item.prompt)) hasVisual = true;
      const p = validateItem(item, tex);
      const calc = calculusProblem(item);
      if (calc) p.push(calc);
      const clash = letterClash(item);
      if (clash) p.push(clash);
      const raw = rawFloatText(item);
      if (raw) p.push(raw);
      if (p.length) { firstProblem = `variant ${v}: ${p.join('; ')}`; break; }
      if (v < 3) await checkVisual(`${L0.id}/${def.id} variant ${v}`, item.visual);
    }
    if (hasVisual) withVisual++;
    lessonItems++; if (hasVisual) lessonVisual++;
    check(`${L0.id}/${def.id} (${context})`, !firstProblem, firstProblem || '');
    if (def.gen && n > 5 && !firstProblem) check(`${L0.id}/${def.id}: generator varies`, seen.size > 1, 'every variant was identical');
  }
  if (lessonItems && lessonVisual / lessonItems < 0.6) lowVisual.push(`${L0.id} ${lessonVisual}/${lessonItems}`);
}

// authored boss battles: content/<course>/boss.js
for (const c of CATALOG.courses) {
  if (!c.bossLoad || (only && c.id !== only)) continue;
  let B;
  try { B = (await c.bossLoad()).default; } catch (e) { check(`${c.id} boss loads`, false, e.message); continue; }
  check(`${c.id} boss: has rounds`, Array.isArray(B.rounds) && B.rounds.length >= 3, 'an authored boss needs 3+ rounds');
  // the story text is markup too
  for (const s of [B.title, B.intro, ...(B.rounds || []).flatMap((r) => [r.title, r.story])]) {
    if (!s) continue;
    const dmg = escapeDamage(s);
    if (dmg) check(`${c.id} boss text`, false, `“${String(s).slice(0, 40)}…” ${dmg}`);
    for (const m of mathIn(s)) { try { tex(m.tex, m.display); } catch (e) { check(`${c.id} boss text TeX`, false, `${m.tex}: ${e.message}`); } }
  }
  const bossIds = (B.rounds || []).flatMap((r) => (r.items || []).map((d) => d.id));
  check(`${c.id} boss: item ids are unique`, new Set(bossIds).size === bossIds.length);
  let slot = 0;
  for (const [k, round] of (B.rounds || []).entries()) {
    for (const def of round.items || []) {
      // the first 10 seeds, then the ones the boss page draws: 500 + 37·attempt + position
      const seeds = def.gen ? [...Array(10).keys(), ...Array.from({ length: 20 }, (_, a) => 500 + 37 * a + slot)] : [0];
      slot++;
      for (const v of seeds) {
        const item = instantiate({ id: `${c.id}.boss`, skills: [def.skill || `${c.id}.boss`] }, def, v);
        const p = validateItem(item, tex);
        const calc = calculusProblem(item);
        if (calc) p.push(calc);
        if (p.length) { check(`${c.id} boss round ${k + 1}/${def.id}`, false, `variant ${v}: ${p.join('; ')}`); break; }
        if (v === 0) {
          check(`${c.id} boss round ${k + 1}/${def.id}`, true);
          check(`${c.id} boss ${def.id}: measures a real lesson skill`, !!CATALOG.lessons[def.skill], `skill “${def.skill}” — set skill to the id of the lesson this problem draws on`);
        }
        await checkVisual(`${c.id} boss ${def.id} variant ${v}`, item.visual);
      }
    }
  }
}

if (lowVisual.length) console.log(`note: problems with a visual below 60% in ${lowVisual.length} lesson(s): ${lowVisual.join(', ')}`);
// links between lessons: every #/lesson/<id> (and #/explore/<id>) must name a real lesson
// (or gallery entry); a link to a lesson not written yet is counted, not failed
if (!only) {
  const { readdirSync } = await import('node:fs');
  const root = new URL('../content/', import.meta.url);
  const galleryIds = new Set(GALLERY.map((g) => g.id));
  let pending = 0;
  const pendingList = new Set();
  for (const dir of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of readdirSync(new URL(dir.name + '/', root)).filter((f) => f.endsWith('.js'))) {
      const src = readFileSync(new URL(`${dir.name}/${f}`, root), 'utf8');
      for (const m of src.matchAll(/#\/lesson\/([\w.-]+?)(?=[)'"`\s]|$)/g)) {
        const id = m[1], L = CATALOG.lessons[id];
        if (!L) check(`content/${dir.name}/${f}: link to #/lesson/${id}`, false, 'no such lesson in the catalog');
        else if (!L.ready) { pending++; pendingList.add(id); }
      }
      for (const m of src.matchAll(/#\/explore\/([\w-]+)/g)) if (!galleryIds.has(m[1])) check(`content/${dir.name}/${f}: link to #/explore/${m[1]}`, false, 'no such gallery entry');
    }
  }
  if (pending) console.log(`${pending} links point to lessons not written yet (${pendingList.size} lessons: ${[...pendingList].slice(0, 12).join(', ')}${pendingList.size > 12 ? ', …' : ''})`);
}
console.log(`${lessons} lessons, ${items} items (${items ? Math.round((100 * withVisual) / items) : 0}% with a visual), ${instances} instances checked`);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
