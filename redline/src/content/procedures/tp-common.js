/* Procedure building blocks shared by the TS-3 turbopump levels.

   Generalised for training on a fictional stand; how such procedures are
   shaped, not a certified procedure for any real hardware. */

import { psi, fmt, unitLabel } from '../../lib/units.js';
import { near, lastEvent, fullScale, PSIG } from './common.js';
import { bpRecordStep } from './bp-common.js';

export const P = v => `${fmt(v, 'pressure')} ${PSIG()}`;
export const TP_PTS = ['PT-302', 'PT-410', 'PT-420', 'PT-413', 'PT-423', 'PT-414', 'PT-424', 'PT-417', 'PT-427', 'PT-336', 'PT-333'];
export const ALL_PTS = ['PT-301', ...TP_PTS];
export const spun = v => !!v.completedSeq || v.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT'));
export const pumpRuns = (v, pred = () => true, { aborted = false } = {}) =>
  v.runs.filter(r => r.tFire !== null && (aborted || !r.aborted) && r.metrics?.kind === 'pump' && pred(r));
const rpm = x => `${Math.round(x).toLocaleString('en-US')} rpm`;
const pct = x => `${Math.round(100 * x)} %`;

export function tpPretest(def, sec = 'A', { reviewText } = {}) {
  return { id: sec, title: 'Pre-test', steps: [
    { kind: 'info', station: 'TC', title: 'Review the test request',
      text: reviewText || (v => v.request.text),
      why: 'Know what the test is for and what the data should look like before touching anything.' },
    { kind: 'action', station: 'PROP', title: 'Technician: stand walkdown',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Walkdown.',
      why: 'On a turbopump stand the walkdown includes the things that spin: the coupling guard, the speed pickups\' gaps and cables, the exhaust duct.',
      check: v => v.has(e => e.cat === 'TECH' && e.text.startsWith('Walkdown complete')) },
    { kind: 'verify', station: 'CTL', title: 'Verify the safe line-up',
      text: 'IV-301 CLOSED; VV-301, VV-413, VV-423 OPEN; TSV-332, DV-414, DV-424, VV-338 CLOSED; all three regulators at 0; fire circuit SAFE.',
      why: 'Every test starts from a known, safe configuration.',
      check: v => v.cmd('IV-301') === 0 && ['VV-301', 'VV-413', 'VV-423'].every(id => v.cmd(id) === 1) && ['TSV-332', 'DV-414', 'DV-424', 'VV-338'].every(id => v.cmd(id) === 0)
        && ['PR-410', 'PR-420', 'PR-330'].every(id => v.sp[id] === 0) && !v.armed,
      failMsg: 'The commanded line-up is not the safe starting configuration.' },
  ] };
}

export function tpInstrumentation(def, sec = 'B') {
  const FS = fullScale(def);
  return { id: sec, title: 'Instrumentation', steps: [
    { kind: 'action', station: 'DAQ', title: 'Power up the DAQ', text: 'Console ▸ DAQ ▸ Power ON. Wait for ONLINE.',
      why: 'No data, no redlines — and on this stand the speed redline is the one that matters.', check: v => v.daq.online },
    { kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers (everything vented)',
      text: 'Console ▸ DAQ ▸ ZERO PTs.', why: 'Only correct because every section is truly at zero gauge now — PT-301 included: it sits downstream of the shut bank valve.',
      check: v => { const z = lastEvent(v, e => e.zero); return !!z && ALL_PTS.every(id => near(v.ch(id), 0, 0.003 * FS(id))); },
      audit: v => { const z = lastEvent(v, e => e.zero); return !!z && z.zero.every(o => Math.abs(o.removed) < Math.max(psi(5), 0.01 * FS(o.id))); } },
    { kind: 'action', station: 'DAQ', title: 'Tare the tank scales — EMPTY',
      text: 'Console ▸ DAQ ▸ TARE (tank scales). WT-411 and WT-421 then read 0.0 kg.',
      why: 'Tared empty, the scales read water on board — which the low-level redlines rely on. A pump that runs its tank dry runs away.',
      check: v => { const t = lastEvent(v, e => e.tare && e.tare.some(o => o.id === 'WT-411'));
        return !!t && Math.abs(v.ch('WT-411')) < 0.1 && Math.abs(v.ch('WT-421')) < 0.1; },
      audit: v => v.session.model.line('ox').mL < 0.1, focus: ['T-410', 'T-420'] },
  ] };
}

