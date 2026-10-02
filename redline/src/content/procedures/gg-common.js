/* Procedure building blocks shared by the TS-3G gas-generator engine levels.
   The stand is TS-3 with an engine on it, so the turbopump's own scaffolding
   (the rotor, the supply, the leak check) is reused from tp-common.js; what
   is new is two propellants, two igniters, three purges, a start gas and an
   ablative chamber that has to cool between burns.

   Generalised for training on a fictional stand; how such procedures are
   shaped, not a certified procedure for any real hardware. */

import { psi, fmt } from '../../lib/units.js';
import { near, lastEvent, fullScale, PSIG } from './common.js';
import { bpRecordStep } from './bp-common.js';
import { tpRotor, tpSupply, tpLeak } from './tp-common.js';

export const P = v => `${fmt(v, 'pressure')} ${PSIG()}`;
export const GG_PTS = ['PT-302', 'PT-410', 'PT-420', 'PT-413', 'PT-423', 'PT-414', 'PT-424', 'PT-415', 'PT-425', 'PT-501', 'PT-333', 'PT-336', 'PT-630'];
export const ALL_PTS = ['PT-301', ...GG_PTS];
const PURGES = ['PV-631', 'PV-632', 'PV-635'];
const ENGINE_VALVES = ['TSV-332', 'MOV-414', 'MFV-424', 'GOV-416', 'GFV-426'];

/* Runs recorded this session: hot fires and pump-fed cold flows. Aborted
   ones only when asked — a start that hung is data too. */
export const ggRuns = (v, pred = () => true, { aborted = false } = {}) =>
  v.runs.filter(r => r.tFire !== null && (aborted || !r.aborted) && r.metrics?.kind === 'gg' && pred(r));
export const coldRuns = (v, pred = () => true, { aborted = false } = {}) =>
  v.runs.filter(r => r.tFire !== null && (aborted || !r.aborted) && r.metrics?.kind === 'ggcold' && pred(r));
export const ggDone = v => !!v.completedSeq || v.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT'));

/* ---- plans ------------------------------------------------------------ */
const HOT = { startP: psi(220), mainOpen: 0.45, ggOpen: 0.75, spinEnd: 1.1, ignLead: 0.5, ignOff: 2.0, shutLag: 0.25, thr: 1, settle: 4, dwell: 4 };
const COLD = { startP: psi(200), mainOpen: 0.3 };
const TIMING = ['mainOpen', 'ggOpen', 'spinEnd', 'ignLead', 'ignOff', 'shutLag'];
const pcts = xs => JSON.stringify((xs || []).map(x => Math.round(x * 100)));
const pct = x => `${Math.round(100 * x)} %`;

/* The loaded plan is the one the request asks for. */
export const ggPlanOk = (v, w) => {
  const p = v.plan, d = w.mode === 'cold' ? COLD : HOT;
  const eq = (k, tol) => Math.abs((p[k] ?? d[k]) - (w[k] ?? d[k])) <= tol;
  if (p.mode !== w.mode || !eq('startP', psi(1))) return false;
  if (w.mode === 'cold') return eq('mainOpen', 0.005) && eq('duration', 0.01);
  if (!TIMING.every(k => eq(k, 0.005))) return false;
  if (w.thrSteps) return pcts(p.thrSteps) === pcts(w.thrSteps) && eq('settle', 0.01) && eq('dwell', 0.01);
  const thr = w.thr ?? 1;
  return !(p.thrSteps?.length > 1) && eq('duration', 0.01)
    && Math.abs((p.thrOx ?? p.thr ?? 1) - (w.thrOx ?? thr)) < 0.005 && Math.abs((p.thrFu ?? p.thr ?? 1) - (w.thrFu ?? thr)) < 0.005;
};
/* A recorded run made with that plan. */
export const ggPlanMatch = w => r => {
  const p = r.plan || {};
  if (p.mode !== w.mode) return false;
  if (w.thrSteps) return pcts(p.thrSteps) === pcts(w.thrSteps);
  return !(p.thrSteps?.length > 1) && Math.abs((p.duration ?? 0) - w.duration) < 0.01;
};
export const ggPlanDesc = w => {
  if (w.mode === 'cold') return `PUMP-FED COLD FLOW (water), start gas ${fmt(w.startP ?? COLD.startP, 'pressure', 0)} ${PSIG()}, main valves T+${(w.mainOpen ?? COLD.mainOpen).toFixed(2)} s, ${w.duration.toFixed(1)} s`;
  const thr = w.thrSteps ? `GG throttle ${w.thrSteps.map(pct).join(' → ')} (${w.settle ?? 4} s, then ${w.dwell ?? 4} s each)` : `${w.duration.toFixed(1)} s, GG throttle ${pct(w.thr ?? 1)}`;
  return `HOT FIRE, ${thr}, start gas ${fmt(w.startP ?? HOT.startP, 'pressure', 0)} ${PSIG()}, standard start timing`;
};

