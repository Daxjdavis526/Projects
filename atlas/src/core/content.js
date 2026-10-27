// The content model: how a lesson and its questions are written, how a
// question becomes a concrete, seeded variant, and the validator that the
// Node suite runs over every item in the Atlas.
//
// A lesson module default-exports lesson({...}). Items are either fixed
// objects or generators — { id, gen(rng) { return {...} } } — that compute
// their numbers and their answer key together, so a printed number and its
// key can never disagree. Every generator is exercised over many seeds in
// test/content.test.mjs, which also checks that every key passes the grader
// and every distractor fails it.

import { makeRng, hashString } from './rng.js';
import { grade } from './check.js';
import { mathIn, escapeDamage, bareCommand } from './markup.js';

export const ITEM_TYPES = ['mcq', 'multi', 'numeric', 'expression', 'order', 'match', 'label', 'point', 'slider', 'code'];
export const LESSON_KINDS = ['lesson', 'concept', 'dissection'];

/** A dissected equation marks its parts as \part{n}{…}; for plain rendering they are just groups. */
export const stripParts = (src) => String(src).replace(/\\part\{\d+\}/g, '');

/** Normalise a lesson definition. */
export function lesson(def) {
  const L = {
    minutes: 6, difficulty: 2, prereqs: [], encompasses: [], practice: [], checkpoint: [],
    visual: null, example: null, why: '', sources: [], badges: [], kind: 'lesson',
    ...def,
  };
  L.skills = def.skills?.length ? def.skills : [def.id];
  const [course, module] = String(def.id).split('.');
  L.course ??= course;
  L.module ??= `${course}.${module}`;
  return L;
}

/**
 * Normalise an authored boss battle: a story in rounds, each round a few
 * unassisted problems. Every item names the lesson skill it measures
 * (`skill: 'math1220.C2-4.5'`) so a boss result moves the right estimate.
 */
export function boss(def) {
  return { pass: 0.7, intro: '', ...def, rounds: (def.rounds || []).map((r, k) => ({ title: `Round ${k + 1}`, story: '', items: [], ...r })) };
}

/** Helpers for writing items tersely; they only fill defaults. */
export const mcq = (f) => ({ type: 'mcq', ...f });
export const multi = (f) => ({ type: 'multi', ...f });
export const num = (f) => ({ type: 'numeric', ...f });
export const expr = (f) => ({ type: 'expression', ...f });
export const order = (f) => ({ type: 'order', ...f });
export const match = (f) => ({ type: 'match', ...f });
/** A coding exercise: Python checked by running it (src/lab/harness.js). */
export const code = (f) => ({ type: 'code', ...f });

/**
 * A concrete question: run the generator (if any) with a seed derived from the
 * lesson, the item and the variant number, then fix the choice order.
 */
export function instantiate(L, def, variant = 0) {
  const seed = hashString(`${L.id}/${def.id}#${variant}`);
  const rng = makeRng(seed);
  const fields = def.gen ? def.gen(rng, variant) : {};
  const { gen, ...stat } = def;
  const item = { difficulty: 2, ...stat, ...fields };
  item.id = def.id;
  item.key = `${L.id}/${def.id}`;
  item.variant = variant;
  item.lesson = L.id;
  item.skill = item.skill ?? L.skills[0];
  item.seed = seed;
  if ((item.type === 'mcq' || item.type === 'multi') && !item.fixedOrder) item.order = rng.perm(item.choices.length);
  if (item.type === 'order') item.shuffle = shuffledNotIdentity(rng, item.items.length);
  if (item.type === 'match' || item.type === 'label') item.rightOrder = rng.perm(item.right.length);
  return item;
}

function shuffledNotIdentity(rng, n) {
  for (let k = 0; k < 20; k++) {
    const p = rng.perm(n);
    if (n < 2 || p.some((v, i) => v !== i)) return p;
  }
  return [...Array(n).keys()].reverse();
}

/** All item definitions of a lesson with the context each is used in. */
export function itemsOf(L) {
  return [
    ...L.practice.map((d) => ({ def: d, context: 'practice' })),
    ...L.checkpoint.map((d) => ({ def: d, context: 'checkpoint' })),
  ];
}

