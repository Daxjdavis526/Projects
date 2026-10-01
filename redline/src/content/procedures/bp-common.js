/* Building blocks for the TS-2 (bipropellant) procedures. Same idea as
   common.js for TS-1: a procedure is a list of sections, most of them
   shared scaffolding.

   Generalised for training on a fictional stand; how such procedures are
   shaped, not a certified procedure for any real hardware. */

import { psi, fmt, unitLabel } from '../../lib/units.js';
import { near, lastEvent, fullScale } from './common.js';
const PSIG = () => unitLabel('pressure', true);

export const P = v => `${fmt(v, 'pressure')} ${PSIG()}`;
export const SYS_PTS = ['PT-602', 'PT-710', 'PT-720', 'PT-630', 'PT-713', 'PT-723', 'PT-715', 'PT-725', 'PT-801'];
export const ALL_PTS = ['PT-601', ...SYS_PTS];
export const flowed = v => !!v.completedSeq || v.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT'));
const ind = (v, id) => (v.ch(id + '-ZSO') === 1 && v.ch(id + '-ZSC') === 0 ? 'open' : v.ch(id + '-ZSC') === 1 && v.ch(id + '-ZSO') === 0 ? 'closed' : 'travel');

/* Cold-flow runs recorded this session matching a predicate. */
export const flowsWhere = (v, pred) => v.runs.filter(r => r.tFire !== null && !r.aborted && r.metrics?.kind === 'coldflow' && pred(r));

export function bpPretest(def, sec = 'A', { reviewText } = {}) {
  return { id: sec, title: 'Pre-test', steps: [
    { kind: 'info', station: 'TC', title: 'Review the test request',
      text: reviewText || (v => v.request.text),
      why: 'Know what the test is for and what the data should look like before touching anything.' },
    { kind: 'action', station: 'PROP', title: 'Technician: stand walkdown',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Walkdown.',
      why: 'On a two-propellant stand the walkdown also checks the things that kill engines: check valves fitted the right way round, the right line on the right manifold.',
      check: v => v.has(e => e.cat === 'TECH' && e.text.startsWith('Walkdown complete')) },
    { kind: 'verify', station: 'CTL', title: 'Verify the safe line-up',
      text: 'IV-601 CLOSED; VV-601, VV-711, VV-721 OPEN (venting); PV-631/632 CLOSED; all three regulators at 0; main valves CLOSED; fire circuit SAFE.',
      why: 'Every test starts from a known, safe configuration — and on this stand there are three regulators and seven remote valves to know.',
      check: v => v.cmd('IV-601') === 0 && ['VV-601', 'VV-711', 'VV-721'].every(id => v.cmd(id) === 1) && ['PV-631', 'PV-632', 'MOV-713', 'MFV-723'].every(id => v.cmd(id) === 0)
        && ['PR-610', 'PR-620', 'PR-630'].every(id => v.sp[id] === 0) && !v.armed,
      failMsg: 'The commanded line-up is not the safe starting configuration.' },
  ] };
}

export function bpInstrumentation(def, sec = 'B') {
  const FS = fullScale(def);
  return { id: sec, title: 'Instrumentation', steps: [
    { kind: 'action', station: 'DAQ', title: 'Power up the DAQ', text: 'Console ▸ DAQ ▸ Power ON. Wait for ONLINE.',
      why: 'No data, no redlines.', check: v => v.daq.online },
    { kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers (everything vented)',
      text: 'Console ▸ DAQ ▸ ZERO PTs.', why: 'Only correct because every section is truly at zero gauge now.',
      check: v => { const z = lastEvent(v, e => e.zero); return !!z && ALL_PTS.every(id => near(v.ch(id), 0, 0.003 * FS(id))); },
      audit: v => { const z = lastEvent(v, e => e.zero); return !!z && z.zero.every(o => Math.abs(o.removed) < Math.max(psi(5), 0.01 * FS(o.id))); } },
    { kind: 'action', station: 'DAQ', title: 'Tare the tank scales — EMPTY',
      text: 'Console ▸ DAQ ▸ TARE (tank scales). Both tanks are empty and vented: WT-716 and WT-726 should then read 0.00 kg.',
      why: 'A tank scale is tared once, empty, so that afterwards it reads the liquid on board. Tare it after loading and it reads "empty" with a full tank — which the tank-empty redline will believe.',
      check: v => { const t = lastEvent(v, e => e.tare && e.tare.some(o => o.id === 'WT-716'));
        return !!t && Math.abs(v.ch('WT-716')) < 0.05 && Math.abs(v.ch('WT-726')) < 0.05; },
      audit: v => v.session.model.line('ox').mL < 0.1, focus: ['T-710', 'T-720'] },
  ] };
}

