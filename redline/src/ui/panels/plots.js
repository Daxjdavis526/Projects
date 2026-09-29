/* A stack of strip charts sharing one time axis, with the operator's own
   choice of channels on each. Used live in the control room and on
   recorded runs in the analysis view. */

import { h, btn, clear } from '../dom.js';
import { Chart, TimeAxis, SERIES } from '../plot/chart.js';
import { modal } from '../modal.js';
import { fmt } from '../../lib/units.js';

const GROUPS = [
  ['pressure', 'Pressure'], ['force', 'Force'], ['temperature', 'Temperature'], ['massflow', 'Mass flow'],
  ['current', 'Electrical'], ['discrete', 'Discrete (logic lanes)'],
];

export class PlotStack {
  constructor(host, app, opts) {
    this.app = app;
    this.o = opts;
    this.host = host;
    this.axis = new TimeAxis({ live: opts.live !== false, window: opts.window ?? 30 });
    this.axis.onChange = () => this.charts.forEach(c => (c.dirty = true));
    this.layout = opts.layout;
    this.charts = [];
    this.body = h('div.plots');
    host.append(this.body);
    this.rebuild();
  }

  channels() { return this.o.channels(); }
  chanMeta(id) { return this.channels().find(c => c.id === id); }

  rebuild() {
    this.charts.forEach(c => c.destroy());
    clear(this.body);
    this.charts = this.layout.map((pl, i) => {
      const host = h('div.plot');
      this.body.append(host);
      const chart = new Chart(host, {
        axis: this.axis,
        traces: this._traces(pl),
        timeRef: this.o.timeRef,
        events: this.o.events,
        limits: this.o.limits,
        cursors: this.o.cursors,
        onCursor: this.o.onCursor,
        clockBase: this.o.clockBase,
        onReset: this.o.onReset,
      });
      chart.tools.append(btn('⚙', () => this.configure(i), 'sm ghost', { title: 'Choose channels' }));
      return chart;
    });
    this.o.onLayout && this.o.onLayout(this.layout);
  }

  _traces(pl) {
    if (!pl.colors) pl.colors = {};
    const used = new Set(Object.values(pl.colors));
    for (const id of pl.channels) {
      if (!pl.colors[id]) {
        const c = SERIES.find(x => !used.has(x)) || SERIES[pl.channels.indexOf(id) % SERIES.length];
        pl.colors[id] = c; used.add(c);
      }
    }
    const out = [];
    for (const id of pl.channels) {
      const m = this.chanMeta(id);
      if (!m) continue;
      if (this.o.makeTraces) out.push(...this.o.makeTraces(m, pl.colors[id]));
      else out.push({ id, source: this.o.source(), color: pl.colors[id], label: id, quantity: m.quantity, gauge: m.gauge, discrete: m.quantity === 'discrete', desc: m.desc });
    }
    return out;
  }

  refreshTraces() { this.charts.forEach((c, i) => c.setTraces(this._traces(this.layout[i]))); }

  addChannel(i, id) {
    const pl = this.layout[i];
    if (pl.channels.includes(id)) return;
    const m = this.chanMeta(id);
    const q = this._plotQuantity(pl);
    if (m.quantity !== 'discrete' && q && q !== m.quantity) {
      this.app.toast?.('Different quantity', `Plot ${i + 1} shows ${q}. One axis per plot — put ${id} on another plot.`);
      return;
    }
    pl.channels.push(id);
    this.charts[i].setTraces(this._traces(pl));
    this.o.onLayout && this.o.onLayout(this.layout);
  }

  _plotQuantity(pl) {
    for (const id of pl.channels) { const m = this.chanMeta(id); if (m && m.quantity !== 'discrete') return m.quantity; }
    return null;
  }