/** The answer a perfect learner would give, in the grader's input format. */
export function keyResponse(item) {
  switch (item.type) {
    case 'mcq': return item.answer;
    case 'multi': return item.answer;
    case 'numeric': return String(item.answer);
    case 'expression': return item.answer;
    case 'order': return item.items.map((_, k) => k);
    case 'match': case 'label': return Object.fromEntries(item.answer.map((r, l) => [l, r]));
    case 'point': return item.answer;
    case 'slider': return (item.answer[0] + item.answer[1]) / 2;
    case 'code': return item.answer;
    default: return null;
  }
}

const TEXT_FIELDS = ['prompt', 'teach', 'explain', 'solution'];

// sentences in a line of prose: abbreviations (e.g., i.e., vs.) and the dots
// inside $math$ and `code` do not end one
const sentences = (s) => String(s).replace(/\$[^$]*\$|`[^`]*`/g, 'X')
  .replace(/\b(e\.g|i\.e|etc|vs|cf|approx|Eq|Eqs|Fig|No|Dr|St)\./gi, '$1').split(/(?<=[.!?])\s+/).filter((x) => x.trim()).length;

/**
 * Check one instantiated item; returns a list of problems (empty = good).
 * `tex` is an optional function (tex, display) => throws on bad TeX.
 */
export function validateItem(item, tex) {
  const p = [];
  const need = (cond, msg) => { if (!cond) p.push(msg); };
  need(ITEM_TYPES.includes(item.type), `unknown type ${item.type}`);
  need(item.prompt && String(item.prompt).trim().length > 8, 'prompt missing or too short');
  need(Array.isArray(item.hints) && item.hints.length >= 1, 'needs at least one hint');
  if ((item.difficulty ?? 2) >= 3) need(item.hints?.length >= 2, 'a difficult item needs a hint ladder (2+ hints)');
  need(item.teach && item.teach.length > 10, 'needs a one-sentence micro-teaching line (teach)');
  need(item.explain && item.explain.length > 10, 'needs an explanation of why the answer is right');
  need([1, 2, 3, 4].includes(item.difficulty ?? 2), 'difficulty must be 1–4');
  if (item.teach) need(sentences(item.teach) <= 2, 'teach should be one sentence (two at most)');
  // strings: escape damage and TeX
  const strings = [...TEXT_FIELDS.map((f) => item[f]), ...(item.hints || []), ...(item.choices || []),
    ...(item.items || []), ...(item.left || []), ...(item.right || []), ...Object.values(item.why || {}),
    ...(item.tests || []).map((x) => x.name)];
  for (const s of strings) {
    if (s === undefined || s === null) continue;
    const dmg = escapeDamage(s);
    if (dmg) p.push(`text “${String(s).slice(0, 40)}…” ${dmg}`);
    if (tex) for (const m of mathIn(s)) {
      try { tex(m.tex, m.display); } catch (e) { p.push(`bad TeX “${m.tex}”: ${e.message}`); }
    }
  }
  if (item.type === 'code') {
    // run by test/code.test.mjs in real Python: the reference passes, the starter does not
    need(typeof item.starter === 'string', 'a coding exercise needs starter code (it may be empty)');
    need(typeof item.answer === 'string' && item.answer.trim().length > 0, 'a coding exercise needs a reference solution in answer');
    need(Array.isArray(item.tests) && item.tests.length >= 1 && item.tests.every((x) => x.name && x.code), 'a coding exercise needs tests: [{ name, code }]');
    return p;
  }
  // the key must pass; distractors must fail
  try {
    if (item.type === 'mcq') {
      need(item.choices?.length === 4, 'multiple choice needs exactly four options');
      need(new Set(item.choices).size === item.choices?.length, 'choices must be distinct');
      need(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.choices.length, 'answer index out of range');
    }
    if (item.type === 'multi') need(item.choices?.length >= 4 && item.answer?.length >= 1, 'multi-select needs 4+ choices and at least one answer');
    if (item.type === 'numeric') {
      need(Number.isFinite(item.answer), `numeric answer is not finite (${item.answer})`);
      for (const e of item.errors || []) {
        const r = grade(item, String(e.value));
        need(!r.correct, `known error value ${e.value} would be graded correct`);
      }
    }
    if (item.type === 'expression') {
      for (const e of item.errors || []) need(!grade(item, e.answer).correct, `known error form ${e.answer} would be graded correct`);
    }
    if (item.type === 'order') need(item.items?.length >= 3, 'ordering needs 3+ steps');
    if (item.type === 'match' || item.type === 'label') {
      need(item.left?.length >= 2 && item.right?.length >= item.left.length, 'matching needs 2+ pairs');
      need(item.answer?.length === item.left?.length, 'matching answer must map every left item');
    }
    const r = grade(item, keyResponse(item));
    need(r.correct, `the answer key does not pass the grader (${r.feedback || r.status})`);
    if (item.type === 'mcq') {
      for (let k = 0; k < item.choices.length; k++) if (k !== item.answer) need(!grade(item, k).correct, `distractor ${k} graded correct`);
    }
  } catch (e) {
    p.push(`grader threw: ${e.message}`);
  }
  return p;
}

/** Problems with a lesson as a whole. */
export function validateLesson(L, tex) {
  const p = [];
  const need = (cond, msg) => { if (!cond) p.push(msg); };
  need(/^[a-z0-9-]+\.[A-Za-z0-9-]+\.[0-9a-z]+$/.test(L.id), `lesson id ${L.id} must look like course.MODULE.n`);
  need(L.title && L.title.length > 2, 'title missing');
  need(L.intro && L.intro.length > 40, 'intro missing or too short');
  need(LESSON_KINDS.includes(L.kind), `unknown lesson kind ${L.kind}`);
  if (L.kind === 'lesson') {
    need(L.example && L.example.steps?.length >= 1, 'needs a worked example with steps');
    need(L.practice.length >= 4, `needs at least 4 practice items (has ${L.practice.length})`);
    need(L.checkpoint.length >= 2, `needs at least 2 checkpoint items (has ${L.checkpoint.length})`);
  }
  if (L.kind === 'concept') {
    need(L.practice.length >= 3, `a concept lesson needs at least 3 practice items (has ${L.practice.length})`);
    need(L.checkpoint.length >= 2, `needs at least 2 checkpoint items (has ${L.checkpoint.length})`);
  }
  if (L.kind === 'dissection') {
    need(L.equation, 'a dissection needs its equation');
    need(L.parts?.length >= 3, 'a dissection needs at least 3 parts');
    const marked = new Set([...String(L.equation || '').matchAll(/\\part\{(\d+)\}/g)].map((m) => +m[1]));
    for (const [k, part] of (L.parts || []).entries()) {
      need(marked.has(k + 1), `part ${k + 1} (${part.name}) is not marked in the equation with \\part{${k + 1}}{…}`);
      need(part.name && part.text && part.text.length > 20, `part ${k + 1} needs a name and an explanation`);
    }
    need(L.practice.length >= 3, `a dissection needs at least 3 practice items (has ${L.practice.length})`);
    need(L.checkpoint.length >= 2, `needs at least 2 checkpoint items (has ${L.checkpoint.length})`);
  }
  const ids = new Set();
  for (const { def } of itemsOf(L)) {
    need(def.id && !ids.has(def.id), `duplicate or missing item id ${def.id}`);
    ids.add(def.id);
  }
  const texts = [L.intro, L.why, L.example?.prompt, L.example?.answer, ...(L.example?.steps || []).map((s) => s.text), L.visual?.lead,
    L.visual?.caption, L.visual?.explain, L.summary, L.readAloud, ...(L.symbols || []).map((s) => s.text), ...(L.visual?.tasks || []),
    ...(L.parts || []).flatMap((q) => [q.text, q.more])];
  for (const s of texts) {
    if (!s) continue;
    const dmg = escapeDamage(s);
    if (dmg) p.push(`lesson text “${String(s).slice(0, 40)}…” ${dmg}`);
    if (tex) for (const m of mathIn(s)) {
      try { tex(m.tex, m.display); } catch (e) { p.push(`bad TeX “${m.tex}”: ${e.message}`); }
    }
  }
  // bare TeX fields (no $ delimiters)
  const bare = [[L.equation && stripParts(L.equation), true], ...(L.symbols || []).map((s) => [s.tex, false]), ...(L.parts || []).map((q) => [q.tex, false])];
  for (const [src, display] of bare) {
    if (!src) continue;
    const dmg = escapeDamage(src) || (bareCommand(src) && `contains “${bareCommand(src)}” without its backslash — write it with String.raw`);
    if (dmg) p.push(`TeX “${String(src).slice(0, 40)}…” ${dmg}`);
    if (tex) { try { tex(src, display); } catch (e) { p.push(`bad TeX “${src}”: ${e.message}`); } }
  }
  return p;
}
