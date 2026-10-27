// The lesson player: intro → visual → worked example → practice → checkpoint
// → summary. Practice is assisted (hints, retries, solutions, fresh variants
// after a miss); the checkpoint is unassisted and sets the skill's first
// spaced-review rating. Completing a lesson is recorded separately from
// mastery, which only the evidence moves.

import { h, md, mdi, math, tex, texParts, icon, statePill, difficultyDots, clear, toast } from '../dom.js';
import { app, log } from '../state.js';
import { instantiate } from '../../core/content.js';
import { prereqStatus, recommendNext, stateOf } from '../../core/plan.js';
import { explain as explainSkill } from '../../core/mastery.js';
import { mountQuestion } from '../player/question.js';
import { mountViz } from '../../viz/registry.js';
import { badge } from './course.js';

const STEPS = ['intro', 'dissect', 'visual', 'example', 'practice', 'checkpoint', 'summary'];
const STEP_LABEL = { intro: 'Introduction', dissect: 'Dissect', visual: 'Explore', example: 'Worked example', practice: 'Practice', checkpoint: 'Checkpoint', summary: 'Summary' };

export async function render(main, { lesson: id }) {
  const entry = app.cat.lessons[id];
  if (!entry) { main.append(h('div.page.narrow', h('h1', 'No such lesson'), h('a.btn', { href: '#/library' }, 'Library'))); return; }
  if (!entry.ready) {
    main.append(h('div.page.narrow', h('div.eyebrow', app.cat.byId[entry.course].code), h('h1', entry.title),
      h('p.muted', 'This lesson is planned but not built yet. The coverage page lists everything that is built and planned.'),
      h('div.row', h('a.btn', { href: `#/course/${entry.course}` }, 'Back to the course'), h('a.btn.ghost', { href: '#/manifest' }, 'Coverage'))));
    return;
  }
  const L = (await entry.load()).default;
  const P = new Player(main, L, entry);
  log('visit', { lesson: L.id });
  P.go('intro');
  return () => P.destroy();
}

class Player {
  constructor(main, L, entry) {
    this.main = main; this.L = L; this.entry = entry;
    this.course = app.cat.byId[entry.course];
    this.module = app.cat.modules[entry.module];
    this.steps = STEPS.filter((s) => (s === 'dissect' ? L.kind === 'dissection' && !!L.parts?.length : s === 'visual' ? !!L.visual : s === 'example' ? !!L.example : s === 'checkpoint' ? L.checkpoint.length > 0 : s === 'practice' ? L.practice.length > 0 : true));
    this.cleanups = [];
    this.stateBefore = stateOf(app.st, L.skills[0]);
    this.xpBefore = app.st.xp;
    this.practiceStreak = 0;
    this.extraVariants = {};
  }
  destroy() { this.flush(); }
  flush() { this.cleanups.splice(0).forEach((f) => { try { f(); } catch { /* ignore */ } }); }

  go(step) {
    this.flush();
    this.step = step;
    clear(this.main);
    const idx = this.steps.indexOf(step);
    const top = h('div.player-top',
      h('a.icon-btn', { href: `#/course/${this.course.id}`, 'aria-label': 'Back to the course', html: icon('left') }),
      h('div.steps', { role: 'progressbar', 'aria-label': `Step ${idx + 1} of ${this.steps.length}: ${STEP_LABEL[step]}` },
        this.steps.map((s, i) => h(i < idx ? 'span.done' : i === idx ? 'span.cur' : 'span', { title: STEP_LABEL[s] }))),
      h('span.crumb', STEP_LABEL[step]));
    this.stage = h('section.stage');
    this.nav = h('div.player-nav');
    this.main.append(h('div.player', top, this.stage, this.nav));
    this[step]();
    window.scrollTo({ top: 0 });
  }
  next() { const i = this.steps.indexOf(this.step); this.go(this.steps[Math.min(this.steps.length - 1, i + 1)]); }
  prev() { const i = this.steps.indexOf(this.step); if (i > 0) this.go(this.steps[i - 1]); }
  navButtons(nextLabel, { back = true, extra = null } = {}) {
    this.nav.replaceChildren(
      back && this.steps.indexOf(this.step) > 0 ? h('button.btn.ghost', { type: 'button', onclick: () => this.prev(), html: `${icon('left')}Back` }) : h('span'),
      h('div.row', extra, nextLabel ? h('button.btn.primary', { type: 'button', onclick: () => this.next() }, nextLabel, h('span', { html: icon('right'), style: { display: 'inline-flex' } })) : null));
  }

