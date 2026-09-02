/*
 * text.mjs — segmentation, masking and small linguistic helpers.
 *
 * Nothing here knows about the DOM. Everything is a pure function over
 * strings so the whole rewriting engine can be exercised from node.
 */

/* ------------------------------------------------------------------ *
 * Block segmentation
 * ------------------------------------------------------------------ */

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const BULLET_RE = /^(\s*)([-*+•])\s+(.*)$/;
const NUMBERED_RE = /^(\s*)(\d+[.)])\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const FENCE_RE = /^\s*(```|~~~)/;

/**
 * Split a document into typed blocks. Paragraphs are joined from
 * consecutive non-blank lines; every other kind of line keeps its own
 * block so that structure survives a round trip.
 */
export function splitBlocks(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let para = null;
  let fence = null;

  const flush = () => {
    if (para) {
      blocks.push({ type: 'paragraph', text: para.join(' ').trim() });
      para = null;
    }
  };

  for (const line of lines) {
    if (fence !== null) {
      blocks[blocks.length - 1].text += '\n' + line;
      if (FENCE_RE.test(line)) fence = null;
      continue;
    }
    if (FENCE_RE.test(line)) {
      flush();
      blocks.push({ type: 'code', text: line });
      fence = line.match(FENCE_RE)[1];
      continue;
    }
    if (!line.trim()) {
      flush();
      blocks.push({ type: 'blank', text: '' });
      continue;
    }
    let m;
    if ((m = line.match(HEADING_RE))) {
      flush();
      blocks.push({ type: 'heading', text: m[2].trim(), level: m[1].length, marker: m[1] });
      continue;
    }
    if ((m = line.match(BULLET_RE))) {
      flush();
      blocks.push({ type: 'list', text: m[3].trim(), indent: m[1], marker: m[2], ordered: false });
      continue;
    }
    if ((m = line.match(NUMBERED_RE))) {
      flush();
      blocks.push({ type: 'list', text: m[3].trim(), indent: m[1], marker: m[2], ordered: true });
      continue;
    }
    if ((m = line.match(QUOTE_RE))) {
      flush();
      blocks.push({ type: 'quote', text: m[1].trim() });
      continue;
    }
    (para || (para = [])).push(line.trim());
  }
  flush();

  // Trailing blanks carry no information.
  while (blocks.length && blocks[blocks.length - 1].type === 'blank') blocks.pop();
  return blocks;
}

/** Re-emit blocks as text, restoring the markers they were parsed from. */
export function joinBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.removed) continue;
    switch (b.type) {
      case 'blank': out.push(''); break;
      case 'heading': out.push(`${b.marker} ${b.text}`); break;
      case 'list': out.push(`${b.indent}${b.marker} ${b.text}`); break;
      case 'quote': out.push(`> ${b.text}`); break;
      default: out.push(b.text);
    }
  }
  // Collapse runs of blank lines created by removed blocks.
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* ------------------------------------------------------------------ *
 * Sentence segmentation
 * ------------------------------------------------------------------ */

// Abbreviations that end in a period without ending a sentence.
const ABBREV = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'mt',
  'vs', 'etc', 'eg', 'ie', 'al', 'fig', 'figs', 'eq', 'eqs', 'ref', 'refs',
  'approx', 'est', 'no', 'vol', 'ch', 'pp', 'ed', 'eds', 'inc', 'ltd', 'co',
  'dept', 'univ', 'min', 'max', 'avg', 'std', 'temp', 'sec', 'cf'
]);

/**
 * Split a paragraph into sentences. Deliberately conservative: when a
 * boundary is ambiguous we keep the text together rather than cutting a
 * sentence in half, because every downstream rule assumes its input is a
 * grammatical unit.
 */
export function splitSentences(text) {
  const s = String(text);
  const out = [];
  let start = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch !== '.' && ch !== '!' && ch !== '?') continue;

    // Consume any run of terminators plus trailing quotes/brackets.
    let end = i;
    while (end + 1 < s.length && '.!?'.includes(s[end + 1])) end++;
    while (end + 1 < s.length && `"'”’)]`.includes(s[end + 1])) end++;

    const after = s.slice(end + 1);
    if (!/^\s/.test(after) && after !== '') { i = end; continue; }
    if (!/^\s+["'“‘(\[]?[A-Z0-9]/.test(after) && after.trim() !== '') { i = end; continue; }

    const before = s.slice(start, i);
    const lastWord = (before.match(/([A-Za-z]+)$/) || [])[1];
    if (ch === '.' && lastWord) {
      if (ABBREV.has(lastWord.toLowerCase())) { i = end; continue; }
      // Single initial, as in "J. Smith", or an acronym like "U.S."
      if (lastWord.length === 1 && /[A-Z]/.test(lastWord)) { i = end; continue; }
    }
    // A decimal point inside a number.
    if (ch === '.' && /\d$/.test(before) && /^\s*\d/.test(after)) { i = end; continue; }

    out.push(s.slice(start, end + 1).trim());
    start = end + 1;
    i = end;
  }

  const tail = s.slice(start).trim();
  if (tail) out.push(tail);
  return out.filter(Boolean);
}

/* ------------------------------------------------------------------ *
 * Masking
 * ------------------------------------------------------------------ */

const OPEN = '';
const CLOSE = '';

/**
 * Hide spans that must survive rewriting untouched, replacing each with a
 * private-use sentinel. Regex rules then run over text that cannot
 * accidentally reach inside a quotation, an equation or a part number.
 */
export function mask(text, technical) {
  const vault = [];
  let s = String(text);

  const hide = (re) => {
    s = s.replace(re, (m) => {
      vault.push(m);
      return OPEN + (vault.length - 1) + CLOSE;
    });
  };

  hide(/`[^`\n]*`/g);                                   // inline code
  hide(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g);                // TeX math
  hide(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g);           // TeX math, alt form
  hide(/"[^"\n]{2,}"|“[^”\n]{2,}”/g);                   // quotations
  hide(/\[\d+(?:\s*[,–-]\s*\d+)*\]/g);                  // [12], [3-5]
  hide(/\((?:[A-Z][A-Za-z'’-]+(?:\s+(?:et al\.?|and|&)\s+[A-Z][A-Za-z'’-]+)?,\s*)?\d{4}[a-z]?\)/g); // (Smith, 2020)
  hide(/\bhttps?:\/\/\S+/g);                            // URLs
  hide(/\b\d+(?:\.\d+)?(?:\s?[×x]\s?10\^?-?\d+)?\s?(?:[A-Za-zµΩ°%]+(?:\/[A-Za-z]+)?)?\b/g); // numbers + units

  if (technical) {
    hide(/\b(?:ISO|ASTM|ANSI|IEEE|MIL-STD|DIN|EN|SAE|NIST|RFC)[\s-]?[A-Z0-9-]+\b/g); // standards
    hide(/\b[A-Z]{2,}(?:-[A-Z0-9]+)*\b/g);              // acronyms, part codes
    hide(/\b[A-Za-z]+[-_][A-Za-z0-9]+\b/g);             // hyphenated identifiers
    hide(/\b[a-zA-Z]_\{?[a-zA-Z0-9]+\}?\b/g);           // subscripted variables
  } else {
    hide(/\b[A-Z]{3,}\b/g);                             // acronyms
  }

  return { masked: s, vault };
}

export function unmask(text, vault) {
  let s = String(text);
  // Repeat because a masked span may itself contain a sentinel.
  for (let pass = 0; pass < 4 && s.includes(OPEN); pass++) {
    s = s.replace(new RegExp(OPEN + '(\\d+)' + CLOSE, 'g'), (m, i) => vault[Number(i)] ?? m);
  }
  return s;
}

export const SENTINEL = { OPEN, CLOSE };

/** True when the string contains nothing but sentinels and punctuation. */
export function isMaskOnly(s) {
  return !/[A-Za-z]/.test(s.replace(new RegExp(OPEN + '\\d+' + CLOSE, 'g'), ''));
}

/* ------------------------------------------------------------------ *
 * Word-level helpers
 * ------------------------------------------------------------------ */

export const STOPWORDS = new Set(`a an and are as at be been being but by can could did do does
for from had has have he her his how i if in into is it its of on or our she so than that the
their them then there these they this to was we were what when which who will with would you
your not no such may might been am every each all also only more most other same just about
over under through between during while where why any both few own too very same again further
here once because until against above below out off up down nor own now
before after into onto upon within without still even much many some via per`.split(/\s+/));

export function words(text) {
  return String(text).toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
}

export function contentWords(text) {
  return words(text).filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** Fraction of b's content words that also appear in a. */
export function overlap(a, b) {
  const A = new Set(contentWords(a));
  const B = contentWords(b);
  if (!B.length) return 0;
  let hits = 0;
  for (const w of B) if (A.has(w)) hits++;
  return hits / B.length;
}

export function wordCount(text) {
  const m = String(text).trim().match(/\S+/g);
  return m ? m.length : 0;
}

/** Capitalise the first letter, leaving the rest of the string alone. */
export function capitalise(s) {
  return s.replace(/^(\s*["'“‘(\[]?)([a-z])/, (m, pre, c) => pre + c.toUpperCase());
}

export function lowerFirst(s) {
  return s.replace(/^(\s*)([A-Z])(?![A-Z])/, (m, pre, c) => pre + c.toLowerCase());
}

export function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

export function stdev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}