export function tpFill(def, sec = 'C') {
  return { id: sec, title: 'Fill the run tanks', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: fill both tanks with water',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Fill tanks (vents open). About 54 kg each, from the catch tank.',
      why: 'The water is the pumps\' load. Without it there is nothing to stop the turbine running the shaft away.',
      check: v => v.ch('WT-411') > 30 && v.ch('WT-421') > 30, focus: ['T-410', 'T-420'] },
    { kind: 'record', station: 'PROP', title: 'Record the ox-side load (WT-411), kg',
      record: { unit: 'kg', validate: (x, v) => (near(x, v.ch('WT-411'), 0.5) ? { ok: true, msg: `${v.ch('WT-411').toFixed(1)} kg.` } : { ok: false, msg: `WT-411 reads ${v.ch('WT-411').toFixed(1)} kg.` }) } },
  ] };
}

export function tpRotor(def, sec = 'D') {
  return { id: sec, title: 'The rotor', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: turn the rotor by hand',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Turn rotor. A torque wrench on the shaft nut: breakaway torque, and how it feels.',
      why: 'The first thing anyone does to a turbopump on a test day. A seized, rubbing or gritty rotor is found here, with a wrench — not at 36 000 rpm.',
      check: v => v.inspected.has('turn-rotor'), focus: ['TPA-1'] },
    { kind: 'record', station: 'PROP', title: 'Record the breakaway torque, N·mm',
      text: 'From the technician\'s log entry. Acceptance: 8–12 N·mm, turning smoothly.',
      record: { unit: 'N·mm', validate: (x, v) => {
        const e = lastEvent(v, q => q.cat === 'TECH' && /breakaway/.test(q.text));
        const m = e && e.text.match(/breakaway (\d+) N·mm/);
        if (!m) return { ok: false, msg: 'No hand-turn logged yet.' };
        return Number(x) === Number(m[1]) ? { ok: true, msg: `${m[1]} N·mm — ${Number(m[1]) <= 12 ? 'within acceptance' : 'ABOVE the 12 N·mm acceptance: find out why before spinning'}.` } : { ok: false, msg: `The log says ${m[1]} N·mm.` };
      } } },
    { kind: 'verify', station: 'DAQ', title: 'Both speed pickups read zero',
      text: 'SE-341 and SE-342 at rest. (Whether they AGREE can only be seen once the shaft turns: watch them on the way up.)',
      check: v => Math.abs(v.ch('SE-341')) < 100 && Math.abs(v.ch('SE-342')) < 100 },
  ] };
}

export function tpDaq(def, sec, minRate = 2000) {
  return { id: sec, title: 'DAQ for a spin', steps: [
    { kind: 'action', station: 'DAQ', title: `Sample rate ≥ ${minRate} Hz`,
      text: `Console ▸ DAQ ▸ Rate ▸ ${minRate} Hz.`,
      why: 'Speed rises at thousands of rpm per second and the overspeed redline has a few tens of milliseconds to act in.',
      check: v => v.daq.rate >= minRate },
  ] };
}

export function tpSupply(def, sec) {
  return { id: sec, title: 'Supply', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: open the bank valve HV-300',
      text: 'FACILITY ▸ Technician ▸ Open HV-300. PT-301 rises to bank pressure.',
      check: v => v.cmd('HV-300') === 1 && v.ch('PT-301') > psi(1500), focus: ['HV-300', 'N2-B'] },
    { kind: 'record', station: 'PROP', title: 'Record the bank pressure (PT-301)',
      text: v => `Minimum for a turbine run: ${P(v.ratings.SUPPLY_MIN)}.`,
      why: 'The turbine takes about 0.1 kg of nitrogen a second: each run takes a visible bite out of the bank.',
      record: { channel: 'PT-301', unit: 'psig', validate: (x, v) => {
        const m = v.ch('PT-301') / psi(1);
        return near(x, m, 15) ? { ok: true, msg: m >= v.ratings.SUPPLY_MIN / psi(1) ? 'Enough for the test.' : 'BELOW the minimum.' } : { ok: false, msg: `PT-301 reads ${m.toFixed(0)}.` };
      } } },
    { kind: 'action', station: 'PROP', title: 'Close VV-301, VV-413 and VV-423; open IV-301',
      text: 'Header and both tanks able to hold pressure; PT-302 at supply.',
      check: v => ['VV-301', 'VV-413', 'VV-423'].every(id => v.cmd(id) === 0) && v.ch('IV-301-ZSO') === 1 },
  ] };
}

