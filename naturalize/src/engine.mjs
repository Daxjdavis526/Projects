/*
 * engine.mjs — the rewriting engine.
 *
 * Imports no DOM and no browser API, so `node test/engine.test.mjs`
 * exercises the whole thing headlessly.
 *
 * The engine works in two layers. Sentence rules (rules.mjs) are local
 * substitutions with a stated reason. Document passes, below, are the
 * part that makes the output feel written rather than processed: they
 * look at the whole text, decide which habits it actually leans on, and
 * spend a limited budget of edits on those. A transition is only padding
 * if the document keeps reaching for it; a three-item list is only a tic
 * if it happens over and over. Judging that needs the whole document.
 *
 * Everything the engine will not touch, it says so out loud in `notes`
 * rather than guessing.
 */

import {
  splitBlocks, splitSentences, mask, unmask, isMaskOnly,
  contentWords, overlap, wordCount, capitalise, lowerFirst, mean, stdev
} from './text.mjs';

import {
  ALL_SENTENCE_RULES, CLOSINGS, CONTRAST, CONTRACTIONS, TRANSITIONS,
  TRANSITION_PLAIN, RESTATEMENT_MARKER, tidy
} from './rules.mjs';

/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */

export const MODES = {
  minimal: {
    label: 'Minimal',
    blurb: 'Only the edits that are obviously right. Wordy phrases and dead openers go; everything structural is left alone.',
    capStrength: 1, contractions: 'never', structural: false, splitting: false
  },
  natural: {
    label: 'Natural',
    blurb: 'Clears out formulaic wording while keeping the author’s voice. The default.',
    capStrength: 5, contractions: 'keep', structural: true, splitting: true
  },
  casual: {
    label: 'Casual',
    blurb: 'More conversational. Adds contractions and prefers the plainer word.',
    capStrength: 5, contractions: 'add', structural: true, splitting: true, formalBoost: 1
  },
  professional: {
    label: 'Professional',
    blurb: 'Plain professional prose with the corporate vocabulary stripped out. No contractions added.',
    capStrength: 5, contractions: 'never', structural: true, splitting: true, corporateBoost: 1
  },
  academic: {
    label: 'Academic',
    blurb: 'Keeps technical precision and hedging intact, and removes only repetition and filler.',
    capStrength: 4, contractions: 'never', structural: true, splitting: false, keepCausal: true
  },
  student: {
    label: 'Student',
    blurb: 'Reads like a capable university student rather than a textbook. Shorter sentences, plainer words.',
    capStrength: 5, contractions: 'add', structural: true, splitting: true, formalBoost: 1
  }
};

export const STRENGTH_LABELS = {
  1: 'Almost unchanged', 2: 'Light cleanup', 3: 'Natural rewrite',
  4: 'Strong rewrite', 5: 'Major stylistic rewrite'
};

const INTENSIFIERS = [
  'very', 'really', 'quite', 'extremely', 'incredibly', 'truly', 'highly',
  'utterly', 'simply', 'actually', 'basically', 'essentially', 'fundamentally',
  'literally', 'certainly', 'undoubtedly', 'clearly', 'obviously', 'definitely'
];

const SOFT_QUALIFIERS = [
  'notably', 'particularly', 'significantly', 'relatively', 'arguably',
  'potentially', 'generally', 'typically', 'largely', 'somewhat',
  'considerably', 'substantially', 'remarkably', 'importantly',
  'completely', 'entirely', 'totally', 'absolutely'
];

// Never stripped in Technical mode: each can carry a measured meaning.
const TECHNICAL_QUALIFIERS = new Set([
  'significantly', 'relatively', 'substantially', 'considerably',
  'completely', 'entirely', 'approximately', 'typically'
]);

/* ------------------------------------------------------------------ *
 * Voice analysis — what the author's own habits look like
 * ------------------------------------------------------------------ */

