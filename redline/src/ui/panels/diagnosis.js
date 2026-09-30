/* The diagnosis form and the root-cause reveal.

   The form asks what a failure review board would: which component, which
   failure mode, on what evidence, and what should be done about it. The
   answer is withheld until the diagnosis is in — then the reveal says what
   really failed, which measurements showed it, which misled, and how an
   experienced engineer would have gone about it. */

import { h, btn } from '../dom.js';
import { modal, toast } from '../modal.js';
import { store } from '../store.js';
import { FAILURE_MODES, ACTIONS } from '../../content/faults/ts1-faults.js';

/* Comparisons and checks an operator can cite, beyond channels and
   inspections. Ids match the fault answer keys. */
const CHECKS = [
  ['go-no-go', 'Go/no-go poll data'],
  ['prediction', 'Comparison with the pre-test prediction'],
  ['static-agreement', 'Static agreement between transducers'],
  ['leak-check', 'Pressure-decay leak check'],
  ['shunt-cal', 'Shunt calibration of LC-501'],
  ['droop', 'Regulator droop (lock-up vs flowing)'],
  ['rise-time', 'Chamber-pressure rise / decay time'],
  ['dPv', 'Pressure drop across the fire valve'],
  ['dThroat', 'Effective throat from the reduction'],
  ['sound', 'What the cell sounded like'],
  ['cctv', 'Cell camera'],
];

const CAT_LABEL = { none: 'No fault', control: 'Pressure control and supply', flow: 'Flow path', actuation: 'Actuation', sensor: 'Instrument' };

export function openDiagnosis(app) {
  const S = app.session, def = S.def;
  if (S.faults.diagnosis) return reveal(app);
  const sel = (opts, groups) => {
    const s = h('select.in', { style: { width: '100%' } });
    s.append(h('option', { value: '' }, '— choose —'));
    if (groups) for (const [g, list] of groups) s.append(h('optgroup', { label: g }, list.map(([v, l]) => h('option', { value: v }, l))));
    else s.append(...opts.map(([v, l]) => h('option', { value: v }, l)));
    return s;
  };
  const hw = Object.entries(def.components).map(([id, c]) => [id, `${id} — ${c.name}`]);
  hw.splice(hw.findIndex(x => x[0] === 'SV-301'), 0, ['FEED-LINE', 'Feed tubing and fittings']);
  const inst = def.sensors.map(s => [s.id, `${s.id} — ${s.desc || s.kind || ''}`]).concat([['DAQ', 'DAQ / signal conditioning']]);
  const comp = sel(null, [['Nothing', [['NONE', 'No fault — stand nominal']]], ['Hardware', hw], ['Instruments', inst]]);
  const modeGroups = {};
  for (const [id, label, cat] of FAILURE_MODES) (modeGroups[CAT_LABEL[cat] || cat] ||= []).push([id, label]);
  const mode = sel(null, Object.entries(modeGroups));
  comp.addEventListener('change', () => { if (comp.value === 'NONE') mode.value = 'none'; });
  mode.addEventListener('change', () => { if (mode.value === 'none') comp.value = 'NONE'; });

  const evid = new Set();
  const chk = (id, label) => h('label.chk.ev', h('input', { type: 'checkbox', onchange: e => e.target.checked ? evid.add(id) : evid.delete(id) }), label);
  const chanIds = [...def.sensors.map(s => s.id), ...(def.channels.derived || []).map(d => d.id)];
  const evChan = h('div.evgrid', chanIds.map(id => chk(id, id)));
  const evChecks = h('div.evgrid.wide', CHECKS.map(([id, l]) => chk(id, l)));
  const done = [...new Map(S.inspections.map(r => [r.id, r])).values()];
  const evInsp = done.length ? h('div.evgrid.wide', done.map(r => chk(r.id, r.label)))
    : h('p.faint', 'No inspections performed. Evidence you did not gather cannot be cited.');

  const action = sel(ACTIONS);
  const notes = h('textarea.in', { rows: 4, placeholder: 'Your reasoning: what you saw, what you ruled out, and why.' });
  const body = h('div.diag',
    h('p.muted', 'Submit once. The answer is revealed afterwards — including whether there was anything wrong at all.'),
    h('div.dgrid', h('label', 'Component'), comp, h('label', 'Failure mode'), mode, h('label', 'Recommended action'), action),
    h('h4', 'Evidence — measured channels'), evChan,
    h('h4', 'Evidence — checks and comparisons'), evChecks,
    h('h4', 'Evidence — inspections performed'), evInsp,
    h('h4', 'Reasoning'), notes);
  const m = modal({ title: 'Diagnosis', body, footer: [
    h('span.faint', { style: { marginRight: 'auto', fontSize: '11px' } }, `${S.inspections.length} inspection result(s) · ${S.runs.length} run(s) recorded`),
    btn('Cancel', () => m.close(), 'ghost'),
    btn('Submit diagnosis', () => {
      if (!comp.value || !mode.value || !action.value) { toast('Incomplete', 'Choose a component, a failure mode and an action.', 'info'); return; }
      const rec = S.submitDiagnosis({ component: comp.value, mode: mode.value, evidence: [...evid], action: action.value, notes: notes.value });
      m.close();
      recordInNotebook(app, rec);
      // a procedure already finished (its debrief shown) waits on this
      if (S.procedure?.done && app.level && rec.result.score >= 70 && !S.pollMisses.length && !S.safetyViolations.length) {
        app.recordCompetency(app.level.id, S.mode);
        toast('Competency recorded', `Level ${app.level.n}, ${S.mode}.`, 'info', 3500);
      }
      reveal(app);
    }, 'primary')] });
}