export function bpLoad(def, sec = 'C') {
  return { id: sec, title: 'Load the simulant', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: load both tanks with water',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Load water. Vents open, tanks vented. Watch WT-716 and WT-726 rise.',
      why: 'Liquid goes in through a fill port with the tank vented; the gas it displaces leaves through the vent. A cold flow uses water: same hydraulics, none of the hazard.',
      check: v => v.ch('WT-716') > 5 && v.ch('WT-726') > 4, focus: ['T-710', 'T-720'] },
    { kind: 'record', station: 'PROP', title: 'Record the oxidiser-side load (WT-716)',
      text: 'The scale, not the sight glass, is the number that goes in the record.',
      why: 'The liquid on board limits how long you can flow, and the scale is also the independent check on the flowmeters later.',
      record: { channel: 'WT-716', unit: 'kg', validate: (x, v) => {
        const m = v.ch('WT-716');
        return near(x, m, 0.05) ? { ok: true, msg: `${m.toFixed(2)} kg on board.` } : { ok: false, msg: `WT-716 reads ${m.toFixed(2)} kg.` };
      } } },
  ] };
}

export function bpPressurantLeak(def, sec = 'E') {
  return { id: sec, title: 'Pressurant and leak check', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: open the bottle valve HV-600',
      text: 'FACILITY ▸ Technician ▸ Open HV-600. PT-601 rises to bottle pressure.',
      why: 'A hand valve: opened while people may still be in the cell.', check: v => v.cmd('HV-600') === 1 && v.ch('PT-601') > psi(1000) },
    { kind: 'action', station: 'PROP', title: 'Close VV-601 and both tank vents',
      text: 'VV-601, VV-711, VV-721 CLOSED.', why: 'Nothing holds pressure with its vent open.',
      check: v => ['VV-601', 'VV-711', 'VV-721'].every(id => v.cmd(id) === 0) },
    { kind: 'action', station: 'PROP', title: 'Open IV-601', text: 'Pressurant onto the three regulator inlets (PT-602).',
      why: 'The regulators are shut (setpoints 0), so nothing flows yet.', check: v => v.ch('IV-601-ZSO') === 1 && v.ch('PT-602') > psi(1000) },
    { kind: 'action', station: 'PROP', title: 'Both tanks to 50 psig (PR-610, PR-620)',
      text: 'Set both tank regulators to 50 psig and wait for PT-710 and PT-720 to lock up.',
      why: 'Leak-check at the personnel limit first.', check: v => near(v.sp['PR-610'], psi(50), psi(1)) && near(v.sp['PR-620'], psi(50), psi(1)) && near(v.ch('PT-710'), psi(50), psi(4)) && near(v.ch('PT-720'), psi(50), psi(4)) },
    { kind: 'hold', station: 'PROP', title: 'Isolate and hold: 60 s leak check',
      text: 'Close IV-601, open VV-601 (the header would otherwise keep feeding), set PR-610 and PR-620 to 0. Both tanks are now isolated volumes. START HOLD. Limit: < 0.5 psi/min on each.',
      why: 'A 12-litre ullage needs a lot of leakage to lose 1 psi; the limit is tighter here for exactly that reason. Big volumes hide leaks.',
      hold: { seconds: 60, store: 'leakCheck', pre: def.leak.pre, evaluate: def.leak.eval } },
    { kind: 'action', station: 'PROP', title: 'Restore pressurant: VV-601 closed, IV-601 open',
      text: 'Back to the pre-hold line-up.', why: 'The tanks will be pressurised from here.',
      check: v => v.cmd('VV-601') === 0 && v.ch('IV-601-ZSO') === 1 && !!v.leakCheck },
  ] };
}

