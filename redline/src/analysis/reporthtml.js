/* The session test report as a standalone, printable HTML document. No DOM:
   it is a string, so the same document is previewed in the notebook,
   downloaded, and checked in Node.

   Light and plain on purpose — a report is printed, attached and archived,
   and should read the same on paper as on a screen. */

import { fmt, unitLabel, fmtClock } from '../lib/units.js';
import { VALIDITY } from './report.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const P = v => `${fmt(v, 'pressure')} ${unitLabel('pressure', true)}`;
const F = v => `${fmt(v, 'force')} ${unitLabel('force')}`;
const num = (v, dp) => (Number.isFinite(v) ? v.toFixed(dp) : '—');
const pct = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && b ? `${(100 * (a / b - 1)).toFixed(1)} %` : '—');

export function fmtQ(v, q) {
  if (!Number.isFinite(v)) return '—';
  if (q === 'percent') return `${(100 * v).toFixed(1)} %`;
  if (q === 'impulse') return `${(v * 1e3).toFixed(2)} mN·s`;
  if (q === 'isp') return `${v.toFixed(1)} s`;
  if (q === 'ratio') return v.toFixed(3);
  if (q === 'pressure') return P(v);
  if (q === 'force') return F(v);
  return String(v);
}

/* data: sessionReport(S); c: the conductor's conclusions
   { result, summary, anomalies, validity, numbers: {F,Pc,Isp,Cf,Ibit,IbitCv} };
   grade: gradeCampaign(...) or null; meta: { level, date, operator } */