function recordInNotebook(app, rec) {
  const S = app.session, r = S.faults.reveal();
  const modeLabel = id => FAILURE_MODES.find(x => x[0] === id)?.[1] || id;
  const diag = `${rec.component} — ${modeLabel(rec.mode)}. Action: ${ACTIONS.find(a => a[0] === rec.action)?.[1] || rec.action}. Evidence: ${rec.evidence.join(', ') || 'none cited'}.${rec.notes ? ' Reasoning: ' + rec.notes : ''} Score ${rec.result.score}/100 (${rec.result.grade}).`;
  const root = r.none ? 'No fault: stand and instruments nominal.' : `${r.fault.component} — ${modeLabel(r.fault.mode)}. ${r.story.what}`;
  const ids = new Set(S.runs.map(x => x.id));
  let n = 0;
  for (const e of app.notebook.entries) if (ids.has(e.id)) { e.diagnosis = diag; e.rootCause = root; n++; }
  if (!n) app.notebook.addPendingNote(null, 'diagnosis', `${diag} Root cause: ${root}`);
  store.save();
  app.notebook.render();
}

export function reveal(app) {
  const S = app.session, rec = S.faults.diagnosis, r = S.faults.reveal();
  if (!rec || !r) return;
  const sec = (t, x, cls = '') => x ? [h('h4' + cls, t), typeof x === 'string' ? h('p', x) : x] : [];
  const parts = h('table.dparts', rec.result.parts.map(p => h('tr', h('td', p.label), h('td.n', `${p.got} / ${p.max}`), h('td.faint', p.note || ''))));
  const score = h('div.dscore', h('b', String(rec.result.score)), h('span', '/ 100'), h('em', rec.result.grade));
  const body = h('div.reveal', h('div.dtop', score, parts));
  if (r.none) {
    body.append(...sec('WHAT FAILED', 'Nothing. This session had no fault: the stand, the article and every instrument were nominal. The scatter you saw was the ordinary scatter of real measurements.'),
      ...sec('THE LESSON', 'Deciding a stand is healthy is a diagnosis too, and it needs evidence just as much: the leak check held, the transducers agreed statically, the shunt calibration was on value, the firing matched the prediction.'));
  } else {
    const s = r.story, key = r.fault.evidence || [];
    body.append(
      h('div.dans', h('span.faint', 'ROOT CAUSE'), h('b', `${r.fault.component}`), h('span', FAILURE_MODES.find(x => x[0] === r.fault.mode)?.[1] || r.fault.mode),
        h('span.tagc.' + (r.fault.category === 'sensor' ? 'sens' : 'sys'), r.fault.category === 'sensor' ? 'INSTRUMENT FAULT' : 'SYSTEM FAULT'),
        r.fault.hazard ? h('span.tagc.haz', 'HAZARDOUS') : null),
      ...sec('WHAT FAILED', s.what),
      ...sec('WHICH MEASUREMENTS SHOWED IT', s.indicators),
      ...sec('WHAT WAS MISLEADING', s.misleading),
      ...sec('WHAT SHOULD HAVE BEEN NOTICED', s.notice),
      ...sec('WAS STOPPING RIGHT?', h('div', h('p', s.abort), ...rec.abort.map(l => h('p.muted', l)))),
      ...sec('HOW AN EXPERT WOULD APPROACH IT', s.expert),
      ...sec('KEY EVIDENCE', h('p.mono', key.map(k => h('span.kev' + (rec.evidence.includes(k) ? '.hit' : ''), k)))));
    if (!r.applied) body.append(h('p.faint', 'The fault had not yet occurred when you submitted — it was waiting for a condition the session never reached (pressurisation or a firing). There was nothing in the data to find.'));
  }
  if (!r.none || rec.abort.length) { if (r.none) body.append(...sec('YOUR HANDLING', h('div', rec.abort.map(l => h('p.muted', l))))); }
  const m = modal({ title: 'Root cause', body, footer: [btn('Close', () => m.close(), 'primary')] });
}
