/* The engineering notebook: every recorded run, automatically, with its
   configuration, results, alarms, aborts and the operator's notes; a place
   to write the plan before a test and the report after; and search across
   all of it. Summaries persist in the browser; traces live for the session. */

import { h, btn, clear } from '../dom.js';
import { fmt, unitLabel, fmtClock } from '../../lib/units.js';
import { store } from '../store.js';

export class NotebookView {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.q = '';
    this.sel = null;
    this.pendingNotes = [];
    this.root = h('div.split', { style: { gridTemplateColumns: '320px 1fr' } });
    host.append(this.root);
    this.render();
  }

  get entries() { return store.data.notebook; }

  onSession() { this.pendingNotes = []; this.render(); }
  onShow() { this.render(); }

  /* Called by the session when a recording stops. */
  onRun(run) {
    const S = this.app.session, cfg = run.meta.config;
    const lvl = this.app.level;
    const entry = {
      id: run.id,
      date: new Date().toISOString().slice(0, 10),
      clock: fmtClock(run.clock),
      level: lvl ? `L${lvl.n} ${lvl.title}` : 'Open stand',
      mode: S.mode,
      objective: run.meta.objective,
      stand: `${S.def.name} · ${S.def.article}`,
      config: {
        regSet: cfg.regSet, plan: S.controller.planText(run.plan || cfg.plan), rate: cfg.rate, supply: cfg.supply,
        valves: Object.entries(cfg.valves).map(([k, v]) => `${k} ${v ? 'OPEN' : 'CLOSED'}`).join(', '),
      },
      commanded: run.plan?.mode === 'single' ? run.plan.duration : null,
      actual: run.metrics?.summary?.dur ?? null,
      results: run.metrics?.items?.map(i => ({ label: i.label, value: i.value, quantity: i.quantity })) || [],
      pulses: run.metrics?.pulses?.length || 0,
      prediction: cfg.prediction ? { Pc: cfg.prediction.Pc, F: cfg.prediction.F, mdot: cfg.prediction.mdot, Isp: cfg.prediction.Isp } : null,
      alarms: run.alarms,
      aborted: run.aborted,
      abort: run.abort,
      reason: run.reason,
      notes: [...this.pendingNotes.map(n => ({ ...n, kind: 'pre-test' })), ...run.notes.map(n => ({ text: n.text, kind: 'operator' }))],
      report: null,
      diagnosis: null,
      rootCause: null,
    };
    this.pendingNotes = [];
    this.entries.unshift(entry);
    store.save();
    this.sel = entry.id;
    this.render();
  }

  addPendingNote(runId, kind, text) {
    const e = runId && this.entries.find(x => x.id === runId);
    if (e) { e.notes.push({ kind, text }); store.save(); this.render(); }
    else this.pendingNotes.push({ kind, text });
  }

  select(id) { this.sel = id; this.render(); }

  render() {
    clear(this.root);
    // list
    const search = h('input.in', { placeholder: 'Search runs, notes, alarms…', value: this.q, style: { width: '100%', fontFamily: 'var(--sans)' },
      oninput: () => { this.q = search.value.toLowerCase(); this.renderList(list); } });
    const list = h('div.pb.list');
    const newNote = h('div.li' + (this.sel === null ? '.sel' : ''), { onclick: () => { this.sel = null; this.render(); } },
      h('div.a', h('b', 'Pre-test notes')), h('div.b', this.pendingNotes.length ? `${this.pendingNotes.length} note(s) waiting for the next run` : 'Write the plan before you record'));
    this.root.append(h('div.panel', h('div.ph', h('span.t', 'Notebook'), h('span.sp'), h('span.sub', `${this.entries.length} run(s)`)),
      h('div', { style: { padding: '6px' } }, search), h('div.list', newNote), list));
    this.renderList(list);
    // detail
    const detail = h('div.panel');
    this.root.append(detail);
    const e = this.entries.find(x => x.id === this.sel);
    if (!e) this.renderPre(detail); else this.renderEntry(detail, e);
  }

  renderList(list) {
    clear(list);
    const q = this.q;
    for (const e of this.entries) {
      if (q && !JSON.stringify(e).toLowerCase().includes(q)) continue;
      const F = e.results.find(r => r.label.startsWith('Thrust, steady'));
      list.append(h('div.li' + (this.sel === e.id ? '.sel' : ''), { onclick: () => { this.sel = e.id; this.render(); } },
        h('div.a', h('b', e.id), h('span.faint', `${e.date} ${e.clock}`), e.aborted ? h('span.tag', { style: { color: 'var(--redline)', borderColor: '#6d2c30' } }, 'ABORT') : null,
          e.report?.filed ? h('span.tag', { style: { color: 'var(--good)', borderColor: '#2a6b37' } }, 'REPORT') : null),
        h('div.b', `${e.objective} · ${e.config.plan}${F ? ` · F ${fmt(F.value, 'force')} ${unitLabel('force')}` : ''}`)));
    }
    if (!list.childElementCount) list.append(h('div', { style: { padding: '10px', color: 'var(--ink-4)' } }, q ? 'Nothing matches.' : 'No runs yet.'));
  }

  renderPre(detail) {
    detail.append(h('div.ph', h('span.t', 'Pre-test notes')));
    const ta = h('textarea.in', { rows: 8, placeholder: 'Objective, configuration, predictions, what you expect to see, what would make you stop…' });
    const body = h('div.pb', { style: { padding: '14px 18px' } },
      h('p.muted', 'Notes written here are attached to the next recorded run and logged in the event log.'),
      ta,
      h('div', { style: { marginTop: '8px' } }, btn('Add note', () => {
        if (!ta.value.trim()) return;
        this.pendingNotes.push({ kind: 'pre-test', text: ta.value.trim() });
        this.app.session?.note('Pre-test note: ' + ta.value.trim());
        this.render();
      }, 'sm primary')),
      this.pendingNotes.length ? h('div', { style: { marginTop: '14px' } }, this.pendingNotes.map(n => h('div.warnbox', { style: { borderColor: 'var(--gas)' } }, n.text))) : null);
    detail.append(body);
  }

  renderEntry(detail, e) {
    const inMemory = this.app.session?.runs.some(r => r.id === e.id);
    detail.append(h('div.ph', h('span.t', e.id), h('span.sub', `${e.date} · ${e.clock} · ${e.level} · ${e.mode}`), h('span.sp'),
      inMemory ? btn('Open in analysis', () => { this.app.show('analysis'); this.app.views.analysis.main = e.id; this.app.views.analysis.render(); }, 'sm ghost') : h('span.sub', 'traces not retained from an earlier session')));
    const b = h('div.pb', { style: { padding: '12px 18px' } });
    detail.append(b);
    const sec = t => h('div.proc-sec', { style: { padding: '14px 0 6px' } }, t);
    b.append(h('p', { style: { margin: '0 0 6px' } }, h('b', e.objective)), h('p.muted', { style: { margin: 0 } }, e.stand));
    b.append(sec('Configuration'), h('div.kv',
      h('span.k', 'Regulator setpoint'), h('span.v', `${fmt(e.config.regSet, 'pressure')} ${unitLabel('pressure', true)}`),
      h('span.k', 'Supply at start'), h('span.v', `${fmt(e.config.supply, 'pressure')} ${unitLabel('pressure', true)}`),
      h('span.k', 'Firing plan'), h('span.v', e.config.plan),
      h('span.k', 'Commanded / actual'), h('span.v', `${e.commanded !== null ? e.commanded.toFixed(3) + ' s' : '—'} / ${e.actual !== null && Number.isFinite(e.actual) ? e.actual.toFixed(3) + ' s' : '—'}`),
      h('span.k', 'Sample rate'), h('span.v', `${e.config.rate} Hz`),
      h('span.k', 'Valve line-up at record start'), h('span.v', { style: { whiteSpace: 'normal' } }, e.config.valves),
      h('span.k', 'Recording ended'), h('span.v', e.reason || '—')));
    if (e.prediction) b.append(h('div.faint', { style: { fontSize: '11px', marginTop: '4px' } },
      `Prediction: Pc ${fmt(e.prediction.Pc, 'pressure')} ${unitLabel('pressure', true)}, F ${fmt(e.prediction.F, 'force')} ${unitLabel('force')}, ṁ ${fmt(e.prediction.mdot, 'massflow')} g/s, Isp ${e.prediction.Isp.toFixed(1)} s`));
    b.append(sec('Results'));
    if (!e.results.length) b.append(h('p.muted', 'No firing reduced in this recording.'));
    else {
      const t = h('table.metrics', { style: { maxWidth: '640px' } });
      for (const r of e.results) t.append(h('tr', h('td', r.label), h('td.v', r.quantity === 'discrete' ? String(r.value) : fmt(r.value, r.quantity, r.quantity === 'time' ? 4 : undefined)), h('td.u', r.quantity === 'time' ? 's' : unitLabel(r.quantity, r.quantity === 'pressure' ? true : undefined))));
      b.append(t);
    }
    b.append(sec('Alarms and aborts'));
    if (e.aborted) b.append(h('div.warnbox.block', h('b', e.abort)));
    if (!e.alarms.length && !e.aborted) b.append(h('p.muted', 'None.'));
    for (const a of e.alarms) b.append(h('div.mono', { style: { fontSize: '11.5px', color: 'var(--caution)' } }, a));
    b.append(sec('Notes'));
    for (const n of e.notes) b.append(h('div.warnbox', { style: { borderColor: 'var(--line-3)' } }, h('span.faint', { style: { fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', marginRight: '8px' } }, n.kind), n.text));
    const ta = h('textarea.in', { rows: 3, placeholder: 'Post-test observation…' });
    b.append(ta, h('div', { style: { margin: '6px 0' } }, btn('Add note', () => { if (!ta.value.trim()) return; e.notes.push({ kind: 'post-test', text: ta.value.trim() }); store.save(); this.render(); }, 'sm')));
    // report
    b.append(sec('Test report'));
    const rep = e.report || {};
    const result = h('select.in', {}, ['Success', 'Partial', 'Failed', 'Aborted', 'Invalid (no data)'].map(x => h('option', { value: x }, x)));
    result.value = rep.result || (e.aborted ? 'Aborted' : 'Success');
    const summary = h('textarea.in', { rows: 4, placeholder: 'What was done, what was measured, how it compares with the prediction.' });
    summary.value = rep.summary || '';
    const anomalies = h('textarea.in', { rows: 3, placeholder: 'Anything unexpected — however small. "None" is an answer too.' });
    anomalies.value = rep.anomalies || '';
    b.append(h('div.kv', { style: { gap: '6px 12px', alignItems: 'start', maxWidth: '760px' } },
      h('span.k', 'Result'), result, h('span.k', 'Summary'), summary, h('span.k', 'Anomalies'), anomalies));
    b.append(h('div', { style: { margin: '8px 0', display: 'flex', gap: '8px', alignItems: 'center' } },
      btn(rep.filed ? 'Update report' : 'File report', () => {
        e.report = { result: result.value, summary: summary.value, anomalies: anomalies.value, filed: true, at: new Date().toISOString() };
        store.save();
        this.app.session?.flag('report:' + e.id);
        this.app.session?.note(`Test report filed for ${e.id}: ${result.value}`, e.id);
        this.render();
      }, 'sm primary'),
      rep.filed ? h('span.faint', `filed ${rep.at?.slice(0, 16).replace('T', ' ')}`) : null));
    b.append(sec('Diagnosis and root cause'));
    b.append(h('p.muted', e.diagnosis ? e.diagnosis : 'Diagnosis submission and root-cause reveal arrive with fault-injection training (development phase 4).'));
  }
}