/* ---- sections --------------------------------------------------------- */
export function ggPretest(def, sec = 'A', { reviewText } = {}) {
  return { id: sec, title: 'Pre-test', steps: [
    { kind: 'info', station: 'TC', title: 'Review the test request',
      text: reviewText || (v => v.request.text),
      why: 'Know what the test is for and what the data should look like before touching anything.' },
    { kind: 'action', station: 'PROP', title: 'Technician: stand walkdown',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Walkdown.',
      why: 'On an engine stand the walkdown adds the engine\'s own hazards: the turbine exhaust duct clear and pointing at the berm, the GG flanges lock-wired, both igniter leads secured.',
      check: v => v.has(e => e.cat === 'TECH' && e.text.startsWith('Walkdown complete')) },
    { kind: 'verify', station: 'CTL', title: 'Verify the safe line-up',
      text: 'IV-301 CLOSED; VV-301, VV-413, VV-423 OPEN; VV-338 and all three purges CLOSED; TSV-332, both main valves and both GG valves CLOSED; all four regulators at 0; fire circuit SAFE.',
      why: 'Every test starts from a known, safe configuration — on this stand, four regulators and fourteen remote valves.',
      check: v => v.cmd('IV-301') === 0 && ['VV-301', 'VV-413', 'VV-423'].every(id => v.cmd(id) === 1) && ['VV-338', ...PURGES, ...ENGINE_VALVES].every(id => v.cmd(id) === 0)
        && ['PR-410', 'PR-420', 'PR-330', 'PR-630'].every(id => v.sp[id] === 0) && !v.armed,
      failMsg: 'The commanded line-up is not the safe starting configuration.' },
  ] };
}

export function ggInstrumentation(def, sec = 'B') {
  const FS = fullScale(def);
  return { id: sec, title: 'Instrumentation', steps: [
    { kind: 'action', station: 'DAQ', title: 'Power up the DAQ', text: 'Console ▸ DAQ ▸ Power ON. Wait for ONLINE.',
      why: 'No data, no redlines — and an engine start has three redlines that only exist for the first three seconds.', check: v => v.daq.online },
    { kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers (everything vented)',
      text: 'Console ▸ DAQ ▸ ZERO PTs.', why: 'Only correct because every section is truly at zero gauge now — PT-301 included: it sits downstream of the shut bank valve.',
      check: v => { const z = lastEvent(v, e => e.zero); return !!z && ALL_PTS.every(id => near(v.ch(id), 0, 0.003 * FS(id))); },
      audit: v => { const z = lastEvent(v, e => e.zero); return !!z && z.zero.every(o => Math.abs(o.removed) < Math.max(psi(5), 0.01 * FS(o.id))); } },
    { kind: 'action', station: 'DAQ', title: 'Tare the tank scales — EMPTY',
      text: 'Console ▸ DAQ ▸ TARE SCALES. WT-411 and WT-421 then read 0.0 kg.',
      why: 'Tared empty, the scales read what is on board — which the tank-empty redlines rely on. A pump that runs its tank dry runs away, and on this engine takes the gas generator with it.',
      check: v => { const t = lastEvent(v, e => e.tare && e.tare.some(o => o.id === 'WT-411'));
        return !!t && Math.abs(v.ch('WT-411')) < 0.1 && Math.abs(v.ch('WT-421')) < 0.1; },
      audit: v => v.session.model.line('ox').mL < 0.1, focus: ['T-410', 'T-420'] },
  ] };
}

