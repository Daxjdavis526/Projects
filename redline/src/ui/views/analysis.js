/* Post-test analysis: a recorded run at full rate, cursors, automatic
   reductions, and overlays of other runs aligned at T-0.

   The reductions are the same code the session uses (analysis/metrics.js);
   the cursors are there so you can check any of them by hand — and so you
   learn to read the numbers off the traces rather than trust a table. */

import { h, btn, clear, setText } from '../dom.js';
import { PlotStack } from '../panels/plots.js';
import { fmt, unitLabel, fmtT } from '../../lib/units.js';
import { lowerBound } from '../../analysis/metrics.js';

const DEFAULT = () => ([
  { channels: ['PT-201', 'PT-301', 'PT-401', 'SV-301-CMD'] },
  { channels: ['LC-501', 'SV-301-CMD'] },
  { channels: ['SV-301-I', 'SV-301-CMD'] },
]);

export class AnalysisView {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.main = null;
    this.overlay = new Set();
    this.cursors = { A: null, B: null };
    this.layout = DEFAULT();
    this.root = h('div.split', { style: { gridTemplateColumns: '250px 1fr 430px' } });
    host.append(this.root);
    this.render();
  }

  get S() { return this.app.session; }

  onSession() { this.main = null; this.overlay.clear(); this.render(); }
  onShow() { this.render(); }

  render() {
    clear(this.root);
    this.stack = null;
    const S = this.S;
    const runs = S ? S.runs : [];
    // list
    const list = h('div.pb.list');
    if (!runs.length) list.append(h('div', { style: { padding: '12px', color: 'var(--ink-4)', lineHeight: 1.6 } }, 'No recorded runs in this session. Record a firing (DAQ ▸ RECORD) and it appears here. Runs from earlier sessions keep their summaries in the NOTEBOOK; their traces are not kept.'));
    for (const r of runs) {
      const ov = h('input', { type: 'checkbox', checked: this.overlay.has(r.id), title: 'Overlay on the selected run', onclick: e => e.stopPropagation(), onchange: e => { e.target.checked ? this.overlay.add(r.id) : this.overlay.delete(r.id); this.render(); } });
      list.append(h('div.li' + (this.main === r.id ? '.sel' : ''), { onclick: () => { this.main = r.id; this.overlay.delete(r.id); this.cursors = { A: null, B: null }; this.render(); } },
        h('div.a', h('b', r.id), h('span.faint', r.aborted ? 'ABORT' : r.tFire === null ? 'no firing' : r.plan?.mode === 'pulse' ? 'pulses' : `${(r.plan?.duration ?? 0).toFixed(2)} s`),
          h('span', { style: { marginLeft: 'auto' } }, this.main !== r.id ? h('label.chk', { title: 'overlay' }, ov, 'ovl') : null)),
        h('div.b', `${fmt(r.meta.config.regSet, 'pressure', 0)} ${unitLabel('pressure', true)} set · ${r.data.rate} Hz · ${(r.stop - r.start).toFixed(1)} s`)));
    }
    this.root.append(h('div.panel', h('div.ph', h('span.t', 'Runs'), h('span.sp'), h('span.sub', 'tick to overlay')), list));

    const run = runs.find(r => r.id === this.main) || null;
    const centre = h('div.panel');
    const right = h('div.panel');
    this.root.append(centre, right);
    if (!run) {
      centre.append(h('div.ph', h('span.t', 'Traces')), h('div', { style: { padding: '14px', color: 'var(--ink-4)' } }, runs.length ? 'Select a run.' : ''));
      right.append(h('div.ph', h('span.t', 'Reduction')));
      return;
    }
    S.flag('analysis:' + run.id);
    const overlays = runs.filter(r => this.overlay.has(r.id) && r.id !== run.id);
    const ref = run.tFire ?? run.start;
    const presets = [
      ['Full record', () => this.stack.axis.setRange(run.data.tFirst, run.data.tLast)],
      ['Start', () => this.stack.axis.setRange(ref - 0.03, ref + 0.08)],
      ['Shutdown', () => { const m = run.metrics; const t = m?.tOff ?? ref; this.stack.axis.setRange(t - 0.03, t + 0.08); }],
      ['Burn', () => { const m = run.metrics; this.stack.axis.setRange(ref - 0.3, (m?.tOff ?? ref + 1) + 0.4); }],
    ];
    const tb = h('div.filters', presets.map(([l, f]) => h('button', { onclick: f }, l)));
    const head = h('div.ph', h('span.t', `Traces — ${run.id}`), overlays.length ? h('span.sub', `+ ${overlays.map(o => o.id.split('-').pop()).join(', ')} (dashed, aligned at T-0)`) : null, h('span.sp'), tb,
      btn('+ PLOT', () => this.stack.configure(), 'sm ghost'));
    centre.append(head);
    const body = h('div', { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } });
    centre.append(body);
    centre.append(h('div', { style: { padding: '3px 10px', fontSize: '11px', color: 'var(--ink-4)', borderTop: '1px solid var(--line)' } }, 'Click: cursor A · shift-click: cursor B · drag a cursor to move it · wheel: zoom · drag: pan · dbl-click: full record'));
    const chans = S.daq.channels;
    this.stack = new PlotStack(body, this.app, {
      layout: this.layout, live: false,
      channels: () => chans,
      makeTraces: (m, color) => [
        { id: m.id, source: run.data, color, label: m.id, quantity: m.quantity, gauge: m.gauge, discrete: m.quantity === 'discrete', desc: m.desc, shift: 0 },
        ...overlays.map(o => ({ id: m.id, source: o.data, color, dash: [5, 3], alpha: 0.8, label: `${m.id} · ${o.id.split('-').pop()}`, quantity: m.quantity, gauge: m.gauge,
          discrete: m.quantity === 'discrete', shift: (ref) - (o.tFire ?? o.start) })).filter(t => !t.discrete),
      ],
      timeRef: () => ref,
      events: (t0, t1) => run.events.filter(e => e.t >= t0 && e.t <= t1 && (e.cat === 'CMD' || e.cat === 'ABT' || e.cat === 'ALM' || e.text === 'T-0'))
        .map(e => ({ t: e.t, label: e.text.replace(/ \(.*\)$/, '').slice(0, 22), color: e.cat === 'ABT' ? '#e5484d' : e.cat === 'ALM' ? '#a07b17' : e.text === 'T-0' ? '#8c7a3c' : '#5b4f96' })),
      cursors: this.cursors,
      onCursor: () => this.readouts(run),
      onReset: () => this.stack.axis.setRange(run.data.tFirst, run.data.tLast),
      clockBase: S.clockStart,
    });
    this.stack.axis.bounds = [run.data.tFirst, run.data.tLast];
    if (run.tFire !== null) presets[3][1](); else presets[0][1]();
    // right: reductions + cursors
    right.append(h('div.ph', h('span.t', 'Reduction'), h('span.sp'), h('span.sub', run.metrics ? (run.metrics.kind === 'pulse' ? 'pulse train' : 'single burn') : '')));
    const rb = h('div.pb');
    right.append(rb);
    this.cursorBox = h('div');
    rb.append(h('div.proc-sec', 'Cursors'), this.cursorBox);
    this.readouts(run);
    rb.append(h('div.proc-sec', 'Automatic reduction'));
    const t = h('table.metrics');
    if (!run.metrics || !run.metrics.items.length) t.append(h('tr', h('td.n', run.metrics?.note || 'No firing in this recording.')));
    else for (const it of run.metrics.items) {
      t.append(h('tr', { title: it.note || '' }, h('td', it.label), h('td.v', it.quantity === 'discrete' ? String(it.value) : fmt(it.value, it.quantity, it.quantity === 'time' ? 4 : undefined)),
        h('td.u', it.quantity === 'time' ? 's' : unitLabel(it.quantity, it.quantity === 'pressure' ? true : undefined))));
      if (it.note) t.append(h('tr', h('td.n', { colSpan: 3, style: { paddingTop: 0 } }, it.note)));
    }
    rb.append(t);
    const pred = run.meta.config.prediction;
    if (pred && run.metrics?.summary?.F !== undefined) {
      const m = run.metrics.summary;
      rb.append(h('div.proc-sec', 'Prediction vs measured'));
      const pt = h('table.metrics');
      pt.append(h('tr.hd', h('td', ''), h('td', 'pred.'), h('td', 'meas.'), h('td', 'Δ')));
      const row = (l, p, x, q) => pt.append(h('tr', h('td', l), h('td.v', fmt(p, q)), h('td.v', fmt(x, q)), h('td.v', `${(100 * (x / p - 1)).toFixed(1)} %`)));
      row('Chamber pressure', pred.Pc, m.Pc, 'pressure');
      row('Thrust', pred.F, m.F, 'force');
      row('Mass flow (MDOT-C)', pred.mdot, m.mdot, 'massflow');
      pt.append(h('tr', h('td', 'Isp'), h('td.v', pred.Isp.toFixed(1)), h('td.v', Number.isFinite(m.Isp) ? m.Isp.toFixed(1) : '----'), h('td.v', `${(100 * (m.Isp / pred.Isp - 1)).toFixed(1)} %`)));
      rb.append(pt);
    }
    if (run.metrics?.pulses) {
      rb.append(h('div.proc-sec', 'Pulses'));
      const pt = h('table.metrics');
      pt.append(h('tr.hd', h('td', '#'), h('td', 'width'), h('td', 'I-bit'), h('td', 'Pc peak')));
      for (const p of run.metrics.pulses) pt.append(h('tr', h('td', String(p.n)), h('td.v', `${(p.width * 1e3).toFixed(1)} ms`), h('td.v', `${(p.Ibit * 1e3).toFixed(2)} mN·s`), h('td.v', fmt(p.PcPeak, 'pressure'))));
      rb.append(pt);
    }
    if (overlays.length) {
      rb.append(h('div.proc-sec', 'Run comparison'));
      const ct = h('table.metrics');
      ct.append(h('tr.hd', h('td', 'Run'), h('td', 'Pc'), h('td', 'F'), h('td', 'I'), h('td', 'Isp')));
      for (const r of [run, ...overlays]) {
        const m = r.metrics?.summary || {};
        ct.append(h('tr', h('td', r.id.split('-').pop()), h('td.v', fmt(m.Pc, 'pressure')), h('td.v', fmt(m.F, 'force')), h('td.v', fmt(m.I, 'impulse')), h('td.v', Number.isFinite(m.Isp) ? m.Isp.toFixed(1) : '----')));
      }
      rb.append(ct);
    }
    rb.append(h('div', { style: { padding: '8px 10px' } }, btn('Open in notebook', () => { this.app.show('notebook'); this.app.notebook.select(run.id); }, 'sm ghost')));
  }

  update() {
    if (!this.stack) return;
    const A = this.cursors.A;
    for (const c of this.stack.charts) {
      if (!c.dirty) continue;
      c.draw();
      c.updateLegend(t => (A !== null && t.source.valueAt ? t.source.valueAt(t.id, A - (t.shift || 0)) : NaN));
    }
  }

  readouts(run) {
    if (!this.cursorBox) return;
    clear(this.cursorBox);
    const { A, B } = this.cursors;
    const ref = run.tFire ?? run.start;
    const t = h('table.metrics');
    t.append(h('tr.hd', h('td', 'Channel'), h('td', 'A'), h('td', 'B'), h('td', 'B − A'), h('td', 'mean A…B')));
    const fmtT2 = x => (x === null ? '—' : fmtT(x - ref, 4));
    t.append(h('tr', h('td', 'Time'), h('td.v', fmtT2(A)), h('td.v', fmtT2(B)), h('td.v', A !== null && B !== null ? `${((B - A) * 1e3).toFixed(2)} ms` : '—'), h('td', '')));
    const ids = [...new Set(this.layout.flatMap(p => p.channels))];
    for (const id of ids) {
      const ch = this.S.daq.channel(id);
      if (!ch || ch.quantity === 'discrete') continue;
      const va = A !== null ? run.data.valueAt(id, A) : NaN, vb = B !== null ? run.data.valueAt(id, B) : NaN;
      let mean = NaN;
      if (A !== null && B !== null) {
        const T = run.data.T, V = run.data.series(id);
        const a = Math.min(A, B), b = Math.max(A, B);
        let s = 0, n = 0;
        for (let k = lowerBound(T, a); k < T.length && T[k] <= b; k++) { if (!Number.isNaN(V[k])) { s += V[k]; n++; } }
        mean = n ? s / n : NaN;
      }
      t.append(h('tr', h('td', id), h('td.v', fmt(va, ch.quantity)), h('td.v', fmt(vb, ch.quantity)), h('td.v', fmt(vb - va, ch.quantity)), h('td.v', fmt(mean, ch.quantity))));
    }
    this.cursorBox.append(t);
    if (A === null) this.cursorBox.append(h('div.faint', { style: { padding: '4px 10px', fontSize: '11px' } }, 'Place cursors on the traces to read values and differences.'));
  }
}
