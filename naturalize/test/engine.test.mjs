/*
 * Headless tests for the rewriting engine.
 *
 *   node naturalize/test/engine.test.mjs
 *
 * The engine imports no DOM and no browser API, so the whole rewriting
 * pipeline is exercised here. Most of these tests assert restraint —
 * that the engine leaves things alone — because over-rewriting is the
 * failure mode that matters.
 */

import assert from 'node:assert/strict';
import { naturalize, compose, analyseVoice, MODES } from '../src/engine.mjs';
import { splitSentences, splitBlocks, mask, unmask } from '../src/text.mjs';
import { diffWords, retention } from '../src/diff.mjs';

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    failures.push({ name, err });
  }
}

const out = (text, opts = {}) => naturalize(text, { strength: 3, ...opts }).text;

/* ---------------------------------------------------------------- *
 * Segmentation
 * ---------------------------------------------------------------- */

test('sentence splitter does not break on abbreviations', () => {
  assert.equal(splitSentences('Dr. Smith arrived. He was late.').length, 2);
  assert.equal(splitSentences('We used 3.5 kg of fuel. It was enough.').length, 2);
  assert.equal(splitSentences('See Fig. 4 for detail.').length, 1);
});

test('block splitter keeps headings, lists and code fences distinct', () => {
  const blocks = splitBlocks('# Title\n\nA para.\n\n- one\n- two\n\n```\ncode();\n```');
  assert.equal(blocks.filter((b) => b.type === 'heading').length, 1);
  assert.equal(blocks.filter((b) => b.type === 'list').length, 2);
  assert.equal(blocks.filter((b) => b.type === 'code').length, 1);
});

test('masking round-trips protected spans exactly', () => {
  const src = 'He measured 3.5 kg per ISO 9001 and said "keep it" (Smith, 2020).';
  const { masked, vault } = mask(src, true);
  assert.equal(unmask(masked, vault), src);
});

/* ---------------------------------------------------------------- *
 * Restraint: text that is already fine must survive untouched
 * ---------------------------------------------------------------- */

test('already-natural prose is left alone', () => {
  const src = 'The pump failed on the second run. We swapped the seal and it held.';
  const r = naturalize(src, { strength: 3 });
  assert.equal(r.text, src);
  assert.equal(r.changes.length, 0);
});

test('strength 1 makes only unambiguous edits', () => {
  const src = 'Teams utilize the tool in order to ship. Furthermore, it is fast, cheap, and simple.';
  const r = naturalize(src, { strength: 1 });
  assert.ok(!/utilize/.test(r.text), 'utilize should still go at strength 1');
  assert.ok(/Furthermore/.test(r.text), 'transitions are untouched at strength 1');
});

test('minimal mode caps strength no matter what the slider says', () => {
  const r = naturalize('Furthermore, the result was quite good.', { mode: 'minimal', strength: 5 });
  assert.equal(r.strength, 1);
  assert.ok(r.capped);
  assert.ok(/Furthermore/.test(r.text));
});

test('a single rhetorical contrast is stylistic and survives', () => {
  const src = "It's not just faster — it's cheaper. The team shipped in March.";
  assert.ok(out(src).includes("not just faster"));
});

test('one three-item list is left alone', () => {
  const src = 'The tool is fast, cheap, and simple. It runs nightly.';
  assert.ok(out(src).includes('fast, cheap, and simple'));
});

/* ---------------------------------------------------------------- *
 * The habits the engine is supposed to catch
 * ---------------------------------------------------------------- */

test('wordy phrases are shortened', () => {
  assert.ok(out('We did it in order to win.').includes('to win'));
  assert.ok(/because/.test(out('It failed due to the fact that the seal broke.')));
  assert.ok(/\bcan\b/.test(out('The valve has the ability to close.')));
});

test('"it is important to note that" is deleted outright', () => {
  const r = out('It is important to note that the seal failed.');
  assert.equal(r, 'The seal failed.');
});

test('overused additive transitions are dropped', () => {
  const src = 'The seal failed. Furthermore, the pump stalled. Moreover, the log filled. Additionally, the alarm fired.';
  const r = out(src);
  assert.ok(!/Moreover/.test(r) && !/Additionally/.test(r), r);
});

test('causal transitions survive better than additive ones', () => {
  const src = 'The seal failed. Therefore, the pump stalled. The log filled up.';
  assert.ok(/Therefore|So/.test(out(src)));
});

test('a restating sentence is removed', () => {
  const src = 'The valve controls the flow of propellant. This means that the valve controls how much propellant flows.';
  const r = naturalize(src, { strength: 3 });
  assert.equal(r.text, 'The valve controls the flow of propellant.');
  assert.ok(r.changes.some((c) => c.category === 'redundancy'));
});

