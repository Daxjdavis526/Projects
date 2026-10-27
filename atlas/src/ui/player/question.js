// One question, start to finish: prompt, optional visual, the answer control
// for its type, a hint ladder, grading with named slips, the one-line
// micro-teaching, the explanation, an expanded solution after an attempt,
// and a confidence check. Used by lessons, reviews, the daily challenge,
// boss battles and the diagnostic.

import { h, md, mdi, math, icon, tex, difficultyDots } from '../dom.js';
import { grade } from '../../core/check.js';
import { previewExpression } from '../../core/check.js';
import { parseQuantity, unitTeX } from '../../core/units.js';
import { app } from '../state.js';
import { mountViz } from '../../viz/registry.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const CONF = [['guess', 'Guessing'], ['unsure', 'Unsure'], ['sure', 'Sure']];

/**
 * @param {HTMLElement} el
 * @param {object} item  an instantiated item (content.instantiate)
 * @param {object} o     { context, assisted, maxTries, confidence, index, total, onResolved, onNext, nextLabel, label }
 * @returns {{ destroy(): void }}
 */
export function mountQuestion(el, item, o = {}) {
  const assisted = o.assisted !== false;                 // hints and retries allowed
  const maxTries = o.maxTries ?? (assisted ? Infinity : 1);
  const askConfidence = o.confidence ?? app.settings.confidence;
  const S = { tries: 0, hints: 0, solution: false, resolved: false, correct: false, confidence: null, value: null, lastResult: null };
  const destroyers = [];

  const head = h('div.q-head',
    h('span.qcount', o.label || (o.total ? `Question ${o.index + 1} of ${o.total}` : '')),
    difficultyDots(item.difficulty),
    item.kind === 'error' ? h('span.chip', 'Find the error') : null,
    item.transfer ? h('span.chip', 'New context') : null);
  const prompt = md(item.prompt, 'q-prompt');
  const visualBox = h('div.q-visual');
  const control = h('div.q-control');
  const hintsBox = h('div.hints');
  const feedbackBox = h('div');
  const actions = h('div.q-actions');
  el.append(h('div.question', head, prompt, visualBox, control, hintsBox, feedbackBox, actions));

  let vizCtl = null;
  if (item.visual) {
    mountViz(visualBox, item.visual, { compact: true, onChange: () => refreshValue() }).then((c) => { vizCtl = c; destroyers.push(() => c?.destroy?.()); refreshValue(); }).catch((e) => console.error(e));
  }

  // ── the answer control ────────────────────────────────────────────────
  const ctl = buildControl(item, control, () => refreshValue());
  function refreshValue() {
    S.value = ctl.value(vizCtl);
    checkBtn.disabled = S.resolved || S.value === null || S.value === undefined || S.value === '';
  }

  // ── buttons ───────────────────────────────────────────────────────────
  const checkBtn = h('button.btn.primary', { type: 'button', onclick: () => submit() }, 'Check');
  const hintBtn = h('button.btn', { type: 'button', onclick: () => nextHint(), html: `${icon('bulb')}Hint` });
  const solBtn = h('button.btn.ghost', { type: 'button', onclick: () => revealSolution() }, o.context === 'checkpoint' || o.context === 'boss' || o.context === 'diagnostic' ? 'I don’t know' : 'Show solution');
  const nextBtn = h('button.btn.primary', { type: 'button', onclick: () => o.onNext?.(S) }, o.nextLabel || 'Continue', h('span', { html: icon('right'), style: { display: 'inline-flex' } }));
  function paintActions() {
    actions.replaceChildren();
    if (!S.resolved) {
      actions.append(checkBtn);
      if (assisted && item.hints?.length && S.hints < item.hints.length) actions.append(hintBtn);
      actions.append(h('span.spacer'));
      if (assisted ? S.tries >= 1 : true) actions.append(solBtn);
    } else {
      actions.append(h('span.spacer'), nextBtn);
      if (item.regenerate && o.onAnother && !S.correct) actions.prepend(h('button.btn', { type: 'button', onclick: () => o.onAnother() }, 'Try a similar problem'));
    }
  }
  paintActions();
  refreshValue();

  function nextHint() {
    if (S.hints >= item.hints.length) return;
    const k = S.hints++;
    hintsBox.append(h('div.hint', h('b', `Hint ${k + 1} of ${item.hints.length}`), mdi(item.hints[k])));
    if (S.hints === 1) hintsBox.append(h('div.tiny.faint', 'Hints never cost XP. They just tell the Atlas to check this skill again soon.'));
    paintActions();
  }

  let running = false;
  async function submit() {
    if (S.resolved || running) return;
    let r;
    if (item.type === 'code') {
      // a program is graded by running it, which takes time: ask first, then run
      if (!String(S.value || '').trim()) { showInvalid('Write some code first.'); return; }
      if (askConfidence && S.tries === 0 && !S.confidence) S.confidence = await askSure();
      running = true; checkBtn.disabled = true; checkBtn.textContent = 'Running…';
      ctl.clearOutput?.();
      try {
        const { gradeCode } = await import('../../lab/grade-code.js');
        r = await gradeCode(item, S.value, { onOutput: (m) => ctl.output?.(m) });
      } finally { running = false; checkBtn.textContent = 'Check'; refreshValue(); }
      if (r.status === 'invalid') { showInvalid(r.feedback); return; }
    } else {
      r = grade(item, S.value);
      if (r.status === 'invalid') { showInvalid(r.feedback); return; }
      if (askConfidence && S.tries === 0 && !S.confidence) S.confidence = await askSure();
    }
    S.tries += 1;
    S.lastResult = r;
    ctl.mark?.(r, item);
    if (r.correct) { S.correct = true; resolve(); feedback(true, r); return; }
    if (S.tries >= maxTries) { resolve(); feedback(false, r, true); return; }
    feedback(false, r, false);
    paintActions();
  }

  function askSure() {
    return new Promise((res) => {
      const box = h('div.confidence', h('span', 'How sure are you?'),
        CONF.map(([k, label]) => h('button', { type: 'button', onclick: () => { box.remove(); res(k); } }, label)),
        h('span.tiny.faint', '— this never affects XP or mastery'));
      actions.before(box);
      box.querySelector('button')?.focus();
    });
  }

  function showInvalid(msg) {
    feedbackBox.replaceChildren(h('div.feedback.info', h('div.head', { html: `${icon('info')}Not quite readable` }), h('div', msg || 'Check the format of your answer.')));
  }

  function feedback(ok, r, final = false) {
    const parts = [];
    if (ok) {
      parts.push(h('div.head', { html: `${icon('check')}${S.hints || S.tries > 1 ? 'Correct' : pick(['Correct', 'Exactly right', 'That’s it'])}` }));
      if (r.feedback) parts.push(h('div.small', r.feedback));
    } else {
      // opening the solution is not a failure to scold: it gets a neutral heading
      parts.push(h('div.head', { html: S.solution ? `${icon('info')}Here’s how it goes` : `${icon('x')}${final ? 'Not this time' : 'Not quite'}` }));
      const msg = r.feedback || (item.type === 'mcq' ? '' : 'That doesn’t match. Check each step against the hint.');
      if (msg) parts.push(item.type === 'code' ? md(msg, 'small') : mdi(msg, 'small'));
      if (!final && assisted) parts.push(h('div.small.faint', { style: { marginTop: '.3rem' } }, item.hints?.length > S.hints ? 'Try again, or take a hint.' : 'Try again, or open the solution.'));
    }
    const box = h(`div.feedback.${ok ? 'good' : S.solution ? 'info' : 'bad'}`, parts);
    feedbackBox.replaceChildren(box);
    if (S.resolved) {
      if (item.teach) feedbackBox.append(h('div.teach', h('span', { html: icon('bulb') }), mdi(item.teach)));
      if (item.explain) feedbackBox.append(h('div.feedback.info', h('div.tiny.eyebrow', 'Why'), md(item.explain, 'small')));
      if (!ok && item.type !== 'mcq') feedbackBox.append(h('div.small.muted', { style: { marginTop: '.5rem' } }, item.type === 'code' ? 'One solution:' : 'Answer: ', answerText(item)));
      if (item.solution) feedbackBox.append(h('details.solution', { open: !ok && S.solution ? '' : null }, h('summary', 'Full solution'), md(item.solution, 'small')));
    } else if (!ok && item.teach && S.tries === 1) {
      feedbackBox.append(h('div.teach', h('span', { html: icon('bulb') }), mdi(item.teach)));
    }
    paintActions();
    (S.resolved ? nextBtn : checkBtn).focus({ preventScroll: true });
  }

  function revealSolution() {
    if (S.resolved) return;
    S.solution = true;
    resolve();
    ctl.reveal?.(item);
    // keep what the last attempt was told (an option's “why”, a named slip)
    const last = S.lastResult && !S.lastResult.correct ? S.lastResult.feedback || '' : '';
    feedback(false, { feedback: o.context === 'checkpoint' && !last ? 'Counted as not yet known — here is how it goes.' : last }, true);
  }

  function resolve() {
    S.resolved = true;
    ctl.lock?.();
    o.onResolved?.({ correct: S.correct, tries: S.tries, hints: S.hints, solution: S.solution, confidence: S.confidence });
  }

  // Enter submits; number keys pick choices
  const onKey = (e) => {
    if (e.target.closest?.('input, textarea, select') && e.key !== 'Enter') return;
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!S.resolved && !checkBtn.disabled && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); submit(); }
    } else if (/^[1-6]$/.test(e.key) && !S.resolved && ctl.pick) ctl.pick(+e.key - 1);
  };
  el.addEventListener('keydown', onKey);
  destroyers.push(() => el.removeEventListener('keydown', onKey));
  setTimeout(() => ctl.focus?.(), 30);

  return { destroy: () => destroyers.forEach((d) => { try { d(); } catch { /* ignore */ } }) };
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function answerText(item) {
  switch (item.type) {
    case 'numeric': return h('span', { html: tex(`${fmtNum(item.answer)}${item.units ? '\\;' + unitTeX(item.units) : ''}`) });
    case 'expression': return item.answerTeX ? math(item.answerTeX) : h('span', { html: tex(previewExpression(item.answer, item.vars).tex || item.answer) });
    case 'mcq': return mdi(item.choices[item.answer]);
    case 'multi': return h('span', item.answer.map((i, k) => [k ? '; ' : '', mdi(item.choices[i])]));
    case 'order': return h('ol.small', { style: { margin: '.3rem 0 0', paddingLeft: '1.3rem' } }, item.items.map((x) => h('li', mdi(x))));
    case 'match': case 'label': return h('ul.small', { style: { margin: '.3rem 0 0', paddingLeft: '1.1rem' } }, item.left.map((l, i) => h('li', mdi(l), ' → ', mdi(item.right[item.answer[i]]))));
    case 'slider': return h('span', `between ${item.answer[0]} and ${item.answer[1]}`);
    case 'point': return h('span', { html: tex(`(${fmtNum(item.answer.x)},\\ ${fmtNum(item.answer.y)})`) });
    case 'code': return h('pre.code-answer', item.answer);
    default: return h('span', '');
  }
}