/* Water for a cold flow, or the propellants for a hot fire. */
export function ggLoad(def, sec = 'C', { prop = true } = {}) {
  const R = def.ratings;
  if (!prop) return { id: sec, title: 'Fill the run tanks with water', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: fill both tanks with water',
      text: `Console ▸ FACILITY ▸ Technician ▸ Fill tanks (water). Vents open. About ${R.FILL_WATER} kg each.`,
      why: 'A cold flow pumps water through the whole engine feed system: the pumps, the main valves, the injector — everything but the gas generator. Same hydraulics, none of the hazard.',
      check: v => v.loaded === 'water' && v.ch('WT-411') > 30 && v.ch('WT-421') > 30, focus: ['T-410', 'T-420'] },
    { kind: 'record', station: 'PROP', title: 'Record the ox-side load (WT-411), kg',
      record: { unit: 'kg', validate: (x, v) => (near(x, v.ch('WT-411'), 0.5) ? { ok: true, msg: `${v.ch('WT-411').toFixed(1)} kg.` } : { ok: false, msg: `WT-411 reads ${v.ch('WT-411').toFixed(1)} kg.` }) } },
  ] };
  return { id: sec, title: 'Load propellants', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: load OX-1 and FU-1',
      text: `Console ▸ FACILITY ▸ Technician ▸ Load propellants. Tanks empty and vented, vents open. About ${R.FILL_OX} kg of OX-1 and ${R.FILL_FU} kg of FU-1.`,
      why: 'From here the stand is a propellant hazard — and the gas generator drinks from the same two tanks as the main chamber.',
      check: v => v.loaded === 'propellants' && v.ch('WT-411') > 30, focus: ['T-410', 'T-420'] },
    { kind: 'record', station: 'PROP', title: 'Record the oxidiser load (WT-411), kg',
      why: 'The budget for the day: about 0.55 kg/s of OX-1 at mainstage, the gas generator\'s share included, plus a reserve the tank-empty redline keeps.',
      record: { unit: 'kg', validate: (x, v) => (near(x, v.ch('WT-411'), 0.5) ? { ok: true, msg: `${v.ch('WT-411').toFixed(1)} kg of OX-1 on board.` } : { ok: false, msg: `WT-411 reads ${v.ch('WT-411').toFixed(1)} kg.` }) } },
  ] };
}

export function ggRotor(def, sec = 'D') { return tpRotor(def, sec); }

/* DAQ rate, and the meter calibration fluid for what is in the tanks. */
export function ggDaq(def, sec, { prop = true } = {}) {
  const want = prop ? ['OX-1', 'FU-1'] : ['water', 'water'];
  return { id: sec, title: prop ? 'DAQ for a hot fire' : 'DAQ for a cold flow', steps: [
    { kind: 'action', station: 'DAQ', title: 'Sample rate ≥ 2000 Hz', text: 'Console ▸ DAQ ▸ Rate.',
      why: 'The whole start is over in two seconds. A gas generator hard start is a spike of a few tens of milliseconds, and the overspeed redline has about as long to act.',
      check: v => v.daq.rate >= 2000 },
    { kind: 'action', station: 'DAQ', title: `Flowmeter calibration fluid: FT-416 → ${want[0]}, FT-426 → ${want[1]}`,
      text: 'Console ▸ DAQ ▸ Meter fluid (one per meter).',
      why: prop ? 'Turbine meters count volume; the DAQ multiplies by the density it was told. Left on water, every mixture ratio, c* and Isp is wrong.' : 'Water in the tanks: the meters must be told water — whatever they were told for the last hot fire.',
      check: v => v.meterFluid?.ox === want[0] && v.meterFluid?.fu === want[1] },
  ] };
}

export function ggSpark(def, sec) {
  return { id: sec, title: 'Igniters', steps: [
    { kind: 'action', station: 'CTL', title: 'Spark-check both igniters',
      text: 'Console ▸ INSPECT ▸ Spark check — the main igniter through the nozzle, the gas generator\'s through its inspection port. Before the cell is cleared.',
      why: 'Two chambers, two igniters, two ways to start without a flame: a main chamber that fills with propellant, or a gas generator that sends raw propellant into the turbine and lights late — hard.',
      check: v => v.sparkChecked },
    { kind: 'verify', station: 'CTL', title: 'Both sparks regular and strong',
      text: 'Read the inspection result: IGN-501 and IGN-502.', why: 'A weak or irregular spark is a NO-GO, not a maybe.',
      check: v => { const r = [...v.inspections].reverse().find(i => i.id === 'spark-check'); return !!r && /strong/.test(r.lines[1]?.[1] || '') && /strong/.test(r.lines[3]?.[1] || ''); },
      failMsg: 'At least one igniter did not show a strong, regular spark. Do not fire on it.' },
  ] };
}

export function ggSupply(def, sec) { return tpSupply(def, sec); }
export function ggLeak(def, sec) { return tpLeak(def, sec); }

