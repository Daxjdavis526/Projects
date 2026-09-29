/* Post-test analysis.

   TRACES   one recorded run at full rate: cursors, automatic reductions,
            overlays of other runs aligned at T-0, CSV export.
   CAMPAIGN many runs at once: any per-run quantity against any other, a
            least-squares line with its uncertainty and what it means, and
            repeatability statistics.

   Runs come from this session and from test history (IndexedDB), so a
   campaign can span sessions. The reductions are the same code the session
   uses (analysis/metrics.js); the cursors are there so you can check any of
   them by hand. */

import { h, btn, clear } from '../dom.js';
import { PlotStack } from '../panels/plots.js';
import { Scatter } from '../plot/scatter.js';
import { fmt, unitLabel, fmtT, toDisplay } from '../../lib/units.js';
import { lowerBound } from '../../analysis/metrics.js';
import { QUANTITIES_CATALOG, value, linfit, stats, interpret, runKind } from '../../analysis/campaign.js';
import { channelList } from '../../instruments/daq.js';
import { STANDS } from '../../content/programs.js';
import { history, runCSV, download } from '../history.js';
import { toast } from '../modal.js';

const DEFAULT = () => ([
  { channels: ['PT-201', 'PT-301', 'PT-401', 'SV-301-CMD'] },
  { channels: ['LC-501', 'SV-301-CMD'] },
  { channels: ['SV-301-I', 'SV-301-CMD'] },
]);

const PRESETS = [
  ['F vs Pc (abs)', 'PcAbs', 'F'],
  ['ṁ (FT-201) vs Pc (abs)', 'PcAbs', 'mdotFM'],
  ['Throat Ø vs Pc', 'Pc', 'dThroat'],
  ['Droop vs setpoint', 'regSet', 'droop'],
  ['Delay vs setpoint', 'regSet', 'delay'],
  ['I-bit vs width', 'width', 'Ibit'],
  ['I-bit scatter vs width', 'width', 'IbitCv'],
];

const short = id => id.split('-').pop();
const qfmt = (v, q) => (q === 'time' ? `${(v * 1e3).toFixed(2)} ms` : q === 'ratio' ? (Number.isFinite(v) ? v.toPrecision(4) : '----') : `${fmt(v, q)} ${unitLabel(q, q === 'pressure' ? true : undefined)}`);