function fmtNum(x) {
  if (!Number.isFinite(x)) return String(x);
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) { const [m, e] = x.toExponential(3).split('e'); return `${+m} \\times 10^{${+e}}`; }
  return String(+x.toPrecision(5));
}

// ─── answer controls by item type ──────────────────────────────────────────

function buildControl(item, box, changed) {
  switch (item.type) {
    case 'mcq': return choiceControl(item, box, changed, false);
    case 'multi': return choiceControl(item, box, changed, true);
    case 'numeric': return numericControl(item, box, changed);
    case 'expression': return expressionControl(item, box, changed);
    case 'order': return orderControl(item, box, changed);
    case 'match': case 'label': return matchControl(item, box, changed);
    case 'slider': return sliderControl(item, box, changed);
    case 'point': return pointControl(item, box, changed);
    case 'code': return codeControl(item, box, changed);
    default: box.append(h('p.muted', `Unsupported item type ${item.type}`)); return { value: () => null };
  }
}

function choiceControl(item, box, changed, multiple) {
  const order = item.order || item.choices.map((_, i) => i);
  let picked = multiple ? new Set() : null;
  const buttons = order.map((ci, k) => {
    const b = h('button.choice', { type: 'button', 'aria-pressed': 'false', onclick: () => toggle(ci) },
      h('span.key', LETTERS[k]), mdi(item.choices[ci]));
    b.dataset.ci = ci;
    return b;
  });
  box.append(h('div.choices', { role: multiple ? 'group' : 'radiogroup' }, buttons), multiple ? h('div.tiny.faint', { style: { marginTop: '.4rem' } }, 'Select all that apply.') : null);
  function toggle(ci) {
    if (multiple) { picked.has(ci) ? picked.delete(ci) : picked.add(ci); }
    else picked = ci;
    for (const b of buttons) b.setAttribute('aria-pressed', String(multiple ? picked.has(+b.dataset.ci) : +b.dataset.ci === picked));
    changed();
  }
  return {
    value: () => (multiple ? (picked.size ? [...picked] : null) : picked),
    pick: (k) => { if (k < order.length) toggle(order[k]); },
    mark: (r) => {
      if (multiple) return;
      for (const b of buttons) { b.classList.remove('wrong'); if (+b.dataset.ci === picked && !r.correct) b.classList.add('wrong'); }
    },
    lock: () => {
      for (const b of buttons) {
        b.disabled = true;
        const ci = +b.dataset.ci;
        const right = multiple ? item.answer.includes(ci) : ci === item.answer;
        if (right) b.classList.add('right');
      }
    },
    focus: () => buttons[0]?.focus({ preventScroll: true }),
  };
}

