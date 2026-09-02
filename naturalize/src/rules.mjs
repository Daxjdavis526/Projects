/*
 * rules.mjs — the sentence-level rewrite rules.
 *
 * Every rule is a small, auditable transformation with a stated reason.
 * A rule fires only when its `minStrength` is met, its category is enabled
 * for the current mode, and its pattern actually matches. Rules that would
 * change technical meaning declare `technicalSafe: false` and are skipped
 * whenever Technical mode is on.
 *
 * The governing principle is minimum necessary editing: a rule that is
 * unsure should decline. It is always better to leave a sentence alone
 * than to paraphrase it for the sake of looking busy.
 */

/** Build a rule that swaps one phrase for another, preserving capitalisation. */
function swap(id, category, pattern, replacement, reason, opts = {}) {
  return {
    id,
    category,
    reason,
    minStrength: opts.minStrength ?? 2,
    technicalSafe: opts.technicalSafe ?? true,
    skipModes: opts.skipModes ?? [],
    apply(sentence) {
      const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      let fired = false;
      const out = sentence.replace(re, (...args) => {
        const m = args[0];
        fired = true;
        const rep = typeof replacement === 'function'
          ? replacement(...args)
          : replacement.replace(/\$(\d)/g, (x, n) => args[Number(n)] ?? '');
        // Keep the original casing of the first letter.
        if (/^[A-Z]/.test(m) && /^[a-z]/.test(rep)) return rep[0].toUpperCase() + rep.slice(1);
        return rep;
      });
      return fired && out !== sentence ? out : null;
    }
  };
}

/** Build a rule that deletes a padding phrase and tidies what is left. */
function drop(id, category, pattern, reason, opts = {}) {
  return {
    ...swap(id, category, pattern, '', reason, opts),
    apply(sentence) {
      const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      if (!re.test(sentence)) return null;
      let out = sentence.replace(new RegExp(pattern.source, re.flags), '');
      out = tidy(out);
      return out && out !== sentence ? out : null;
    }
  };
}