export function bpClearCell(def, sec = 'F') {
  return { id: sec, title: 'Clear the test cell', steps: [
    { kind: 'action', station: 'SAF', title: 'Clear and secure the test cell', text: 'Console ▸ FACILITY ▸ Clear cell.',
      why: 'Above 50 psig nobody is in the cell.', check: v => v.facility.area === 'SECURED' },
    { kind: 'action', station: 'SAF', title: 'Warning announcement', text: 'Console ▸ FACILITY ▸ PA.',
      why: 'Everyone near the cell must know a test is coming: a cold flow is a loud spray of liquid at hundreds of psi, a hot fire is a flame and propellants under pressure.', check: v => v.paMade },
  ] };
}

export function bpPurge(def, sec = 'G') {
  return { id: sec, title: 'Purge available', steps: [
    { kind: 'action', station: 'PROP', title: 'PR-630 purge regulator → 150 psig',
      text: 'Set the purge regulator; PT-630 rises and locks up at 150. Purge valves stay CLOSED.',
      why: 'The purge must be at pressure BEFORE any flow: the sequencer post-purges after shutdown, and the abort sequence purges both manifolds. Purge pressure must also exceed the manifold pressure it is meant to displace.',
      check: v => near(v.sp['PR-630'], psi(150), psi(1)) && near(v.ch('PT-630'), psi(150), psi(6)) },
  ] };
}

/* One flow of a series: setpoints, a re-tare, then record-arm-fire, and the
   run that matches. */
export function flowPoint(def, { label, oxP = null, fuP = null, sides, lead = 0.1, duration = 3, match }) {
  const steps = [];
  const regs = [oxP != null ? ['PR-610', oxP, 'PT-710'] : null, fuP != null ? ['PR-620', fuP, 'PT-720'] : null].filter(Boolean);
  if (regs.length) steps.push({ kind: 'action', station: 'PROP',
    title: `${label}: ${regs.map(([id, p]) => `${id} → ${fmt(p, 'pressure', 0)}`).join(', ')} ${PSIG()}, locked up`,
    text: 'Set the tank pressure(s) and wait for lock-up. The regulators do not relieve: going DOWN in pressure means venting the tank a little.',
    why: 'Each point starts from a verified static condition.',
    check: v => regs.every(([id, p, ch]) => near(v.sp[id], p, psi(1)) && near(v.ch(ch), p, psi(6))) });
  const plan = `cold flow, ${sides === 'ox' ? 'oxidiser side only' : sides === 'fuel' ? 'fuel side only' : `both sides, ox lead ${Math.round(lead * 1000)} ms`}, ${duration.toFixed(1)} s`;
  steps.push({ kind: 'action', station: 'TC', title: `${label}: record, arm, flow — ${plan}`,
    text: 'FIRE CONTROL ▸ plan (sides, duration, lead) ▸ LOAD; DAQ ▸ RECORD; ARM; FIRE.',
    why: 'One flow, one file.',
    check: v => flowsWhere(v, match).length > 0 });
  return steps;
}

