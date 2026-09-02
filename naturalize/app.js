/*
 * app.js — DOM wiring only.
 *
 * All the judgement lives in src/engine.mjs. This file renders its output,
 * keeps the two panes in step, and lets you overrule the engine one
 * sentence at a time.
 */

import { naturalize, compose, MODES, STRENGTH_LABELS } from './src/engine.mjs';
import { diffWords, coalesce, retention, tokenize } from './src/diff.mjs';

const $ = (id) => document.getElementById(id);

const el = {
  input: $('input'), output: $('output'), run: $('run'), reset: $('reset'),
  copy: $('copy'), example: $('example'), theme: $('theme'),
  mode: $('mode'), modeBlurb: $('mode-blurb'), strength: $('strength'),
  strengthText: $('strength-text'), preserve: $('preserve'), technical: $('technical'),
  inCounts: $('in-counts'), outCounts: $('out-counts'), status: $('status'),
  tabOut: $('tab-out'), tabDiff: $('tab-diff'), diffKey: $('diff-key'),
  report: $('report'), whyBody: $('why-body'), whyPill: $('why-pill'),
  notesBox: $('notes-box'), notesList: $('notes-list'), notesPill: $('notes-pill'),
  voiceStats: $('voice-stats')
};

const state = {
  result: null,
  source: '',
  overrides: Object.create(null),
  tab: 'rewritten',
  menu: null
};

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

const CATEGORY_TITLES = {
  wordiness: 'Wordy phrasing',
  formality: 'Unnecessarily formal words',
  corporate: 'Corporate language',
  transition: 'Transitions',
  redundancy: 'Repetition and restatement',
  qualifier: 'Padding words',
  opening: 'Generic openings',
  closing: 'Generic conclusions',
  contrast: 'Rhetorical contrast',
  rhythm: 'Sentence rhythm',
  punctuation: 'Punctuation',
  structure: 'Structure',
  voice: 'Voice'
};

function counts(text) {
  const w = (String(text).trim().match(/\S+/g) || []).length;
  const c = String(text).length;
  return `${w.toLocaleString()} word${w === 1 ? '' : 's'} · ${c.toLocaleString()} character${c === 1 ? '' : 's'}`;
}

function readSettings() {
  return {
    mode: el.mode.value,
    strength: Number(el.strength.value),
    preserveVoice: el.preserve.checked,
    technical: el.technical.checked
  };
}

function currentText() {
  return state.result ? compose(state.result, state.overrides) : '';
}

function sentenceText(s) {
  const o = state.overrides[s.id];
  return o !== undefined ? o : (s.removed ? '' : s.rewritten);
}

function setStatus(html) {
  el.status.innerHTML = html;
}

/* ------------------------------------------------------------------ *
 * Rendering — rewritten view
 * ------------------------------------------------------------------ */

function renderOutput() {
  const r = state.result;
  el.output.className = 'surface';
  el.diffKey.hidden = true;

  if (!r) return;
  if (!currentText().trim()) {
    el.output.innerHTML = '<p class="empty">Every sentence was removed as redundant. Lower the rewrite strength to keep more of the original.</p>';
    return;
  }

  const byId = new Map(r.sentences.map((s) => [s.id, s]));
  const frag = document.createDocumentFragment();

  for (const block of r.blocks) {
    if (block.removed) continue;

    if (!block.sentenceIds.length) {
      if (block.type === 'blank') { frag.append(line('blank', '')); continue; }
      const cls = block.type === 'heading' ? 'heading' : block.type === 'quote' ? 'quote' : 'code';
      const text = block.type === 'heading' ? `${block.marker} ${block.text}`
        : block.type === 'quote' ? `> ${block.text}` : block.text;
      if (text) frag.append(line(cls, text));
      continue;
    }

    const parts = block.sentenceIds.map((id) => byId.get(id)).filter(Boolean)
      .map((s) => ({ s, text: sentenceText(s) })).filter((p) => p.text.trim());
    if (!parts.length) continue;

    const div = line(block.type === 'list' ? 'list' : 'para', '');
    if (block.type === 'list') div.append(document.createTextNode(`${block.indent}${block.marker} `));

    parts.forEach((p, i) => {
      const span = document.createElement('span');
      span.className = 'sent';
      span.dataset.id = p.s.id;
      const overridden = state.overrides[p.s.id] !== undefined;
      if (overridden && state.overrides[p.s.id] === p.s.original) span.classList.add('kept-original');
      else if (p.s.changed || overridden) span.classList.add('changed');
      if (span.classList.contains('changed') || span.classList.contains('kept-original')) {
        span.tabIndex = 0;
        span.setAttribute('role', 'button');
        span.title = 'Click to adjust this sentence';
      }
      span.textContent = p.text;
      div.append(span);
      if (i < parts.length - 1) div.append(document.createTextNode(' '));
    });

    frag.append(div);
  }

  el.output.replaceChildren(frag);
}