  // ── 1. introduction ─────────────────────────────────────────────────────
  intro() {
    const L = this.L;
    const pre = prereqStatus(app.cat, app.st, L.id).filter((p) => !p.met);
    const counterpart = L.mode ? app.cat.lessons[L.id.replace(/\.(i|d)$/, (m, k) => (k === 'i' ? '.d' : '.i'))] : null;
    this.stage.append(
      h('div.kicker', h('span.eyebrow', `${this.course.code} · ${this.module.title}`)),
      h('h1', L.title),
      h('div.row.small.faint', { style: { marginBottom: '1rem' } },
        h('span', `about ${L.minutes} minutes`), difficultyDots(L.difficulty),
        L.mode ? h('span.chip', L.mode === 'intuition' ? 'Intuition Mode' : 'Derivation Mode') : null,
        ...(L.badges || []).map(badge),
        stateOf(app.st, L.skills[0]) !== 'not-started' ? statePill(stateOf(app.st, L.skills[0])) : null),
      pre.length ? h('div.callout', 'This lesson builds on ', pre.map((p, i) => [i ? ', ' : '', h('a', { href: `#/lesson/${p.id}` }, p.title)]), '. You can explore it anyway.') : null,
      L.equation ? h('div.eq-hero', { html: texParts(L.equation, true) }) : null,
      md(L.intro),
      L.symbols?.length ? h('dl.symbols', L.symbols.flatMap((s) => [h('dt', { html: math(s.tex).innerHTML }), h('dd', mdi(s.text))])) : null,
      L.why ? h('div.why', h('span', { html: icon('target'), style: { color: 'var(--accent-2)', display: 'inline-flex' } }), mdi(L.why)) : null,
      counterpart?.ready ? h('p.small', { style: { marginTop: '1rem' } }, h('a', { href: `#/lesson/${counterpart.id}` }, `Switch to ${L.mode === 'intuition' ? 'Derivation' : 'Intuition'} Mode →`)) : null,
      L.sources?.length ? h('p.tiny.faint', { style: { marginTop: '1rem' } }, 'Sources: ', L.sources.map((s, i) => [i ? ' · ' : '', h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.label)])) : null,
    );
    const testOut = L.checkpoint.length ? h('button.btn.ghost', { type: 'button', title: 'Skip straight to the unassisted checkpoint', onclick: () => this.go('checkpoint') }, 'I know this — test me') : null;
    this.navButtons(this.steps[1] ? `Start` : null, { back: false, extra: testOut });
  }

  // ── dissection: the equation, one symbol at a time ─────────────────────
  dissect() {
    const L = this.L;
    const parts = L.parts;
    const eq = h('div.eq-hero.eq-dissect', { html: texParts(L.equation, true) });
    const detail = h('div.part-detail', { 'aria-live': 'polite' });
    let cur = 0;
    const chips = parts.map((p, k) => h('button.part-chip', { type: 'button', 'aria-pressed': 'false', onclick: () => select(k) },
      h('span.pn', String(k + 1)), h('span', { html: tex(p.tex) }), h('span.pname', p.name)));
    const prevBtn = h('button.btn.small.ghost', { type: 'button', onclick: () => select(cur - 1), html: `${icon('left')}Previous part` });
    const nextBtn = h('button.btn.small', { type: 'button', onclick: () => select(cur + 1) }, 'Next part', h('span', { html: icon('right'), style: { display: 'inline-flex' } }));
    const select = (k) => {
      cur = Math.max(0, Math.min(parts.length - 1, k));
      eq.classList.add('focus');
      eq.querySelectorAll('.eqp').forEach((el) => el.classList.toggle('lit', el.classList.contains(`eqp-${cur + 1}`)));
      chips.forEach((c, i) => c.setAttribute('aria-pressed', String(i === cur)));
      const p = parts[cur];
      detail.replaceChildren(
        h('div.row.small.faint', h('span', `Part ${cur + 1} of ${parts.length}`), p.badge ? badge(p.badge) : null, p.units ? h('span', 'units: ', mdi(p.units)) : null),
        h('h3', h('span', { html: tex(p.tex) }), ' ', h('span', `— ${p.name}`)),
        md(p.text, 'prose small'),
        p.more ? h('details', h('summary', 'Go deeper'), md(p.more, 'prose small')) : null);
      prevBtn.disabled = cur === 0;
      nextBtn.disabled = cur === parts.length - 1;
    };
    // pointing at a term in the equation selects its part (the innermost one)
    eq.addEventListener('click', (e) => {
      const el = e.target.closest('.eqp');
      const m = el && /eqp-(\d+)/.exec(el.className);
      if (m) select(+m[1] - 1);
    });
    this.stage.append(h('div.kicker', h('span.eyebrow', 'Dissect the equation')), h('h2', L.title),
      h('p.small.muted', 'Tap a symbol in the equation, or step through the parts in order.'),
      eq, h('div.part-chips', chips), detail, h('div.row', { style: { marginTop: '.8rem' } }, prevBtn, nextBtn),
      L.readAloud ? h('div.callout', { style: { marginTop: '1.2rem' } }, h('b', 'In words: '), mdi(L.readAloud)) : null);
    select(0);
    this.navButtons(this.steps.includes('visual') ? 'Explore' : 'Practice');
  }

  // ── 2. visual ───────────────────────────────────────────────────────────
  visual() {
    const L = this.L;
    this.stage.append(h('div.kicker', h('span.eyebrow', 'Explore')), L.visual.title ? h('h2', L.visual.title) : null,
      L.visual.lead ? md(L.visual.lead) : null);
    const box = h('div');
    this.stage.append(box);
    mountViz(box, L.visual, {}).then((c) => this.cleanups.push(() => c.destroy())).catch((e) => { console.error(e); box.append(h('p.muted', 'This visualization could not load.')); });
    if (L.visual.explain) this.stage.append(md(L.visual.explain, 'prose small'));
    this.navButtons(this.steps.includes('example') ? 'Worked example' : 'Practice');
  }

  // ── 3. worked example ──────────────────────────────────────────────────
  example() {
    const ex = this.L.example;
    let shown = 0;
    const list = h('div');
    const more = h('button.btn', { type: 'button', onclick: () => reveal() }, 'Show the next step');
    const reveal = () => {
      const s = ex.steps[shown++];
      list.append(h('div.ex-step', h('span.k', String(shown)), h('div', s.label ? h('div.lbl', s.label) : null, md(s.text, 'prose small'))));
      if (shown >= ex.steps.length) {
        more.remove();
        if (ex.answer) list.append(h('div.feedback.good', h('div.head', { html: `${icon('check')}Result` }), md(ex.answer, 'small')));
        if (!this.exampleLogged) { this.exampleLogged = true; log('example', { lesson: this.L.id }); }
        this.navButtons('Practice');
      }
    };
    this.stage.append(h('div.kicker', h('span.eyebrow', 'Worked example')), ex.title ? h('h2', ex.title) : null, md(ex.prompt));
    if (ex.visual) { const vb = h('div', { style: { margin: '1rem 0' } }); this.stage.append(vb); mountViz(vb, ex.visual, { compact: true }).then((c) => this.cleanups.push(() => c.destroy())); }
    this.stage.append(list, h('div.row', { style: { marginTop: '.8rem' } }, more, h('button.btn.ghost', { type: 'button', onclick: () => { while (shown < ex.steps.length) reveal(); } }, 'Show all')));
    reveal();
    this.navButtons(null, { extra: h('button.btn.ghost', { type: 'button', onclick: () => this.next() }, 'Skip to practice') });
  }

  // ── 4. practice ─────────────────────────────────────────────────────────
  practice() {
    if (!this.pQueue) {
      this.pQueue = this.L.practice.map((def) => ({ def, variant: 0 }));
      this.pAt = 0;
    }
    this.renderPractice();
  }
  renderPractice() {
    this.flush();
    clear(this.stage);
    const slot = this.pQueue[this.pAt];
    if (!slot) { this.next(); return; }
    const item = instantiate(this.L, slot.def, slot.variant);
    item.regenerate = !!slot.def.gen;
    const box = h('div');
    this.stage.append(box);
    let result = null;
    const q = mountQuestion(box, item, {
      context: 'practice', index: this.pAt, total: this.pQueue.length,
      onResolved: (r) => {
        result = r;
        logResponse(this.L, item, 'practice', r);
        const unaided = r.correct && r.tries === 1 && !r.hints;
        this.practiceStreak = unaided ? this.practiceStreak + 1 : 0;
        // a miss queues a fresh variant of the same problem for targeted practice
        if (!r.correct && slot.def.gen && (this.extraVariants[slot.def.id] || 0) < 2) {
          this.extraVariants[slot.def.id] = (this.extraVariants[slot.def.id] || 0) + 1;
          this.pQueue.push({ def: slot.def, variant: slot.variant + 1 + this.extraVariants[slot.def.id] * 10 });
        }
      },
      onAnother: () => { this.pQueue.splice(this.pAt + 1, 0, { def: slot.def, variant: slot.variant + 101 + this.pAt }); this.pAt++; this.renderPractice(); },
      onNext: () => { this.pAt++; this.renderPractice(); },
      nextLabel: this.pAt + 1 < this.pQueue.length ? 'Next question' : this.steps.includes('checkpoint') ? 'On to the checkpoint' : 'Finish',
    });
    this.cleanups.push(() => q.destroy());
    const skip = this.practiceStreak >= 3 && this.pAt < this.pQueue.length - 1
      ? h('button.btn.ghost', { type: 'button', onclick: () => this.go(this.steps.includes('checkpoint') ? 'checkpoint' : 'summary') }, 'You’ve got this — skip to the checkpoint') : null;
    this.navButtons(null, { extra: skip });
  }

  // ── 5. checkpoint ───────────────────────────────────────────────────────
  checkpoint() {
    const attempts = app.events.filter((e) => e.kind === 'checkpoint' && e.lesson === this.L.id).length;
    this.cQueue = this.L.checkpoint.map((def) => ({ def, variant: attempts }));
    this.cAt = 0; this.cScore = 0;
    this.stage.append(h('div.kicker', h('span.eyebrow', 'Checkpoint')), h('h2', 'Quick check'),
      h('p.muted', `${this.cQueue.length} questions, no hints, one try each. This is how the Atlas tells whether the idea has landed — it is not a test you can fail out of.`));
    const box = h('div', { style: { marginTop: '1rem' } });
    this.stage.append(box);
    this.cBox = box;
    this.renderCheck();
  }
  renderCheck() {
    this.flush();
    clear(this.cBox);
    const slot = this.cQueue[this.cAt];
    if (!slot) { this.finishCheckpoint(); return; }
    const item = instantiate(this.L, slot.def, slot.variant);
    const q = mountQuestion(this.cBox, item, {
      context: 'checkpoint', assisted: false, index: this.cAt, total: this.cQueue.length,
      onResolved: (r) => { if (r.correct) this.cScore++; logResponse(this.L, item, 'checkpoint', r); },
      onNext: () => { this.cAt++; this.renderCheck(); },
      nextLabel: this.cAt + 1 < this.cQueue.length ? 'Next' : 'See results',
    });
    this.cleanups.push(() => q.destroy());
    this.navButtons(null, { back: false });
  }
  async finishCheckpoint() {
    const total = this.cQueue.length, score = this.cScore;
    const passed = score / total >= 0.66;
    await log('checkpoint', { lesson: this.L.id, score, total, passed, skills: this.L.skills });
    await log('lesson', { lesson: this.L.id, lab: !!this.L.lab });
    this.checkResult = { score, total, passed };
    this.go('summary');
  }

  // ── 6. summary ──────────────────────────────────────────────────────────
  summary() {
    const L = this.L;
    if (!this.checkResult && !app.st.lessons[L.id]?.completed) {
      log('lesson', { lesson: L.id, lab: !!L.lab });
    }
    const s = app.st.skills[L.skills[0]];
    const after = s?.state ?? 'not-started';
    const gained = app.st.xp - this.xpBefore;
    const nextId = nextInModule(L.id) || recommendNext(app.cat, app.st, app.profile || {});
    const r = this.checkResult;
    this.stage.append(
      h('div.summary-hero',
        h('div.eyebrow', 'Lesson complete'),
        h('h1', L.title),
        r ? h('div.big', `${r.score} / ${r.total}`) : null,
        r ? h('p.muted', r.passed ? 'Checkpoint passed.' : 'Not yet — the Atlas will bring this skill back for review soon. That is how it sticks.') : null),
      h('div.grid.g2', { style: { marginTop: '1rem' } },
        h('div.delta', h('span', 'XP earned'), h('b', `+${gained}`)),
        h('div.delta', h('span', 'Mastery estimate'), h('span.row', this.stateBefore !== after ? [statePill(this.stateBefore), h('span', '→')] : null, statePill(after)))),
      s ? h('div.card.flat', { style: { marginTop: '1rem' } }, h('div.tiny.eyebrow', 'Why this state?'),
        h('ul.small', { style: { margin: '.4rem 0 0', paddingLeft: '1.1rem' } }, explainSkill(s).map((x) => h('li', { style: { color: x.met ? 'var(--good)' : 'var(--ink-3)' } }, `${x.met ? '✓' : '○'} ${x.label}`))),
        h('p.tiny.faint', { style: { marginTop: '.5rem' } }, 'Mastered needs success on a later day and in a new context — completing a lesson is never proof of mastery on its own.')) : null,
    );
    const retake = r && !r.passed ? h('button.btn', { type: 'button', onclick: () => this.go('checkpoint') }, 'Retake the checkpoint (new numbers)') : null;
    const more = h('button.btn.ghost', { type: 'button', onclick: () => { this.pQueue = this.L.practice.filter((d) => d.gen).map((def) => ({ def, variant: 1000 + Math.floor(Math.random() * 1e5) })); this.pAt = 0; if (!this.pQueue.length) this.pQueue = this.L.practice.map((def) => ({ def, variant: 0 })); this.go('practice'); } }, 'Practise more');
    this.nav.replaceChildren(
      h('a.btn.ghost', { href: `#/course/${this.course.id}` }, 'Back to the course'),
      h('div.row', retake, more, nextId ? h('a.btn.primary', { href: `#/lesson/${nextId}` }, `Next: ${app.cat.lessons[nextId].title}`) : null));
  }
}

function nextInModule(id) {
  const L = app.cat.lessons[id];
  const mod = app.cat.modules[L.module];
  const i = mod.lessonIds.indexOf(id);
  const n = mod.lessonIds.slice(i + 1).find((x) => app.cat.lessons[x].ready);
  if (n) return n;
  const course = app.cat.byId[L.course];
  const j = course.lessonIds.indexOf(id);
  return course.lessonIds.slice(j + 1).find((x) => app.cat.lessons[x].ready && !app.st.lessons[x]?.completed) || null;
}

export function logResponse(L, item, context, r, extra = {}) {
  return log('response', {
    lesson: L.id, skill: item.skill, item: item.key, variant: item.variant, context,
    correct: r.correct, tries: r.tries, hints: r.hints, solution: r.solution, confidence: r.confidence,
    difficulty: item.difficulty ?? 2, choices: item.type === 'mcq' ? item.choices.length : undefined,
    transfer: !!item.transfer, mixed: !!item.mixed, itemType: item.kind || item.type, ...extra,
  });
}

export { toast };
