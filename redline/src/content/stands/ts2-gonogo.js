/* Go/no-go stations for TS-2. Measured facts only, as each station would
   see them. A two-propellant stand has twice the fluid state to confirm,
   and two things the cold-gas stand did not have at all: purge, and how
   much liquid is in each tank. */

import { psi, fmt, degC } from '../../lib/units.js';

const P = v => (Number.isFinite(v) ? `${fmt(v, 'pressure')} psig` : 'NO DATA');
const kg = v => (Number.isFinite(v) ? `${v.toFixed(2)} kg` : 'NO DATA');
const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;
const ind = (v, id) => (v.ch(id + '-ZSO') === 1 && v.ch(id + '-ZSC') === 0 ? 'OPEN' : v.ch(id + '-ZSC') === 1 && v.ch(id + '-ZSO') === 0 ? 'CLOSED' : 'NO INDICATION');
const flowsOx = v => v.plan.sides !== 'fuel';
const flowsFu = v => v.plan.sides !== 'ox';
const hot = v => v.plan.mode === 'hot';
const LOAD = { propellants: ['OX-1', 'FU-1'], water: ['water', 'water'] };

export default [
  { id: 'TC', name: 'Test Conductor', role: 'Owns the procedure and the final call',
    items: [
      { label: 'Flow plan', eval: v => ({ value: v.planText, ok: v.plan.duration > 0 && v.plan.duration <= v.ratings.MAX_BURN }),
        why: 'Read back what the sequencer will do: which sides, how long, which valve leads, how long the post-purge runs.' },
      { label: 'Tank setpoints vs test request', eval: v => {
          const r = v.request || {};
          const want = [flowsOx(v) && r.oxP != null ? ['PR-610', r.oxP] : null, flowsFu(v) && r.fuP != null ? ['PR-620', r.fuP] : null].filter(Boolean);
          const rg = r.range;
          const txt = `ox ${P(v.sp['PR-610'])}, fuel ${P(v.sp['PR-620'])}`;
          if (rg) return { value: `${txt} / approved ${fmt(rg[0], 'pressure', 0)}–${fmt(rg[1], 'pressure', 0)} psig`,
            ok: (!flowsOx(v) || (v.sp['PR-610'] >= rg[0] - psi(1) && v.sp['PR-610'] <= rg[1] + psi(1))) && (!flowsFu(v) || (v.sp['PR-620'] >= rg[0] - psi(1) && v.sp['PR-620'] <= rg[1] + psi(1))) };
          return { value: want.length ? `${txt} / requested ${want.map(([, p]) => P(p)).join(', ')}` : txt,
            ok: want.every(([id, p]) => near(v.sp[id], p, psi(1))) };
        }, why: 'Flowing at the wrong tank pressure wastes the run — and the water.' },
      { label: 'Run type vs what is in the tanks', eval: v => ({ value: `${hot(v) ? 'HOT FIRE' : 'COLD FLOW'} plan / tanks: ${v.loaded || 'empty'}`,
          ok: hot(v) ? v.loaded === 'propellants' : v.loaded === 'water' }),
        why: 'A cold-flow plan with propellants loaded sprays them unlit into the cell; a hot plan with water aborts at the ignition check.' },
      { label: 'Burn duration vs heat-sink limit', eval: v => ({ value: hot(v) ? `${v.plan.duration.toFixed(1)} s planned / ${v.session.def.design.burnLimit} s limit` : 'n/a (cold flow)',
          ok: !hot(v) || v.plan.duration <= v.session.def.design.burnLimit }),
        why: 'The copper chamber is a heat sink: the burn ends before the throat gets too hot, or the redline ends it for you.' },
      { label: 'Unacknowledged alarms', eval: v => ({ value: v.unackedAlarms ? `${v.unackedAlarms} unacknowledged` : 'none', ok: v.unackedAlarms === 0 }) },
      { label: 'Active alarms', eval: v => ({ value: v.activeAlarms.length ? v.activeAlarms.join(', ') : 'none', ok: v.activeAlarms.length === 0 }) },
    ] },
  { id: 'DAQ', name: 'DAQ', role: 'Instrumentation and data recording',
    items: [
      { label: 'DAQ status', eval: v => ({ value: v.daq.online ? 'ONLINE' : v.daq.powered ? 'BOOTING' : 'OFF', ok: v.daq.online }) },
      { label: 'Sample rate', eval: v => ({ value: `${v.daq.rate} Hz`, ok: v.daq.rate >= 500 }),
        why: 'Priming and the shutdown surge last tens of milliseconds.' },
      { label: 'Recording', eval: v => ({ value: v.daq.recording ? `RECORDING ${v.daq.runId}` : 'NOT RECORDING', ok: v.daq.recording }) },
      { label: 'Stale or dropped channels', eval: v => ({ value: v.staleChannels.length ? v.staleChannels.join(', ') : 'none', ok: v.staleChannels.length === 0 }) },
      { label: 'Flowmeters at zero flow', eval: v => ({ value: `FT-714 ${fmt(v.ch('FT-714'), 'massflow')}, FT-724 ${fmt(v.ch('FT-724'), 'massflow')} g/s`,
          ok: Math.abs(v.ch('FT-714')) < 0.003 && Math.abs(v.ch('FT-724')) < 0.003 }),
        why: 'No flow should read no flow. A meter that reads flow with the valves shut is either leaking past a valve or lying.' },
      { label: 'Flowmeter calibration fluid', eval: v => {
          const want = LOAD[v.loaded] || ['water', 'water'], mf = v.meterFluid || {};
          return { value: `FT-714 ${mf.ox || '?'}, FT-724 ${mf.fu || '?'} / tanks hold ${want[0] === 'water' ? 'water' : `${want[0]}, ${want[1]}`}`, ok: mf.ox === want[0] && mf.fu === want[1] };
        }, why: 'A turbine meter measures volume; the DAQ makes it mass with the density you set. Set for water, it reads OX-1 low and FU-1 high — and every mixture ratio and c* after it.' },
    ] },
  { id: 'PROP', name: 'Propulsion', role: 'Fluid system state',
    items: [
      { label: 'Pressurant supply PT-601', eval: v => ({ value: P(v.ch('PT-601')), ok: v.ch('PT-601') >= v.ratings.SUPPLY_MIN }) },
      { label: 'Ox tank PT-710 vs setpoint', eval: v => ({ value: `${P(v.ch('PT-710'))} (set ${P(v.sp['PR-610'])})`,
          ok: !flowsOx(v) || (v.sp['PR-610'] > psi(5) && near(v.ch('PT-710'), v.sp['PR-610'], psi(10))) }),
        why: 'Locked up at, or a little above, the setpoint, and steady.' },
      { label: 'Fuel tank PT-720 vs setpoint', eval: v => ({ value: `${P(v.ch('PT-720'))} (set ${P(v.sp['PR-620'])})`,
          ok: !flowsFu(v) || (v.sp['PR-620'] > psi(5) && near(v.ch('PT-720'), v.sp['PR-620'], psi(10))) }) },
      { label: 'Liquid on board (WT-716 / WT-726)', eval: v => {
          const need = 0.25 * v.plan.duration + v.ratings.TANK_RESERVE;
          return { value: `ox ${kg(v.ch('WT-716'))}, fuel ${kg(v.ch('WT-726'))} (need > ${need.toFixed(1)} kg each side flowed)`,
            ok: (!flowsOx(v) || v.ch('WT-716') > need) && (!flowsFu(v) || v.ch('WT-726') > need) };
        }, why: 'Run a tank dry and the line ingests pressurant: the flow collapses and the data from the end of the run is garbage. Budget the flow plus a reserve.' },
      { label: 'Purge pressure PT-630', eval: v => ({ value: P(v.ch('PT-630')),
          ok: v.ch('PT-630') >= v.ratings.PURGE_MIN && v.ch('PT-630') <= v.ratings.PURGE_MAX }),
        why: 'Purge must be available BEFORE a flow: it is what clears the manifolds afterwards and what the abort sequence relies on.' },
      { label: 'Manifolds (valves shut)', eval: v => ({ value: `PT-715 ${P(v.ch('PT-715'))}, PT-725 ${P(v.ch('PT-725'))}`,
          ok: v.ch('PT-715') < psi(15) && v.ch('PT-725') < psi(15) }),
        why: 'Pressure behind a shut main valve means it is leaking through — or a purge is still on.' },
      { label: 'Tank vents', eval: v => ({ value: `VV-711 ${v.cmd('VV-711') ? 'OPEN' : 'CLOSED'}, VV-721 ${v.cmd('VV-721') ? 'OPEN' : 'CLOSED'}`,
          ok: !v.cmd('VV-711') && !v.cmd('VV-721') }) },
      { label: 'Leak check', eval: v => ({ value: v.leakCheck ? `${fmt(v.leakCheck.value, 'rate')} psi/min` : 'not performed', ok: !!v.leakCheck && v.leakCheck.ok }) },
    ] },
  { id: 'CTL', name: 'Controls', role: 'Valves, sequencer, fire circuit',
    items: [
      { label: 'Fire circuit', eval: v => ({ value: v.armed ? 'ARMED' : 'SAFE', ok: !v.armed }) },
      { label: 'Main valves', eval: v => ({ value: `MOV-713 ${ind(v, 'MOV-713')}, MFV-723 ${ind(v, 'MFV-723')}`,
          ok: ind(v, 'MOV-713') === 'CLOSED' && ind(v, 'MFV-723') === 'CLOSED' }) },
      { label: 'IV-601 indication', eval: v => ({ value: ind(v, 'IV-601'), ok: ind(v, 'IV-601') === 'OPEN' }) },
      { label: 'Purge valves', eval: v => ({ value: `PV-631 ${v.cmd('PV-631') ? 'OPEN' : 'CLOSED'}, PV-632 ${v.cmd('PV-632') ? 'OPEN' : 'CLOSED'}`,
          ok: !v.cmd('PV-631') && !v.cmd('PV-632') }),
        why: 'The sequencer owns the purges during a run. Left open by hand, they are flowing gas into the manifold the liquid is about to fill.' },
      { label: 'Igniter', eval: v => ({ value: hot(v) ? `spark check ${v.sparkChecked ? 'done' : 'NOT DONE'}; exciter ${v.ch('IGN-I') > 0.5 ? 'ON' : 'off'}` : 'n/a (cold flow)',
          ok: !hot(v) || (v.sparkChecked && v.ch('IGN-I') < 0.5) }),
        why: 'An igniter that does not spark lights nothing — or lights late, after the chamber has filled. Someone must have SEEN it spark.' },
      { label: 'Abort sequence', eval: v => ({ value: v.abortActive ? 'ABORT NOT RESET' : 'loaded, reset', ok: !v.abortActive }) },
      { label: 'EPC feedback', eval: v => {
          const bad = ['610', '620', '630'].filter(n => !near(v.ch('EPC-' + n), v.sp['PR-' + n], psi(4)));
          return { value: bad.length ? `EPC-${bad.join(', EPC-')} not at command` : 'all three at command', ok: !bad.length };
        } },
    ] },
  { id: 'FAC', name: 'Facility', role: 'Gas, power, drains, catch area',
    items: [
      { label: 'Facility power', eval: () => ({ value: 'normal (UPS on line)', ok: true }) },
      { label: 'Catch area and drains', eval: () => ({ value: 'catch pan in place, drain open', ok: true }) },
      { label: 'Engine throat TC-803', eval: v => ({ value: `${fmt(v.ch('TC-803'), 'temperature')} °C`, ok: !hot(v) || v.ch('TC-803') < v.ratings.WALL_REFIRE }),
        why: 'A heat-sink chamber starts each burn from where the last left it. Fire it warm and the throat redline comes early.' },
      { label: 'Technician', eval: v => ({ value: v.techBusy ? 'task in progress' : 'out of cell, in control room', ok: !v.techBusy }) },
    ] },
  { id: 'SAF', name: 'Safety', role: 'People and hazards',
    items: [
      { label: 'Test cell', eval: v => ({ value: `${v.facility.area}, headcount ${v.facility.personnel}`, ok: v.facility.area === 'SECURED' && v.facility.personnel === 0 }) },
      { label: 'Door interlock', eval: v => ({ value: v.facility.door, ok: v.facility.door === 'LOCKED' }) },
      { label: 'Warning announcement', eval: v => ({ value: v.paMade ? 'made' : 'not made', ok: v.paMade }) },
      { label: 'Safety violations this session', eval: v => ({ value: v.safetyViolations ? `${v.safetyViolations} logged` : 'none', ok: v.safetyViolations === 0 }) },
    ] },
];