export function reportHTML(data, c = {}, grade = null, meta = {}) {
  const runs = data.runs;
  const single = runs.filter(r => r.fired && !r.pulse && !r.aborted && Number.isFinite(r.F));
  const row = cells => `<tr>${cells.map(x => `<td>${x}</td>`).join('')}</tr>`;
  const head = cells => `<tr>${cells.map(x => `<th>${x}</th>`).join('')}</tr>`;
  let secN = 0;      // numbered as they appear; optional sections leave no gaps
  const sec = (_, t, body) => `<section><h2><span>${++secN}</span>${esc(t)}</h2>${body}</section>`;
  const out = [];
  out.push(sec(1, 'Test request', data.request
    ? `<p>${esc(data.request)}</p>${data.success ? `<p class="m"><b>Success criteria.</b> ${esc(data.success)}</p>` : ''}`
    : '<p class="m">Open-stand session: no formal test request.</p>'));
  const ps = data.procSummary;
  out.push(sec(2, 'Conduct', `<table class="kv">
    ${row(['Stand', esc(`${data.stand} · ${data.article}`)])}
    ${row(['Procedure', esc(data.procedure || 'none (open stand)')])}
    ${ps ? row(['Steps', `${ps.counts.COMPLETE} complete, ${ps.counts.SKIPPED} skipped, ${ps.counts.FAILED} failed, ${ps.counts.PENDING} open — of ${ps.total}`]) : ''}
    ${row(['Session', `${fmtClock(data.start)} – ${fmtClock(data.end)} · ${esc(data.mode)} mode${meta.level ? ' · ' + esc(meta.level) : ''}`])}
    ${row(['Go/no-go polls', String(data.polls)])}
    ${row(['Recorded runs', String(runs.length)])}
    ${row(['Safety violations', String(data.safety)])}</table>`));
  out.push(sec(3, 'Run log', runs.length ? `<table>
    ${head(['Run', 'Time', 'Plan', 'Setpoint', 'Result', 'Status'])}
    ${runs.map(r => row([
      `<b>${esc(r.id)}</b>`, fmtClock(r.clock), esc(r.plan), P(r.regSet),
      !r.fired ? '<span class="m">no firing</span>'
        : r.coldflow ? [Number.isFinite(r.coldflow.mdotOx) ? `ox ${fmt(r.coldflow.mdotOx, 'massflow')} g/s` : '', Number.isFinite(r.coldflow.mdotFu) ? `fuel ${fmt(r.coldflow.mdotFu, 'massflow')} g/s` : ''].filter(Boolean).join(', ')
        : r.pulse ? `I-bit ${fmtQ(r.Ibit, 'impulse')}, scatter ${fmtQ(r.IbitCv, 'percent')} (${r.n ?? '—'} pulses)`
        : `F ${F(r.F)}, Pc ${P(r.Pc)}, Isp ${num(r.Isp, 1)} s`,
      r.aborted ? `<span class="bad">ABORT</span> ${esc(r.abort || '')}` : r.alarms.length ? `<span class="warn">${r.alarms.length} alarm(s)</span>` : 'OK',
    ])).join('')}</table>` : '<p class="m">No runs recorded.</p>'));
  const cold = runs.filter(r => r.coldflow && !r.aborted);
  if (cold.length) out.push(sec(4, 'Cold-flow results', `<table>
    ${head(['Run', 'Sides', 'Ox flow', 'pred. (drawing)', 'Ox CdA', 'Fuel flow', 'pred. (drawing)', 'Fuel CdA', 'Meter vs scale'])}
    ${cold.map(r => { const c = r.coldflow, mm = v => (Number.isFinite(v) ? `${(v * 1e6).toFixed(3)} mm²` : '—'), g = v => (Number.isFinite(v) ? fmt(v, 'massflow') + ' g/s' : '—');
      return row([esc(r.id), esc(c.sides), g(c.mdotOx), g(c.sides === 'fuel' ? NaN : c.pOx), mm(c.CdAOx), g(c.mdotFu), g(c.sides === 'ox' ? NaN : c.pFu), mm(c.CdAFu),
        [c.errOx, c.errFu].filter(Number.isFinite).map(x => `${(100 * x).toFixed(2)} %`).join(' / ') || '—']); }).join('')}</table>
    ${cold.some(r => Number.isFinite(r.coldflow.MRhot)) ? `<p>Hot-fire mixture ratio predicted from these flow coefficients: <b>${cold.filter(r => Number.isFinite(r.coldflow.MRhot)).map(r => r.coldflow.MRhot.toFixed(3)).join(', ')}</b> (design 1.50).</p>` : ''}
    <p class="m">Predictions use the injector DRAWING flow areas. The measured CdA is the as-built injector.</p>`));
  else out.push(sec(4, 'Results against prediction', single.length ? `<table>
    ${head(['Run', 'Setpoint', 'Thrust', 'pred.', 'Δ', 'Chamber', 'pred.', 'Δ', 'Isp', 'pred.'])}
    ${single.map(r => row([esc(r.id), P(r.regSet), F(r.F), r.pred ? F(r.pred.F) : '—', pct(r.F, r.pred?.F),
      P(r.Pc), r.pred ? P(r.pred.Pc) : '—', pct(r.Pc, r.pred?.Pc), `${num(r.Isp, 1)} s`, r.pred ? `${num(r.pred.Isp, 1)} s` : '—'])).join('')}</table>
    <p class="m">Predictions are from the nominal model of the stand at each run's supply and setpoint. A difference is a finding until it is explained.</p>`
    : '<p class="m">No steady-state firing to compare.</p>'));
  out.push(sec(5, 'Anomalies, alarms and holds', data.anomalies.length
    ? `<ul>${data.anomalies.map(a => `<li><span class="m">${esc(a.kind)} · t = ${a.t.toFixed(0)} s</span> ${esc(a.text)}</li>`).join('')}</ul>`
    : '<p class="m">None recorded by the system.</p>'));
  if (data.inspections.length) out.push(sec(6, 'Inspections', data.inspections.map(i => `<h3>${esc(i.label)}</h3><table>
    ${head(['', 'Found', 'Expected'])}${i.lines.map(l => row([esc(l[0]), `<b>${esc(l[1])}</b>`, esc(l[2] ?? '')])).join('')}</table>${i.text ? `<p class="m">${esc(i.text)}</p>` : ''}`).join('')));
  if (data.faultSession || data.diagnosis) {
    const d = data.diagnosis, rc = data.rootCause;
    out.push(sec(7, 'Diagnosis and root cause', d
      ? `<table class="kv">${row(['Conductor\'s diagnosis', esc(`${d.component} — ${d.mode}; action: ${d.action}`)])}
         ${row(['Evidence cited', esc(d.evidence.join(', ') || 'none')])}
         ${row(['Score', `${d.score}/100 (${esc(d.grade)})`])}
         ${row(['Root cause', rc?.none ? 'No fault: stand and instruments nominal.' : esc(`${rc.component} — ${rc.mode}. ${rc.what}`)])}</table>`
      : '<p class="warn">No diagnosis submitted.</p>'));
  }
  const n = c.numbers;
  const vLabel = VALIDITY.find(v => v[0] === c.validity)?.[1];
  out.push(sec(8, 'Conclusions of the test conductor', `<table class="kv">
    ${c.result ? row(['Result', `<b>${esc(c.result)}</b>`]) : ''}
    ${vLabel ? row(['Data validity', `<b>${esc(vLabel)}</b>`]) : ''}
    ${n ? row(['Baseline', `F ${fmtQ(n.F, 'force')}, Pc ${fmtQ(n.Pc, 'pressure')}, Isp ${fmtQ(n.Isp, 'isp')}`]) : ''}
    ${n ? row(['Thrust coefficient', fmtQ(n.Cf, 'ratio')]) : ''}
    ${n ? row(['Impulse bit, 10 ms', `${fmtQ(n.Ibit, 'impulse')}, scatter ${fmtQ(n.IbitCv, 'percent')}`]) : ''}
    ${row(['Summary', esc(c.summary || '—')])}
    ${row(['Anomalies', esc(c.anomalies || '—')])}</table>`));
  if (grade) out.push(sec(9, 'Review', `<p><b>${grade.score}/100 — ${esc(grade.grade)}</b></p><table>
    ${head(['', 'Points', ''])}${grade.parts.map(p => row([esc(p.label), `${p.got} / ${p.max}`,
      esc(p.note) + (Number.isFinite(p.ref) && p.got < p.max ? ` <span class="m">(your reduction: ${fmtQ(p.ref, p.q)})</span>` : '')])).join('')}</table>`));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(data.title)} — test report</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: #fff; color: #16191d; font: 13px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 900px; margin: 0 auto; padding: 28px 24px 48px; }
  header { border-bottom: 2px solid #16191d; padding-bottom: 10px; margin-bottom: 8px; }
  header .k { font: 600 10px/1 ui-monospace, monospace; letter-spacing: .16em; color: #666; }
  h1 { font-size: 20px; margin: 6px 0 4px; }
  .sub { color: #555; font-size: 12px; }
  .note { margin: 10px 0 0; padding: 6px 10px; background: #fbf5e6; border-left: 3px solid #c99a2e; font-size: 11.5px; color: #5a4a20; }
  h2 { font-size: 13px; letter-spacing: .06em; text-transform: uppercase; margin: 22px 0 8px; border-bottom: 1px solid #ccd; padding-bottom: 3px; }
  h2 span { display: inline-block; min-width: 22px; color: #888; }
  h3 { font-size: 12.5px; margin: 12px 0 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; font-weight: 600; color: #555; border-bottom: 1px solid #99a; padding: 3px 8px 3px 0; }
  td { padding: 3px 8px 3px 0; border-bottom: 1px solid #e3e6ea; vertical-align: top; font-variant-numeric: tabular-nums; }
  table.kv td:first-child { width: 190px; color: #555; }
  p { margin: 0 0 8px; } ul { margin: 0; padding-left: 18px; }
  .m { color: #666; } .bad { color: #b3261e; font-weight: 700; } .warn { color: #9a6a00; font-weight: 600; }
  footer { margin-top: 28px; font-size: 11px; color: #777; border-top: 1px solid #ccd; padding-top: 8px; }
  @media print { main { padding: 0; } section { break-inside: avoid; } }
</style></head><body><main>
<header><div class="k">TEST REPORT · ${esc(meta.date || '')}</div><h1>${esc(data.title)}</h1>
<div class="sub">${esc(data.stand)} · ${esc(data.article)}${meta.operator ? ' · test conductor: ' + esc(meta.operator) : ''}</div>
<p class="note">Training exercise on a simulated, fictional test stand (REDLINE). Not a record of real hardware.</p></header>
${out.join('\n')}
<footer>Generated by REDLINE, a test-stand operations trainer. Values in display units: pressure ${esc(unitLabel('pressure'))}, force ${esc(unitLabel('force'))}.</footer>
</main></body></html>`;
}
