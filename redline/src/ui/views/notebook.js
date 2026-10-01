/* The engineering notebook: every recorded run, automatically, with its
   configuration, results, alarms, aborts and the operator's notes; a place
   to write the plan before a test and the report after; and search across
   all of it. Summaries persist in the browser; traces live for the session. */

import { h, btn, clear } from '../dom.js';
import { fmt, unitLabel, fmtClock, fromDisplay, toDisplay } from '../../lib/units.js';
import { store } from '../store.js';
import { history, download } from '../history.js';
import { reportHTML } from '../../analysis/reporthtml.js';
import { sessionReport, CAMPAIGN_SPEC, VALIDITY } from '../../analysis/report.js';
const campaignSpec = S => S.scenario?.campaignSpec || CAMPAIGN_SPEC;

const slug = s => s.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');

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

  onSession() { this.pendingNotes = []; this.draft = null; this.render(); }
  get reports() { return (store.data.reports ||= []); }
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
        regSet: cfg.regSet, sp: cfg.sp, plan: S.controller.planText(run.plan || cfg.plan), rate: cfg.rate, supply: cfg.supply,
        valves: Object.entries(cfg.valves).map(([k, v]) => `${k} ${v ? 'OPEN' : 'CLOSED'}`).join(', '),
      },
      commanded: run.plan?.mode === 'single' ? run.plan.duration : null,
      actual: run.metrics?.summary?.dur ?? null,
      results: run.metrics?.items?.map(i => ({ label: i.label, value: i.value, quantity: i.quantity })) || [],
      pulses: run.metrics?.pulses?.length || 0,
      prediction: !cfg.prediction ? null : cfg.prediction.kind === 'coldflow'
        ? { kind: 'coldflow', mdotOx: cfg.prediction.mdotOx, mdotFu: cfg.prediction.mdotFu, dPox: cfg.prediction.dPox, dPfu: cfg.prediction.dPfu }
        : cfg.prediction.kind === 'hotfire' ? { kind: 'hotfire', Pc: cfg.prediction.Pc, F: cfg.prediction.F, MR: cfg.prediction.MR, Isp: cfg.prediction.Isp }
        : { Pc: cfg.prediction.Pc, F: cfg.prediction.F, mdot: cfg.prediction.mdot, Isp: cfg.prediction.Isp },
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
    const S = this.app.session;
    const sessRep = S ? h('div.li' + (this.sel === '#report' ? '.sel' : ''), { onclick: () => { this.sel = '#report'; this.render(); } },
      h('div.a', h('b', 'Session test report'), S.flags.has('session-report') ? h('span.tag', { style: { color: 'var(--good)', borderColor: '#2a6b37' } }, 'FILED') : null),
      h('div.b', S.request?.title || 'Open-stand session')) : null;
    const filed = this.reports.filter(r => !this.q || (r.title + ' ' + r.date).toLowerCase().includes(this.q)).map(r =>
      h('div.li' + (this.sel === 'rep:' + r.id ? '.sel' : ''), { onclick: () => { this.sel = 'rep:' + r.id; this.render(); } },
        h('div.a', h('b', 'Report'), h('span.faint', `${r.date} ${r.clock}`), r.grade ? h('span.tag', `${r.grade.score}/100`) : null),
        h('div.b', r.title)));
    this.root.append(h('div.panel', h('div.ph', h('span.t', 'Notebook'), h('span.sp'), h('span.sub', `${this.entries.length} run(s)`)),
      h('div', { style: { padding: '6px' } }, search), h('div.list', newNote, sessRep, ...filed), list));
    this.renderList(list);
    // detail
    const detail = h('div.panel');
    this.root.append(detail);
    if (this.sel === '#report' && S) { this.renderSession(detail); return; }
    if (String(this.sel).startsWith('rep:')) { const r = this.reports.find(x => 'rep:' + x.id === this.sel); if (r) { this.renderFiled(detail, r); return; } }
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

  /* The session test report: facts assembled from the record, conclusions
     written by the conductor, previewed as the document that will be filed
     and downloaded. In the campaign, filing also grades it. */
  renderSession(detail) {
    const S = this.app.session, campaign = !!S.scenario?.campaign;
    const d = this.draft ||= { result: '', summary: '', anomalies: '', validity: '', numbers: {} };
    const meta = this._meta();
    const frame = h('iframe.report', { title: 'Report preview' });
    const refresh = () => { frame.srcdoc = reportHTML(sessionReport(S), this._conclusions(), null, meta); };
    let tm = null;
    const later = () => { clearTimeout(tm); tm = setTimeout(refresh, 250); };
    const field = (el, key) => {
      el.value = d[key] || '';
      const upd = () => { d[key] = el.value; later(); };
      el.addEventListener('input', upd); el.addEventListener('change', upd);
      return el;
    };
    const result = field(h('select.in', {}, ['', 'Success', 'Partial', 'Held — not fired', 'Aborted', 'Failed', 'Invalid (no usable data)'].map(x => h('option', { value: x }, x || '— result —'))), 'result');
    const summary = field(h('textarea.in', { rows: 3, placeholder: 'What was done and what was measured, against the prediction.' }), 'summary');
    const anomalies = field(h('textarea.in', { rows: 2, placeholder: 'Everything unexpected, however small — and what it means for the data. "None" is an answer.' }), 'anomalies');
    const form = h('div.kv.repform', h('span.k', 'Result'), result, h('span.k', 'Summary'), summary, h('span.k', 'Anomalies'), anomalies);
    if (campaign) {
      const validity = field(h('select.in', {}, [h('option', { value: '' }, '— data validity —'), ...VALIDITY.map(([v, l]) => h('option', { value: v }, l))]), 'validity');
      // entered in display units; kept in SI
      const conv = {
        force: [x => fromDisplay(x, 'force'), x => toDisplay(x, 'force')], pressure: [x => fromDisplay(x, 'pressure'), x => toDisplay(x, 'pressure')],
        mNs: [x => x / 1e3, x => x * 1e3], pct: [x => x / 100, x => x * 100], plain: [x => x, x => x], kW: [x => x * 1e3, x => x / 1e3],
      };
      const NUM = campaignSpec(S).fields.map(([k, label, q, u]) => [k, label, q, u ?? (q === 'force' ? unitLabel('force') : q === 'pressure' ? unitLabel('pressure', true) : '')]);
      const nums = h('div.repnums');
      for (const [k, label, q, u] of NUM) {
        const inp = h('input.in', { type: 'number', step: 'any' });
        if (Number.isFinite(d.numbers[k])) inp.value = String(+conv[q][1](d.numbers[k]).toPrecision(5));
        inp.addEventListener('input', () => { const x = parseFloat(inp.value); d.numbers[k] = Number.isFinite(x) ? conv[q][0](x) : NaN; later(); });
        nums.append(h('label', h('span', label), inp, h('span.faint', u)));
      }
      form.append(h('span.k', 'Data validity'), validity, h('span.k', 'Deliverables'), nums);
    }
    const title = S.request?.title || 'Open-stand session';
    detail.append(h('div.ph', h('span.t', 'Session test report'), h('span.sub', title), h('span.sp'),
      btn('Download HTML', () => download(`${slug(title)}-report.html`, reportHTML(sessionReport(S), this._conclusions(), null, meta), 'text/html'), 'sm ghost'),
      btn(S.flags.has('session-report') ? 'File again' : 'File report', () => this._file(), 'sm primary')));
    detail.append(h('div.pb.repwrap',
      h('p.muted', { style: { margin: '0 0 8px' } }, campaign
        ? 'Report the deliverables from YOUR reductions (ANALYSIS), and make the call on whether the data represent the article. Filing grades the report against your data and against what was really wrong with the stand.'
        : 'The facts are assembled from the record. The conclusions are yours.'),
      form, frame));
    refresh();
  }

  _meta() {
    const lvl = this.app.level;
    return { date: new Date().toISOString().slice(0, 10), level: lvl ? `Level ${lvl.n}: ${lvl.title}` : 'Open stand' };
  }

  _conclusions() {
    const d = this.draft || {}, campaign = !!this.app.session?.scenario?.campaign;
    return { result: d.result, summary: d.summary, anomalies: d.anomalies, validity: campaign ? d.validity : undefined, numbers: campaign ? d.numbers : undefined,
      fields: campaign ? campaignSpec(this.app.session).fields : undefined };
  }

  _file() {
    const S = this.app.session, c = this._conclusions(), campaign = !!S.scenario?.campaign, meta = this._meta();
    if (!c.result || (campaign && !c.validity)) { this.app.toast('Incomplete', campaign ? 'State a result and the data validity.' : 'State a result.', 'info'); return; }
    if (S.faults.enabled && !S.faults.diagnosis && !confirm('No diagnosis has been submitted (Console ▸ INSPECT). File the report without one?')) return;
    const grade = campaign ? campaignSpec(S).grade(S, { ...c.numbers, validity: c.validity }) : null;
    const n = this.reports.filter(r => r.session === S.uid).length + 1;
    const id = `${S.uid}-${n}`;
    const title = S.request?.title || 'Open-stand session';
    this.reports.unshift({ id, session: S.uid, title, date: meta.date, clock: fmtClock(S.clock),
      html: reportHTML(sessionReport(S), c, grade, meta), grade: grade ? { score: grade.score, grade: grade.grade } : null });
    while (this.reports.length > 20) this.reports.pop();
    store.save();
    S.flag('session-report');
    S.flag('report:session');            // satisfies a procedure's "file the test report" step
    S.note(`Session test report filed: ${c.result}${grade ? ` — review ${grade.score}/100 (${grade.grade})` : ''}`);
    if (campaign) {
      S.flag('campaign-report');
      if (this.app.level && grade.score >= 70) this.app.recordCompetency(this.app.level.id, S.mode);
    }
    this.sel = 'rep:' + id;
    this.render();
    this.app.toast('Report filed', grade ? `Review: ${grade.score}/100 — ${grade.grade}.` : 'Saved to the notebook.', 'info', 4500);
  }

  renderFiled(detail, r) {
    detail.append(h('div.ph', h('span.t', 'Filed report'), h('span.sub', `${r.date} ${r.clock} · ${r.title}`), h('span.sp'),
      btn('Download HTML', () => download(`${slug(r.title)}-${r.id}.html`, r.html, 'text/html'), 'sm ghost'),
      btn('Delete', () => {
        const i = this.reports.indexOf(r);
        if (i >= 0 && confirm('Delete this filed report?')) { this.reports.splice(i, 1); store.save(); this.sel = null; this.render(); }
      }, 'sm ghost')));
    const frame = h('iframe.report.tall', { title: 'Filed report' });
    frame.srcdoc = r.html;
    detail.append(h('div.pb.repwrap', frame));
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
    const inMemory = this.app.session?.runs.some(r => r.id === e.id) || history.index.some(r => r.id === e.id);
    detail.append(h('div.ph', h('span.t', e.id), h('span.sub', `${e.date} · ${e.clock} · ${e.level} · ${e.mode}`), h('span.sp'),
      inMemory ? btn('Open in analysis', async () => {
        const a = this.app.views.analysis;
        const entry = a.pool().find(x => x.id === e.id);
        if (entry && await a.ensure(entry)) { a.mode = 'traces'; a.main = e.id; this.app.show('analysis'); a.render(); }
      }, 'sm ghost') : h('span.sub', 'traces no longer in test history')));
    const b = h('div.pb', { style: { padding: '12px 18px' } });
    detail.append(b);
    const sec = t => h('div.proc-sec', { style: { padding: '14px 0 6px' } }, t);
    b.append(h('p', { style: { margin: '0 0 6px' } }, h('b', e.objective)), h('p.muted', { style: { margin: 0 } }, e.stand));
    b.append(sec('Configuration'), h('div.kv',
      ...(e.config.sp && Object.keys(e.config.sp).length > 1
        ? [h('span.k', 'Regulator setpoints'), h('span.v', Object.entries(e.config.sp).map(([k, v]) => `${k} ${fmt(v, 'pressure')}`).join(', ') + ' ' + unitLabel('pressure', true))]
        : [h('span.k', 'Regulator setpoint'), h('span.v', `${fmt(e.config.regSet, 'pressure')} ${unitLabel('pressure', true)}`)]),
      h('span.k', 'Supply at start'), h('span.v', `${fmt(e.config.supply, 'pressure')} ${unitLabel('pressure', true)}`),
      h('span.k', 'Firing plan'), h('span.v', e.config.plan),
      h('span.k', 'Commanded / actual'), h('span.v', `${e.commanded !== null ? e.commanded.toFixed(3) + ' s' : '—'} / ${e.actual !== null && Number.isFinite(e.actual) ? e.actual.toFixed(3) + ' s' : '—'}`),
      h('span.k', 'Sample rate'), h('span.v', `${e.config.rate} Hz`),
      h('span.k', 'Valve line-up at record start'), h('span.v', { style: { whiteSpace: 'normal' } }, e.config.valves),
      h('span.k', 'Recording ended'), h('span.v', e.reason || '—')));
    if (e.prediction) b.append(h('div.faint', { style: { fontSize: '11px', marginTop: '4px' } },
      e.prediction.kind === 'coldflow'
        ? `Prediction (injector drawing): ox ${fmt(e.prediction.mdotOx, 'massflow')}, fuel ${fmt(e.prediction.mdotFu, 'massflow')} ${unitLabel('massflow')} of water`
        : e.prediction.kind === 'hotfire'
        ? `Prediction (injector drawing): Pc ${fmt(e.prediction.Pc, 'pressure')} ${unitLabel('pressure', true)}, F ${fmt(e.prediction.F, 'force')} ${unitLabel('force')}, MR ${e.prediction.MR?.toFixed(2)}, Isp ${e.prediction.Isp?.toFixed(0)} s`
        : `Prediction: Pc ${fmt(e.prediction.Pc, 'pressure')} ${unitLabel('pressure', true)}, F ${fmt(e.prediction.F, 'force')} ${unitLabel('force')}, ṁ ${fmt(e.prediction.mdot, 'massflow')} g/s, Isp ${e.prediction.Isp?.toFixed(1)} s`));
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
    if (e.diagnosis) b.append(h('p', h('b', 'Diagnosis: '), e.diagnosis), h('p', h('b', 'Root cause: '), e.rootCause || '—'));
    else b.append(h('p.muted', e.mode === 'fault' || /L5/.test(e.level) ? 'No diagnosis submitted yet (Console ▸ INSPECT ▸ Submit diagnosis).' : 'Not a fault-injection session.'));
  }
}