export function bpSafe(def, sec = 'S', done = flowed) {
  const R = def.ratings;
  return { id: sec, title: 'Safe the stand', steps: [
    { gate: done, kind: 'action', station: 'PROP', title: 'Tank regulators → 0, IV-601 closed',
      text: 'PR-610 and PR-620 to 0; IV-601 CLOSED.', why: 'Shut off the source first.',
      check: v => v.sp['PR-610'] === 0 && v.sp['PR-620'] === 0 && ind(v, 'IV-601') === 'closed' },
    { gate: done, kind: 'action', station: 'PROP', title: 'Vent both tanks and the header',
      text: 'VV-711, VV-721 and VV-601 OPEN. Watch PT-710, PT-720 and PT-602 fall.',
      why: 'Three vents for three sections.', check: v => ['VV-601', 'VV-711', 'VV-721'].every(id => v.cmd(id) === 1) },
    { gate: done, kind: 'action', station: 'PROP', title: 'Purge regulator → 0 and bleed the purge line',
      text: 'PR-630 to 0. The purge line between PR-630 and the closed purge valves is trapped: open PV-631 until PT-630 reads < 3 psig, then close it.',
      why: 'The purge line has no vent of its own. Its gas only leaves through a purge valve and the injector — another trapped volume.',
      check: v => v.sp['PR-630'] === 0 && v.ch('PT-630') < R.VENTED && v.cmd('PV-631') === 0 && v.cmd('PV-632') === 0 },
    { kind: 'verify', station: 'PROP', title: 'Verify the test system is vented',
      text: 'PT-602, PT-710, PT-720, PT-630, both manifolds and the chamber below 3 psig. (PT-601 still reads the bottle: HV-600 is still open.)',
      why: 'Vented means verified vented, everywhere.',
      check: v => SYS_PTS.every(id => v.ch(id) < R.VENTED),
      failMsg: 'A section is still pressurised. Find which transducer and which volume.' },
    { gate: done, kind: 'action', station: 'PROP', title: 'Enter the cell; technician closes HV-600',
      text: 'FACILITY ▸ Enter cell, then Technician ▸ Close HV-600. Propellants, if loaded, stay in their vented tanks under the facility\'s storage rules — or drain them (Technician ▸ Drain tanks).',
      why: 'Stored gas stays in the bottle, not in the lines. And nobody walks up to an engine that has not been safed.',
      check: v => v.cmd('HV-600') === 0 && done(v) },
  ] };
}

/* Recording starts before the poll: the DAQ station reports it. */
export const bpRecordStep = () => ({ kind: 'action', station: 'DAQ', title: 'Start DAQ recording',
  text: 'Console ▸ DAQ ▸ RECORD. With auto-stop on it stops a few seconds after each sequence; press RECORD again before each later firing.',
  why: 'The live strip charts are not a record. The DAQ station reports recording at the poll.',
  check: v => v.daq.recording || v.runs.some(r => r.tFire !== null) });

/* ---- hot fire ---------------------------------------------------------- */

/* Hot fires recorded this session matching a predicate (aborted ones
   included only when asked: a hard start is data too). */
export const hotWhere = (v, pred = () => true, { aborted = false } = {}) =>
  v.runs.filter(r => r.tFire !== null && (aborted || !r.aborted) && r.metrics?.kind === 'hotfire' && pred(r));
export const hotFired = v => v.runs.some(r => r.tFire !== null && r.meta?.config?.loaded === 'propellants');

export function bpLoadPropellants(def, sec = 'C') {
  return { id: sec, title: 'Load propellants', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: load OX-1 and FU-1',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Load propellants. Tanks empty and vented, vents open. Two minutes.',
      why: 'From here the stand is a propellant hazard: everything that holds or moves liquid holds or moves something that burns — or makes something else burn.',
      teach: 'OX-1 and FU-1 are fictional, with densities chosen where a storable oxidiser and an alcohol fuel would sit (1140 and 800 kg/m³). Nothing here is hypergolic: no spark, no fire.',
      check: v => v.loaded === 'propellants' && v.ch('WT-716') > 5, focus: ['T-710', 'T-720'] },
    { kind: 'record', station: 'PROP', title: 'Record the oxidiser load (WT-716)',
      text: 'From the scale.', why: 'Budget: the burn plus a reserve, on each side.',
      record: { channel: 'WT-716', unit: 'kg', validate: (x, v) => {
        const m = v.ch('WT-716');
        return near(x, m, 0.05) ? { ok: true, msg: `${m.toFixed(2)} kg of OX-1 on board.` } : { ok: false, msg: `WT-716 reads ${m.toFixed(2)} kg.` };
      } } },
  ] };
}