export class AnalysisView {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.mode = 'traces';
    this.main = null;
    this.overlay = new Set();
    this.excluded = new Set();
    this.withHistory = true;
    this.xKey = 'PcAbs'; this.yKey = 'F';
    this.cursors = { A: null, B: null };
    this.layout = DEFAULT();
    this.root = h('div.split', { style: { gridTemplateColumns: '260px 1fr 430px' } });
    host.append(this.root);
    history.refresh().then(() => this.render());
    this.render();
  }

  get S() { return this.app.session; }

  onSession() { this.main = null; this.overlay.clear(); this.render(); }
  onShow() { history.refresh().then(() => this.render()); }

  /* Every run we know about: this session's (with data), then history. */
  pool() {
    const out = [], seen = new Set();
    for (const r of (this.S?.runs || [])) { out.push({ id: r.id, run: r, rec: r, live: true }); seen.add(r.id); }
    if (this.withHistory) for (const rec of history.index) if (!seen.has(rec.id)) out.push({ id: rec.id, run: history.cache.get(rec.id) || null, rec, live: false });
    return out;
  }

  async ensure(entry) {
    if (entry.run) return entry.run;
    const r = await history.load(entry.id);
    if (!r) toast('Not available', 'That run\'s traces are no longer in test history.', 'info');
    return r;
  }

  render() {
    clear(this.root);
    this.stack?.charts.forEach(c => c.destroy());
    this.stack = null; this.scatter?.destroy(); this.scatter = null;
    const pool = this.pool();
    this.root.append(this.listPanel(pool));
    const centre = h('div.panel'), right = h('div.panel');
    this.root.append(centre, right);
    const tabs = h('div.tabs', [['traces', 'Traces'], ['campaign', 'Campaign']].map(([k, l]) =>
      h('button' + (this.mode === k ? '.on' : ''), { onclick: () => { this.mode = k; this.render(); } }, l)));
    if (this.mode === 'campaign') this.campaign(pool, centre, right, tabs);
    else this.traces(pool, centre, right, tabs);
  }

  listPanel(pool) {
    const list = h('div.pb.list');
    const camp = this.mode === 'campaign';
    if (!pool.length) list.append(h('div', { style: { padding: '12px', color: 'var(--ink-4)', lineHeight: 1.6 } },
      'No recorded runs yet. Record a firing (DAQ ▸ RECORD) and it appears here, and stays in test history for later sessions.'));
    let group = null;
    for (const e of pool) {
      const g = e.live ? 'This session' : 'Test history';
      if (g !== group) { group = g; list.append(h('div.proc-sec', g)); }
      const r = e.rec;
      const cfg = r.meta?.config || {};
      const desc = r.aborted ? 'ABORT' : r.tFire === null ? 'no firing' : r.plan?.mode === 'pulse' ? `${r.plan.count} × ${(r.plan.on * 1e3).toFixed(0)} ms` : `${(r.plan?.duration ?? 0).toFixed(2)} s`;
      let box = null;
      if (camp) {
        const usable = !!r.metrics && !r.aborted;
        box = h('input', { type: 'checkbox', checked: usable && !this.excluded.has(e.id), disabled: !usable, title: 'Include in the campaign',
          onclick: ev => ev.stopPropagation(), onchange: ev => { ev.target.checked ? this.excluded.delete(e.id) : this.excluded.add(e.id); this.render(); } });
      } else if (this.main !== e.id) {
        box = h('input', { type: 'checkbox', checked: this.overlay.has(e.id), title: 'Overlay on the selected run', onclick: ev => ev.stopPropagation(),
          onchange: async ev => { if (ev.target.checked) { if (await this.ensure(e)) this.overlay.add(e.id); } else this.overlay.delete(e.id); this.render(); } });
      }
      list.append(h('div.li' + (!camp && this.main === e.id ? '.sel' : ''), {
        onclick: async () => { if (camp) return; if (!(await this.ensure(e))) return; this.main = e.id; this.overlay.delete(e.id); this.cursors = { A: null, B: null }; this.render(); } },
        h('div.a', h('b', e.id), h('span.faint', desc), h('span', { style: { marginLeft: 'auto' } }, box ? h('label.chk', box, camp ? '' : 'ovl') : null)),
        h('div.b', `${fmt(cfg.regSet, 'pressure', 0)} ${unitLabel('pressure', true)} · ${cfg.rate ?? r.rate} Hz${e.live ? '' : ' · ' + (r.date || '').slice(0, 10)}`)));
    }
    const hist = h('input', { type: 'checkbox', checked: this.withHistory, onchange: ev => { this.withHistory = ev.target.checked; this.render(); } });
    return h('div.panel', h('div.ph', h('span.t', 'Runs'), h('span.sp'), h('label.chk', { style: { fontSize: '10px' } }, hist, 'history')), list);
  }

  /* ---- TRACES --------------------------------------------------------- */
  traces(pool, centre, right, tabs) {
    const entry = pool.find(e => e.id === this.main);
    const run = entry?.run || null;
    if (!run) {
      centre.append(h('div.ph', tabs), h('div', { style: { padding: '14px', color: 'var(--ink-4)' } }, pool.length ? 'Select a run.' : ''));
      right.append(h('div.ph', h('span.t', 'Reduction')));
      return;
    }
    this.S?.flag('analysis:' + run.id);
    const def = STANDS[run.meta.config.stand] || STANDS['TS-1'];
    const overlays = pool.filter(e => this.overlay.has(e.id) && e.id !== run.id && e.run).map(e => e.run);
    const ref = run.tFire ?? run.start;
    const presets = [
      ['Full', () => this.stack.axis.setRange(run.data.tFirst, run.data.tLast)],
      ['Start', () => this.stack.axis.setRange(ref - 0.02, ref + 0.05)],
      ['Shutdown', () => { const t = run.metrics?.tOff ?? ref; this.stack.axis.setRange(t - 0.02, t + 0.05); }],
      ['Burn', () => { const m = run.metrics; this.stack.axis.setRange(ref - 0.3, (m?.kind === 'pulse' ? m.pulses[m.pulses.length - 1].tOff + 0.1 : (m?.tOff ?? ref + 1)) + 0.4); }],
    ];
    const tb = h('div.filters', presets.map(([l, f]) => h('button', { onclick: f }, l)));
    centre.append(h('div.ph', tabs, h('span.sub', `${run.id}${overlays.length ? ` + ${overlays.map(o => short(o.id)).join(', ')} dashed, aligned at T-0` : ''}`), h('span.sp'), tb,
      btn('CSV', () => download(`${run.id}.csv`, runCSV(run)), 'sm ghost', { title: 'Every channel, full rate, SI units' }),
      btn('+ PLOT', () => this.stack.configure(), 'sm ghost')));
    const body = h('div', { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } });
    centre.append(body);
    centre.append(h('div', { style: { padding: '3px 10px', fontSize: '11px', color: 'var(--ink-4)', borderTop: '1px solid var(--line)' } }, 'Click: cursor A · shift-click: cursor B · drag a cursor to move it · wheel: zoom · drag: pan · dbl-click: full record'));
    const chans = channelList(def);
    this.stack = new PlotStack(body, this.app, {
      layout: this.layout, live: false,
      channels: () => chans,
      makeTraces: (m, color) => [
        { id: m.id, source: run.data, color, label: m.id, quantity: m.quantity, gauge: m.gauge, discrete: m.quantity === 'discrete', desc: m.desc, shift: 0 },
        ...overlays.map(o => ({ id: m.id, source: o.data, color, dash: [5, 3], alpha: 0.8, label: `${m.id} · ${short(o.id)}`, quantity: m.quantity, gauge: m.gauge,
          discrete: m.quantity === 'discrete', shift: ref - (o.tFire ?? o.start) })).filter(t => !t.discrete),
      ],
      timeRef: () => ref,
      events: (t0, t1) => (run.events || []).filter(e => e.t >= t0 && e.t <= t1 && (e.cat === 'CMD' || e.cat === 'ABT' || e.cat === 'ALM' || e.text === 'T-0'))
        .map(e => ({ t: e.t, label: e.text.replace(/ \(.*\)$/, '').slice(0, 22), color: e.cat === 'ABT' ? '#e5484d' : e.cat === 'ALM' ? '#a07b17' : e.text === 'T-0' ? '#8c7a3c' : '#5b4f96' })),
      cursors: this.cursors,
      onCursor: () => this.readouts(run),
      onReset: () => this.stack.axis.setRange(run.data.tFirst, run.data.tLast),
      clockBase: this.S?.clockStart ?? 8.5 * 3600,
    });
    this.stack.axis.bounds = [run.data.tFirst, run.data.tLast];
    if (run.tFire !== null) presets[3][1](); else presets[0][1]();
    this.reduction(run, overlays, def, right);
  }

  reduction(run, overlays, def, right) {
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
    if (pred && run.metrics?.kind === 'single' && run.metrics.summary?.F !== undefined) {
      const m = run.metrics.summary;
      rb.append(h('div.proc-sec', 'Prediction vs measured'));
      const pt = h('table.metrics');
      pt.append(h('tr.hd', h('td', ''), h('td', 'pred.'), h('td', 'meas.'), h('td', 'Δ')));
      const row = (l, p, x, q) => pt.append(h('tr', h('td', l), h('td.v', fmt(p, q)), h('td.v', fmt(x, q)), h('td.v', `${(100 * (x / p - 1)).toFixed(1)} %`)));
      row('Chamber pressure', pred.Pc, m.Pc, 'pressure');
      row('Thrust', pred.F, m.F, 'force');
      row('Mass flow (FT-201)', pred.mdot, m.mdotFM, 'massflow');
      pt.append(h('tr', h('td', 'Isp (FT-201)'), h('td.v', pred.Isp.toFixed(1)), h('td.v', Number.isFinite(m.IspFM) ? m.IspFM.toFixed(1) : '----'), h('td.v', `${(100 * (m.IspFM / pred.Isp - 1)).toFixed(1)} %`)));
      rb.append(pt);
    }
    if (run.metrics?.pulses) {
      rb.append(h('div.proc-sec', 'Pulses'));
      const pt = h('table.metrics');
      pt.append(h('tr.hd', h('td', '#'), h('td', 'I-bit'), h('td', 'Pc peak'), h('td', 'open'), h('td', 'close'), h('td', '')));
      for (const p of run.metrics.pulses) pt.append(h('tr', h('td', String(p.n)), h('td.v', `${(p.Ibit * 1e3).toFixed(2)} mN·s`), h('td.v', fmt(p.PcPeak, 'pressure')),
        h('td.v', Number.isFinite(p.delay) ? `${(p.delay * 1e3).toFixed(2)}` : '—'), h('td.v', Number.isFinite(p.close) ? `${(p.close * 1e3).toFixed(2)}` : '—'),
        h('td.n', !p.fired ? 'no fire' : p.steady ? 'steady' : 'partial')));
      rb.append(pt, h('div.faint', { style: { padding: '2px 10px', fontSize: '11px' } }, 'open/close: ms from command edge to Pc crossing 10 % of steady.'));
    }
    if (overlays.length) {
      rb.append(h('div.proc-sec', 'Run comparison'));
      const ct = h('table.metrics');
      ct.append(h('tr.hd', h('td', 'Run'), h('td', 'Pc'), h('td', 'F'), h('td', 'I'), h('td', 'Isp')));
      for (const r of [run, ...overlays]) {
        const m = r.metrics?.summary || {};
        ct.append(h('tr', h('td', short(r.id)), h('td.v', fmt(m.Pc, 'pressure')), h('td.v', fmt(m.F, 'force')), h('td.v', fmt(m.I, 'impulse')), h('td.v', Number.isFinite(m.IspFM) ? m.IspFM.toFixed(1) : '----')));
      }
      rb.append(ct);
    }
    rb.append(h('div', { style: { padding: '8px 10px' } }, btn('Open in notebook', () => { this.app.show('notebook'); this.app.notebook.select(run.id); }, 'sm ghost')));
  }

  /* ---- CAMPAIGN ------------------------------------------------------- */
  campaign(pool, centre, right, tabs) {
    this.S?.flag('campaign');
    const usable = pool.filter(e => e.rec.metrics && !e.rec.aborted);
    const inc = usable.filter(e => !this.excluded.has(e.id));
    const def = STANDS[inc[0]?.rec.meta.config.stand] || STANDS['TS-1'];
    const qx = QUANTITIES_CATALOG.find(q => q.key === this.xKey), qy = QUANTITIES_CATALOG.find(q => q.key === this.yKey);
    const sel = (cur, set) => {
      const s = h('select.in', { style: { fontFamily: 'var(--sans)', maxWidth: '210px' }, onchange: () => { set(s.value); this.render(); } },
        QUANTITIES_CATALOG.map(q => h('option', { value: q.key }, q.label)));
      s.value = cur; return s;
    };
    centre.append(h('div.ph', tabs, h('span.sp'),
      h('span.sub', 'x'), sel(this.xKey, v => (this.xKey = v)), h('span.sub', 'y'), sel(this.yKey, v => (this.yKey = v))));
    centre.append(h('div', { style: { padding: '5px 10px', borderBottom: '1px solid var(--line)' } },
      h('div.filters', { style: { flexWrap: 'wrap' } }, PRESETS.map(([l, x, y]) => h('button' + (this.xKey === x && this.yKey === y ? '.on' : ''), { onclick: () => { this.xKey = x; this.yKey = y; this.render(); } }, l)))));
    const pts = usable.map(e => ({ id: e.id, label: short(e.id), x: value(e.rec, this.xKey), y: value(e.rec, this.yKey), included: !this.excluded.has(e.id), kind: runKind(e.rec) }))
      .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    const fitPts = pts.filter(p => p.included);
    const fit = fitPts.length >= 2 ? linfit(fitPts.map(p => p.x), fitPts.map(p => p.y)) : null;
    const plotHost = h('div', { style: { flex: '1 1 0', minHeight: '220px', background: 'var(--plot-bg)' } });
    centre.append(plotHost);
    this.scatter = new Scatter(plotHost);
    this.scatter.set({ points: pts, fit, xq: qx.q, yq: qy.q, xKey: this.xKey, yKey: this.yKey, xLabel: qx.label, yLabel: qy.label,
      zeroX: this.xKey === 'PcAbs' || this.xKey === 'width',
      empty: usable.length ? `No included run has both "${qx.label}" and "${qy.label}". Pulse quantities need pulse trains; steady quantities need single burns.` : 'No reduced runs yet.' });
    // table
    const tbl = h('table.metrics');
    tbl.append(h('tr.hd', h('td', 'Run'), h('td', 'Plan'), h('td', 'x'), h('td', 'y'), h('td', 'residual')));
    for (const p of pts) {
      const e = usable.find(u => u.id === p.id);
      tbl.append(h('tr', { style: { opacity: p.included ? 1 : 0.45 } }, h('td', p.id), h('td.n', e.rec.plan?.mode === 'pulse' ? `pulse ${(e.rec.plan.on * 1e3).toFixed(0)} ms` : `${(e.rec.plan?.duration ?? 0).toFixed(1)} s @ ${fmt(e.rec.meta.config.regSet, 'pressure', 0)}`),
        h('td.v', qfmt(p.x, qx.q)), h('td.v', qfmt(p.y, qy.q)), h('td.v', fit && p.included ? qfmt(p.y - fit.at(p.x), qy.q) : '')));
    }
    centre.append(h('div.pb', { style: { flex: '0 0 auto', maxHeight: '34%', borderTop: '1px solid var(--line)' } }, tbl));
    // right: fit, meaning, statistics
    right.append(h('div.ph', h('span.t', 'Fit and statistics'), h('span.sp'), h('span.sub', `${fitPts.length} of ${pts.length} points`)));
    const rb = h('div.pb');
    right.append(rb);
    rb.append(h('div.proc-sec', 'Least-squares line  y = a·x + b'));
    const ft = h('table.metrics');
    if (!fit) ft.append(h('tr', h('td.n', 'Need two or more included points.')));
    else {
      const perUnit = q => (q === 'time' ? 'ms' : q === 'ratio' ? '1' : unitLabel(q, q === 'pressure' ? (this.xKey === 'PcAbs' ? false : true) : undefined));
      // slope in display units: Δy(display) / Δx(display)
      const dy = v => (qy.q === 'time' ? v * 1e3 : qy.q === 'ratio' ? v : toDisplay(v, qy.q) - toDisplay(0, qy.q));
      const dx = v => (qx.q === 'time' ? v * 1e3 : qx.q === 'ratio' ? v : toDisplay(v, qx.q) - toDisplay(0, qx.q));
      const slope = dy(fit.a) / dx(1), sslope = dy(fit.sa) / dx(1);
      ft.append(h('tr', h('td', 'Slope a'), h('td.v', `${slope.toPrecision(5)}${Number.isFinite(sslope) ? ' ± ' + sslope.toPrecision(2) : ''}`), h('td.u', `${perUnit(qy.q)} per ${perUnit(qx.q)}`)));
      ft.append(h('tr', h('td', 'Intercept b'), h('td.v', `${qfmt(fit.b, qy.q)}`), h('td.u', Number.isFinite(fit.sb) ? `± ${qy.q === 'time' ? (fit.sb * 1e3).toPrecision(2) + ' ms' : qy.q === 'ratio' ? fit.sb.toPrecision(2) : fmt(fit.sb, qy.q, 3)}` : '')));
      ft.append(h('tr', h('td', 'R²'), h('td.v', fit.r2.toFixed(6)), h('td', '')));
      ft.append(h('tr', h('td', 'Residual σ'), h('td.v', Number.isFinite(fit.se) ? qfmt(fit.se, qy.q) : '— (2 points)'), h('td', '')));
      ft.append(h('tr', h('td', 'Points'), h('td.v', String(fit.n)), h('td', '')));
    }
    rb.append(ft);
    const meaning = interpret(this.xKey, this.yKey, fit, def);
    if (meaning.length) {
      rb.append(h('div.proc-sec', 'What the line says'));
      const mt = h('table.metrics');
      for (const m of meaning) {
        if (m.label) mt.append(h('tr', h('td', m.label), h('td.v', m.raw ? `${m.value.toExponential(4)} ${m.unit}` : m.q === 'length' ? `${(m.value * 1e3).toFixed(3)} mm` : m.q === 'time' ? `${(m.value * 1e3).toFixed(2)} ms` : m.q === 'ratio' ? m.value.toFixed(4) : `${fmt(m.value, m.q, 3)} ${unitLabel(m.q)}`)));
        if (m.note) mt.append(h('tr', h('td.n', { colSpan: 2 }, m.note)));
      }
      rb.append(mt);
    }
    const sy = stats(fitPts.map(p => p.y));
    if (sy) {
      rb.append(h('div.proc-sec', `Repeatability of y over the included runs`));
      const st = h('table.metrics');
      st.append(h('tr', h('td', 'Mean'), h('td.v', qfmt(sy.mean, qy.q))));
      st.append(h('tr', h('td', 'Std deviation (1σ)'), h('td.v', Number.isFinite(sy.sd) ? qfmt(sy.sd, qy.q) : '—')));
      st.append(h('tr', h('td', 'Coefficient of variation'), h('td.v', Number.isFinite(sy.cv) ? `${(100 * sy.cv).toFixed(3)} %` : '—')));
      st.append(h('tr', h('td', '95 % confidence on the mean'), h('td.v', Number.isFinite(sy.ci95) ? `± ${qfmt(sy.ci95, qy.q)}` : '—')));
      st.append(h('tr', h('td', 'Range'), h('td.v', `${qfmt(sy.min, qy.q)} … ${qfmt(sy.max, qy.q)}`)));
      rb.append(st, h('div.faint', { style: { padding: '4px 10px', fontSize: '11px', lineHeight: 1.5 } },
        'Repeatability only means something across runs meant to be identical — same setpoint, same plan. Across a sweep these numbers describe the sweep, not the scatter.'));
    }
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
    const def = STANDS[run.meta.config.stand] || STANDS['TS-1'];
    const meta = new Map(channelList(def).map(c => [c.id, c]));
    const t = h('table.metrics');
    t.append(h('tr.hd', h('td', 'Channel'), h('td', 'A'), h('td', 'B'), h('td', 'B − A'), h('td', 'mean A…B')));
    const fmtT2 = x => (x === null ? '—' : fmtT(x - ref, 4));
    t.append(h('tr', h('td', 'Time'), h('td.v', fmtT2(A)), h('td.v', fmtT2(B)), h('td.v', A !== null && B !== null ? `${((B - A) * 1e3).toFixed(2)} ms` : '—'), h('td', '')));
    const ids = [...new Set(this.layout.flatMap(p => p.channels))];
    for (const id of ids) {
      const ch = meta.get(id);
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
