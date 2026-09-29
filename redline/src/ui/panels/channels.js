/* Live channel readouts: every DAQ channel, grouped, with alarm state. */
import { h, setText } from '../dom.js';
import { fmt, unitLabel } from '../../lib/units.js';
import { LEVELS } from '../../control/alarms.js';

const GROUPS = [
  ['Pressure', c => c.quantity === 'pressure' && c.kind !== 'derived'],
  ['Temperature', c => c.quantity === 'temperature'],
  ['Thrust', c => c.quantity === 'force'],
  ['Derived', c => c.kind === 'derived'],
  ['Electrical', c => c.quantity === 'current'],
  ['Discrete / commands', c => c.quantity === 'discrete'],
];

export class ChannelTable {
  constructor(host, app) {
    this.app = app;
    this.rows = [];
    const S = app.session;
    const tb = h('table.ch-table');
    const used = new Set();
    for (const [name, pred] of GROUPS) {
      const chs = S.daq.channels.filter(c => pred(c) && !used.has(c.id));
      if (!chs.length) continue;
      tb.append(h('tr.grp', h('td', { colSpan: 5 }, name)));
      for (const c of chs) {
        used.add(c.id);
        const val = h('td.val', '----'), unit = h('td.unit', unitLabel(c.quantity, c.gauge));
        const tr = h('tr', { onclick: () => app.inspect(c.id, 'channel'), title: c.desc },
          h('td.st', h('span.dot')), h('td.tg', c.id), h('td.desc', c.desc), val, unit);
        tb.append(tr);
        this.rows.push({ c, tr, val, unit });
      }
    }
    host.append(tb);
  }

  update() {
    const S = this.app.session, d = S.daq;
    const lvl = new Map();
    for (const a of S.alarms.list) {
      if (!a.channel || !(a.active || !a.acked)) continue;
      lvl.set(a.channel, Math.max(lvl.get(a.channel) || 0, LEVELS[a.level]));
    }
    for (const r of this.rows) {
      const v = d.latest(r.c.id);
      setText(r.val, !d.online ? '----' : r.c.quantity === 'discrete' ? (v >= 0.5 ? '1' : '0') : fmt(v, r.c.quantity));
      setText(r.unit, unitLabel(r.c.quantity, r.c.gauge));
      const l = lvl.get(r.c.id);
      const cls = (l ? 'c' + l : d.online ? 'ok' : '') + (this.app.selected === r.c.id ? ' sel' : '');
      if (r.tr.className !== cls) r.tr.className = cls;
    }
  }
}