function numericControl(item, box, changed) {
  const input = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Your answer', placeholder: item.unitMode === 'typed' ? 'number and unit, e.g. 9.8 m/s^2' : 'your answer' });
  const unit = item.units && item.unitMode !== 'typed' ? h('span.unit', { html: tex(unitTeX(item.units)) }) : null;
  const wrap = h('div.answer', input, unit);
  const preview = h('div.preview');
  box.append(h('div.answer-row', wrap), preview);
  input.addEventListener('input', () => {
    const v = input.value.trim();
    wrap.classList.remove('wrong');
    if (!v) { preview.replaceChildren(); changed(); return; }
    try {
      const q = parseQuantity(v);
      const shown = q.unit ? `${fmtNum(q.value)}\\;${unitTeX(q.unitText)}` : fmtNum(q.value);
      const isPlain = /^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(q.numberText.replace(/\s/g, '')) && !q.unit;
      preview.replaceChildren(isPlain ? '' : h('span', 'Read as ', h('span', { html: tex(shown) })));
    } catch (e) { preview.replaceChildren(h('span.err', e.message)); }
    changed();
  });
  return {
    value: () => input.value.trim() || null,
    mark: (r) => { wrap.classList.toggle('wrong', !r.correct); wrap.classList.toggle('right', r.correct); },
    lock: () => { input.readOnly = true; },
    focus: () => input.focus({ preventScroll: true }),
  };
}

