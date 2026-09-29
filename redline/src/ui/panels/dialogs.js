/* Go/no-go poll, abort banner, and the end-of-procedure debrief. */
import { h, btn, clear, setText } from '../dom.js';
import { modal, toast } from '../modal.js';
import { fmt, fmtT, fmtClock, unitLabel } from '../../lib/units.js';
import { resolve } from '../../control/procedure.js';

/* ---- go / no-go -------------------------------------------------------- */
export function openPoll(app) {
  const S = app.session, mode = S.mode;
  const poll = S.startPoll();
  const explain = mode === 'tutorial' || mode === 'guided';
  const calls = {};
  const body = h('div');
  body.append(h('p.muted', explain
    ? 'Each station reports its data and makes its call. You are the test conductor: the final call is yours, and NO-GO is always an acceptable answer.'
    : 'Each station reports its data. You decide whether each is GO — and then whether the test is.'));
  body.append(h('p.faint', `Snapshot at ${fmtClock(S.clock)} · configuration #${poll.epoch}. Any configuration change after the poll invalidates it.`));
  const finalGo = btn('TEST CONDUCTOR: GO', () => finish('GO'), 'go');
  const finalNo = btn('NO-GO — HOLD', () => finish('NO-GO'), 'nogo');
  const refresh = () => { finalGo.disabled = poll.stations.some(s => !calls[s.id]); };
  for (const st of poll.stations) {
    const callBox = h('span.call');
    const box = h('div.poll-st', h('div.psh', h('b', st.name), h('span.role', st.role), callBox));
    if (explain) {
      calls[st.id] = st.go ? 'GO' : 'NO-GO';
      callBox.append(h('span.stcall.' + (st.go ? 'GO' : 'NOGO'), st.go ? 'GO' : 'NO-GO'));
    } else {
      const g = btn('GO', () => { calls[st.id] = 'GO'; g.classList.add('on'); n.classList.remove('on'); refresh(); }, 'sm go');
      const n = btn('NO-GO', () => { calls[st.id] = 'NO-GO'; n.classList.add('on'); g.classList.remove('on'); refresh(); }, 'sm nogo');
      callBox.append(g, n);
    }
    for (const it of st.items) {
      const mk = explain ? h('span.mk.' + (it.ok ? 'ok' : 'bad'), it.ok ? '✓' : '✕') : h('span.mk', '·');
      box.append(h('div.it', mk, h('span.lab', it.label), h('span.val', it.value ?? '')));
      if (explain && it.why && (!it.ok || mode === 'tutorial')) box.lastChild.append(h('span.why', it.why));
    }
    body.append(box);
  }
  refresh();
  const m = modal({ title: 'GO / NO-GO POLL', body, footer: [h('span.faint', { style: { marginRight: 'auto', fontSize: '11px' } }, S.controller.planText()), finalNo, finalGo] });
  function finish(final) {
    for (const st of poll.stations) calls[st.id] ||= 'NO-GO';
    const r = S.concludePoll(poll, calls, final);
    m.close();
    if (final === 'GO') toast('GO for test', 'Poll complete. Arm when ready.', 'info', 3000);
    else toast('NO-GO — holding', 'Fix what the poll found, then poll again.', 'info', 4000);
    return r;
  }
}

/* ---- abort banner -------------------------------------------------------- */
export class AbortBanner {
  constructor(host, app) {
    this.app = app;
    this.el = h('div.abort-banner.hidden');
    host.append(this.el);
    this.shownFor = null;
  }
  update() {
    const S = this.app.session, a = S.controller.abort;
    if (!a || a.reset) { this.el.classList.add('hidden'); this.shownFor = null; return; }
    this.el.classList.remove('hidden');
    if (this.shownFor !== a) {
      this.shownFor = a;
      clear(this.el);
      this.list = h('ol');
      this.status = h('div.why');
      this.btns = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } });
      this.el.append(h('div', h('div.big', 'ABORT'), h('div.why', a.reason), h('div.why', { style: { color: '#d69a9c' } },
        `${a.source === 'auto' ? 'Automatic (redline)' : 'Manual'}${a.T !== null && a.T !== undefined ? ' at ' + fmtT(a.T) : ''}`)), this.list, this.btns);
      this.items = a.steps.map(s => { const li = h('li', s.text); this.list.append(li); return li; });
    }
    a.steps.forEach((s, i) => this.items[i].classList.toggle('done', s.done));
    if (a.complete && !this.btns.childElementCount) {
      this.btns.append(btn('What happened?', () => whatHappened(this.app, a), 'sm'), btn('Reset abort', () => this.app.session.execute('resetAbort'), 'sm ghost'));
    }
  }
}