function line(cls, text) {
  const d = document.createElement('div');
  d.className = `ln ${cls}`;
  if (text) d.textContent = text;
  return d;
}

/* ------------------------------------------------------------------ *
 * Rendering — changes view
 * ------------------------------------------------------------------ */

function renderDiff() {
  const r = state.result;
  el.output.className = 'surface diff';
  el.diffKey.hidden = false;
  if (!r) return;

  const parts = coalesce(diffWords(state.source, currentText()));
  const frag = document.createDocumentFragment();
  let anyChange = false;

  for (const p of parts) {
    const text = p.tokens.join('');
    if (p.type === 'equal') { frag.append(document.createTextNode(text)); continue; }
    anyChange = true;
    const node = document.createElement(p.type === 'delete' ? 'del' : 'ins');
    node.textContent = text;
    frag.append(node);
    frag.append(document.createTextNode(' '));
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'ln';
  wrapper.append(frag);
  el.output.replaceChildren(wrapper);

  if (!anyChange) {
    el.output.replaceChildren(
      Object.assign(document.createElement('p'), {
        className: 'empty',
        textContent: 'Nothing changed. The engine judged this text natural enough to leave alone — raise the strength if you want it to push harder.'
      })
    );
  }
}

function renderView() {
  if (state.tab === 'diff') renderDiff(); else renderOutput();
  el.tabOut.setAttribute('aria-selected', String(state.tab !== 'diff'));
  el.tabDiff.setAttribute('aria-selected', String(state.tab === 'diff'));
  el.outCounts.textContent = counts(currentText());
}

/* ------------------------------------------------------------------ *
 * Rendering — the report
 * ------------------------------------------------------------------ */

function renderReport() {
  const r = state.result;
  el.report.hidden = false;

  // Grouped explanations.
  const groups = new Map();
  for (const c of r.changes) {
    if (!groups.has(c.category)) groups.set(c.category, []);
    groups.get(c.category).push(c);
  }

  el.whyPill.textContent = r.changes.length
    ? `${r.changes.length} change${r.changes.length === 1 ? '' : 's'}`
    : 'nothing needed changing';

  if (!r.changes.length) {
    el.whyBody.innerHTML = '<p class="empty" style="padding:12px 0">The engine found no formulaic patterns worth correcting at this strength. That is a real result, not a failure — text that already reads naturally should come back unchanged.</p>';
  } else {
    const frag = document.createDocumentFragment();
    for (const [cat, list] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
      const box = document.createElement('div');
      box.className = 'cat';
      const h = document.createElement('h4');
      h.textContent = `${CATEGORY_TITLES[cat] || cat} · ${list.length}`;
      box.append(h);

      const ul = document.createElement('ul');
      // Collapse identical reasons, but keep one worked example of each.
      const seen = new Map();
      for (const c of list) {
        if (!seen.has(c.reason)) seen.set(c.reason, { count: 0, sample: c });
        seen.get(c.reason).count++;
      }
      for (const [reason, { count, sample }] of seen) {
        const li = document.createElement('li');
        li.textContent = count > 1 ? `${reason} (${count}×)` : reason;
        if (sample.before) li.append(examplePair(sample));
        ul.append(li);
      }
      box.append(ul);
      frag.append(box);
    }
    el.whyBody.replaceChildren(frag);
  }

  // Observations the engine deliberately left alone.
  el.notesPill.textContent = r.notes.length ? `${r.notes.length}` : 'nothing flagged';
  el.notesList.replaceChildren(...r.notes.map((n) => {
    const li = document.createElement('li');
    li.textContent = n;
    return li;
  }));
  el.notesBox.hidden = !r.notes.length;

  // Measured facts about the original.
  const v = r.voice;
  const kept = Math.round(retention(state.source, currentText()) * 100);
  const stats = [
    [`${kept}%`, 'of the original wording kept'],
    [String(v.sentenceCount), 'sentences'],
    [String(v.avgSentenceLength), 'words per sentence, average'],
    [v.lengthVariation.toFixed(2), 'sentence-length variation'],
    [v.usesContractions ? 'yes' : 'no', 'uses contractions'],
    [v.firstPerson ? 'yes' : 'no', 'writes in first person']
  ];
  el.voiceStats.replaceChildren(...stats.map(([value, key]) => {
    const d = document.createElement('div');
    d.className = 'stat';
    d.innerHTML = `<div class="v"></div><div class="k"></div>`;
    d.querySelector('.v').textContent = value;
    d.querySelector('.k').textContent = key;
    return d;
  }));
}

/*
 * Show only the part of the sentence that actually moved, with a few
 * words of context either side. A word-level diff interleaves too much
 * here ("unlock see significant real value benefits"), so this collapses
 * the whole edited region into one deletion followed by one insertion.
 */
function examplePair(change) {
  const span = document.createElement('span');
  span.className = 'quote-pair';

  if (!change.after) {
    const del = document.createElement('del');
    del.textContent = truncate(change.before, 160);
    span.append(del);
    return span;
  }

  const CTX = 5; // words of context to keep beside the edit
  const before = tokenize(change.before);
  const after = tokenize(change.after);

  let head = 0;
  while (head < before.length && head < after.length && before[head] === after[head]) head++;
  let tail = 0;
  while (
    tail < before.length - head &&
    tail < after.length - head &&
    before[before.length - 1 - tail] === after[after.length - 1 - tail]
  ) tail++;

  const removed = before.slice(head, before.length - tail).join('').trim();
  const added = after.slice(head, after.length - tail).join('').trim();
  const leading = before.slice(0, head);
  const trailing = before.slice(before.length - tail);

  const lead = edge(leading, CTX, 'end');
  const trail = edge(trailing, CTX, 'start');

  if (countWords(leading) > CTX) span.append(document.createTextNode('…'));
  if (lead) span.append(document.createTextNode(lead));
  if (removed) {
    const del = document.createElement('del');
    del.textContent = truncate(removed, 90);
    span.append(del);
  }
  if (added) {
    span.append(document.createTextNode(' '));
    const ins = document.createElement('ins');
    ins.textContent = truncate(added, 90);
    span.append(ins);
  }
  if (trail) span.append(document.createTextNode(trail));
  if (countWords(trailing) > CTX) span.append(document.createTextNode('…'));

  return span;
}

function countWords(tokens) {
  return tokens.filter((t) => !/^\s+$/.test(t)).length;
}

/** The first or last `n` words of a token run, with their spacing intact. */
function edge(tokens, n, which) {
  const out = [];
  let seen = 0;
  const source = which === 'start' ? tokens : [...tokens].reverse();
  for (const tok of source) {
    if (!/^\s+$/.test(tok)) {
      if (seen === n) break;
      seen++;
    }
    out.push(tok);
  }
  const text = (which === 'start' ? out : out.reverse()).join('').trim();
  if (!text) return '';
  return which === 'start' ? ` ${text}` : `${text} `;
}

function truncate(s, n = 130) {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

/* ------------------------------------------------------------------ *
 * Running the engine
 * ------------------------------------------------------------------ */

function run() {
  const source = el.input.value;
  if (!source.trim()) {
    setStatus('Paste some text first.');
    el.input.focus();
    return;
  }

  const opts = readSettings();
  state.source = source;
  state.overrides = Object.create(null);
  state.result = naturalize(source, opts);

  renderView();
  renderReport();

  const r = state.result;
  const kept = Math.round(retention(source, r.text) * 100);
  const parts = [
    r.changes.length
      ? `<strong>${r.changes.length}</strong> change${r.changes.length === 1 ? '' : 's'} across ${new Set(r.changes.map((c) => c.category)).size} categor${new Set(r.changes.map((c) => c.category)).size === 1 ? 'y' : 'ies'}`
      : '<strong>No changes.</strong> The text already reads naturally at this strength',
    `${kept}% of the original wording kept`
  ];
  if (r.capped) parts.push(`strength capped at ${r.strength} by ${MODES[r.mode].label} mode`);
  setStatus(parts.join(' · '));
}

function reset() {
  el.input.value = '';
  state.result = null;
  state.source = '';
  state.overrides = Object.create(null);
  state.tab = 'rewritten';
  closeMenu();
  el.output.className = 'surface';
  el.diffKey.hidden = true;
  el.output.innerHTML = '<p class="empty">The rewrite will appear here. Highlighted sentences are ones the engine changed — click any of them to accept, revert or adjust that sentence on its own.</p>';
  el.report.hidden = true;
  setStatus('');
  updateCounts();
  renderView();
  el.input.focus();
}

/* ------------------------------------------------------------------ *
 * Per-sentence controls
 * ------------------------------------------------------------------ */

const SENTENCE_ACTIONS = [
  { key: 'original', label: 'Keep original', hint: 'Put this sentence back exactly as you wrote it.' },
  { key: 'rewrite', label: 'Use rewrite', hint: 'Take the engine’s version.' },
  { key: 'again', label: 'Rewrite again', hint: 'Re-run this sentence one strength step harder.' },
  { key: 'casual', label: 'Make more casual', hint: 'Re-run this sentence in Casual mode.' },
  { key: 'professional', label: 'Make more professional', hint: 'Re-run this sentence in Professional mode.' },
  { key: 'shorten', label: 'Shorten', hint: 'Re-run at maximum strength, which cuts the most padding.' },
  { key: 'expand', label: 'Expand slightly', hint: 'Re-run at the lightest strength, so more of your original wording comes back.' }
];

function applySentenceAction(sentence, key) {
  const opts = readSettings();
  const base = sentence.original;

  switch (key) {
    case 'original':
      return base;
    case 'rewrite':
      return sentence.removed ? '' : sentence.rewritten;
    case 'again':
      return naturalize(sentenceText(sentence) || base,
        { ...opts, strength: Math.min(5, opts.strength + 1) }).text;
    case 'casual':
      return naturalize(base, { ...opts, mode: 'casual' }).text;
    case 'professional':
      return naturalize(base, { ...opts, mode: 'professional' }).text;
    case 'shorten':
      return naturalize(base, { ...opts, strength: 5 }).text;
    case 'expand':
      return naturalize(base, { ...opts, strength: 1 }).text;
    default:
      return base;
  }
}

function openMenu(span) {
  closeMenu();
  const sentence = state.result?.sentences.find((s) => s.id === span.dataset.id);
  if (!sentence) return;

  const menu = document.createElement('div');
  menu.className = 'menu';
  menu.setAttribute('role', 'menu');

  const head = document.createElement('div');
  head.className = 'menu-head';
  head.textContent = sentence.reasons.length ? sentence.reasons[0] : 'This sentence';
  menu.append(head);

  for (const action of SENTENCE_ACTIONS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = action.label;
    b.title = action.hint;
    b.setAttribute('role', 'menuitem');

    const next = applySentenceAction(sentence, action.key);
    const current = sentenceText(sentence);
    // A control that would change nothing is shown, but disabled, so the
    // menu never lies about what it can do.
    if (next === current && action.key !== 'original') b.disabled = true;

    b.addEventListener('click', () => {
      const value = applySentenceAction(sentence, action.key);
      if (action.key === 'rewrite') delete state.overrides[sentence.id];
      else state.overrides[sentence.id] = value;
      closeMenu();
      renderView();
      const kept = Math.round(retention(state.source, currentText()) * 100);
      const n = Object.keys(state.overrides).length;
      setStatus(`${n} sentence${n === 1 ? '' : 's'} adjusted by hand · ${kept}% of the original wording kept`);
    });
    menu.append(b);
  }

  document.body.append(menu);
  const rect = span.getBoundingClientRect();
  const top = window.scrollY + rect.bottom + 6;
  const left = Math.min(
    window.scrollX + rect.left,
    window.scrollX + document.documentElement.clientWidth - menu.offsetWidth - 12
  );
  menu.style.top = `${top}px`;
  menu.style.left = `${Math.max(12, left)}px`;

  span.classList.add('active');
  state.menu = { menu, span };
  menu.querySelector('button:not([disabled])')?.focus();
}

function closeMenu() {
  if (!state.menu) return;
  state.menu.menu.remove();
  state.menu.span.classList.remove('active');
  state.menu = null;
}

/* ------------------------------------------------------------------ *
 * Wiring
 * ------------------------------------------------------------------ */

function updateCounts() {
  el.inCounts.textContent = counts(el.input.value);
  el.outCounts.textContent = counts(currentText());
}

function updateStrengthLabel() {
  const n = Number(el.strength.value);
  el.strengthText.textContent = `${n} — ${STRENGTH_LABELS[n]}`;
  const cap = MODES[el.mode.value].capStrength;
  el.strengthText.textContent += n > cap ? ` (capped at ${cap})` : '';
}

function updateModeBlurb() {
  el.modeBlurb.textContent = MODES[el.mode.value].blurb;
  updateStrengthLabel();
}

function saveSettings() {
  try {
    localStorage.setItem('nr.settings', JSON.stringify(readSettings()));
  } catch (e) { /* private browsing, or storage disabled */ }
}

function loadSettings() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('nr.settings') || 'null'); } catch (e) {}
  if (saved && MODES[saved.mode]) {
    el.mode.value = saved.mode;
    el.strength.value = String(Math.min(5, Math.max(1, saved.strength || 2)));
    el.preserve.checked = !!saved.preserveVoice;
    el.technical.checked = !!saved.technical;
  }
}