export function analyseVoice(text) {
  const sentences = splitBlocks(text)
    .filter((b) => b.type === 'paragraph' || b.type === 'list')
    .flatMap((b) => splitSentences(b.text));

  const lengths = sentences.map(wordCount).filter((n) => n > 0);
  const total = wordCount(text) || 1;
  const contractions = (text.match(/\b\w+['’](?:s|t|re|ve|ll|d|m)\b/g) || []).length;
  const firstPerson = (text.match(/\b(?:I|we|my|our|me|us)\b/g) || []).length;
  const formalHits = (text.match(/\b(?:utilize|utilise|furthermore|moreover|thus|hence|herein|whereby|therein|aforementioned)\b/gi) || []).length;

  return {
    sentenceCount: sentences.length,
    avgSentenceLength: Math.round(mean(lengths) * 10) / 10,
    lengthVariation: mean(lengths) ? Math.round((stdev(lengths) / mean(lengths)) * 100) / 100 : 0,
    contractionRate: Math.round((contractions / (total / 100)) * 100) / 100,
    usesContractions: contractions > 0,
    firstPerson: firstPerson > 0,
    firstPersonRate: Math.round((firstPerson / (total / 100)) * 100) / 100,
    formality: Math.round((formalHits / (total / 100)) * 100) / 100,
    oxfordComma: /,\s+(?:and|or)\s+\w+[.;]/.test(text),
    emDashRate: Math.round(((text.match(/—/g) || []).length / (total / 100)) * 100) / 100
  };
}

/* ------------------------------------------------------------------ *
 * Internal model
 * ------------------------------------------------------------------ */

function buildSentences(blocks) {
  const list = [];
  blocks.forEach((block, bi) => {
    if (block.type !== 'paragraph' && block.type !== 'list' && block.type !== 'quote') return;
    if (block.type === 'quote') return; // quotations are never rewritten
    const parts = splitSentences(block.text);
    parts.forEach((s, si) => {
      list.push({
        id: `${bi}.${si}`, blockIndex: bi, indexInBlock: si,
        original: s, current: s, changes: [], removed: false, first: si === 0,
        last: si === parts.length - 1, blockType: block.type
      });
    });
  });
  return list;
}

function record(sentence, ctx, ruleId, category, reason, before, after) {
  sentence.changes.push({ ruleId, category, reason });
  ctx.changes.push({
    id: `c${ctx.changes.length}`, sentenceId: sentence.id, ruleId, category, reason,
    before: before.trim(), after: after.trim(),
    kind: after.trim() ? 'edit' : 'removal'
  });
}

/* ------------------------------------------------------------------ *
 * Pass 1 — sentence-local rules
 * ------------------------------------------------------------------ */

function passSentenceRules(sentences, ctx) {
  const { strength, mode, technical } = ctx;
  for (const s of sentences) {
    if (s.removed) continue;
    const { masked, vault } = mask(s.current, technical);
    let working = masked;

    for (const rule of ALL_SENTENCE_RULES) {
      let min = rule.minStrength;
      if (rule.category === 'corporate' && ctx.modeCfg.corporateBoost) min -= 1;
      if (rule.category === 'formality' && ctx.modeCfg.formalBoost) min -= 1;
      if (strength < min) continue;
      if (technical && !rule.technicalSafe) continue;
      if (rule.skipModes.includes(mode)) continue;

      const before = working;
      const next = rule.apply(working);
      if (next === null) continue;
      const cleaned = tidy(next);
      if (!cleaned || isMaskOnly(cleaned)) continue;
      working = cleaned;
      record(s, ctx, rule.id, rule.category, rule.reason,
        unmask(before, vault), unmask(working, vault));
    }

    s.current = unmask(working, vault);
  }
}

/* ------------------------------------------------------------------ *
 * Pass 2 — transitions, budgeted across the whole document
 * ------------------------------------------------------------------ */

const TRANSITION_LOOKUP = (() => {
  const map = [];
  for (const [group, list] of Object.entries(TRANSITIONS)) {
    for (const word of list) map.push({ word, group });
  }
  return map.sort((a, b) => b.word.length - a.word.length);
})();

function leadingTransition(sentence) {
  for (const { word, group } of TRANSITION_LOOKUP) {
    const re = new RegExp(`^${word}\\b[,:]?\\s+`, 'i');
    const m = sentence.match(re);
    if (m) return { word, group, matched: m[0] };
  }
  return null;
}

function passTransitions(sentences, ctx) {
  const { strength, modeCfg } = ctx;
  if (strength < 2) return;

  const live = sentences.filter((s) => !s.removed);
  const n = live.length || 1;

  const budgets = {
    // Additive openers ("Furthermore", "Moreover") almost never carry
    // meaning that the sentence order does not already convey.
    additive: 0,
    summative: strength >= 2 ? 0 : 1,
    causal: modeCfg.keepCausal ? Math.max(2, Math.ceil(n / 5)) : Math.max(1, Math.ceil(n / 8)),
    contrastive: Math.max(2, Math.ceil(n / 6))
  };
  const used = { additive: 0, summative: 0, causal: 0, contrastive: 0 };

  for (const s of live) {
    const hit = leadingTransition(s.current);
    if (!hit) continue;
    const { word, group, matched } = hit;

    // A transition opening a paragraph can be doing real work, so causal
    // and contrastive ones get the benefit of the doubt there. Additive
    // and summative openers are padding wherever they sit.
    const earnsBonus = group === 'causal' || group === 'contrastive';
    const budget = budgets[group] + (s.first && earnsBonus ? 1 : 0);
    if (used[group] < budget) { used[group]++; continue; }

    const before = s.current;
    const rest = s.current.slice(matched.length);
    if (!rest || wordCount(rest) < 3) { used[group]++; continue; }

    const plain = TRANSITION_PLAIN[word];
    const dropIt = group === 'additive' || group === 'summative' || strength >= 4 || !plain;

    if (dropIt) {
      s.current = capitalise(rest);
      record(s, ctx, 'transition.drop', 'transition',
        `Removed “${word}” — the sentence follows on without it.`, before, s.current);
    } else {
      s.current = capitalise(`${plain} ${lowerFirst(rest)}`);
      record(s, ctx, 'transition.plain', 'transition',
        `Replaced the ${used[group] + 1}th “${word}” with the plainer “${plain}”.`, before, s.current);
    }
  }

  // Report the habit even where the budget let it through.
  const counts = {};
  for (const s of live) {
    const hit = leadingTransition(s.original);
    if (hit) counts[hit.word] = (counts[hit.word] || 0) + 1;
  }
  for (const [word, count] of Object.entries(counts)) {
    if (count >= 3) ctx.notes.push(`“${word}” opens ${count} sentences in the original. Some were kept because they carry the argument; consider whether they all earn their place.`);
  }
}

/* ------------------------------------------------------------------ *
 * Pass 3 — restatement and redundant explanation
 * ------------------------------------------------------------------ */

function passRestatement(sentences, ctx) {
  const { strength } = ctx;
  if (strength < 2) return;

  const byBlock = new Map();
  for (const s of sentences) {
    if (s.removed) continue;
    if (!byBlock.has(s.blockIndex)) byBlock.set(s.blockIndex, []);
    byBlock.get(s.blockIndex).push(s);
  }

  for (const group of byBlock.values()) {
    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const cur = group[i];
      if (cur.removed || prev.removed) continue;

      const m = cur.current.match(RESTATEMENT_MARKER);
      if (!m) continue;
      const body = cur.current.slice(m[0].length);
      if (!body) continue;

      // Does the follow-up sentence carry anything the first did not?
      const share = overlap(prev.current, body);
      const fresh = contentWords(body).filter((w) => !new Set(contentWords(prev.current)).has(w));

      if (share >= 0.6 && fresh.length <= 2 && strength >= 2) {
        cur.removed = true;
        record(cur, ctx, 'restate.remove', 'redundancy',
          'Removed a sentence that restated the one before it without adding anything.',
          cur.current, '');
      } else {
        const before = cur.current;
        cur.current = capitalise(body);
        record(cur, ctx, 'restate.marker', 'redundancy',
          `Removed “${m[0].trim()}” — the sentence stands on its own.`, before, cur.current);
      }
    }

    // A paragraph that ends by repeating how it started.
    if (group.length >= 3 && strength >= 3) {
      const live = group.filter((s) => !s.removed);
      if (live.length >= 3) {
        const head = live[0];
        const tail = live[live.length - 1];
        const share = overlap(head.current, tail.current);
        const fresh = contentWords(tail.current)
          .filter((w) => !new Set(contentWords(live.slice(0, -1).map((s) => s.current).join(' '))).has(w));
        if (share >= 0.7 && fresh.length <= 2) {
          tail.removed = true;
          record(tail, ctx, 'restate.paragraph-echo', 'redundancy',
            'Removed a closing sentence that repeated the paragraph’s opening claim.',
            tail.current, '');
        }
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * Pass 4 — qualifier and intensifier padding, on a budget
 * ------------------------------------------------------------------ */

function passQualifiers(sentences, ctx) {
  const { strength, technical } = ctx;
  if (strength < 2) return;

  const live = sentences.filter((s) => !s.removed);
  let intensifierAllowance = Math.max(0, Math.ceil(live.length / 8) - (strength >= 4 ? 1 : 0));
  let softAllowance = strength >= 3 ? Math.max(1, Math.ceil(live.length / 6)) : Infinity;

  const strip = (s, word, reason) => {
    const { masked, vault } = mask(s.current, technical);
    // Only when the adverb modifies something, and never right after "not".
    const re = new RegExp(`(?<!\\bnot )\\b${word}\\b[,]?\\s+(?=[a-z])`, 'i');
    if (!re.test(masked)) return false;
    const before = s.current;
    const next = tidy(masked.replace(re, ''));
    if (!next || isMaskOnly(next)) return false;
    s.current = unmask(next, vault);
    record(s, ctx, `qualifier.${word}`, 'qualifier', reason, before, s.current);
    return true;
  };

  for (const s of live) {
    for (const word of INTENSIFIERS) {
      if (intensifierAllowance > 0) { if (new RegExp(`\\b${word}\\b`, 'i').test(s.current)) intensifierAllowance--; continue; }
      strip(s, word, `Removed “${word}” — it padded the sentence without changing the claim.`);
    }
  }

  for (const s of live) {
    for (const word of SOFT_QUALIFIERS) {
      if (technical && TECHNICAL_QUALIFIERS.has(word)) continue;
      if (softAllowance > 0) { if (new RegExp(`\\b${word}\\b`, 'i').test(s.current)) softAllowance--; continue; }
      strip(s, word, `Removed a repeated “${word}”.`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * Pass 5 — em-dashes, kept but rationed
 * ------------------------------------------------------------------ */

function passEmDashes(sentences, ctx) {
  const { strength } = ctx;
  if (strength < 2) return;

  const live = sentences.filter((s) => !s.removed);
  const total = live.reduce((n, s) => n + (s.current.match(/—/g) || []).length, 0);
  if (!total) return;

  const totalWords = live.reduce((n, s) => n + wordCount(s.current), 0);
  const allowance = Math.max(1, Math.round(totalWords / 180));
  if (total <= allowance) return;

  let kept = 0;
  for (const s of live) {
    let dashes = (s.current.match(/—/g) || []).length;
    while (dashes > 0) {
      if (kept < allowance) { kept++; dashes--; continue; }

      const before = s.current;
      let next = null;

      // A pair of dashes wrapping an aside becomes commas, or parentheses
      // when the aside already contains a comma.
      const paired = s.current.match(/\s*—\s*([^—]+?)\s*—\s*/);
      if (paired) {
        next = paired[1].includes(',')
          ? s.current.replace(paired[0], ` (${paired[1]}) `)
          : s.current.replace(paired[0], `, ${paired[1]}, `);
      } else {
        const single = s.current.match(/\s*—\s*/);
        if (single) {
          const idx = s.current.indexOf(single[0]);
          const right = s.current.slice(idx + single[0].length);
          // An independent clause on the right earns a full stop.
          const independent = /^(?:it|this|that|they|he|she|we|you|there|the\s+\w+|and)\s+\w+/i.test(right) && wordCount(right) >= 4;
          next = independent
            ? s.current.slice(0, idx) + '. ' + capitalise(right)
            : s.current.slice(0, idx) + ', ' + right;
        }
      }

      if (!next || next === before) break;
      s.current = tidy(next);
      record(s, ctx, 'dash.ration', 'punctuation',
        'Replaced an em-dash — the text had enough of them already.', before, s.current);
      dashes = (s.current.match(/—/g) || []).length;
    }
  }
}

/* ------------------------------------------------------------------ *
 * Pass 6 — the three-item list habit
 * ------------------------------------------------------------------ */

const TRIPLE_RE = /\b([A-Za-z][\w'’-]*(?:\s[\w'’-]+)?),\s+([A-Za-z][\w'’-]*(?:\s[\w'’-]+)?),?\s+and\s+([A-Za-z][\w'’-]*(?:\s[\w'’-]+)?)\b/;

function passTriples(sentences, ctx) {
  const { strength, technical } = ctx;
  if (strength < 3 || technical) return;

  const live = sentences.filter((s) => !s.removed);
  const hits = live.filter((s) => TRIPLE_RE.test(s.current));
  if (hits.length < 3) {
    if (hits.length === 2) ctx.notes.push('Two three-item lists appeared. That is a normal rhythm, so both were left alone.');
    return;
  }

  // The first two read as style. Past that it is a tic.
  hits.slice(2).forEach((s) => {
    const m = s.current.match(TRIPLE_RE);
    if (!m) return;
    const before = s.current;
    s.current = tidy(s.current.replace(m[0], `${m[1]} and ${m[2]}`));
    record(s, ctx, 'triple.trim', 'rhythm',
      `Trimmed a three-item list to two — the text used the same “A, B, and C” rhythm ${hits.length} times.`,
      before, s.current);
  });
}

/* ------------------------------------------------------------------ *
 * Pass 7 — repeated rhetorical contrast
 * ------------------------------------------------------------------ */

function passContrast(sentences, ctx) {
  const { strength } = ctx;
  if (strength < 2) return;

  const live = sentences.filter((s) => !s.removed);
  const matches = live.filter((s) => CONTRAST.some((r) => r.apply(s.current) !== null));
  if (matches.length < 2) return; // once is a stylistic choice, not a habit

  matches.slice(1).forEach((s) => {
    for (const rule of CONTRAST) {
      if (strength < rule.minStrength) continue;
      const next = rule.apply(s.current);
      if (next === null) continue;
      const before = s.current;
      s.current = tidy(next);
      record(s, ctx, rule.id, 'contrast', rule.reason, before, s.current);
      break;
    }
  });
}

/* ------------------------------------------------------------------ *
 * Pass 8 — sentence length variation
 *
 * Only runs when the sentences really are uniform. The fix is splitting
 * a long compound sentence, which is safe; nothing here invents or
 * merges clauses, because that is where meaning gets lost.
 * ------------------------------------------------------------------ */

function passVariation(sentences, ctx) {
  const { strength, modeCfg, voice, preserveVoice } = ctx;
  if (!modeCfg.splitting || strength < 3) return;
  if (preserveVoice && voice.avgSentenceLength > 22) {
    ctx.notes.push('Left the long sentences alone: the original averages ' + voice.avgSentenceLength + ' words per sentence, and “Preserve my writing style” is on.');
    return;
  }

  const live = sentences.filter((s) => !s.removed);
  if (live.length < 5) return;

  const lengths = live.map((s) => wordCount(s.current));
  const cv = mean(lengths) ? stdev(lengths) / mean(lengths) : 1;
  if (cv >= 0.35) return;

  ctx.notes.push(`Sentence lengths were unusually uniform (variation ${cv.toFixed(2)}, where about 0.5 is typical of human prose).`);

  const budget = Math.max(1, Math.floor(live.length / 6));
  let spent = 0;

  for (const s of live) {
    if (spent >= budget) break;
    if (wordCount(s.current) < 22) continue;
    const m = s.current.match(/^(.{40,}?[a-z0-9)]),\s+(?:and|but|so)\s+((?:it|this|that|they|we|the|there)\s+.{15,})$/i);
    if (!m) continue;
    const before = s.current;
    s.current = `${m[1]}. ${capitalise(m[2])}`;
    record(s, ctx, 'variation.split', 'rhythm',
      'Split a long compound sentence so the paragraph is not all one length.', before, s.current);
    spent++;
  }

  if (!spent) ctx.notes.push('No sentence could be split without rewording it, so the uniform rhythm was left as it is.');
}

/* ------------------------------------------------------------------ *
 * Pass 9 — contractions
 * ------------------------------------------------------------------ */

function passContractions(sentences, ctx) {
  const { modeCfg, preserveVoice, voice, technical } = ctx;

  let add = modeCfg.contractions === 'add';
  if (preserveVoice) {
    // The author's own habit wins over the mode.
    add = voice.usesContractions && modeCfg.contractions !== 'never';
    if (!voice.usesContractions && modeCfg.contractions === 'add') {
      ctx.notes.push('Did not add contractions: the original text uses none, and “Preserve my writing style” is on.');
    }
  }
  if (!add) return;

  for (const s of sentences) {
    if (s.removed) continue;
    const { masked, vault } = mask(s.current, technical);
    let working = masked;
    for (const [re, rep] of CONTRACTIONS) {
      working = working.replace(re, (m) => (/^[A-Z]/.test(m) ? rep[0].toUpperCase() + rep.slice(1) : rep));
    }
    if (working === masked) continue;
    const before = s.current;
    s.current = unmask(working, vault);
    record(s, ctx, 'voice.contractions', 'voice',
      'Used contractions, which is how people actually write.', before, s.current);
  }
}

/* ------------------------------------------------------------------ *
 * Block-level passes — conclusions, headings, bullet lists
 * ------------------------------------------------------------------ */

function passClosings(blocks, sentences, ctx) {
  const { strength } = ctx;
  const paraIdx = blocks.map((b, i) => (b.type === 'paragraph' ? i : -1)).filter((i) => i >= 0);
  if (!paraIdx.length) return;
  const lastIdx = paraIdx[paraIdx.length - 1];

  // Closing clichés only make sense to strip in the closing paragraph.
  for (const s of sentences) {
    if (s.removed || s.blockIndex !== lastIdx) continue;
    const { masked, vault } = mask(s.current, ctx.technical);
    let working = masked;
    for (const rule of CLOSINGS) {
      if (strength < rule.minStrength) continue;
      const next = rule.apply(working);
      if (next === null) continue;
      const cleaned = tidy(next);
      if (!cleaned || isMaskOnly(cleaned)) continue;
      const before = unmask(working, vault);
      working = cleaned;
      record(s, ctx, rule.id, 'closing', rule.reason, before, unmask(working, vault));
    }
    s.current = unmask(working, vault);
  }

  // A whole closing paragraph that only restates the piece.
  if (!ctx.modeCfg.structural || strength < 3 || paraIdx.length < 3) return;
  const closing = sentences.filter((s) => s.blockIndex === lastIdx && !s.removed);
  if (!closing.length || closing.length > 4) return;

  const earlier = sentences.filter((s) => s.blockIndex !== lastIdx && !s.removed).map((s) => s.current).join(' ');
  const closingText = closing.map((s) => s.current).join(' ');
  const share = overlap(earlier, closingText);
  const earlierSet = new Set(contentWords(earlier));
  const fresh = [...new Set(contentWords(closingText))].filter((w) => !earlierSet.has(w));

  if (share >= 0.8 && fresh.length <= 3) {
    closing.forEach((s) => { s.removed = true; });
    record(closing[0], ctx, 'closing.paragraph', 'redundancy',
      'Removed the closing paragraph: it restated points already made and introduced nothing new.',
      closingText, '');
  }
}

function passHeadings(blocks, sentences, ctx) {
  const { strength, modeCfg } = ctx;
  const headings = blocks.filter((b) => b.type === 'heading');
  if (headings.length < 3) return;

  const wordsPerSection = wordCount(blocks.filter((b) => b.type === 'paragraph').map((b) => b.text).join(' ')) / headings.length;
  if (wordsPerSection < 30) {
    ctx.notes.push(`There are ${headings.length} headings for about ${Math.round(wordsPerSection)} words of prose each. That much signposting makes writing feel fragmented; consider merging some sections.`);
  }
  if (!modeCfg.structural || strength < 3) return;

  // A heading that the following sentence immediately repeats is dead weight.
  blocks.forEach((b, i) => {
    if (b.type !== 'heading') return;
    const next = sentences.find((s) => s.blockIndex > i && !s.removed);
    if (!next || next.blockIndex > i + 2) return;
    const hw = contentWords(b.text);
    if (!hw.length) return;
    const nextSet = new Set(contentWords(next.current));
    if (hw.every((w) => nextSet.has(w))) {
      b.removed = true;
      ctx.changes.push({
        id: `c${ctx.changes.length}`, sentenceId: null, ruleId: 'heading.redundant',
        category: 'structure', reason: 'Removed a heading that the sentence below it repeated word for word.',
        before: `${b.marker} ${b.text}`, after: '', kind: 'removal'
      });
    }
  });
}

function passLists(blocks, sentences, ctx) {
  const { strength, modeCfg, technical } = ctx;
  if (!modeCfg.structural || strength < 3 || technical) return;

  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type !== 'list' || blocks[i].removed) continue;
    const runStart = i;
    let j = i;
    while (j < blocks.length && blocks[j].type === 'list' && !blocks[j].removed) j++;
    const run = blocks.slice(runStart, j);
    i = j - 1;
    if (run.length < 3) continue;

    // Only fragments convert cleanly. Full sentences belong in a list.
    const allFragments = run.every((b) => wordCount(b.text) <= 9 && !/[.!?]$/.test(b.text));
    if (!allFragments) continue;

    // The list needs a lead-in to attach to, or converting it would mean
    // inventing a sentence that the author never wrote.
    let leadBlockIndex = -1;
    for (let k = runStart - 1; k >= 0; k--) {
      if (blocks[k].type === 'blank') continue;
      if (blocks[k].type === 'paragraph' && !blocks[k].removed) leadBlockIndex = k;
      break;
    }
    const leadSentences = leadBlockIndex >= 0
      ? sentences.filter((s2) => s2.blockIndex === leadBlockIndex && !s2.removed)
      : [];
    const lead = leadSentences[leadSentences.length - 1];
    if (!lead || !/:\s*$/.test(lead.current)) {
      ctx.notes.push(`A ${run.length}-item bullet list of short fragments would read better as a sentence, but there is no lead-in ending in a colon for it to join, so it was left alone.`);
      continue;
    }

    const items = run.map((b) => lowerFirst(b.text.replace(/[.;,]$/, '')));
    const prose = `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
    const before = `${lead.current}\n` + run.map((b) => `${b.marker} ${b.text}`).join('\n');

    const after = `${lead.current.replace(/\s*:\s*$/, '')} ${prose}.`;
    record(lead, ctx, 'list.to-prose', 'structure',
      `Folded a ${run.length}-item list of short fragments into the sentence that introduced it.`,
      before, after);
    lead.current = after;
    run.forEach((b) => { b.removed = true; });
  }
}

/* ------------------------------------------------------------------ *
 * Observations that are reported rather than edited
 * ------------------------------------------------------------------ */

function collectNotes(sentences, ctx) {
  const live = sentences.filter((s) => !s.removed);
  if (live.length < 4) return;

  // Repeated sentence openings. Fixing these means rewriting a clause,
  // which risks the meaning, so the engine points them out instead.
  const openings = {};
  for (const s of live) {
    const w = (s.original.match(/^[A-Za-z'’]+/) || [''])[0].toLowerCase();
    if (!w) continue;
    openings[w] = (openings[w] || 0) + 1;
  }
  for (const [w, n] of Object.entries(openings)) {
    if (n >= 3 && n / live.length > 0.25) {
      ctx.notes.push(`${n} of ${live.length} sentences open with “${w}”. Varying a couple of those would help, but it needs a human rewrite rather than a substitution.`);
    }
  }

  // Content words leaned on hard, excluding the subject matter itself.
  const freq = {};
  for (const s of live) for (const w of contentWords(s.original)) freq[w] = (freq[w] || 0) + 1;
  const heavy = Object.entries(freq)
    .filter(([w, n]) => n >= 4 && n / live.length > 0.5 && w.length > 4)
    .sort((a, b) => b[1] - a[1]).slice(0, 3);
  for (const [w, n] of heavy) {
    ctx.notes.push(`“${w}” appears ${n} times. If it is the subject, that is fine; if it is a filler adjective, a different word would read better.`);
  }
}

/* ------------------------------------------------------------------ *
 * Orchestration
 * ------------------------------------------------------------------ */

export function naturalize(text, options = {}) {
  const mode = MODES[options.mode] ? options.mode : 'natural';
  const modeCfg = MODES[mode];
  const requested = Math.min(5, Math.max(1, Math.round(options.strength ?? 3)));
  const strength = Math.min(requested, modeCfg.capStrength);
  const technical = !!options.technical;
  const preserveVoice = !!options.preserveVoice;

  const source = String(text ?? '');
  const voice = analyseVoice(source);

  const ctx = {
    mode, modeCfg, strength, requestedStrength: requested,
    technical, preserveVoice, voice,
    changes: [], notes: []
  };

  if (!source.trim()) {
    return { text: '', changes: [], notes: [], sentences: [], voice, mode, strength, capped: false };
  }

  const blocks = splitBlocks(source);
  const sentences = buildSentences(blocks);

  passSentenceRules(sentences, ctx);
  passTransitions(sentences, ctx);
  passRestatement(sentences, ctx);
  passClosings(blocks, sentences, ctx);
  passContrast(sentences, ctx);
  passQualifiers(sentences, ctx);
  passEmDashes(sentences, ctx);
  passTriples(sentences, ctx);
  passVariation(sentences, ctx);
  passContractions(sentences, ctx);
  passHeadings(blocks, sentences, ctx);
  passLists(blocks, sentences, ctx);
  collectNotes(sentences, ctx);

  if (technical) {
    ctx.notes.push('Technical mode was on: equations, units, variable names, standards, citations and acronyms were masked before any rule ran, and the rules that trade precision for plainness were switched off.');
  }
  if (requested > strength) {
    ctx.notes.push(`${modeCfg.label} mode caps the rewrite strength at ${strength}, so the slider setting of ${requested} was reduced.`);
  }

  const outline = blocks.map((b, i) => ({
    index: i, type: b.type, marker: b.marker ?? '', indent: b.indent ?? '',
    level: b.level ?? 0, removed: !!b.removed,
    text: b.type === 'paragraph' || b.type === 'list' ? '' : b.text,
    sentenceIds: sentences.filter((s2) => s2.blockIndex === i).map((s2) => s2.id)
  }));

  const result = {
    text: '',
    blocks: outline,
    changes: ctx.changes,
    notes: [...new Set(ctx.notes)],
    sentences: sentences.map((s) => ({
      id: s.id, original: s.original, rewritten: s.removed ? '' : s.current,
      removed: s.removed, changed: s.removed || s.current !== s.original,
      reasons: s.changes.map((c) => c.reason), blockIndex: s.blockIndex
    })),
    voice, mode, strength, requestedStrength: requested,
    capped: requested > strength
  };

  result.text = compose(result);
  return result;
}

/**
 * Rebuild the output text from the block outline and the current state of
 * each sentence. `overrides` maps a sentence id to replacement text, which
 * is how the per-sentence controls in the UI take effect without re-running
 * the whole document.
 */
export function compose(result, overrides) {
  const get = (id) => {
    if (overrides) {
      const o = overrides instanceof Map ? overrides.get(id) : overrides[id];
      if (o !== undefined) return o;
    }
    const s = result.sentences.find((x) => x.id === id);
    return s ? (s.removed ? '' : s.rewritten) : '';
  };

  const lines = [];
  for (const b of result.blocks) {
    if (b.removed) continue;
    if (b.sentenceIds.length) {
      const text = b.sentenceIds.map(get).map((t) => t.trim()).filter(Boolean).join(' ');
      if (!text) continue;
      if (b.type === 'list') lines.push(`${b.indent}${b.marker} ${text}`);
      else lines.push(text);
      continue;
    }
    switch (b.type) {
      case 'blank': lines.push(''); break;
      case 'heading': lines.push(`${b.marker} ${b.text}`); break;
      case 'quote': lines.push(`> ${b.text}`); break;
      default: if (b.text) lines.push(b.text);
    }
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Per-category counts, for the summary strip in the UI. */
export function summarise(result) {
  const byCategory = {};
  for (const c of result.changes) byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  return byCategory;
}
