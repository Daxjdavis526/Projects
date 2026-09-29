/* Go/no-go stations for TS-1. Each item reports a fact from the stand as the
   station would see it — measured values and states, never the physics —
   and whether that fact is acceptable for the planned firing. */

import { psi, fmt } from '../../lib/units.js';

const P = v => (Number.isFinite(v) ? `${fmt(v, 'pressure')} psig` : 'NO DATA');

export default [
  { id: 'TC', name: 'Test Conductor', role: 'Owns the procedure and the final call',
    items: [
      { label: 'Firing plan', eval: v => ({ value: v.planText, ok: v.plan.mode === 'pulse' || (v.plan.duration > 0 && v.plan.duration <= v.ratings.MAX_BURN) }),
        why: 'The sequencer will do exactly what is loaded. Read it back.' },
      { label: 'Regulator setpoint vs test request', eval: v => {
          const pts = v.request?.matrix ? v.request.matrix : v.request ? [v.request.regSet] : null;
          return {
            value: !pts ? `${P(v.regSet)} commanded` : `${P(v.regSet)} commanded / ${pts.length > 1 ? 'matrix ' + pts.map(x => fmt(x, 'pressure', 0)).join(', ') + ' psig' : P(pts[0]) + ' requested'}`,
            ok: !pts || pts.some(x => Math.abs(v.regSet - x) < psi(1)) };
        },
        why: 'Testing at the wrong condition wastes a run and, at worst, exceeds a limit.' },
      { label: 'Unacknowledged alarms', eval: v => ({ value: v.unackedAlarms ? `${v.unackedAlarms} unacknowledged` : 'none', ok: v.unackedAlarms === 0 }),
        why: 'Every alarm must be understood before arming, not just silenced.' },
      { label: 'Active alarms', eval: v => ({ value: v.activeAlarms.length ? v.activeAlarms.join(', ') : 'none', ok: v.activeAlarms.length === 0 }) },
    ] },
  { id: 'DAQ', name: 'DAQ', role: 'Instrumentation and data recording',
    items: [
      { label: 'DAQ status', eval: v => ({ value: v.daq.online ? 'ONLINE' : v.daq.powered ? 'BOOTING' : 'OFF', ok: v.daq.online }) },
      { label: 'Sample rate', eval: v => ({ value: `${v.daq.rate} Hz`, ok: v.daq.rate >= 500 }),
        why: 'Valve and chamber-pressure transients last a few milliseconds; 500 Hz is the floor for seeing them at all.' },
      { label: 'Recording', eval: v => ({ value: v.daq.recording ? `RECORDING ${v.daq.runId}` : 'NOT RECORDING', ok: v.daq.recording }),
        why: 'No recording, no data.' },
      { label: 'Stale or dropped channels', eval: v => ({ value: v.staleChannels.length ? v.staleChannels.join(', ') : 'none', ok: v.staleChannels.length === 0 }) },
      { label: 'LC-501 pre-fire reading', eval: v => { const f = v.ch('LC-501'); return { value: Number.isFinite(f) ? `${f.toFixed(3)} N` : 'NO DATA', ok: Math.abs(f) < 0.05 }; },
        why: 'With the system pressurised and the fire valve shut, the thrust channel should read zero. If it does not, re-tare now — every thrust number afterwards sits on this baseline.' },
    ] },
  { id: 'PROP', name: 'Propulsion', role: 'Fluid system state',
    items: [
      { label: 'Supply PT-101', eval: v => ({ value: P(v.ch('PT-101')), ok: v.ch('PT-101') >= v.ratings.SUPPLY_MIN }),
        why: 'Below ~800 psig the regulator starts to lose authority during a long burn.' },
      { label: 'Regulator outlet PT-201 vs setpoint', eval: v => ({ value: `${P(v.ch('PT-201'))} (set ${P(v.regSet)})`,
          ok: v.regSet > psi(5) && Math.abs(v.ch('PT-201') - v.regSet) < psi(6) }),
        why: 'Locked up at, or a little above, the setpoint with no flow.' },
      { label: 'PT-201 / PT-301 static agreement', eval: v => { const d = v.ch('PT-201') - v.ch('PT-301');
          return { value: `Δ ${fmt(d, 'pressure', 2)} psi`, ok: Math.abs(d) < psi(2) }; },
        why: 'With no flow there is no pressure drop, so two transducers on the same pressure must agree. If they do not, one of them is wrong.' },
      { label: 'Chamber PT-401 (fire valve shut)', eval: v => ({ value: P(v.ch('PT-401')), ok: Math.abs(v.ch('PT-401')) < psi(2) }),
        why: 'Pressure behind a closed fire valve means it is leaking through.' },
      { label: 'Vent valves', eval: v => ({ value: `VV-101 ${v.cmd('VV-101') ? 'OPEN' : 'CLOSED'}, VV-201 ${v.cmd('VV-201') ? 'OPEN' : 'CLOSED'}`,
          ok: !v.cmd('VV-101') && !v.cmd('VV-201') }) },
      { label: 'IV-101 indication', eval: v => ({ value: v.ch('IV-101-ZSO') === 1 ? 'OPEN' : v.ch('IV-101-ZSC') === 1 ? 'CLOSED' : 'NO INDICATION',
          ok: v.ch('IV-101-ZSO') === 1 && v.ch('IV-101-ZSC') === 0 }) },
      { label: 'Leak check', eval: v => ({ value: v.leakCheck ? `${fmt(v.leakCheck.value, 'rate')} psi/min` : 'not performed',
          ok: !!v.leakCheck && v.leakCheck.ok }) },
    ] },
  { id: 'CTL', name: 'Controls', role: 'Valves, sequencer, fire circuit',
    items: [
      { label: 'Fire circuit', eval: v => ({ value: v.armed ? 'ARMED' : 'SAFE', ok: !v.armed }),
        why: 'The fire circuit is armed only after the poll.' },
      { label: 'SV-301 coil current', eval: v => ({ value: `${(v.ch('SV-301-I') || 0).toFixed(3)} A`, ok: Math.abs(v.ch('SV-301-I')) < 0.05 }) },
      { label: 'Sequence loaded', eval: v => ({ value: v.planText, ok: true }) },
      { label: 'Abort sequence', eval: v => ({ value: v.abortActive ? 'ABORT NOT RESET' : 'loaded, reset', ok: !v.abortActive }) },
      { label: 'EPC-101 dome feedback', eval: v => ({ value: `${P(v.ch('EPC-101'))} (cmd ${P(v.regSet)})`, ok: Math.abs(v.ch('EPC-101') - v.regSet) < psi(3) }) },
    ] },
  { id: 'FAC', name: 'Facility', role: 'Gas, power, vent stack, exhaust path',
    items: [
      { label: 'Facility power', eval: () => ({ value: 'normal (UPS on line)', ok: true }) },
      { label: 'Vent stack', eval: () => ({ value: 'clear, exhaust fan running', ok: true }) },
      { label: 'Exhaust area', eval: () => ({ value: 'clear (camera)', ok: true }) },
      { label: 'Technician', eval: v => ({ value: v.techBusy ? 'task in progress' : 'out of cell, in control room', ok: !v.techBusy }) },
    ] },
  { id: 'SAF', name: 'Safety', role: 'People and hazards',
    items: [
      { label: 'Test cell', eval: v => ({ value: `${v.facility.area}, headcount ${v.facility.personnel}`, ok: v.facility.area === 'SECURED' && v.facility.personnel === 0 }) },
      { label: 'Door interlock', eval: v => ({ value: v.facility.door, ok: v.facility.door === 'LOCKED' }) },
      { label: 'Warning announcement', eval: v => ({ value: v.paMade ? 'made' : 'not made', ok: v.paMade }),
        why: 'Everyone within earshot is told before a firing. A thruster is loud and sudden.' },
      { label: 'Safety violations this session', eval: v => ({ value: v.safetyViolations ? `${v.safetyViolations} logged` : 'none', ok: v.safetyViolations === 0 }),
        why: 'Unresolved violations are reviewed before continuing.' },
    ] },
];
