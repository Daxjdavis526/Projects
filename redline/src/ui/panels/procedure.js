/* The procedure panel: the checklist, the active step, and — depending on
   mode — how much it tells you. Tutorial explains everything; guided
   explains on request; independent shows titles and expects you to know. */

import { h, btn, clear, setText } from '../dom.js';
import { resolve, ST } from '../../control/procedure.js';
import { toast } from '../modal.js';

// fault-injection sessions run under independent rules
const indep = m => m === 'independent' || m === 'fault';

const ICON = { PENDING: '○', COMPLETE: '✓', FAILED: '✕', SKIPPED: '–' };

export class ProcedurePanel {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.open = null;          // step id the operator expanded
    this.whyOpen = new Set();
    this.msgs = new Map();
    const S = app.session, P = S.procedure;
    host.append(h('div.ph', h('span.t', 'Procedure'), h('span.sp'), h('span.sub', S.mode.toUpperCase())));
    this.body = h('div.pb');
    host.append(this.body);
    if (!P) { this._noProc(); return; }
    this.head = h('div.proc-head', h('div.ttl', P.proc.title), h('div.meta', h('span', S.scenario?.objective || ''), this.count = h('span', '')), h('div.progress', this.bar = h('i')));
    this.body.append(this.head);
    this.els = new Map();
    let sec = null;
    for (const st of P.steps) {
      if (st.section !== sec) { sec = st.section; this.body.append(h('div.proc-sec', `${st.section} · ${st.sectionTitle}`)); }
      const ic = h('span.ic'), tt = h('span.tt');
      const row = h('div.sr', { onclick: () => { this.open = this.open === st.id ? '__none' : st.id; this.render(); } }, ic, h('span.n', st.num || ''), tt, h('span.stn', st.station || ''));
      const body = h('div.body.hidden');
      const el = h('div.step', row, body);
      this.body.append(el);
      this.els.set(st.id, { el, ic, tt, body, step: st });
    }
    for (const ev of ['change', 'active', 'holdStart', 'holdDone']) P.on(ev, () => this.render());
    P.on('active', a => { if (this.open === '__none') this.open = null; this._scrollTo(a.id); });
    P.on('done', () => app.debrief());
    this.render();
  }

  _noProc() {
    this.body.append(h('div', { style: { padding: '12px', color: 'var(--ink-3)', lineHeight: '1.6' } },
      h('p', 'Open stand — no procedure loaded. Everything is available; the interlocks and the physics still apply.'),
      h('p', 'Use the notebook to write your own plan before you start, and the event log to see what you actually did.')));
  }

  _scrollTo(id) {
    const e = this.els?.get(id);
    if (e) e.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  get expandedId() {
    const P = this.app.session.procedure;
    if (!P) return null;
    if (this.open && this.open !== '__none') return this.open;
    if (this.open === '__none') return null;
    return P.active?.id || null;
  }

  render() {
    const S = this.app.session, P = S.procedure;
    if (!P) return;
    const v = S.view();
    const act = P.active;
    const exp = this.expandedId;
    const sum = P.summary();
    const done = sum.counts.COMPLETE + sum.counts.SKIPPED + sum.counts.FAILED;
    setText(this.count, `${done}/${sum.total}`);
    this.bar.style.width = (100 * done / sum.total).toFixed(1) + '%';
    for (const [id, e] of this.els) {
      const st = P.state.get(id);
      e.el.className = `step ${st.status}${act?.id === id ? ' active' : ''}${exp === id ? ' open' : ''}`;
      setText(e.ic, ICON[st.status]);
      setText(e.tt, resolve(e.step.title, v));
      if (exp === id) { e.body.classList.remove('hidden'); this._body(e, st, v); }
      else if (!e.body.classList.contains('hidden')) { e.body.classList.add('hidden'); clear(e.body); }
    }
    // P&ID focus follows the expanded step (not in independent mode)
    const step = exp ? P.byId.get(exp) : null;
    this.app.setFocus(step && !indep(S.mode) ? step.focus || [] : []);
  }

  _body(e, st, v) {
    const S = this.app.session, P = S.procedure, step = e.step, mode = S.mode;
    const b = e.body;
    clear(b);
    if (!indep(mode)) {
      b.append(h('p', resolve(step.text, v)));
      if (step.why && (mode === 'tutorial' || this.whyOpen.has(step.id))) b.append(h('div.why', h('b', 'WHY  '), step.why));
      if (step.teach && mode === 'tutorial') b.append(h('div.teach', step.teach));
    }
    if (st.msg && st.status !== ST.PENDING) b.append(h('div.msg' + (st.status === ST.COMPLETE ? '.ok' : ''), st.msg));
    const m = this.msgs.get(step.id);
    if (m && st.status === ST.PENDING) b.append(h('div.msg' + (m.ok ? '.ok' : ''), m.text));
    const ctl = h('div.ctl');
    const confirm = (input) => {
      const r = P.confirm(step.id, input);
      this.msgs.set(step.id, r.ok ? { ok: true, text: r.note || 'Done.' } : { ok: false, text: r.msg || 'Not satisfied.' });
      if (!r.ok && r.msg && !indep(mode)) toast('Not yet', r.msg, 'info', 4200);
      this.render();
    };
    if (st.status === ST.PENDING || st.status === ST.FAILED) {
      if (st.status === ST.FAILED) ctl.append(btn('Re-open', () => { P.reopen(step.id); this.render(); }, 'sm ghost'));
      else switch (step.kind) {
        case 'info': ctl.append(btn('Acknowledge', () => confirm(), 'sm primary')); break;
        case 'action':
          if (indep(mode)) ctl.append(btn('Mark done', () => confirm(), 'sm'));
          else ctl.append(h('span.faint', { style: { fontSize: '11px' } }, 'Completes when the stand shows it done.'));
          break;
        case 'verify': ctl.append(btn('Verified', () => confirm(), 'sm primary'), btn('Mark failed', () => { P.fail(step.id, 'operator: check not satisfied'); this.render(); }, 'sm ghost')); break;
        case 'record': {
          const inp = h('input.in', { type: 'number', step: 'any', style: { width: '90px' } });
          inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') confirm(inp.value); });
          ctl.append(inp, h('span.faint', resolve(step.record.unit, v) || ''), btn('Record', () => confirm(inp.value), 'sm primary'));
          break;
        }
        case 'hold': {
          const hd = P.holds.get(step.id);
          if (!hd) ctl.append(btn('Start hold', () => { const r = P.startHold(step.id); if (r && !r.ok) { this.msgs.set(step.id, { ok: false, text: r.msg }); this.render(); } }, 'sm primary'));
          else if (!hd.result) {
            const bar = h('div.hold-bar', h('i'));
            const lab = h('span.mono.faint');
            ctl.append(bar, lab);
            this._hold = { bar, lab, hd };
          } else {
            b.append(h('div.msg' + (hd.result.ok ? '.ok' : ''), hd.result.msg));
            ctl.append(btn('Accept', () => confirm(true), 'sm go'), btn('Reject', () => confirm(false), 'sm nogo'),
              btn('Repeat hold', () => { P.holds.delete(step.id); this.render(); }, 'sm ghost'));
          }
          break;
        }
        case 'poll': ctl.append(btn('Open go/no-go poll', () => this.app.openPoll(), 'sm primary')); break;
      }
      if (st.status === ST.PENDING) {
        if (mode === 'guided' && step.why) ctl.append(h('button.lnk', { onclick: () => { this.whyOpen.has(step.id) ? this.whyOpen.delete(step.id) : this.whyOpen.add(step.id); this.render(); } }, this.whyOpen.has(step.id) ? 'hide why' : 'why?'));
        if (indep(mode) && !this.whyOpen.has(step.id)) ctl.append(h('button.lnk', { onclick: () => { this.whyOpen.add(step.id); this.render(); } }, 'detail'));
        ctl.append(h('button.lnk', { onclick: () => { P.skip(step.id); this.render(); } }, 'skip'));
      }
    }
    if (indep(mode) && this.whyOpen.has(step.id)) {
      b.prepend(h('p', resolve(step.text, v)));
    }
    b.append(ctl);
  }

  update() {
    // live hold progress
    const hd = this._hold;
    if (hd && hd.hd && !hd.hd.result) {
      const S = this.app.session;
      const f = Math.min(1, (S.t - hd.hd.start) / (hd.hd.end - hd.hd.start));
      hd.bar.firstChild.style.width = (f * 100).toFixed(1) + '%';
      setText(hd.lab, `${Math.max(0, hd.hd.end - S.t).toFixed(0)} s`);
    }
  }
}