/* Leak check: both tanks at 40 psig, the supply isolated, a 60 s hold. */
export function tpLeak(def, sec) {
  return { id: sec, title: 'Leak check (≤ 50 psig)', steps: [
    { kind: 'action', station: 'PROP', title: 'Both tanks → 40 psig',
      text: 'PR-410 and PR-420 → 40 psig; wait for PT-410 and PT-420 to lock up.',
      check: v => near(v.ch('PT-410'), psi(40), psi(4)) && near(v.ch('PT-420'), psi(40), psi(4)) },
    { kind: 'action', station: 'PROP', title: 'Isolate: IV-301 closed, VV-301 open',
      text: 'Leave the tank regulators at 40 psig — they are RELIEVING: set to zero, they would bleed the tanks down and void the check.',
      why: 'A relieving regulator is a vent as well as a feed. The leak check has to know which of the two it is.',
      check: v => v.cmd('IV-301') === 0 && v.cmd('VV-301') === 1 },
    { kind: 'hold', station: 'PROP', title: 'Leak check: 60 s hold',
      text: 'Start hold. Both tank pressures must fall by less than 0.5 psi/min.',
      why: 'Two identical tanks on identical regulators: if one decays and the other does not, the difference is the leak.',
      hold: { seconds: 60, store: 'leakCheck', pre: def.leak.pre, evaluate: def.leak.eval } },
    { kind: 'action', station: 'PROP', title: 'Restore supply: VV-301 closed, IV-301 open',
      check: v => v.cmd('VV-301') === 0 && v.ch('IV-301-ZSO') === 1 && !!v.leakCheck },
  ] };
}

export function tpClearCell(def, sec) {
  return { id: sec, title: 'Clear the cell', steps: [
    { kind: 'action', station: 'SAF', title: 'Clear and secure the test cell', text: 'Console ▸ FACILITY ▸ Clear cell.',
      why: 'Above 50 psig nobody is in the cell; and nobody is ever near a rotor that is about to spin.', check: v => v.facility.area === 'SECURED' },
    { kind: 'action', station: 'SAF', title: 'Warning announcement', text: 'Console ▸ FACILITY ▸ PA.',
      why: 'A turbine run is loud, and the exhaust duct runs at −70 °C.', check: v => v.paMade },
  ] };
}

export function tpPressurise(def, sec, tankP = psi(50)) {
  return { id: sec, title: 'Pressurise', steps: [
    { kind: 'action', station: 'PROP', title: `Both tanks → ${fmt(tankP, 'pressure', 0)} ${PSIG()}`,
      text: 'PR-410 and PR-420; wait for lock-up. With the pumps stopped, PT-413/414 and PT-423/424 read tank pressure too.',
      why: 'The tank pressure is the pumps\' suction pressure: it sets the margin against cavitation (NPSH).',
      check: v => near(v.sp['PR-410'], tankP, psi(1)) && near(v.sp['PR-420'], tankP, psi(1)) && near(v.ch('PT-410'), tankP, psi(5)) && near(v.ch('PT-420'), tankP, psi(5)) },
    { kind: 'verify', station: 'CTL', title: 'PR-330 at zero, TSV-332 shut',
      text: 'The drive regulator starts from zero: in speed control SC-330 ramps it from the feed-forward the prediction gives.',
      check: v => v.sp['PR-330'] === 0 && v.ch('TSV-332-ZSC') === 1 },
  ] };
}