const KEYPAD = {
  default: [['^', '^'], ['√', 'sqrt('], ['π', 'pi'], ['( )', '()'], ['sin', 'sin('], ['cos', 'cos('], ['ln', 'ln('], ['e^', 'e^(']],
};

function expressionControl(item, box, changed) {
  const vars = Object.keys(Array.isArray(item.vars) ? Object.fromEntries(item.vars.map((v) => [v, 1])) : item.vars || {});
  const input = h('input', { type: 'text', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off', 'aria-label': 'Your expression', placeholder: item.mode === 'equation' ? 'an equation, e.g. y = 2x + 1' : 'an expression' });
  const wrap = h('div.answer', item.lhs ? h('span.unit', { html: tex(item.lhs + '='), style: { paddingLeft: 0, paddingRight: '.5rem' } }) : null, input,
    item.mode === 'constant' ? h('span.unit', { html: tex('+\\;C') }) : null);
  const preview = h('div.preview');
  const keys = h('div.keys', [...(item.keys || []), ...KEYPAD.default].map(([label, ins]) => h('button', { type: 'button', onclick: () => insert(ins) }, label)));
  box.append(h('div.answer-row', wrap), preview, keys,
    vars.length ? h('div.tiny.faint', { style: { marginTop: '.35rem' } }, `Use ${vars.join(', ')}. Type sin x or sin(x), x^2, sqrt(x), ln, pi; multiplication can be implicit (2x).`) : null);
  function insert(s) {
    const a = input.selectionStart ?? input.value.length, b = input.selectionEnd ?? a;
    const v = input.value;
    let ins = s, caret = a + s.length;
    if (s === '()') { ins = `(${v.slice(a, b)})`; caret = a + ins.length - (a === b ? 1 : 0); }
    input.value = v.slice(0, a) + ins + v.slice(b);
    input.focus();
    input.setSelectionRange(caret, caret);
    input.dispatchEvent(new Event('input'));
  }
  input.addEventListener('input', () => {
    const v = input.value.trim();
    wrap.classList.remove('wrong');
    if (!v) { preview.replaceChildren(); changed(); return; }
    const p = previewExpression(v, item.vars);
    preview.replaceChildren(p.error ? h('span.err', p.error) : h('span', 'Read as ', h('span', { html: tex(p.tex) })));
    changed();
  });
  return {
    value: () => input.value.trim() || null,
    mark: (r) => { wrap.classList.toggle('wrong', !r.correct); wrap.classList.toggle('right', r.correct); },
    lock: () => { input.readOnly = true; keys.remove(); },
    focus: () => input.focus({ preventScroll: true }),
  };
}

function orderControl(item, box, changed) {
  let seq = (item.shuffle || item.items.map((_, i) => i)).slice();
  const list = h('ol.order-list', { 'aria-label': 'Put the steps in order' });
  let locked = false;
  function paint() {
    list.replaceChildren(...seq.map((ix, pos) => h('li.order-item', { draggable: locked ? 'false' : 'true', 'data-pos': pos },
      h('span.grip', '⋮⋮'), h('span.txt', mdi(item.items[ix])),
      h('button.icon-btn', { type: 'button', 'aria-label': 'Move up', disabled: locked || pos === 0 || null, onclick: () => move(pos, -1), html: icon('up') }),
      h('button.icon-btn', { type: 'button', 'aria-label': 'Move down', disabled: locked || pos === seq.length - 1 || null, onclick: () => move(pos, 1), html: icon('down') }))));
  }
  function move(pos, d) {
    const j = pos + d;
    if (j < 0 || j >= seq.length) return;
    [seq[pos], seq[j]] = [seq[j], seq[pos]];
    paint(); changed();
  }
  // pointer drag reordering (buttons remain the keyboard path)
  let dragFrom = null;
  list.addEventListener('dragstart', (e) => { const li = e.target.closest('li'); if (!li || locked) return; dragFrom = +li.dataset.pos; li.classList.add('dragging'); });
  list.addEventListener('dragover', (e) => e.preventDefault());
  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const li = e.target.closest('li');
    if (!li || dragFrom === null) return;
    const to = +li.dataset.pos;
    const [x] = seq.splice(dragFrom, 1);
    seq.splice(to, 0, x);
    dragFrom = null; paint(); changed();
  });
  list.addEventListener('dragend', () => { dragFrom = null; paint(); });
  box.append(list);
  paint();
  return {
    value: () => seq.slice(),
    lock: () => { locked = true; seq = item.items.map((_, i) => i); paint(); },
  };
}