function setTheme(next) {
  document.documentElement.setAttribute('data-theme', next);
  el.theme.textContent = next === 'dark' ? 'Light' : 'Dark';
  try { localStorage.setItem('nr.theme', next); } catch (e) {}
}

/* Synchronised scrolling between the two panes. */
let syncing = false;
function syncScroll(from, to) {
  if (syncing) return;
  syncing = true;
  const range = from.scrollHeight - from.clientHeight;
  const ratio = range > 0 ? from.scrollTop / range : 0;
  to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
  requestAnimationFrame(() => { syncing = false; });
}

const EXAMPLE = `# Understanding Modern Data Pipelines

In today's rapidly evolving technological landscape, data pipelines play a crucial role in modern software engineering. It is important to note that organizations increasingly utilize comprehensive tooling in order to facilitate reliable data delivery.

Furthermore, a well-designed pipeline must be fast, reliable, and scalable. Moreover, it should leverage cutting-edge orchestration frameworks that seamlessly integrate with existing infrastructure. Additionally, teams that implement these solutions can unlock significant value across the entire organization.

The ingestion layer validates each incoming record against a schema. This means that the ingestion layer checks every record before it is stored. It's not just about correctness — it's about trust. Consequently, downstream consumers can rely on the data.

When it comes to monitoring, engineers should track three things:

- latency
- throughput
- error rate

Generally speaking, a pipeline that fails silently is significantly worse than one that fails loudly. It is essential to understand that observability is fundamentally a design concern rather than an operational afterthought.

In conclusion, data pipelines are crucial to modern engineering. By understanding these factors, teams can build systems that are fast, reliable, and scalable. As technology continues to evolve, well-designed pipelines will continue to play an important role in the years to come.`;