export function bpHotDaq(def, sec = 'D') {
  return { id: sec, title: 'DAQ for a hot fire', steps: [
    { kind: 'action', station: 'DAQ', title: 'Sample rate ≥ 2000 Hz',
      text: 'Console ▸ DAQ ▸ Rate.', why: 'The start transient — flame, the pressure overshoot, a hard-start spike — lasts a few tens of milliseconds. The overpressure redline is only as fast as the samples it sees.',
      check: v => v.daq.rate >= 2000 },
    { kind: 'action', station: 'DAQ', title: 'Flowmeter calibration fluid: FT-714 → OX-1, FT-724 → FU-1',
      text: 'Console ▸ DAQ ▸ Meter fluid (one per meter).',
      why: 'A turbine meter counts volume. The DAQ multiplies by the density it was told. Left on water, FT-714 reads OX-1 12 % low and FT-724 reads FU-1 25 % high — and every mixture ratio, c* and Isp computed from them is wrong.',
      check: v => v.meterFluid?.ox === 'OX-1' && v.meterFluid?.fu === 'FU-1' },
  ] };
}

export function bpSparkCheck(def, sec = 'E') {
  return { id: sec, title: 'Igniter', steps: [
    { kind: 'action', station: 'CTL', title: 'Spark check',
      text: 'Console ▸ INSPECT ▸ Spark check — a technician in the cell watches the plug through the nozzle while the exciter runs. Do it before the cell is cleared.',
      why: 'The exciter current proves the exciter. Only an eye — or the flame detector — proves a spark. An igniter that does not spark lights nothing; one that sparks late makes a hard start.',
      check: v => v.sparkChecked },
    { kind: 'verify', station: 'CTL', title: 'Spark seen: regular and strong',
      text: 'Read the inspection result.', why: 'A weak, irregular spark is a NO-GO, not a maybe.',
      check: v => { const r = [...v.inspections].reverse().find(i => i.id === 'spark-check'); return !!r && /strong/.test(r.lines[1]?.[1] || ''); },
      failMsg: 'The spark check did not show a strong, regular spark. Do not fire on it.' },
  ] };
}

export function bpPressuriseHot(def, sec, { oxP, fuP, title = 'Pressurise' } = {}) {
  return { id: sec, title, steps: [
    { kind: 'action', station: 'PROP', title: v => `PR-610 → ${P(oxP ?? v.request.oxP)}, PR-620 → ${P(fuP ?? v.request.fuP)}; locked up`,
      text: 'Set both tank regulators and wait for PT-710 and PT-720 to lock up.',
      why: 'The two tank pressures ARE the engine\'s throttle and its mixture-ratio trim.',
      check: v => { const o = oxP ?? v.request.oxP, f = fuP ?? v.request.fuP;
        return near(v.sp['PR-610'], o, psi(1)) && near(v.sp['PR-620'], f, psi(1)) && near(v.ch('PT-710'), o, psi(8)) && near(v.ch('PT-720'), f, psi(8)); } },
    { kind: 'action', station: 'DAQ', title: 'Tare LC-901 at pressure',
      text: 'Console ▸ DAQ ▸ TARE LC.', why: 'Feed-line stiffness changes with pressure; tare where you fire.',
      check: v => v.has(e => e.tare && e.tare.some(o => o.id === 'LC-901')) },
    bpRecordStep(),
  ] };
}

