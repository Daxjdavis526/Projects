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
import { mathIn } from '../src/core/markup.js';
import { scan, render as renderLoads } from '../tools/register.mjs';
import ACHIEVEMENTS from '../content/achievements.js';
import GALLERY from '../content/gallery.js';

const require = createRequire(import.meta.url);
const katex = require('../vendor/katex-0.19.0/katex.min.js');
const tex = (src, display) => katex.renderToString(src, { displayMode: display, throwOnError: true, strict: 'ignore' });

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
  if (mod.validate) {
    let p;
    try { p = mod.validate({ ...(mod.defaults || {}), ...(spec.params || {}) }); } catch (e) { p = [`validate threw: ${e.message}`]; }
    check(`${where}: ${spec.type} parameters`, p.length === 0, p.slice(0, 3).join('; '));
  }
  for (const s of [spec.lead, spec.caption, spec.explain, spec.note, ...(spec.tasks || [])]) {
    if (!s) continue;
    for (const m of mathIn(s)) { try { tex(m.tex, m.display); } catch (e) { check(`${where}: visual text TeX`, false, `${m.tex}: ${e.message}`); } }
  }
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

if (!only) for (const g of GALLERY) {
  if (g.lesson) check(`gallery ${g.id}: lesson ${g.lesson} is built`, !!CATALOG.lessons[g.lesson]?.ready);
  else await checkVisual(`gallery ${g.id}`, g.spec);
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
      seen.add(JSON.stringify([item.prompt, item.answer]));
      const p = validateItem(item, tex);
      if (p.length) { firstProblem = `variant ${v}: ${p.join('; ')}`; break; }
      if (item.visual || item.diagram) hasVisual = true;
      if (v < 3) await checkVisual(`${L0.id}/${def.id} variant ${v}`, item.visual);
    }
    if (hasVisual) withVisual++;
    lessonItems++; if (hasVisual) lessonVisual++;
    check(`${L0.id}/${def.id} (${context})`, !firstProblem, firstProblem || '');
    if (def.gen && n > 5) check(`${L0.id}/${def.id}: generator varies`, seen.size > 1, 'every variant was identical');
  }
  if (lessonItems && lessonVisual / lessonItems < 0.6) lowVisual.push(`${L0.id} ${lessonVisual}/${lessonItems}`);
}

// authored boss battles: content/<course>/boss.js
for (const c of CATALOG.courses) {
  if (!c.bossLoad || (only && c.id !== only)) continue;
  let B;
  try { B = (await c.bossLoad()).default; } catch (e) { check(`${c.id} boss loads`, false, e.message); continue; }
  check(`${c.id} boss: has rounds`, Array.isArray(B.rounds) && B.rounds.length >= 3, 'an authored boss needs 3+ rounds');
  for (const [k, round] of (B.rounds || []).entries()) {
    for (const def of round.items || []) {
      for (let v = 0; v < (def.gen ? 10 : 1); v++) {
        const item = instantiate({ id: `${c.id}.boss`, skills: [def.skill || `${c.id}.boss`] }, def, v);
        const p = validateItem(item, tex);
        if (p.length) { check(`${c.id} boss round ${k + 1}/${def.id}`, false, p.join('; ')); break; }
        if (v === 0) {
          check(`${c.id} boss round ${k + 1}/${def.id}`, true);
          check(`${c.id} boss ${def.id}: measures a real lesson skill`, !!CATALOG.lessons[def.skill], `skill “${def.skill}” — set skill to the id of the lesson this problem draws on`);
          await checkVisual(`${c.id} boss ${def.id}`, item.visual);
        }
      }
    }
  }
}

if (lowVisual.length) console.log(`note: problems with a visual below 60% in ${lowVisual.length} lesson(s): ${lowVisual.join(', ')}`);
console.log(`${lessons} lessons, ${items} items (${items ? Math.round((100 * withVisual) / items) : 0}% with a visual), ${instances} instances checked`);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
