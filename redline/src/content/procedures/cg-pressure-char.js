/* LEVEL 3 — Pressure characterisation.

   Four firings across the operating range, one file each, and then the part
   that makes it a characterisation rather than four tests: put them on one
   plot and read the hardware off the straight line.

   Thrust against ABSOLUTE chamber pressure is a straight line for attached
   nozzle flow, F = k·Pc − Pa·Ae. Its slope is the thrust coefficient times
   the throat area; its intercept is ambient pressure acting on the exit.
   The independent flowmeter gives the throat a second way. Two routes to the
   same geometry, and they should agree with the drawing. */

import { psi, fmt, fromDisplay, unitLabel } from '../../lib/units.js';
import { linfit, value } from '../../analysis/campaign.js';
import { P, near, finalize, pretest, instrumentation, zeroCal, daqConfig, supplyLeak, clearCell,
         pressurise, pollSection, safeStand, returnSafe, inspectStep, reportStep, firingPoint, runsWhere } from './common.js';

const MATRIX = [60, 100, 150, 200].map(psi);
const DUR = 2.0;

const matchPoint = p => r => near(r.meta.config.regSet, p, psi(1)) && r.plan?.mode === 'single' && near(r.plan.duration, DUR, 0.01) && r.meta.config.rate >= 1000;
const seriesDone = v => MATRIX.every(p => runsWhere(v, matchPoint(p)).length > 0);
/* The newest run at each matrix point. */
const pointRuns = v => MATRIX.map(p => runsWhere(v, matchPoint(p)).pop()).filter(Boolean);

export const request = def => ({
  regSet: MATRIX[0],
  matrix: MATRIX,
  duration: DUR,
  supplyAssumed: psi(2200),
  title: 'CGT-1 thrust vs chamber pressure',
  text: `Characterise CGT-1 S/N 002 (nozzle N-02) across its operating range: one ${DUR.toFixed(1)} s steady burn at each regulator setpoint of ${MATRIX.map(x => fmt(x, 'pressure', 0)).join(', ')} psig, recorded at ≥ 1000 Hz. Fit thrust against absolute chamber pressure; compare slope, intercept and effective throat with the drawing.`,
  success: 'Four clean runs; linear fit with R² > 0.999; nozzle exit and throat inferred from the data within a few percent of the drawing.',
});

