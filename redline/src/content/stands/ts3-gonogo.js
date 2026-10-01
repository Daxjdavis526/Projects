/* Go/no-go stations for TS-3. Measured facts only, as each station would
   see them. A turbopump test adds a station's worth of rotating-machinery
   questions: is the rotor free, are both speed pickups alive, is there
   gas enough to drive it and water enough to load it. */

import { psi, fmt, degC, unitLabel } from '../../lib/units.js';
const PSIG = () => unitLabel('pressure', true);

const P = v => (Number.isFinite(v) ? `${fmt(v, 'pressure')} ${PSIG()}` : 'NO DATA');
const kg = v => (Number.isFinite(v) ? `${v.toFixed(1)} kg` : 'NO DATA');
const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;
const ind = (v, id) => (v.ch(id + '-ZSO') === 1 && v.ch(id + '-ZSC') === 0 ? 'OPEN' : v.ch(id + '-ZSC') === 1 && v.ch(id + '-ZSO') === 0 ? 'CLOSED' : 'NO INDICATION');
const hold = p => (p.mode === 'map' ? (p.ramp ?? 3) + (p.thrSteps?.length || 1) * (p.dwell ?? 4) : p.duration);

export default [
  { id: 'TC', name: 'Test Conductor', role: 'Owns the procedure and the final call',
    items: [
      { label: 'Run plan', eval: v => ({ value: v.planText, ok: hold(v.plan) > 0 && hold(v.plan) <= v.ratings.MAX_BURN }),
        why: 'Read back what the sequencer will do: what kind of run, what speed, what throttle, how long.' },
      { label: 'Tank setpoints vs test request', eval: v => {
          const r = v.request || {};
          const txt = `ox-side ${P(v.sp['PR-410'])}, fuel-side ${P(v.sp['PR-420'])}`;
          if (r.tankP == null) return { value: txt, ok: v.sp['PR-410'] > psi(5) && v.sp['PR-420'] > psi(5) };
          return { value: `${txt} / requested ${P(r.tankP)}`, ok: near(v.sp['PR-410'], r.tankP, psi(1)) && near(v.sp['PR-420'], r.tankP, psi(1)) };
        }, why: 'The tank pressure is the pumps\' suction pressure: it decides how close to cavitation they run.' },
      { label: 'Planned speed vs test request', eval: v => {
          const r = v.request || {}, p = v.plan;
          if ((p.ctl || 'speed') !== 'speed') return { value: 'pressure control (speed not planned)', ok: r.speed == null };
          // a series may plan more than one speed (a first spin goes up in steps)
          const ok = r.speeds ? r.speeds.some(x => Math.abs(p.speed - x) < 1) : !r.speed || Math.abs(p.speed - r.speed) < 1;
          const req = r.speeds ? r.speeds.map(x => Math.round(x)).join(' / ') : r.speed ? Math.round(r.speed) : null;
          return { value: `${Math.round(p.speed)} rpm${req ? ` / requested ${req}` : ''}`, ok };
        } },
      { label: 'Unacknowledged alarms', eval: v => ({ value: v.unackedAlarms ? `${v.unackedAlarms} unacknowledged` : 'none', ok: v.unackedAlarms === 0 }) },
      { label: 'Active alarms', eval: v => ({ value: v.activeAlarms.length ? v.activeAlarms.join(', ') : 'none', ok: v.activeAlarms.length === 0 }) },
    ] },
  { id: 'DAQ', name: 'DAQ', role: 'Instrumentation and data recording',
    items: [
      { label: 'DAQ status', eval: v => ({ value: v.daq.online ? 'ONLINE' : v.daq.powered ? 'BOOTING' : 'OFF', ok: v.daq.online }) },
      { label: 'Sample rate', eval: v => ({ value: `${v.daq.rate} Hz`, ok: v.daq.rate >= 1000 }),
        why: 'The speed redline acts in tens of milliseconds; a spin-up is over in a second or two.' },
      { label: 'Recording', eval: v => ({ value: v.daq.recording ? `RECORDING ${v.daq.runId}` : 'NOT RECORDING', ok: v.daq.recording }) },
      { label: 'Stale or dropped channels', eval: v => ({ value: v.staleChannels.length ? v.staleChannels.join(', ') : 'none', ok: v.staleChannels.length === 0 }) },
      { label: 'Speed pickups at rest', eval: v => ({ value: `SE-341 ${fmt(v.ch('SE-341'), 'speed')}, SE-342 ${fmt(v.ch('SE-342'), 'speed')} rpm`,
          ok: Math.abs(v.ch('SE-341')) < 100 && Math.abs(v.ch('SE-342')) < 100 }),
        why: 'Both must read zero now and agree later. The redline takes the higher; the speed controller the mean. A dead pickup is not visible until the shaft turns — which is why the rotor is turned by hand and both are watched on the way up.' },
      { label: 'Flowmeters at zero flow', eval: v => ({ value: `FT-416 ${fmt(v.ch('FT-416'), 'massflow')}, FT-426 ${fmt(v.ch('FT-426'), 'massflow')} ${unitLabel('massflow')}`,
          ok: Math.abs(v.ch('FT-416')) < 0.005 && Math.abs(v.ch('FT-426')) < 0.005 }) },
    ] },
  { id: 'PROP', name: 'Fluids', role: 'Tanks, suction and drive gas',
    items: [
      { label: 'Bottle bank PT-301', eval: v => ({ value: P(v.ch('PT-301')), ok: v.ch('PT-301') >= v.ratings.SUPPLY_MIN }),
        why: 'The turbine is the biggest gas user on the stand.' },
      { label: 'Ox-side tank PT-410 vs setpoint', eval: v => ({ value: `${P(v.ch('PT-410'))} (set ${P(v.sp['PR-410'])})`,
          ok: v.sp['PR-410'] > psi(5) && near(v.ch('PT-410'), v.sp['PR-410'], psi(6)) }) },
      { label: 'Fuel-side tank PT-420 vs setpoint', eval: v => ({ value: `${P(v.ch('PT-420'))} (set ${P(v.sp['PR-420'])})`,
          ok: v.sp['PR-420'] > psi(5) && near(v.ch('PT-420'), v.sp['PR-420'], psi(6)) }) },
      { label: 'Water on board (WT-411 / WT-421)', eval: v => {
          const p = v.prediction || {}, dur = hold(v.plan) + 2;
          const needO = (p.mdotOx > 0 ? 1.15 * p.mdotOx * dur : 0.5 * dur) + v.ratings.TANK_RESERVE;
          const needF = (p.mdotFu > 0 ? 1.15 * p.mdotFu * dur : 0.5 * dur) + v.ratings.TANK_RESERVE;
          return { value: `ox-side ${kg(v.ch('WT-411'))} (need ${needO.toFixed(1)}), fuel-side ${kg(v.ch('WT-421'))} (need ${needF.toFixed(1)})`,
            ok: v.ch('WT-411') > needO && v.ch('WT-421') > needF };
        }, why: 'A pump that runs out of water runs out of load, and the turbine runs away. Budget the flow, the coast-down and a reserve above the low-level redline.' },
      { label: 'Suction margin (predicted NPSH available / required)', eval: v => {
          const p = v.prediction || {};
          if (!(p.npshrOx > 0)) return { value: 'no prediction', ok: false };
          const mo = p.npshaOx / p.npshrOx, mf = p.npshaFu / p.npshrFu;
          return { value: `ox ${mo.toFixed(2)}, fuel ${mf.toFixed(2)}${v.plan.mode === 'suction' ? ' (at the start of the suction ramp)' : ''}`, ok: mo > 1.3 && mf > 1.3 };
        }, why: 'Below about 1.3 the inducers start to cavitate somewhere on the run.' },
      { label: 'Discharge lines (valves shut)', eval: v => ({ value: `PT-414 ${P(v.ch('PT-414'))}, PT-424 ${P(v.ch('PT-424'))}`,
          ok: v.ch('PT-414') < v.sp['PR-410'] + psi(10) && v.ch('PT-424') < v.sp['PR-420'] + psi(10) }),
        why: 'With the pumps stopped, discharge pressure is tank pressure. More means a pump is turning.' },
      { label: 'Tank and drive-line vents', eval: v => ({ value: `VV-413 ${v.cmd('VV-413') ? 'OPEN' : 'CLOSED'}, VV-423 ${v.cmd('VV-423') ? 'OPEN' : 'CLOSED'}, VV-338 ${v.cmd('VV-338') ? 'OPEN' : 'CLOSED'}`,
          ok: !v.cmd('VV-413') && !v.cmd('VV-423') && !v.cmd('VV-338') }) },
      { label: 'Leak check', eval: v => ({ value: v.leakCheck ? `${fmt(v.leakCheck.value, 'rate')} psi/min` : 'not performed', ok: !!v.leakCheck && v.leakCheck.ok }) },
    ] },
  { id: 'CTL', name: 'Controls', role: 'Valves, sequencer, speed control, fire circuit',
    items: [
      { label: 'Fire circuit', eval: v => ({ value: v.armed ? 'ARMED' : 'SAFE', ok: !v.armed }) },
      { label: 'Turbine start valve TSV-332', eval: v => ({ value: ind(v, 'TSV-332'), ok: ind(v, 'TSV-332') === 'CLOSED' }) },
      { label: 'Discharge valves', eval: v => ({ value: `DV-414 ${ind(v, 'DV-414')}, DV-424 ${ind(v, 'DV-424')}`,
          ok: ind(v, 'DV-414') === 'CLOSED' && ind(v, 'DV-424') === 'CLOSED' }) },
      { label: 'IV-301 indication', eval: v => ({ value: ind(v, 'IV-301'), ok: ind(v, 'IV-301') === 'OPEN' }) },
      { label: 'Drive pressure', eval: v => {
          const sc = (v.plan.ctl || 'speed') === 'speed';
          return { value: sc ? `SC-330 will drive PR-330 (now ${P(v.sp['PR-330'])}); feed-forward ${P(v.prediction?.Ptin)}` : `PR-330 set ${P(v.sp['PR-330'])}`,
            ok: sc ? v.sp['PR-330'] === 0 && v.prediction?.Ptin > 0 && v.prediction.Ptin < v.ratings.DRIVE_MAX : v.sp['PR-330'] > psi(20) };
        }, why: 'In speed control PR-330 must start from zero — the controller ramps it. In pressure control its setpoint is the run.' },
      { label: 'Abort sequence', eval: v => ({ value: v.abortActive ? 'ABORT NOT RESET' : 'loaded, reset', ok: !v.abortActive }) },
      { label: 'EPC feedback', eval: v => {
          const bad = ['410', '420', '330'].filter(n => !near(v.ch('EPC-' + n), v.sp['PR-' + n], psi(4)));
          return { value: bad.length ? `EPC-${bad.join(', EPC-')} not at command` : 'all three at command', ok: !bad.length };
        } },
    ] },
  { id: 'TPA', name: 'Turbomachinery', role: 'The rotor itself',
    items: [
      { label: 'Rotor turned by hand today', eval: v => ({ value: v.inspected.has('turn-rotor') ? 'done — see the log' : 'NOT DONE', ok: v.inspected.has('turn-rotor') }),
        why: 'A seized, rubbing or gritty rotor is found with a torque wrench in the cell — not with 10 kW of nitrogen behind it.' },
      { label: 'Bearing temperatures', eval: v => ({ value: `TC-343 ${fmt(v.ch('TC-343'), 'temperature')}, TC-344 ${fmt(v.ch('TC-344'), 'temperature')} ${unitLabel('temperature')}`,
          ok: v.ch('TC-343') < degC(45) && v.ch('TC-344') < degC(45) }),
        why: 'Start a run with hot bearings and the bearing redline arrives early.' },
      { label: 'Vibration at rest', eval: v => ({ value: `VIB-345 ${fmt(v.ch('VIB-345'), 'accel')} g`, ok: v.ch('VIB-345') < 0.5 }) },
      { label: 'Pump casings', eval: v => ({ value: `TT-415 ${fmt(v.ch('TT-415'), 'temperature')}, TT-425 ${fmt(v.ch('TT-425'), 'temperature')} ${unitLabel('temperature')}`,
          ok: v.ch('TT-415') < degC(35) && v.ch('TT-425') < degC(35) }),
        why: 'Warm casings mean the last run heated the water in them — closer to boiling at the inducer.' },
    ] },
  { id: 'SAF', name: 'Safety', role: 'People and hazards',
    items: [
      { label: 'Test cell', eval: v => ({ value: `${v.facility.area}, headcount ${v.facility.personnel}`, ok: v.facility.area === 'SECURED' && v.facility.personnel === 0 }) },
      { label: 'Door interlock', eval: v => ({ value: v.facility.door, ok: v.facility.door === 'LOCKED' }) },
      { label: 'Warning announcement', eval: v => ({ value: v.paMade ? 'made' : 'not made', ok: v.paMade }) },
      { label: 'Turbine exhaust and catch tank', eval: () => ({ value: 'exhaust duct to stack, catch tank drain open', ok: true }) },
      { label: 'Safety violations this session', eval: v => ({ value: v.safetyViolations ? `${v.safetyViolations} logged` : 'none', ok: v.safetyViolations === 0 }) },
    ] },
];