test('a follow-up that adds information keeps its content', () => {
  const src = 'The valve controls propellant flow. This means that a stuck valve strands the upper stage in a parking orbit.';
  const r = out(src);
  assert.ok(/parking orbit/.test(r), 'new information must survive');
  assert.ok(!/This means that/.test(r), 'but the dead marker goes');
});

test('generic openers are rewritten', () => {
  assert.ok(!/rapidly evolving/.test(out("In today's rapidly evolving world, teams ship faster.")));
  assert.ok(!/plays an important role/.test(out('Testing plays an important role in delivery.')));
});

test('corporate vocabulary is stripped', () => {
  const r = out('We deliver a cutting-edge, game-changing platform that unlocks value.');
  assert.ok(!/cutting-edge/.test(r) && !/game-changing/.test(r) && !/unlocks value/.test(r), r);
});

test('em-dashes are rationed, not eliminated', () => {
  const src = Array.from({ length: 6 }, (_, i) => `Point ${i} matters — it really does.`).join(' ');
  const r = out(src);
  assert.ok(r.includes('—'), 'at least one em-dash should survive');
  assert.ok((r.match(/—/g) || []).length < 6, 'but not all six');
});

test('a repeated three-item rhythm gets trimmed after the second time', () => {
  const src = 'It is fast, cheap, and simple. We design, test, and ship. The goals are speed, cost, and scale. We measure load, drift, and noise.';
  const r = naturalize(src, { strength: 3 });
  assert.ok(r.changes.some((c) => c.ruleId === 'triple.trim'));
  assert.ok(r.text.includes('fast, cheap, and simple'), 'the first two are left alone');
});

test('a closing paragraph that only restates is removed', () => {
  const src = [
    'The seal failed under thermal load and the pump stalled.',
    '',
    'Engineers replaced the seal with a graphite variant rated to 400 degrees.',
    '',
    'The pump ran for six hours without further incident during the retest.',
    '',
    'In conclusion, the seal failed, the pump stalled, and engineers replaced the seal.'
  ].join('\n');
  const r = naturalize(src, { strength: 3 });
  assert.ok(!/In conclusion/.test(r.text));
  assert.ok(r.text.split('\n').filter(Boolean).length <= 3, r.text);
});

/* ---------------------------------------------------------------- *
 * Preservation guarantees
 * ---------------------------------------------------------------- */

test('numbers, units and citations survive intact', () => {
  const src = 'It is important to note that the chamber ran at 3.5 MPa for 12.4 s (Smith, 2020) [4].';
  const r = out(src);
  for (const frag of ['3.5', 'MPa', '12.4', '(Smith, 2020)', '[4]']) {
    assert.ok(r.includes(frag), `${frag} must survive — got: ${r}`);
  }
});

test('quotations are never rewritten', () => {
  const src = 'She wrote that we should "utilize the robust framework in order to win".';
  assert.ok(out(src).includes('"utilize the robust framework in order to win"'));
});

test('genuine hedges are preserved so no claim gets stronger', () => {
  const src = 'The data suggests the seal may have failed, and the cause is likely thermal.';
  const r = out(src);
  for (const w of ['suggests', 'may', 'likely']) assert.ok(r.includes(w), `${w} must survive`);
});

test('technical mode protects terminology and switches off risky rules', () => {
  const src = 'The robust ASTM D638 coupon uses a comprehensive Inconel-718 fixture with respect to load.';
  const r = out(src, { technical: true });
  assert.ok(/robust/.test(r), 'robust is a real term in engineering');
  assert.ok(/ASTM D638/.test(r));
  assert.ok(/Inconel-718/.test(r));
  assert.ok(/with respect to/.test(r), '"with respect to" is meaningful here');
});

test('technical mode leaves measured qualifiers alone', () => {
  const src = 'Run A was significantly faster. Run B was significantly slower. Run C was significantly noisier. Run D was significantly hotter. Run E was significantly wetter. Run F was significantly drier.';
  assert.equal((out(src, { technical: true }).match(/significantly/g) || []).length, 6);
});

test('equations and inline code are untouched', () => {
  const src = 'It is important to note that $E = mc^2$ and `utilize()` still hold.';
  const r = out(src);
  assert.ok(r.includes('$E = mc^2$'));
  assert.ok(r.includes('`utilize()`'));
});

/* ---------------------------------------------------------------- *
 * Modes and voice
 * ---------------------------------------------------------------- */

