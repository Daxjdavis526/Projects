// Every built lesson and every question in the Atlas, validated headlessly:
// structure, escape damage, TeX that KaTeX can render, generators run over
// many seeds, every answer key passing the grader and every distractor failing.
//   node atlas/test/content.test.mjs            all courses
//   node atlas/test/content.test.mjs math1220   one course

import { createRequire } from 'node:module';
import { CATALOG, COURSES } from '../content/catalog.js';
import { validateCatalog } from '../src/core/catalog.js';
import { validateLesson, validateItem, instantiate, itemsOf } from '../src/core/content.js';
import { mathIn } from '../src/core/markup.js';
import ACHIEVEMENTS from '../content/achievements.js';

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

let lessons = 0, items = 0, instances = 0;
for (const L0 of Object.values(CATALOG.lessons)) {
  if (!L0.ready) continue;
  if (only && L0.course !== only) continue;
  let L;
  try { L = (await L0.load()).default; } catch (e) { check(`${L0.id}: module loads`, false, e.message); continue; }
  lessons++;
  check(`${L0.id}: module id matches its catalog entry`, L.id === L0.id, `module says ${L.id}`);
  const lp = validateLesson(L, tex);
  check(`${L0.id}: lesson structure`, lp.length === 0, lp.join('; '));
  if (L.visual) check(`${L0.id}: visual has a type`, typeof L.visual.type === 'string');
  for (const { def, context } of itemsOf(L)) {
    items++;
    const n = def.gen ? VARIANTS : 1;
    const seen = new Set();
    let firstProblem = null;
    for (let v = 0; v < n; v++) {
      let item;
      try { item = instantiate(L, def, v); } catch (e) { firstProblem = `variant ${v} threw: ${e.message}`; break; }
      instances++;
      seen.add(JSON.stringify([item.prompt, item.answer]));
      const p = validateItem(item, tex);
      if (p.length) { firstProblem = `variant ${v}: ${p.join('; ')}`; break; }
    }
    check(`${L0.id}/${def.id} (${context})`, !firstProblem, firstProblem || '');
    if (def.gen && n > 5) check(`${L0.id}/${def.id}: generator varies`, seen.size > 1, 'every variant was identical');
  }
}

console.log(`${lessons} lessons, ${items} items, ${instances} instances checked`);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