/** Repair the spacing and capitalisation left behind by a deletion. */
export function tidy(s) {
  let out = s
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])\s*([,.;:])/g, '$2')
    .replace(/^[\s,;:]+/, '')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
  out = out.replace(/^(\s*["'“‘(\[]?)([a-z])/, (m, pre, c) => pre + c.toUpperCase());
  return out;
}

/* ------------------------------------------------------------------ *
 * Wordy phrases — safe at every strength, because the shorter form
 * means exactly the same thing.
 * ------------------------------------------------------------------ */

export const WORDY = [
  swap('wordy.in-order-to', 'wordiness', /\bin order to\b/gi, 'to', 'Shortened “in order to” to “to”.', { minStrength: 1 }),
  swap('wordy.in-order-for', 'wordiness', /\bin order for\b/gi, 'for', 'Shortened “in order for” to “for”.', { minStrength: 1 }),
  swap('wordy.due-to-fact', 'wordiness', /\bdue to the fact that\b/gi, 'because', 'Replaced “due to the fact that” with “because”.', { minStrength: 1 }),
  swap('wordy.owing-to-fact', 'wordiness', /\bowing to the fact that\b/gi, 'because', 'Replaced “owing to the fact that” with “because”.', { minStrength: 1 }),
  swap('wordy.despite-fact', 'wordiness', /\b(?:despite|in spite of) the fact that\b/gi, 'although', 'Replaced “despite the fact that” with “although”.', { minStrength: 1 }),
  swap('wordy.ability-to', 'wordiness', /\b(?:has|have) the ability to\b/gi, 'can', 'Replaced “has the ability to” with “can”.', { minStrength: 1 }),
  swap('wordy.capable-of', 'wordiness', /\bis capable of ([a-z]+)ing\b/gi, (m, v) => `can ${v}`, 'Replaced “is capable of …ing” with “can …”.', { minStrength: 2 }),
  swap('wordy.in-the-event', 'wordiness', /\bin the event that\b/gi, 'if', 'Replaced “in the event that” with “if”.', { minStrength: 1 }),
  swap('wordy.at-this-time', 'wordiness', /\bat this (?:point in time|moment in time)\b/gi, 'now', 'Replaced “at this point in time” with “now”.', { minStrength: 1 }),
  swap('wordy.for-purpose-of', 'wordiness', /\bfor the purpose of ([a-z]+)ing\b/gi, (m, v) => `to ${v}`, 'Replaced “for the purpose of …ing” with “to …”.', { minStrength: 1 }),
  swap('wordy.large-number', 'wordiness', /\ba (?:large|significant|substantial|considerable) number of\b/gi, 'many', 'Replaced “a large number of” with “many”.', { minStrength: 2 }),
  swap('wordy.majority', 'wordiness', /\bthe (?:vast )?majority of\b/gi, 'most', 'Replaced “the majority of” with “most”.', { minStrength: 2, technicalSafe: false }),
  swap('wordy.prior-to', 'wordiness', /\bprior to\b/gi, 'before', 'Replaced “prior to” with “before”.', { minStrength: 2, skipModes: ['academic'] }),
  swap('wordy.subsequent-to', 'wordiness', /\bsubsequent to\b/gi, 'after', 'Replaced “subsequent to” with “after”.', { minStrength: 2, skipModes: ['academic'] }),
  swap('wordy.in-the-near-future', 'wordiness', /\bin the near future\b/gi, 'soon', 'Replaced “in the near future” with “soon”.', { minStrength: 2 }),
  swap('wordy.with-regard-to', 'wordiness', /\bwith (?:regard|regards|respect) to\b/gi, 'about', 'Replaced “with regard to” with “about”.', { minStrength: 3, technicalSafe: false, skipModes: ['academic'] }),
  swap('wordy.serves-to', 'wordiness', /\bserves? to ([a-z]+)\b/gi, (m, v) => (/(?:s|sh|ch|x|z)$/.test(v) ? v + 'es' : v + 's'), 'Removed the empty “serves to”.', { minStrength: 3 }),
  swap('wordy.play-role', 'wordiness', /\b(play|plays|played) an? (?:important|crucial|vital|key|significant|critical|central) role in\b/gi, (m, v) => ({ play: 'matter for', plays: 'matters for', played: 'mattered for' }[v.toLowerCase()]), 'Rewrote the “plays an important role in” filler.', { minStrength: 3 }),
  swap('wordy.make-use-of', 'wordiness', /\bmakes? use of\b/gi, 'uses', 'Replaced “makes use of” with “uses”.', { minStrength: 2 }),
  swap('wordy.is-able-to', 'wordiness', /\b(?:is|are) able to\b/gi, 'can', 'Replaced “is able to” with “can”.', { minStrength: 2 }),
  swap('wordy.a-number-of', 'wordiness', /\ba number of\b/gi, 'several', 'Replaced the vague “a number of”.', { minStrength: 3, technicalSafe: false }),
  drop('wordy.note-that', 'wordiness', /\bit (?:is|should be) (?:important|worth|worth it|essential|useful|interesting) to (?:note|mention|remember|understand|point out) that\s*/gi, 'Removed “it is important to note that” — the sentence says it anyway.', { minStrength: 1 }),
  drop('wordy.goes-without-saying', 'wordiness', /\bit goes without saying that\s*/gi, 'Removed “it goes without saying that”.', { minStrength: 1 }),
  drop('wordy.needless-to-say', 'wordiness', /\bneedless to say,?\s*/gi, 'Removed “needless to say”.', { minStrength: 1 }),
  drop('wordy.as-mentioned', 'wordiness', /\bas (?:previously |already )?(?:mentioned|noted|stated|discussed)(?: above| earlier)?,\s*/gi, 'Removed a back-reference the reader does not need.', { minStrength: 2 })
];

/* ------------------------------------------------------------------ *
 * Formal word choices. These are replaced only when the plainer word
 * means the same thing. Several are genuine technical terms, so they
 * carry technicalSafe: false and sit out Technical mode.
 * ------------------------------------------------------------------ */

export const FORMAL = [
  swap('formal.utilize', 'formality', /\butiliz(e|es|ed|ing)\b/gi, (m, s) => ({ e: 'use', es: 'uses', ed: 'used', ing: 'using' }[s.toLowerCase()]), 'Replaced “utilize” with “use”.', { minStrength: 1 }),
  swap('formal.utilise', 'formality', /\butilis(e|es|ed|ing)\b/gi, (m, s) => ({ e: 'use', es: 'uses', ed: 'used', ing: 'using' }[s.toLowerCase()]), 'Replaced “utilise” with “use”.', { minStrength: 1 }),
  swap('formal.utilization', 'formality', /\butili[sz]ation\b/gi, 'use', 'Replaced “utilization” with “use”.', { minStrength: 2 }),
  swap('formal.commence', 'formality', /\bcommenc(e|es|ed|ing)\b/gi, (m, s) => ({ e: 'start', es: 'starts', ed: 'started', ing: 'starting' }[s.toLowerCase()]), 'Replaced “commence” with “start”.', { minStrength: 2 }),
  swap('formal.endeavor', 'formality', /\bendeavou?r to\b/gi, 'try to', 'Replaced “endeavour to” with “try to”.', { minStrength: 2 }),
  swap('formal.ascertain', 'formality', /\bascertain\b/gi, 'find out', 'Replaced “ascertain” with “find out”.', { minStrength: 2 }),
  swap('formal.numerous', 'formality', /\bnumerous\b/gi, 'many', 'Replaced “numerous” with “many”.', { minStrength: 3 }),
  swap('formal.myriad', 'formality', /\ba myriad of\b/gi, 'many', 'Replaced “a myriad of” with “many”.', { minStrength: 2 }),
  swap('formal.plethora', 'formality', /\ba plethora of\b/gi, 'plenty of', 'Replaced “a plethora of” with “plenty of”.', { minStrength: 2 }),
  swap('formal.delve', 'formality', /\bdelv(e|es|ed|ing) into\b/gi, (m, s) => ({ e: 'dig into', es: 'digs into', ed: 'dug into', ing: 'digging into' }[s.toLowerCase()]), 'Replaced “delve into”, a heavily overused verb.', { minStrength: 1 }),
  swap('formal.underscore', 'formality', /\bunderscor(e|es|ed|ing)\b/gi, (m, s) => ({ e: 'show', es: 'shows', ed: 'showed', ing: 'showing' }[s.toLowerCase()]), 'Replaced “underscore” with “show”.', { minStrength: 2 }),
  swap('formal.realm', 'formality', /\bthe realm of\b/gi, '', 'Removed “the realm of”.', { minStrength: 2 }),
  swap('formal.landscape', 'formality', /\bthe (?:ever-)?(?:rapidly |constantly )?(?:evolving |changing |shifting )?landscape of\b/gi, '', 'Removed the “landscape of” cliché.', { minStrength: 2 }),
  swap('formal.crucial', 'formality', /\bcrucial\b/gi, 'important', 'Replaced “crucial” with “important”.', { minStrength: 3 }),
  swap('formal.pivotal', 'formality', /\bpivotal\b/gi, 'key', 'Replaced “pivotal” with “key”.', { minStrength: 3 }),
  swap('formal.intricate', 'formality', /\bintricate\b/gi, 'complex', 'Replaced “intricate” with “complex”.', { minStrength: 3 }),
  swap('formal.multifaceted', 'formality', /\bmultifaceted\b/gi, 'complex', 'Replaced “multifaceted” with “complex”.', { minStrength: 2 }),
  swap('formal.comprehensive', 'formality', /\bcomprehensive\b/gi, 'thorough', 'Replaced “comprehensive” with “thorough”.', { minStrength: 4, technicalSafe: false, skipModes: ['academic'] }),
  swap('formal.robust', 'formality', /\brobust\b/gi, 'strong', 'Replaced “robust” with “strong”.', { minStrength: 4, technicalSafe: false, skipModes: ['academic'] }),
  swap('formal.leverage', 'formality', /\bleverag(e|es|ed|ing)\b/gi, (m, s) => ({ e: 'use', es: 'uses', ed: 'used', ing: 'using' }[s.toLowerCase()]), 'Replaced “leverage” with “use”.', { minStrength: 2, technicalSafe: false }),
  swap('formal.facilitate', 'formality', /\bfacilitat(e|es|ed|ing)\b/gi, (m, s) => ({ e: 'help', es: 'helps', ed: 'helped', ing: 'helping' }[s.toLowerCase()]), 'Replaced “facilitate” with “help”.', { minStrength: 3, technicalSafe: false }),
  swap('formal.demonstrate', 'formality', /\bdemonstrat(e|es|ed)\b that\b/gi, (m, s) => ({ e: 'show', es: 'shows', ed: 'showed' }[s.toLowerCase()]) + ' that', 'Replaced “demonstrates that” with “shows that”.', { minStrength: 4, technicalSafe: false, skipModes: ['academic'] })
];

/* ------------------------------------------------------------------ *
 * Corporate language.
 * ------------------------------------------------------------------ */

export const CORPORATE = [
  swap('corp.cutting-edge', 'corporate', /\b(?:cutting[- ]edge|state[- ]of[- ]the[- ]art|bleeding[- ]edge|next[- ]generation|best[- ]in[- ]class|world[- ]class),?\s+/gi, '', 'Removed a marketing adjective that adds no information.', { minStrength: 2 }),
  swap('corp.game-changing', 'corporate', /\b(?:game[- ]changing|transformative|revolutionary|groundbreaking|paradigm[- ]shifting),?\s+/gi, '', 'Removed a marketing adjective that adds no information.', { minStrength: 2 }),
  swap('corp.seamless', 'corporate', /\bseamless(?:ly)?,?\s+/gi, '', 'Removed “seamless”, a word that promises rather than describes.', { minStrength: 2, technicalSafe: false }),
  swap('corp.holistic', 'corporate', /\ba holistic approach to\b/gi, '', 'Removed “a holistic approach to”.', { minStrength: 2 }),
  swap('corp.powerful-solution', 'corporate', /\ba (?:powerful|comprehensive|complete) solution for\b/gi, 'a way to', 'Replaced marketing phrasing with plain description.', { minStrength: 2 }),
  swap('corp.drive-innovation', 'corporate', /\b(drive|drives|drove|driving) innovation\b/gi, (m, v) => ({ drive: 'lead to new ideas', drives: 'leads to new ideas', drove: 'led to new ideas', driving: 'leading to new ideas' }[v.toLowerCase()]), 'Replaced “drive innovation” with plain language.', { minStrength: 2 }),
  swap('corp.unlock-value', 'corporate', /\b(unlock|unlocks|unlocked|unlocking) (?:[a-z]+ )?(?:value|potential|opportunities)\b/gi, (m, v) => ({ unlock: 'see real benefits', unlocks: 'sees real benefits', unlocked: 'saw real benefits', unlocking: 'seeing real benefits' }[v.toLowerCase()]), 'Replaced “unlock value” with plain language.', { minStrength: 2 }),
  swap('corp.rapidly-evolving', 'corporate', /\b(?:in|within) (?:today'?s?|the) (?:rapidly |constantly |ever[- ])?(?:evolving|changing|shifting|fast[- ]paced|modern|digital) (?:[a-z]+ )?(?:world|landscape|environment|climate|environment|era|age|marketplace|industry),?\s*/gi, '', 'Removed the “in today’s rapidly evolving world” opener.', { minStrength: 1 }),
  swap('corp.move-needle', 'corporate', /\b(move|moves|moved|moving) the needle\b/gi, (m, v) => ({ move: 'make a difference', moves: 'makes a difference', moved: 'made a difference', moving: 'making a difference' }[v.toLowerCase()]), 'Replaced “move the needle” with plain language.', { minStrength: 2 }),
  swap('corp.synergy', 'corporate', /\bsynerg(?:y|ies)\b/gi, 'overlap', 'Replaced “synergy” with plain language.', { minStrength: 2 }),
  swap('corp.deep-dive', 'corporate', /\ba deep dive into\b/gi, 'a close look at', 'Replaced “deep dive” with plain language.', { minStrength: 2 })
];

/* ------------------------------------------------------------------ *
 * Generic openings and closings.
 * ------------------------------------------------------------------ */

export const OPENINGS = [
  swap('open.when-it-comes-to', 'opening', /^When it comes to\b/i, 'With', 'Rewrote the “when it comes to” opener.', { minStrength: 2 }),
  swap('open.one-of-the-most', 'opening', /\bOne of the most (?:important|significant|critical|essential) (?:aspects|factors|elements|parts|components) of\b/gi, 'A key part of', 'Tightened a generic “one of the most important aspects” opener.', { minStrength: 2 }),
  drop('open.essential-to-understand', 'opening', /^It is (?:essential|important|critical|vital|necessary) to (?:understand|realize|realise|recognize|recognise|remember)(?: that)?\s*/i, 'Removed “it is essential to understand that” and let the point stand on its own.', { minStrength: 1 }),
  swap('open.highlights-importance', 'opening', /^This (?:highlights|underscores|demonstrates|illustrates|emphasizes|emphasises|reflects) the (?:importance|significance|value|need) (?:of|for) (.+?)\.$/i, (m, x) => `That is why ${x} matters.`, 'Rewrote a “this highlights the importance of” sentence directly.', { minStrength: 3 }),
  swap('open.in-the-world-of', 'opening', /^In the world of\b/i, 'In', 'Trimmed the “in the world of” opener.', { minStrength: 2 }),
  swap('open.lets-dive', 'opening', /^Let'?s (?:dive into|take a look at|explore|unpack)\b/i, 'Here is', 'Rewrote a filler opener.', { minStrength: 2 })
];

export const CLOSINGS = [
  drop('close.in-conclusion', 'closing', /^(?:In conclusion|To conclude|In summary|To sum up|All in all|At the end of the day|In closing),?\s*/i, 'Removed a signposted conclusion.', { minStrength: 1 }),
  drop('close.ultimately', 'closing', /^(?:Ultimately|Overall|In essence|Essentially|Fundamentally),?\s+/i, 'Removed a summary adverb that added nothing.', { minStrength: 2 }),
  swap('close.by-understanding', 'closing', /^By (?:understanding|considering|examining) these (?:factors|elements|aspects|points),?\s*/i, '', 'Removed a formulaic closing lead-in.', { minStrength: 2 }),
  swap('close.continues-to-evolve', 'closing', /\bAs technology continues to (?:evolve|advance|develop),?\s*/gi, '', 'Removed the “as technology continues to evolve” cliché.', { minStrength: 1 }),
  swap('close.will-continue-to-play', 'closing', /\bwill continue to play an? (?:important|crucial|vital|key|significant) role\b(?: in [^.]*)?/gi, 'will keep mattering', 'Rewrote a formulaic forecast.', { minStrength: 2 }),
  swap('close.years-to-come', 'closing', /,?\s*(?:in|for) (?:the )?years to come\b/gi, '', 'Removed “in the years to come”.', { minStrength: 2 }),
  swap('close.only-time-will-tell', 'closing', /\bOnly time will tell\b[^.]*\./gi, '', 'Removed an empty closing flourish.', { minStrength: 2 })
];

/* ------------------------------------------------------------------ *
 * Qualifiers. Genuine hedges (may, might, likely, suggests,
 * approximately, appears) are never touched — removing them would make a
 * claim stronger than the author made it.
 * ------------------------------------------------------------------ */

export const HEDGES_TO_PRESERVE = /\b(?:may|might|could|likely|unlikely|suggests?|indicates?|appears?|seems?|approximately|roughly|about|estimated|probable|possibly)\b/i;

// Pure intensifiers: almost always removable.
export const INTENSIFIERS = [
  'very', 'really', 'quite', 'extremely', 'incredibly', 'truly', 'highly',
  'utterly', 'absolutely', 'entirely', 'completely', 'totally', 'simply',
  'actually', 'basically', 'essentially', 'fundamentally', 'literally',
  'certainly', 'undoubtedly', 'clearly', 'obviously', 'definitely'
];

// Softer qualifiers: removable when the document leans on them, but they
// sometimes carry real meaning, so they need a higher strength.
export const SOFT_QUALIFIERS = [
  'notably', 'particularly', 'significantly', 'relatively', 'arguably',
  'potentially', 'generally', 'typically', 'largely', 'somewhat',
  'considerably', 'substantially', 'remarkably', 'importantly'
];

export const QUALIFIER_PHRASES = [
  drop('qual.generally-speaking', 'qualifier', /^Generally speaking,\s*/i, 'Removed “generally speaking”.', { minStrength: 2 }),
  drop('qual.in-many-cases', 'qualifier', /^In many cases,\s*/i, 'Removed “in many cases”.', { minStrength: 3, technicalSafe: false }),
  drop('qual.that-said', 'qualifier', /^(?:With that (?:being )?said|That (?:being )?said),?\s*/i, 'Removed “that said”.', { minStrength: 2 }),
  drop('qual.it-can-be-argued', 'qualifier', /\bit (?:can|could) be argued that\s*/gi, 'Removed “it can be argued that”.', { minStrength: 3 }),
  drop('qual.in-terms-of', 'qualifier', /^In terms of\s+/i, 'Removed the vague “in terms of” opener.', { minStrength: 3, technicalSafe: false })
];

/* ------------------------------------------------------------------ *
 * Rhetorical contrast — the "not just X, it's Y" family. These read fine
 * once. The document pass only sends repeat offenders here.
 * ------------------------------------------------------------------ */

export const CONTRAST = [
  swap('contrast.not-just', 'contrast',
    /\bIt(?:'s| is|’s) not (?:just|merely|only) ([^—;,]+?)\s*[—;,-]\s*it(?:'s| is|’s) (.+?)\.$/i,
    (m, a, b) => `It is ${b}, not just ${a}.`,
    'Rewrote a repeated “it’s not just X — it’s Y” construction as plain prose.', { minStrength: 2 }),
  swap('contrast.this-isnt', 'contrast',
    /\bThis is(?:n(?:'|’)t| not) (?:just|merely|only) ([^—;,]+?)\s*[—;,-]\s*it(?:'s| is|’s) (.+?)\.$/i,
    (m, a, b) => `This is ${b}, not just ${a}.`,
    'Rewrote a repeated rhetorical contrast as plain prose.', { minStrength: 2 }),
  swap('contrast.key-isnt', 'contrast',
    /\bThe (key|point|question|issue|answer) is(?:n(?:'|’)t| not) ([^.]+?)\.\s*It(?:'s| is|’s) (.+?)\.$/i,
    (m, k, a, b) => `The ${k} is ${b}.`,
    'Collapsed a “the key isn’t X, it’s Y” pair into the point it was making.', { minStrength: 3 })
];

/* ------------------------------------------------------------------ *
 * Redundant restatement markers.
 * ------------------------------------------------------------------ */

export const RESTATEMENT_MARKER =
  /^(?:This means(?: that)?|In other words|Put (?:simply|another way)|Simply put|That is to say|What this means is(?: that)?|To put it (?:simply|another way))[,:]?\s*/i;

/* ------------------------------------------------------------------ *
 * Contractions, used only when the mode and the author's own habits
 * allow it.
 * ------------------------------------------------------------------ */

export const CONTRACTIONS = [
  [/\bit is\b/gi, "it's"], [/\bthat is\b/gi, "that's"], [/\bthere is\b/gi, "there's"],
  [/\bwhat is\b/gi, "what's"], [/\bhere is\b/gi, "here's"],
  [/\bdo not\b/gi, "don't"], [/\bdoes not\b/gi, "doesn't"], [/\bdid not\b/gi, "didn't"],
  [/\bis not\b/gi, "isn't"], [/\bare not\b/gi, "aren't"],
  [/\bwas not\b/gi, "wasn't"], [/\bwere not\b/gi, "weren't"],
  [/\bcannot\b/gi, "can't"], [/\bcan not\b/gi, "can't"],
  [/\bwill not\b/gi, "won't"], [/\bwould not\b/gi, "wouldn't"],
  [/\bshould not\b/gi, "shouldn't"], [/\bcould not\b/gi, "couldn't"],
  [/\bhave not\b/gi, "haven't"], [/\bhas not\b/gi, "hasn't"],
  [/\byou are\b/gi, "you're"], [/\bwe are\b/gi, "we're"], [/\bthey are\b/gi, "they're"],
  [/\bwe will\b/gi, "we'll"], [/\byou will\b/gi, "you'll"], [/\bthey will\b/gi, "they'll"],
  [/\bwe have\b/gi, "we've"], [/\byou have\b/gi, "you've"], [/\bthey have\b/gi, "they've"]
];

/* ------------------------------------------------------------------ *
 * Transition vocabulary, grouped by how much meaning each group carries.
 * Additive transitions are usually pure padding. Causal ones carry an
 * argument. Contrastive ones almost always earn their place.
 * ------------------------------------------------------------------ */

export const TRANSITIONS = {
  additive: ['Furthermore', 'Moreover', 'Additionally', 'In addition', 'What is more', "What's more", 'Also', 'Further'],
  causal: ['Therefore', 'Thus', 'Hence', 'Consequently', 'As a result', 'Accordingly', 'For this reason'],
  contrastive: ['However', 'Nevertheless', 'Nonetheless', 'Conversely', 'On the other hand', 'That being said'],
  summative: ['Ultimately', 'Overall', 'In conclusion', 'In summary', 'To sum up', 'All in all', 'In essence']
};

// Plainer stand-ins used when a transition is worth keeping but the
// formal form has already appeared.
export const TRANSITION_PLAIN = {
  Furthermore: 'And', Moreover: 'And', Additionally: 'And', 'In addition': 'And',
  Nevertheless: 'Still', Nonetheless: 'Still', Consequently: 'So', Therefore: 'So',
  Thus: 'So', Hence: 'So', Accordingly: 'So', 'As a result': 'So'
};

export const ALL_SENTENCE_RULES = [
  ...WORDY, ...FORMAL, ...CORPORATE, ...OPENINGS, ...QUALIFIER_PHRASES
];