test('casual mode adds contractions, academic mode does not', () => {
  const src = 'It is not ready. We are still testing it.';
  assert.ok(/It's/.test(naturalize(src, { mode: 'casual', strength: 3 }).text));
  assert.ok(!/It's/.test(naturalize(src, { mode: 'academic', strength: 3 }).text));
});

test('preserve-voice blocks contractions the author never uses', () => {
  const src = 'It is not ready. We are still testing it. The team is careful.';
  const r = naturalize(src, { mode: 'casual', strength: 3, preserveVoice: true });
  assert.ok(!/It's/.test(r.text));
  assert.ok(r.notes.some((n) => /did not add contractions/i.test(n)));
});

test('preserve-voice keeps an author who already contracts', () => {
  const src = "It isn't ready. We are still testing it.";
  const r = naturalize(src, { mode: 'casual', strength: 3, preserveVoice: true });
  assert.ok(/We're/.test(r.text));
});

test('voice analysis reports the author’s own habits', () => {
  const v = analyseVoice("I don't think it's ready. We are still testing. The rig is cold.");
  assert.ok(v.usesContractions);
  assert.ok(v.firstPerson);
  assert.ok(v.sentenceCount === 3);
});

test('every declared mode actually runs', () => {
  const src = 'Furthermore, teams utilize a comprehensive toolchain in order to ship quickly.';
  for (const mode of Object.keys(MODES)) {
    const r = naturalize(src, { mode, strength: 3 });
    assert.ok(typeof r.text === 'string' && r.text.length > 0, `${mode} produced nothing`);
  }
});

/* ---------------------------------------------------------------- *
 * Output integrity
 * ---------------------------------------------------------------- */

test('structure survives a round trip', () => {
  const src = '# Title\n\nA sentence here.\n\n## Sub\n\n- item one\n- item two\n\n> a quotation\n\n```\ncode();\n```';
  const r = out(src);
  assert.ok(r.includes('# Title'));
  assert.ok(r.includes('## Sub'));
  assert.ok(r.includes('- item one'));
  assert.ok(r.includes('> a quotation'));
  assert.ok(r.includes('code();'));
});

test('no sentinel characters leak into the output', () => {
  const src = 'It is important to note that 3.5 kg of "material" per ISO 9001 was used in order to test.';
  for (const technical of [true, false]) {
    assert.ok(!/[]/.test(out(src, { technical })), 'mask sentinel leaked');
  }
});

test('output never ends up empty for non-empty input', () => {
  for (const s of ['Ultimately.', 'In conclusion.', 'Furthermore.', 'It is important to note that.']) {
    assert.ok(naturalize(s, { strength: 5 }).text.length > 0, `emptied: ${s}`);
  }
});

test('empty input is handled', () => {
  const r = naturalize('   ', { strength: 3 });
  assert.equal(r.text, '');
  assert.equal(r.changes.length, 0);
});

test('every change carries a human-readable reason', () => {
  const src = "In today's rapidly evolving world, teams utilize cutting-edge tools in order to facilitate delivery. Furthermore, it is important to note that this is crucial.";
  const r = naturalize(src, { strength: 4 });
  assert.ok(r.changes.length > 0);
  for (const c of r.changes) {
    assert.ok(c.reason && c.reason.length > 10, `weak reason: ${JSON.stringify(c)}`);
    assert.ok(c.category, 'every change needs a category');
  }
});

test('minimum necessary editing: a good paragraph mostly survives', () => {
  const src = 'The rig ran for six hours. A seal on the second stage began to weep at 400 K, so we shut it down and pulled the assembly. The graphite replacement held for the rest of the campaign.';
  const r = naturalize(src, { strength: 3 });
  assert.ok(retention(src, r.text) > 0.9, `retention was ${retention(src, r.text)}`);
});

test('compose applies per-sentence overrides', () => {
  const r = naturalize('Furthermore, the seal failed. The pump stalled.', { strength: 3 });
  const id = r.sentences[0].id;
  assert.ok(compose(r, { [id]: 'REPLACED.' }).startsWith('REPLACED.'));
});

test('diff marks only what actually changed', () => {
  const parts = diffWords('Teams utilize the tool to ship.', 'Teams use the tool to ship.');
  const changed = parts.filter((p) => p.type !== 'equal').map((p) => p.tokens.join('').trim());
  assert.deepEqual(changed.sort(), ['use', 'utilize']);
});

/* ---------------------------------------------------------------- */

console.log(`\n${passed} passed, ${failed} failed\n`);
for (const f of failures) {
  console.log(`  ✗ ${f.name}`);
  console.log(`      ${f.err.message.split('\n')[0]}`);
}
process.exit(failed ? 1 : 0);