/* The hot-fire plan, as the request asks for it. */
export const hotPlanOk = (v, want) => {
  const p = v.plan;
  return p.mode === 'hot' && Math.abs(p.duration - want.duration) < 0.001 && Math.abs((p.lead ?? 0) - (want.lead ?? 0)) < 0.001
    && Math.abs((p.ignLead ?? 0.5) - (want.ignLead ?? 0.5)) < 0.001 && Math.abs((p.ignCheck ?? 0.5) - (want.ignCheck ?? 0.5)) < 0.001
    && (p.shutdown || 'ox-first') === (want.shutdown || 'ox-first');
};
const leadText = l => (l ? `${l > 0 ? 'oxidiser' : 'fuel'} lead ${Math.abs(Math.round(l * 1000))} ms` : 'zero lead');

/* One hot fire of a series: plan, a cool-enough engine, record, arm, fire. */
export function hotFirePoint(def, { label, want, match }) {
  const R = def.ratings;
  return [
    { kind: 'action', station: 'TC', title: `${label}: load the plan — ${want.duration.toFixed(1)} s, ${leadText(want.lead)}, ${(want.shutdown || 'ox-first').replace('-', ' ')} shutdown`,
      text: `FIRE CONTROL ▸ HOT FIRE ▸ duration ${want.duration.toFixed(1)} s, "ms ox lead" ${Math.round((want.lead ?? 0) * 1000)}${(want.lead ?? 0) < 0 ? ' (negative: the FUEL valve opens first)' : ''}, IGN T− ${(want.ignLead ?? 0.5).toFixed(2)} s, check T+ ${(want.ignCheck ?? 0.5).toFixed(2)} s ▸ LOAD.`,
      why: 'The plan is the start and shutdown sequence. Read it back before it is armed.',
      check: v => hotPlanOk(v, want) || hotWhere(v, match, { aborted: true }).length > 0 },
    { kind: 'verify', station: 'PROP', title: `${label}: engine cool (TC-803 < ${(R.WALL_REFIRE - 273.15).toFixed(0)} °C)`,
      text: 'A heat-sink chamber starts each burn from where the last left it. Wait (sim speed may be raised).',
      why: 'Start hot and the throat redline comes early — and the run is not comparable with the others.',
      check: v => v.ch('TC-803') < R.WALL_REFIRE || hotWhere(v, match, { aborted: true }).length > 0,
      failMsg: 'The throat is still hot.' },
    { kind: 'action', station: 'TC', title: `${label}: record, arm, FIRE`,
      text: 'DAQ ▸ RECORD; FIRE CONTROL ▸ ARM; FIRE. Watch OD-804 and PT-801 at ignition, VIB-805 and TC-803 through the burn.',
      why: 'One firing, one file.',
      check: v => hotWhere(v, match, { aborted: true }).length > 0 },
  ];
}

/* After a hot fire: the post-purge, and the soak-back peak. */
export function bpAfterFire(def, sec, done = hotFired) {
  return { id: sec, title: 'After the burn', steps: [
    { gate: done, kind: 'verify', station: 'CTL', title: 'Post-purge complete, both purge valves closed',
      text: 'The sequencer purges both manifolds after shutdown and then closes PV-631/632.',
      why: 'The dribble volume — the propellant between each main valve and the injector — is pushed out and burns or vaporises. Approach nothing until it is gone.',
      check: v => !v.seq && v.cmd('PV-631') === 0 && v.cmd('PV-632') === 0 },
    { gate: done, kind: 'verify', station: 'PROP', title: 'Throat soak-back peak passed (TC-803 falling)',
      text: 'Watch TC-803 keep rising after shutdown, peak and turn over.',
      why: 'The heat stored in the hot inner wall conducts outward after the flame is gone. The peak AFTER the run is the one to compare with the limit.',
      check: v => { const st = v.stats('TC-803', 3); return !!st && st.slope < 0; } },
  ] };
}