export function ggClearCell(def, sec, { hot = true } = {}) {
  return { id: sec, title: 'Clear the cell', steps: [
    { kind: 'action', station: 'SAF', title: 'Clear and secure the test cell', text: 'Console ▸ FACILITY ▸ Clear cell.',
      why: 'Above 50 psig nobody is in the cell; and nobody is near a rotor that is about to spin.', check: v => v.facility.area === 'SECURED' },
    { kind: 'action', station: 'SAF', title: 'Warning announcement', text: 'Console ▸ FACILITY ▸ PA.',
      why: hot ? 'A hot fire: a flame, a turbine exhaust at 600 °C pointed at the berm, and propellants at several hundred psi.' : 'A pump-fed cold flow is a spray of water at hundreds of psi and a turbine exhaust at −50 °C.',
      check: v => v.paMade },
  ] };
}

export function ggPurge(def, sec) {
  return { id: sec, title: 'Purge available', steps: [
    { kind: 'action', station: 'PROP', title: 'PR-630 purge regulator → 150 psig',
      text: 'Set the purge regulator; PT-630 locks up at 150. The purge valves stay CLOSED: the sequencer opens them.',
      why: 'Three purges: the two main injector manifolds and the gas generator. The sequencer pre-purges all three before the start and post-purges them after shutdown; the abort purges all three.',
      check: v => near(v.sp['PR-630'], psi(150), psi(1)) && near(v.ch('PT-630'), psi(150), psi(6)) },
  ] };
}

export function ggPressurise(def, sec, tankP = psi(50), { hot = true } = {}) {
  return { id: sec, title: 'Pressurise', steps: [
    { kind: 'action', station: 'PROP', title: `Both tanks → ${fmt(tankP, 'pressure', 0)} ${PSIG()}`,
      text: 'PR-410 and PR-420; wait for lock-up. With the pumps stopped, PT-413/414 and PT-423/424 read tank pressure too.',
      why: 'On a pump-fed engine the tank pressure is not the injector\'s: it is the pumps\' suction pressure, and it only has to keep the inducers out of cavitation.',
      check: v => near(v.sp['PR-410'], tankP, psi(1)) && near(v.sp['PR-420'], tankP, psi(1)) && near(v.ch('PT-410'), tankP, psi(5)) && near(v.ch('PT-420'), tankP, psi(5)) },
    { kind: 'verify', station: 'CTL', title: 'PR-330 at zero, TSV-332 shut',
      text: 'The sequencer brings the start gas up at T-3 to the plan\'s pressure and takes it down after the start.',
      check: v => v.sp['PR-330'] === 0 && v.ch('TSV-332-ZSC') === 1 },
    ...(hot ? [{ kind: 'action', station: 'DAQ', title: 'Tare LC-501',
      text: 'Console ▸ DAQ ▸ TARE LC.', why: 'The engine on its flexures, the lines at pressure: zero is where the engine sits now.',
      check: v => { const t = lastEvent(v, e => e.tare && e.tare.some(o => o.id === 'LC-501')); return !!t && t.t > (lastEvent(v, e => e.cat === 'TECH' && /loaded/.test(e.text))?.t ?? 0); } }] : []),
  ] };
}

/* Load the plan and start recording; the poll comes between this and the
   firing. */
export function ggPlanSteps(def, { label, want, match }) {
  const ran = v => (want.mode === 'cold' ? coldRuns : ggRuns)(v, match, { aborted: true }).length > 0;
  return [
    { kind: 'action', station: 'TC', title: `${label}: load the plan — ${ggPlanDesc(want)}`,
      text: 'FIRE CONTROL ▸ run type, start gas, timing, throttle, duration ▸ LOAD. Read the plan text back.',
      why: 'The plan is the start: when the start gas comes on, when the main valves and the gas generator open, when the start gas goes off. Read it back before it is armed.',
      check: v => ggPlanOk(v, want) || ran(v) },
    bpRecordStep(),
  ];
}