export function whatHappened(app, a) {
  const S = app.session;
  const q = [
    'What state was the system in when the abort occurred?',
    'Which measurement tripped it, and does that measurement make physical sense?',
    'Is there another channel that confirms — or contradicts — it?',
    'Real system problem, or instrumentation problem? What would tell them apart?',
  ];
  const ta = h('textarea.in', { rows: 7, placeholder: 'Your reading of the data…' });
  const m = modal({
    title: 'Abort review — what happened?', narrow: true,
    body: [h('p.muted', a.reason), h('ul', { style: { color: 'var(--ink-3)', paddingLeft: '18px', lineHeight: '1.6' } }, q.map(x => h('li', x))),
      h('p.faint', 'Look at the plots around the abort before you answer. Your notes go into the engineering notebook with the run.'), ta],
    footer: [btn('Cancel', () => m.close(), 'ghost'), btn('Save to notebook', () => {
      const runId = S.daq.recording?.meta.runId || S.runs[S.runs.length - 1]?.id || null;
      S.note('Abort review: ' + ta.value, runId);
      app.notebook?.addPendingNote(runId, 'Abort review', ta.value);
      m.close();
    }, 'primary')],
  });
}

/* ---- debrief --------------------------------------------------------------- */
export function debrief(app) {
  const S = app.session, P = S.procedure;
  if (!P) return;
  const sum = P.summary();
  const v = S.view();
  const body = h('div');
  const run = S.runs.find(r => r.metrics?.summary);
  body.append(h('p', `${P.proc.title} — ${S.mode} mode.`));
  const kv = h('div.kv', { style: { marginBottom: '10px' } },
    h('span.k', 'Steps complete'), h('span.v', `${sum.counts.COMPLETE} / ${sum.total}`),
    h('span.k', 'Skipped / failed'), h('span.v', `${sum.counts.SKIPPED} / ${sum.counts.FAILED}`),
    h('span.k', 'Safety violations'), h('span.v', String(S.safetyViolations.length)),
    h('span.k', 'Go/no-go polls'), h('span.v', `${S.polls.length} (${S.pollMisses.length} wrong call${S.pollMisses.length === 1 ? '' : 's'})`),
    h('span.k', 'Alarms raised'), h('span.v', String(S.log.filter(e => e.cat === 'ALM').length)),
    h('span.k', 'Aborts'), h('span.v', String(S.log.filter(e => e.cat === 'ABT' && e.text.startsWith('ABORT')).length)));
  body.append(kv);
  if (run) {
    const p = run.meta.config.prediction;
    const m = run.metrics.summary;
    body.append(h('h4', { style: { margin: '10px 0 4px', fontSize: '10px', letterSpacing: '.14em', color: 'var(--ink-4)' } }, `RESULT — ${run.id}`));
    body.append(h('div.kv',
      h('span.k', 'Chamber pressure'), h('span.v', `${fmt(m.Pc, 'pressure')} ${unitLabel('pressure', true)}${p ? `  (pred. ${fmt(p.Pc, 'pressure')})` : ''}`),
      h('span.k', 'Thrust'), h('span.v', `${fmt(m.F, 'force')} ${unitLabel('force')}${p ? `  (pred. ${fmt(p.F, 'force')})` : ''}`),
      h('span.k', 'Total impulse'), h('span.v', `${fmt(m.I, 'impulse')} N·s`),
      h('span.k', 'Specific impulse'), h('span.v', `${Number.isFinite(m.Isp) ? m.Isp.toFixed(1) : '----'} s${p ? `  (pred. ${p.Isp.toFixed(1)})` : ''}`)));
  }
  const audits = P.steps.filter(st => P.state.get(st.id).truthOk === false);
  if (audits.length || S.pollMisses.length || S.safetyViolations.length) {
    body.append(h('h4', { style: { margin: '14px 0 4px', fontSize: '10px', letterSpacing: '.14em', color: 'var(--caution)' } }, 'WHAT THE RECORD SHOWS'));
    const ul = h('ul', { style: { margin: 0, paddingLeft: '18px', color: 'var(--ink-2)', lineHeight: '1.6' } });
    for (const st of audits) ul.append(h('li', `${st.num || ''} ${resolve(st.title, v)} — marked done, but the stand did not actually satisfy it${P.state.get(st.id).msg ? ` (${P.state.get(st.id).msg})` : ''}.`));
    for (const pm of S.pollMisses) ul.append(h('li', `Go/no-go at ${pm.t.toFixed(0)} s: called ${pm.final} ${pm.allGo ? 'with every station actually GO' : `with ${pm.missed.join(', ') || 'a station'} actually NO-GO`}.`));
    for (const sv of S.safetyViolations) ul.append(h('li', `Safety: ${sv.msg}`));
    body.append(ul);
  } else body.append(h('p', { style: { color: '#7fd18e' } }, 'Clean: every check you confirmed was true of the stand, every call was right, no safety rules broken.'));
  const passed = sum.counts.COMPLETE + sum.counts.SKIPPED === sum.total && S.pollMisses.length === 0 && S.safetyViolations.length === 0 && audits.length === 0;
  if (passed && app.level) app.recordCompetency(app.level.id, S.mode);
  body.append(h('p.faint', { style: { marginTop: '12px' } }, passed ? `Competency recorded: level ${app.level?.n ?? ''}, ${S.mode}.` : 'Competency not recorded this time — see above.'));
  const m = modal({ title: 'Debrief', narrow: true, body, footer: [btn('Close', () => m.close(), 'primary')] });
}