/* A plan as the request asks for it. */
export const planOk = (v, w) => {
  const p = v.plan;
  if (p.mode !== w.mode || (p.ctl || 'speed') !== (w.ctl || 'speed')) return false;
  if ((w.ctl || 'speed') === 'speed' && Math.abs(p.speed - w.speed) > 1) return false;
  if (w.mode === 'map') return JSON.stringify((p.thrSteps || []).map(x => Math.round(x * 100))) === JSON.stringify(w.thrSteps.map(x => Math.round(x * 100))) && Math.abs((p.dwell ?? 4) - (w.dwell ?? 4)) < 0.01;
  if (Math.abs((p.thr ?? 0) - w.thr) > 0.005 && !(p.thrOx != null && Math.abs(p.thrOx - w.thr) < 0.005)) return false;
  if (w.mode === 'suction') return (p.side || 'ox') === w.side && Math.abs(p.pEnd - w.pEnd) < psi(0.6) && p.duration >= w.duration - 0.01;
  return Math.abs(p.duration - w.duration) < 0.01;
};
export const planDesc = w => (w.mode === 'map' ? `PUMP MAP at ${rpm(w.speed)}, throttles ${w.thrSteps.map(pct).join(' → ')}, ${w.dwell ?? 4} s each`
  : w.mode === 'suction' ? `SUCTION TEST at ${rpm(w.speed)}, throttles ${pct(w.thr)}, ${w.side === 'fu' ? 'fuel' : 'ox'} side down to ${fmt(w.pEnd, 'pressure', 0)} ${PSIG()}, ${w.duration} s`
  : `SPIN at ${rpm(w.speed)}, throttles ${pct(w.thr)}, ${w.duration} s`);

export function tpRunSteps(def, { label, want, match }) {
  return [
    { kind: 'action', station: 'TC', title: `${label}: load the plan — ${planDesc(want)}`,
      text: 'FIRE CONTROL ▸ run type, speed, throttle, timing ▸ LOAD. Read the plan text back.',
      why: 'The plan is the run: the speed the controller will hold, the throttle positions the pumps will see, how long, and the coast-down after.',
      check: v => planOk(v, want) || pumpRuns(v, match, { aborted: true }).length > 0 },
    bpRecordStep(),
  ];
}
export function tpFireSteps(def, { label, match }) {
  return [
    { kind: 'action', station: 'TC', title: `${label}: arm and FIRE`,
      text: 'FIRE CONTROL ▸ ARM; FIRE. Watch SE-341 and SE-342 together on the way up, then the pump pressures, the flows and the vibration; after shut-off, the coast-down.',
      why: 'One run, one file.',
      check: v => pumpRuns(v, match, { aborted: true }).length > 0 },
    { kind: 'verify', station: 'CTL', title: `${label}: coasted down, discharge valves shut`,
      text: 'The sequencer shut the discharge valves after the coast-down. SPD is below 1500 rpm and falling: the last of it is bearing drag, and takes a while.',
      why: 'A rotor that is still turning stores energy; the cell stays shut until it stops.',
      check: v => pumpRuns(v, match, { aborted: true }).length > 0 && !v.seq && v.ch('SPD') < 1500 && v.cmd('DV-414') === 0 && v.cmd('DV-424') === 0 },
  ];
}

export function tpSafe(def, sec = 'S', done = spun) {
  const R = def.ratings;
  return { id: sec, title: 'Safe the stand', steps: [
    { gate: done, kind: 'action', station: 'PROP', title: 'Tank regulators → 0 (they bleed the tanks down), PR-330 → 0',
      check: v => ['PR-410', 'PR-420', 'PR-330'].every(id => v.sp[id] === 0) },
    { gate: done, kind: 'action', station: 'PROP', title: 'Close IV-301', check: v => v.ch('IV-301-ZSC') === 1 },
    { gate: done, kind: 'action', station: 'PROP', title: 'Open VV-301, VV-413, VV-423 and VV-338',
      why: 'The relieving regulators take the tanks down to a few psi; the vents take them the rest of the way. The header between IV-301 and the regulators only leaves through VV-301 — and the drive line between PR-330 and the shut turbine start valve (PT-336) only through VV-338: it was left at drive pressure when the run ended.',
      check: v => ['VV-301', 'VV-413', 'VV-423', 'VV-338'].every(id => v.cmd(id) === 1) },
    { kind: 'verify', station: 'PROP', title: 'Verify the system is vented and the rotor stopped',
      text: 'Every pressure downstream of IV-301 below 3 psig; SPD at zero. (PT-301 still reads the bank: HV-300 is still open.)',
      check: v => TP_PTS.every(id => v.ch(id) < R.VENTED) && v.ch('SPD') < 300,
      failMsg: 'Something is still pressurised, or the rotor is still turning.' },
    { gate: done, kind: 'action', station: 'PROP', title: 'Enter the cell; technician closes HV-300',
      text: 'FACILITY ▸ Enter cell, then Technician ▸ Close HV-300.',
      check: v => v.cmd('HV-300') === 0 && done(v) },
  ] };
}

export { bpRecordStep };