  configure(focus = 0) {
    const draft = this.layout.map(p => ({ channels: [...p.channels], colors: { ...(p.colors || {}) } }));
    const body = h('div');
    const render = () => {
      clear(body);
      body.append(h('p.muted', 'One physical quantity per plot — pressures together, thrust on its own axis. Discrete channels (commands, limit switches) can go on any plot as logic lanes.'));
      draft.forEach((pl, i) => {
        const q = this._plotQuantity(pl);
        const box = h('div', { style: { border: '1px solid var(--line)', marginBottom: '8px', padding: '6px 10px' } });
        box.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' } },
          h('b', `Plot ${i + 1}`), h('span.faint', q ? q : 'empty'), h('span', { style: { flex: 1 } }),
          draft.length > 1 ? btn('Remove plot', () => { draft.splice(i, 1); render(); }, 'sm ghost') : null));
        const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '2px 12px' } });
        for (const [gq, gname] of GROUPS) {
          const chs = this.channels().filter(c => c.quantity === gq || (gq === 'current' && c.quantity === 'voltage'));
          if (!chs.length) continue;
          grid.append(h('div.faint', { style: { gridColumn: '1/-1', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: '4px' } }, gname));
          for (const c of chs) {
            const on = pl.channels.includes(c.id);
            const disabled = !on && c.quantity !== 'discrete' && q && q !== c.quantity;
            const cb = h('input', { type: 'checkbox', checked: on, disabled, onchange: () => {
              if (cb.checked) pl.channels.push(c.id); else pl.channels = pl.channels.filter(x => x !== c.id);
              render();
            } });
            grid.append(h('label.chk', { title: c.desc, style: { opacity: disabled ? 0.4 : 1 } }, cb, h('span.mono', c.id), h('span.faint', { style: { fontSize: '10.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, c.desc)));
          }
        }
        box.append(grid);
        body.append(box);
      });
      if (draft.length < 6) body.append(btn('+ Add plot', () => { draft.push({ channels: [], colors: {} }); render(); }, 'sm'));
    };
    render();
    const m = modal({
      title: 'Plot configuration', body,
      footer: [btn('Cancel', () => m.close(), 'ghost'), btn('Apply', () => {
        this.layout.splice(0, this.layout.length, ...draft);
        this.rebuild(); m.close();
      }, 'primary')],
    });
  }

  toolbar() {
    const wins = [[2, '2 s'], [10, '10 s'], [30, '30 s'], [120, '2 min'], [600, '10 min'], [3600, '1 h']];
    const wrap = h('div.filters');
    const live = h('button', { onclick: () => this.axis.goLive(), title: 'Follow the latest data' }, 'LIVE');
    const bs = wins.map(([w, l]) => h('button', { onclick: () => { this.axis.setWindow(w); if (!this.axis.live) this.axis.goLive(); } }, l));
    wrap.append(...bs, live);
    this._tb = { bs, live, wins };
    return wrap;
  }

  syncToolbar() {
    if (!this._tb) return;
    this._tb.bs.forEach((b, i) => b.classList.toggle('on', Math.abs(this.axis.window - this._tb.wins[i][0]) < 1e-6));
    this._tb.live.classList.toggle('on', this.axis.live);
  }

  draw(tLatest, legendValue) {
    const now = performance.now();
    const legendDue = !this._lastLegend || now - this._lastLegend > 200;
    for (const c of this.charts) {
      c.draw(tLatest);
      if (legendDue && legendValue) c.updateLegend(legendValue);
    }
    if (legendDue) { this._lastLegend = now; this.syncToolbar(); }
  }
}

export function eventMarkers(session) {
  const items = session.log.items;
  return (t0, t1) => {
    const out = [];
    // binary search to the window start
    let lo = 0, hi = items.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (items[m].t < t0) lo = m + 1; else hi = m; }
    for (let i = lo; i < items.length && items[i].t <= t1; i++) {
      const e = items[i];
      if (e.cat === 'CMD') out.push({ t: e.t, label: e.text.replace(/ \(.*\)$/, ''), color: '#5b4f96' });
      else if (e.cat === 'SEQ' && e.text === 'T-0') out.push({ t: e.t, label: 'T-0', color: '#8c7a3c' });
      else if (e.cat === 'ABT' && e.text.startsWith('ABORT')) out.push({ t: e.t, label: 'ABORT', color: '#e5484d' });
      else if (e.cat === 'ALM') out.push({ t: e.t, label: e.text.split(':')[0], color: e.level === 'redline' ? '#e5484d' : e.level === 'warning' ? '#ec835a' : '#a07b17' });
    }
    return out;
  };
}

export function limitLines(session) {
  const def = session.def;
  return ids => {
    const ctx = session.alarmCtx();
    const out = [];
    for (const L of def.limits) {
      if (!ids.includes(L.channel)) continue;
      let active = true;
      if (L.when) { try { active = !!L.when(ctx); } catch { active = false; } }
      const constant = typeof L.hi !== 'function' && typeof L.lo !== 'function';
      if (!active && !(constant && L.level === 'redline')) continue;
      const tag = L.level === 'redline' ? 'RL' : L.level === 'warning' ? 'WRN' : 'CAU';
      for (const [k, sense] of [['hi', 'HI'], ['lo', 'LO']]) {
        if (L[k] === undefined) continue;
        const v = typeof L[k] === 'function' ? L[k](ctx) : L[k];
        if (!Number.isFinite(v)) continue;
        out.push({ v, level: L.level, active, label: `${L.channel} ${tag} ${sense} ${fmt(v, session.daq.channel(L.channel).quantity)}` });
      }
    }
    return out;
  };
}
