/* Event log and alarm list — the bottom strip of the control room. */
import { h, btn, clear, setText } from '../dom.js';
import { fmtT, fmtClock } from '../../lib/units.js';

const FILTERS = [
  ['ALL', null], ['CMD', ['CMD']], ['IND', ['IND']], ['SEQ', ['SEQ', 'ABT']], ['ALM', ['ALM', 'INT', 'SAF']],
  ['TECH', ['TECH', 'FAC']], ['DAQ', ['DAQ']], ['PROC', ['PROC', 'OPR']],
];
const MAX_ROWS = 600;

export class EventLogPanel {
  constructor(host, app) {
    this.app = app;
    this.tab = 'EVENTS';
    this.filter = null;
    this.tabs = h('div.tabs');
    for (const t of ['EVENTS', 'ALARMS']) this.tabs.append(h('button', { dataset: { t }, onclick: () => this.show(t) }, t));
    this.filters = h('div.filters');
    for (const [name, cats] of FILTERS) this.filters.append(h('button', { onclick: () => { this.filter = cats; this.rebuild(); } , dataset: { f: name } }, name));
    this.ackAll = btn('ACK ALL', () => app.session.alarms.ackAll(), 'sm ghost');
    this.alarmCount = h('span.sub');
    host.append(h('div.ph', this.tabs, h('span.sp'), this.alarmCount, this.filters, this.ackAll));
    this.body = h('div.pb.log');
    host.append(this.body);
    this.show('EVENTS');
    app.session.log.on('event', e => { if (this.tab === 'EVENTS') this._append(e, true); });
    const al = app.session.alarms;
    for (const ev of ['raise', 'rtn', 'ack']) al.on(ev, () => { if (this.tab === 'ALARMS') this.rebuild(); });
  }

  show(t) {
    this.tab = t;
    for (const b of this.tabs.children) b.classList.toggle('on', b.dataset.t === t);
    this.filters.classList.toggle('hidden', t !== 'EVENTS');
    this.ackAll.classList.toggle('hidden', t !== 'ALARMS');
    this.rebuild();
  }

  rebuild() {
    clear(this.body);
    for (const b of this.filters.children) b.classList.toggle('on', (FILTERS.find(f => f[0] === b.dataset.f)[1]) === this.filter);
    if (this.tab === 'EVENTS') {
      const items = this.app.session.log.items.filter(e => !this.filter || this.filter.includes(e.cat)).slice(-MAX_ROWS);
      for (const e of items) this._append(e, false);
      this.body.scrollTop = this.body.scrollHeight;
    } else this._alarms();
  }

  _append(e, live) {
    if (this.filter && !this.filter.includes(e.cat)) return;
    const S = this.app.session;
    const stick = this.body.scrollHeight - this.body.scrollTop - this.body.clientHeight < 30;
    this.body.append(h(`div.e.${e.cat}.lv-${e.level}`,
      h('span.c', fmtClock(S.clockStart + e.t)), h('span.T', e.T !== null && e.T !== undefined ? fmtT(e.T) : ''),
      h('span.k', e.cat), h('span.x', e.text)));
    while (this.body.childElementCount > MAX_ROWS) this.body.firstChild.remove();
    if (!live || stick) this.body.scrollTop = this.body.scrollHeight;
  }

  _alarms() {
    const S = this.app.session;
    const list = S.alarms.list;
    if (!list.length) { this.body.append(h('div', { style: { padding: '10px', color: 'var(--ink-4)' } }, 'No alarms.')); return; }
    for (const a of list) {
      this.body.append(h(`div.alm-row.${a.level}${a.acked ? '' : '.unacked'}`,
        h('span.lv', a.level.toUpperCase()), h('span.mono.faint', fmtClock(S.clockStart + a.t)),
        h('span', a.text, a.count > 1 ? h('span.faint', ` ×${a.count}`) : null),
        h('span', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, h('span.st', a.active ? 'ACTIVE' : 'RTN'), a.acked ? h('span.faint', 'acked') : btn('ACK', () => S.alarms.ack(a.id), 'sm'))));
    }
  }

  update() {
    const S = this.app.session;
    const n = S.alarms.list.filter(a => !a.acked).length;
    setText(this.alarmCount, n ? `${n} unacked` : '');
    this.alarmCount.style.color = n ? 'var(--caution)' : '';
  }
}