export function procedure(def) {
  const nz = def.physics.elements.find(e => e.type === 'nozzle').nozzle;
  const pts = MATRIX.map((p, i) => ({ id: String.fromCharCode(73 + i), p, label: `Point ${i + 1}` }));   // sections I, J, K, L
  const fitFP = v => {
    const runs = pointRuns(v);
    return runs.length >= 3 ? linfit(runs.map(r => value(r, 'PcAbs')), runs.map(r => value(r, 'F'))) : null;
  };
  return finalize({
    id: 'cg-pressure-char',
    title: 'TP-CG-003 · Thrust vs chamber pressure',
    sections: [
      pretest(def, 'A', { reviewText: v => `${v.request.text} Pre-test prediction at the first point (${P(v.request.regSet)}): Pc ≈ ${v.prediction ? P(v.prediction.Pc) : '…'}, F ≈ ${v.prediction ? v.prediction.F.toFixed(2) + ' N' : '…'}. The line should extrapolate to about −${(def.physics.ambient.P * Math.PI / 4 * nz.exitDia ** 2).toFixed(2)} N at zero absolute pressure. Why negative? Work it out before you fire; the data will tell you if you were right.` }),
      instrumentation(def, 'B'),
      zeroCal(def, 'C'),
      daqConfig(def, 'D', { minRate: 1000 }),
      supplyLeak(def, 'E'),
      clearCell(def, 'F'),
      pressurise(def, 'G'),
      { id: 'H', title: 'Series set-up and poll', steps: [
        { kind: 'action', station: 'TC', title: `Load the firing plan: single burn, ${DUR.toFixed(1)} s`,
          text: 'The same plan for every point, so the only thing that changes between runs is pressure.',
          why: 'A characterisation varies one thing at a time. Everything else — burn length, sample rate, the order of operations — is held fixed so it cannot appear in the result.',
          check: v => v.plan.mode === 'single' && near(v.plan.duration, DUR, 0.001) },
        { kind: 'action', station: 'DAQ', title: 'Start recording for the first point',
          text: 'Recording auto-stops after each firing. Start it again before each of the later points.',
          why: 'One run per point keeps the data files — and the campaign table — clean.',
          check: v => v.daq.recording || v.runs.length > 0 },
        { kind: 'poll', station: 'TC', title: 'Go/no-go poll for the series',
          text: 'One poll for the whole test matrix: moving between the approved setpoints does not invalidate it. Anything else — a valve, the cell, a technician task — does.',
          why: 'Polling before every point of a routine sweep adds nothing; polling once for the approved matrix, and again if anything outside it changes, is how series testing is normally run.' },
      ] },
      ...pts.map(({ id, p, label }) => ({ id, title: `${label} — ${fmt(p, 'pressure', 0)} psig`, steps: [
        ...firingPoint(def, { label, regSet: p, planText: `${DUR.toFixed(1)} s`, match: matchPoint(p) }),
        { kind: 'verify', station: 'PROP', title: `${label}: check the run`,
          text: 'In ANALYSIS: steady chamber pressure and thrust reduced, no alarms or aborts, the burn the length you asked for.',
          why: 'Check each point before the next one. A bad point found at the end of a sweep costs the whole sweep.',
          check: v => { const r = runsWhere(v, matchPoint(p)).pop(); return !!r && Number.isFinite(r.metrics.summary.F) && !r.alarms.length; },
          failMsg: 'No clean reduced run at this point yet.' },
      ] })),
      { id: 'M', title: 'Characterise', steps: [
        { kind: 'action', station: 'TC', title: 'ANALYSIS ▸ CAMPAIGN: thrust against absolute chamber pressure',
          text: 'Open the campaign view. Put "Chamber pressure, steady (absolute)" on x and "Thrust, steady" on y, with the four points included.',
          why: 'Absolute, not gauge: the physics is written in absolute pressure. Plotted against gauge pressure the same line has an intercept that means nothing.',
          check: v => v.flags.has('campaign') },
        { kind: 'record', station: 'TC', title: v => `Record the fitted slope (N per ${unitLabel('pressure')})`,
          text: 'The slope of the least-squares line.',
          why: 'Slope = (thrust coefficient) × (throat area). Divide by the drawing\'s throat area and you have the nozzle\'s thrust coefficient without the ambient-pressure term.',
          record: { unit: () => `N/${unitLabel('pressure')}`, validate: (x, v) => {
            const f = fitFP(v); if (!f) return { ok: false, msg: 'Need at least three clean points first.' };
            const slope = f.a * fromDisplay(1, 'pressure');
            return near(x, slope, Math.abs(0.03 * slope)) ? { ok: true, msg: `${slope.toPrecision(4)} N per ${unitLabel('pressure')}` } : { ok: false, msg: `The fit gives ${slope.toPrecision(4)} N per ${unitLabel('pressure')}.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the intercept (N at zero absolute pressure)',
          text: 'Extrapolate the line to Pc = 0 absolute.',
          why: 'For attached flow the intercept is −Pa·Ae: ambient pressure pushing back on the nozzle exit. It is the one number in the test that measures the exit diameter.',
          record: { unit: 'N', validate: (x, v) => {
            const f = fitFP(v); if (!f) return { ok: false, msg: 'Need at least three clean points first.' };
            return near(x, f.b, 0.08) ? { ok: true, msg: `${f.b.toFixed(3)} N` } : { ok: false, msg: `The fit gives ${f.b.toFixed(3)} N.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the exit diameter implied by the intercept (mm)',
          text: 'Ae = −intercept / Pa, Pa = 101.3 kPa. Compare with the drawing (3.55 mm).',
          why: 'Two independent routes to one number — the drawing and the data — is how a test engineer knows the hardware is what it is supposed to be.',
          record: { unit: 'mm', validate: (x, v) => {
            const f = fitFP(v); if (!f) return { ok: false, msg: 'Need at least three clean points first.' };
            const d = Math.sqrt(4 * Math.max(0, -f.b) / (Math.PI * def.physics.ambient.P)) * 1e3;
            return near(x, d, 0.08) ? { ok: true, msg: `${d.toFixed(2)} mm (drawing ${(nz.exitDia * 1e3).toFixed(2)} mm)` } : { ok: false, msg: `The intercept implies ${d.toFixed(2)} mm.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the effective throat Ø from FT-201 (mean of the points, mm)',
          text: 'The analysis reduces an effective throat from the MEASURED mass flow and chamber pressure at every point. Average them.',
          why: 'MDOT-C assumes the drawing\'s throat; FT-201 does not. Agreement here says the throat is what the drawing says. Disagreement would mean erosion, blockage or a wrong nozzle — and MDOT-C would never tell you.',
          record: { unit: 'mm', validate: (x, v) => {
            const runs = pointRuns(v); if (!runs.length) return { ok: false, msg: 'No points yet.' };
            const d = runs.reduce((a, r) => a + value(r, 'dThroat'), 0) / runs.length * 1e3;
            return near(x, d, 0.02) ? { ok: true, msg: `${d.toFixed(3)} mm (drawing ${(def.nominal.throatDia * 1e3).toFixed(2)} mm)` } : { ok: false, msg: `The points average ${d.toFixed(3)} mm.` };
          } } },
        { kind: 'verify', station: 'TC', title: 'Linearity: R² above 0.999',
          text: 'Look at the residuals as well as R². A point that sits off the line is either a bad run or physics the line does not describe — below about 48 psig chamber pressure this nozzle separates, and the line would bend.',
          why: 'A characterisation is only as good as its worst point.',
          check: v => { const f = fitFP(v); return !!f && f.r2 > 0.999; }, failMsg: 'The fit is not linear enough — look for the bad point.' },
        { kind: 'info', station: 'TC', title: 'Regulator characterisation — from the same data',
          text: 'Plot "Regulator droop" against "Regulator setpoint" in the campaign view. The same four runs characterise the regulator: how much its outlet falls under this flow, at each setpoint.',
          why: 'Every run carries more information than the question it was fired to answer. Look at what else it says.' },
      ] },
      safeStand(def, 'N', seriesDone),
      returnSafe(def, 'O', seriesDone),
      { id: 'Q', title: 'Close-out', steps: [inspectStep(), reportStep()] },
    ],
  });
}

export default {
  id: 'cg-pressure',
  title: 'Pressure characterisation',
  objective: 'Thrust vs chamber pressure, 60–200 psig',
  seriesPoll: true,
  request,
  procedure,
  setup(session) { session.daq.setRate(250); },
};