function matchControl(item, box, changed) {
  const order = item.rightOrder || item.right.map((_, i) => i);
  const chosen = {};
  const rows = item.left.map((l, li) => {
    const sel = h('select', { 'aria-label': `Match for item ${li + 1}`, onchange: (e) => { if (e.target.value === '') delete chosen[li]; else chosen[li] = +e.target.value; changed(); } },
      h('option', { value: '' }, 'Choose…'), order.map((ri) => h('option', { value: ri }, plainText(item.right[ri]))));
    return h('div.match-row', h('div.l', mdi(l)), sel);
  });
  box.append(item.diagram ? h('div', { html: item.diagram, style: { margin: '0 0 .8rem' } }) : null, h('div.match-list', rows));
  return {
    value: () => (Object.keys(chosen).length === item.left.length ? { ...chosen } : null),
    lock: () => rows.forEach((r, li) => { const s = r.querySelector('select'); s.disabled = true; r.classList.add(chosen[li] === item.answer[li] ? 'right' : 'wrong'); if (chosen[li] !== item.answer[li]) s.value = item.answer[li]; }),
  };
}

function plainText(s) { return String(s).replace(/\$([^$]+)\$/g, '$1').replace(/\\[a-z]+/gi, '').replace(/[{}]/g, ''); }

function sliderControl(item, box, changed) {
  // the slider lives in the item's visual; this control reads it
  box.append(h('p.small.faint', item.instruction || 'Adjust the control in the picture, then check.'));
  return { value: (vizCtl) => (vizCtl?.get ? vizCtl.get(item.param) : null), lock: () => {} };
}

function codeControl(item, box, changed) {
  const ta = h('textarea.code-input', { spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Your Python code', rows: Math.min(18, Math.max(6, (item.starter || '').split('\n').length + 2)) });
  ta.value = item.starter || '';
  const out = h('pre.code-run', { 'aria-live': 'polite', hidden: true });
  ta.addEventListener('input', () => changed());
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const a = ta.selectionStart, b = ta.selectionEnd; ta.value = ta.value.slice(0, a) + '    ' + ta.value.slice(b); ta.selectionStart = ta.selectionEnd = a + 4; changed(); }
  });
  box.append(ta, h('div.tiny.faint', { style: { margin: '.35rem 0 0' } }, 'Python 3.14 runs in your browser. Check runs your program and then the exercise’s tests. Tab inserts four spaces.'), out);
  return {
    value: () => ta.value,
    output: (m) => { if (m.type === 'status') return; out.hidden = false; out.append(m.type === 'stderr' ? h('span.err', m.text) : m.text); },
    mark: () => {},
    lock: () => { ta.readOnly = true; },
    reveal: () => {},
    focus: () => ta.focus({ preventScroll: true }),
    clearOutput: () => { out.replaceChildren(); out.hidden = true; },
  };
}

function pointControl(item, box, changed) {
  box.append(h('p.small.faint', item.instruction || 'Drag the point to the right place, then check.'));
  return { value: (vizCtl) => (vizCtl?.get ? vizCtl.get('point') : null), lock: () => {} };
}