function init() {
  // Modes.
  for (const [key, cfg] of Object.entries(MODES)) {
    const o = document.createElement('option');
    o.value = key;
    o.textContent = cfg.label;
    el.mode.append(o);
  }
  el.mode.value = 'natural';
  el.strength.value = '2';

  loadSettings();
  updateModeBlurb();
  updateCounts();
  setTheme(document.documentElement.getAttribute('data-theme') || 'light');

  el.run.addEventListener('click', run);
  el.reset.addEventListener('click', reset);
  el.example.addEventListener('click', () => {
    el.input.value = EXAMPLE;
    updateCounts();
    run();
  });

  el.input.addEventListener('input', updateCounts);

  el.mode.addEventListener('change', () => { updateModeBlurb(); saveSettings(); if (state.result) run(); });
  el.strength.addEventListener('input', updateStrengthLabel);
  el.strength.addEventListener('change', () => { saveSettings(); if (state.result) run(); });
  for (const box of [el.preserve, el.technical]) {
    box.addEventListener('change', () => { saveSettings(); if (state.result) run(); });
  }

  el.tabOut.addEventListener('click', () => { state.tab = 'rewritten'; closeMenu(); renderView(); });
  el.tabDiff.addEventListener('click', () => { state.tab = 'diff'; closeMenu(); renderView(); });

  el.copy.addEventListener('click', async () => {
    const text = currentText();
    if (!text) { setStatus('There is nothing to copy yet.'); return; }
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // Clipboard API needs a secure context; fall back to a selection.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.append(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e2) { /* nothing else to try */ }
      ta.remove();
    }
    el.copy.textContent = 'Copied';
    setTimeout(() => { el.copy.textContent = 'Copy'; }, 1400);
  });

  el.theme.addEventListener('click', () => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // Per-sentence menu.
  el.output.addEventListener('click', (e) => {
    const span = e.target.closest('.sent.changed, .sent.kept-original');
    if (span) { e.stopPropagation(); openMenu(span); }
  });
  el.output.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const span = e.target.closest?.('.sent.changed, .sent.kept-original');
    if (span) { e.preventDefault(); openMenu(span); }
  });
  document.addEventListener('click', (e) => {
    if (state.menu && !state.menu.menu.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    // Ctrl/Cmd+Enter runs the rewrite from anywhere.
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  });
  window.addEventListener('resize', closeMenu);

  el.input.addEventListener('scroll', () => syncScroll(el.input, el.output));
  el.output.addEventListener('scroll', () => syncScroll(el.output, el.input));
}

init();