export function ggFireSteps(def, { label, want, match }) {
  const R = def.ratings, hot = want.mode !== 'cold';
  const ran = v => (hot ? ggRuns : coldRuns)(v, match, { aborted: true }).length > 0;
  return [
    ...(hot ? [{ kind: 'verify', station: 'PROP', title: `${label}: chamber case cool (TC-503 < ${(R.CASE_REFIRE - 273.15).toFixed(0)} °C)`,
      text: 'An ablative chamber soaks back for minutes after a burn. Wait (sim speed may be raised).',
      why: 'The liner that is left is what insulates the case. Start warm and the case redline comes early.',
      check: v => v.ch('TC-503') < R.CASE_REFIRE || ran(v), failMsg: 'The case is still warm.' }] : []),
    { kind: 'action', station: 'TC', title: `${label}: record, arm, FIRE`,
      text: hot ? 'DAQ ▸ RECORD; FIRE CONTROL ▸ ARM; FIRE. Watch SPD and PT-333 come up on start gas, PT-501 at the main valves, TT-334 at the GG valves — and SPD keep rising after the start gas goes off.'
        : 'DAQ ▸ RECORD; FIRE CONTROL ▸ ARM; FIRE. Watch SPD come up on start gas, the main valves open and the pumps load, the flows settle.',
      why: 'One run, one file.', check: ran },
    { kind: 'verify', station: 'CTL', title: `${label}: shut down, purged, rotor coasting`,
      text: 'The sequence is complete: engine valves shut, the post-purge done and its valves closed, SPD below 1500 rpm and falling.',
      why: 'The post-purge pushes the propellant left between the valves and the injectors out — and clears the turbine manifold of the fuel-rich gas left in it.',
      check: v => ran(v) && !v.seq && v.ch('SPD') < 1500 && [...ENGINE_VALVES, ...PURGES].every(id => v.cmd(id) === 0) },
  ];
}

export function ggSafe(def, sec = 'S', done = ggDone) {
  const R = def.ratings;
  return { id: sec, title: 'Safe the stand', steps: [
    { gate: done, kind: 'action', station: 'PROP', title: 'All four regulators → 0',
      text: 'PR-410 and PR-420 (relieving: they bleed the tanks down), PR-630, PR-330.',
      check: v => ['PR-410', 'PR-420', 'PR-330', 'PR-630'].every(id => v.sp[id] === 0) },
    { gate: done, kind: 'action', station: 'PROP', title: 'Close IV-301', check: v => v.ch('IV-301-ZSC') === 1 },
    { gate: done, kind: 'action', station: 'PROP', title: 'Open VV-301, VV-413, VV-423 and VV-338',
      why: 'The header, both tanks, and the start gas line between PR-330 and the shut TSV-332 (PT-336) — left at start pressure when the start ended.',
      check: v => ['VV-301', 'VV-413', 'VV-423', 'VV-338'].every(id => v.cmd(id) === 1) },
    { gate: done, kind: 'action', station: 'PROP', title: 'Bleed the purge line through PV-635, then close it',
      text: 'The purge line between PR-630 and the shut purge valves is trapped. Open PV-635 until PT-630 reads < 3 psig, then close it.',
      why: 'It has no vent of its own: its gas leaves only through a purge valve — this one through the gas generator and out of the turbine exhaust.',
      check: v => v.ch('PT-630') < R.VENTED && PURGES.every(id => v.cmd(id) === 0) },
    { kind: 'verify', station: 'PROP', title: 'Verify the system is vented and the rotor stopped',
      text: 'Every pressure downstream of IV-301 below 3 psig; SPD at zero. (PT-301 still reads the bank: HV-300 is still open.)',
      check: v => GG_PTS.every(id => v.ch(id) < R.VENTED) && v.ch('SPD') < 300,
      failMsg: 'Something is still pressurised, or the rotor is still turning.' },
    { gate: done, kind: 'action', station: 'PROP', title: 'Enter the cell; technician closes HV-300',
      text: 'FACILITY ▸ Enter cell, then Technician ▸ Close HV-300. Propellants stay in their vented tanks under the facility\'s storage rules — or drain them.',
      check: v => v.cmd('HV-300') === 0 && done(v) },
  ] };
}

/* A record step that reads a number from the reduction of a run. */
export function recordFrom(title, { find, get, unit, tol, msg = x => '', text, why }) {
  return { kind: 'record', station: 'TC', title, text, why,
    record: { unit, validate: (x, v) => {
      const r = find(v);
      if (!r) return { ok: false, msg: 'No qualifying run recorded.' };
      const val = get(r);
      if (!Number.isFinite(val)) return { ok: false, msg: 'The reduction has no value for that.' };
      const t = typeof tol === 'function' ? tol(val) : tol;
      return near(x, val, t) ? { ok: true, msg: msg(val, r) || 'Agrees with the reduction.' } : { ok: false, msg: `The reduction gives ${val.toFixed(Math.max(0, -Math.floor(Math.log10(t))))} ${unit}.` };
    } } };
}

export { bpRecordStep };
