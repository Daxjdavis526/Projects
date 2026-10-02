/* Go/no-go stations for TS-3G. Measured facts only. A gas-generator engine
   adds questions of its own: is there start gas enough, and set where the
   plan says; are both igniters alive; is the turbine manifold purged; is
   the ablative chamber cool enough to fire again. */

import { psi, fmt, degC, unitLabel } from '../../lib/units.js';
const PSIG = () => unitLabel('pressure', true);

const P = v => (Number.isFinite(v) ? `${fmt(v, 'pressure')} ${PSIG()}` : 'NO DATA');
const kg = v => (Number.isFinite(v) ? `${v.toFixed(1)} kg` : 'NO DATA');
const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;
const ind = (v, id) => (v.ch(id + '-ZSO') === 1 && v.ch(id + '-ZSC') === 0 ? 'OPEN' : v.ch(id + '-ZSC') === 1 && v.ch(id + '-ZSO') === 0 ? 'CLOSED' : 'NO INDICATION');
const hot = v => v.loaded === 'propellants';

export default [
  { id: 'TC', name: 'Test Conductor', role: 'Owns the procedure and the final call',
    items: [
      { label: 'Run plan', eval: v => ({ value: v.planText, ok: v.session.def.holdTime(v.plan) > 0 && v.session.def.holdTime(v.plan) <= v.ratings.MAX_BURN && (v.plan.mode === 'cold') === !hot(v) }),
        why: 'Read back what the sequencer will do. A hot-fire plan with water in the tanks — or a cold-flow plan with propellants — is a NO-GO.' },
      { label: 'Tank setpoints vs test request', eval: v => {
          const r = v.request || {};
          const txt = `ox ${P(v.sp['PR-410'])}, fuel ${P(v.sp['PR-420'])}`;
          if (r.tankP == null) return { value: txt, ok: v.sp['PR-410'] > psi(5) && v.sp['PR-420'] > psi(5) };
          return { value: `${txt} / requested ${P(r.tankP)}`, ok: near(v.sp['PR-410'], r.tankP, psi(1)) && near(v.sp['PR-420'], r.tankP, psi(1)) };
        } },
      { label: 'Prediction', eval: v => {
          const p = v.prediction || {};
          if (p.kind === 'gg') return { value: `${Math.round(p.rpm)} rpm, Pc ${P(p.Pc - 101325)}, MR ${p.MR.toFixed(2)}, TIT ${Math.round(p.TIT)} K, ${Math.round(p.F)} N`, ok: p.TIT < v.ratings.TIT_REDLINE - 100 && p.rpm < 1.05 * v.ratings.N_DESIGN };
          if (p.kind === 'ggcold') return { value: `${Math.round(p.rpm)} rpm, ox ${p.mdotOx.toFixed(2)} / fuel ${p.mdotFu.toFixed(2)} kg/s`, ok: p.rpm < 1.05 * v.ratings.N_DESIGN };
          return { value: 'none', ok: false };
        }, why: 'The steady point the plan should reach — and its margins to the turbine-inlet and speed redlines.' },
      { label: 'Unacknowledged alarms', eval: v => ({ value: v.unackedAlarms ? `${v.unackedAlarms} unacknowledged` : 'none', ok: v.unackedAlarms === 0 }) },
      { label: 'Active alarms', eval: v => ({ value: v.activeAlarms.length ? v.activeAlarms.join(', ') : 'none', ok: v.activeAlarms.length === 0 }) },
    ] },
  { id: 'DAQ', name: 'DAQ', role: 'Instrumentation and data recording',
    items: [
      { label: 'DAQ status', eval: v => ({ value: v.daq.online ? 'ONLINE' : v.daq.powered ? 'BOOTING' : 'OFF', ok: v.daq.online }) },
      { label: 'Sample rate', eval: v => ({ value: `${v.daq.rate} Hz`, ok: v.daq.rate >= 2000 }),
        why: 'A start is over in a second and a hard start in milliseconds.' },
      { label: 'Recording', eval: v => ({ value: v.daq.recording ? `RECORDING ${v.daq.runId}` : 'NOT RECORDING', ok: v.daq.recording }) },
      { label: 'Stale or dropped channels', eval: v => ({ value: v.staleChannels.length ? v.staleChannels.join(', ') : 'none', ok: v.staleChannels.length === 0 }) },
      { label: 'Speed pickups at rest', eval: v => ({ value: `SE-341 ${fmt(v.ch('SE-341'), 'speed')}, SE-342 ${fmt(v.ch('SE-342'), 'speed')} rpm`,
          ok: Math.abs(v.ch('SE-341')) < 100 && Math.abs(v.ch('SE-342')) < 100 }) },
      { label: 'Flowmeter calibration fluid', eval: v => {
          const want = hot(v) ? ['OX-1', 'FU-1'] : ['water', 'water'];
          const got = [v.meterFluid?.ox, v.meterFluid?.fu];
          return { value: `FT-416 ${got[0]}, FT-426 ${got[1]}`, ok: got[0] === want[0] && got[1] === want[1] };
        }, why: 'A turbine meter measures volume; the DAQ converts with the density it was told.' },
      { label: 'Thrust load cell', eval: v => ({ value: `LC-501 ${fmt(v.ch('LC-501'), 'force')} ${unitLabel('force')}`, ok: Math.abs(v.ch('LC-501')) < 20 }), why: 'Tared, near zero.' },
    ] },
  { id: 'PROP', name: 'Fluids', role: 'Tanks, start gas, purge',
    items: [
      { label: 'Bottle bank PT-301', eval: v => ({ value: P(v.ch('PT-301')), ok: v.ch('PT-301') >= v.ratings.SUPPLY_MIN }) },
      { label: 'Tanks PT-410 / PT-420 vs setpoint', eval: v => ({ value: `${P(v.ch('PT-410'))} / ${P(v.ch('PT-420'))} (set ${P(v.sp['PR-410'])} / ${P(v.sp['PR-420'])})`,
          ok: v.sp['PR-410'] > psi(5) && near(v.ch('PT-410'), v.sp['PR-410'], psi(6)) && v.sp['PR-420'] > psi(5) && near(v.ch('PT-420'), v.sp['PR-420'], psi(6)) }) },
      { label: 'Propellant on board (WT-411 / WT-421)', eval: v => {
          const p = v.prediction || {}, dur = v.session.def.holdTime(v.plan) + 3;
          const mo = (p.mdotOx || 0.5) + (p.mdotGGox || 0), mf = (p.mdotFu || 0.4) + (p.mdotGGfu || 0);
          const needO = 1.1 * mo * dur + v.ratings.TANK_RESERVE, needF = 1.1 * mf * dur + v.ratings.TANK_RESERVE;
          return { value: `ox ${kg(v.ch('WT-411'))} (need ${needO.toFixed(1)}), fuel ${kg(v.ch('WT-421'))} (need ${needF.toFixed(1)})`,
            ok: v.ch('WT-411') > needO && v.ch('WT-421') > needF };
        }, why: 'Run a pump dry at speed and the turbine runs away. The gas generator drinks from the same tanks.' },
      { label: 'Suction pressure for the pumps', eval: v => ({ value: `${P(v.sp['PR-410'])} / ${P(v.sp['PR-420'])}`, ok: v.sp['PR-410'] >= v.ratings.NPSH_MIN_TANK && v.sp['PR-420'] >= v.ratings.NPSH_MIN_TANK }),
        why: 'Below about 35 psig the inducers start to cavitate at design speed — and a cavitating pump on a running engine unloads the turbine.' },
      { label: 'Purge PT-630', eval: v => ({ value: P(v.ch('PT-630')), ok: v.ch('PT-630') >= v.ratings.PURGE_MIN && v.ch('PT-630') <= v.ratings.PURGE_MAX }),
        why: 'The purges clear both injector manifolds and the turbine manifold before and after the run.' },
      { label: 'Start gas plan', eval: v => ({ value: `${P(v.plan.startP ?? 0)} on PR-330 (applied by the sequencer at T-3)`, ok: v.plan.startP >= psi(120) && v.plan.startP <= v.ratings.START_MAX && v.sp['PR-330'] === 0 }),
        why: 'The start gas spins the pumps up to where the gas generator can take over. The sequencer owns PR-330 from T-3: it must start from zero.' },
      { label: 'Vents', eval: v => ({ value: `VV-413 ${v.cmd('VV-413') ? 'OPEN' : 'CLOSED'}, VV-423 ${v.cmd('VV-423') ? 'OPEN' : 'CLOSED'}, VV-338 ${v.cmd('VV-338') ? 'OPEN' : 'CLOSED'}`,
          ok: !v.cmd('VV-413') && !v.cmd('VV-423') && !v.cmd('VV-338') }) },
      { label: 'Leak check', eval: v => ({ value: v.leakCheck ? `${fmt(v.leakCheck.value, 'rate')} psi/min` : 'not performed', ok: !!v.leakCheck && v.leakCheck.ok }) },
    ] },
  { id: 'CTL', name: 'Controls', role: 'Valves, sequencer, fire circuit',
    items: [
      { label: 'Fire circuit', eval: v => ({ value: v.armed ? 'ARMED' : 'SAFE', ok: !v.armed }) },
      { label: 'Main valves', eval: v => ({ value: `MOV-414 ${ind(v, 'MOV-414')}, MFV-424 ${ind(v, 'MFV-424')}`, ok: ind(v, 'MOV-414') === 'CLOSED' && ind(v, 'MFV-424') === 'CLOSED' }) },
      { label: 'Gas generator valves', eval: v => ({ value: `GOV-416 ${ind(v, 'GOV-416')}, GFV-426 ${ind(v, 'GFV-426')}`, ok: ind(v, 'GOV-416') === 'CLOSED' && ind(v, 'GFV-426') === 'CLOSED' }) },
      { label: 'Turbine start valve TSV-332', eval: v => ({ value: ind(v, 'TSV-332'), ok: ind(v, 'TSV-332') === 'CLOSED' }) },
      { label: 'IV-301 indication', eval: v => ({ value: ind(v, 'IV-301'), ok: ind(v, 'IV-301') === 'OPEN' }) },
      { label: 'GG throttles', eval: v => ({ value: `ZT-417 ${pct(v.ch('ZT-417'))}, ZT-427 ${pct(v.ch('ZT-427'))}`, ok: Number.isFinite(v.ch('ZT-417')) && Number.isFinite(v.ch('ZT-427')) }) },
      { label: 'Abort sequence', eval: v => ({ value: v.abortActive ? 'ABORT NOT RESET' : 'loaded, reset', ok: !v.abortActive }) },
    ] },
  { id: 'TPA', name: 'Turbomachinery', role: 'The rotor',
    items: [
      { label: 'Rotor turned by hand today', eval: v => ({ value: v.inspected.has('turn-rotor') ? 'done — see the log' : 'NOT DONE', ok: v.inspected.has('turn-rotor') }) },
      { label: 'Bearing temperatures', eval: v => ({ value: `TC-343 ${fmt(v.ch('TC-343'), 'temperature')}, TC-344 ${fmt(v.ch('TC-344'), 'temperature')} ${unitLabel('temperature')}`,
          ok: v.ch('TC-343') < degC(45) && v.ch('TC-344') < degC(50) }) },
      { label: 'Vibration at rest', eval: v => ({ value: `VIB-345 ${fmt(v.ch('VIB-345'), 'accel')} g`, ok: v.ch('VIB-345') < 0.5 }) },
      { label: 'Turbine manifold', eval: v => ({ value: `PT-333 ${P(v.ch('PT-333'))}, TT-334 ${fmt(v.ch('TT-334'), 'temperature')} ${unitLabel('temperature')}`, ok: v.ch('PT-333') < psi(5) && v.ch('TT-334') < degC(80) }),
        why: 'Cold and at ambient: no gas left in it from the last run.' },
    ] },
  { id: 'ENG', name: 'Engine', role: 'The test article',
    items: [
      { label: 'Igniters', eval: v => ({ value: hot(v) ? `spark check ${v.sparkChecked ? 'done (both)' : 'NOT DONE'}; exciters ${v.ch('IGN-I') > 0.5 || v.ch('IGG-I') > 0.5 ? 'ON' : 'off'}` : 'n/a (cold flow)',
          ok: !hot(v) || (v.sparkChecked && v.ch('IGN-I') < 0.5 && v.ch('IGG-I') < 0.5) }),
        why: 'Two igniters, two ways to start without a flame: the main chamber fills, or the turbine gets raw propellant.' },
      { label: 'Chamber case TC-503', eval: v => ({ value: `${fmt(v.ch('TC-503'), 'temperature')} ${unitLabel('temperature')}`, ok: v.ch('TC-503') < v.ratings.CASE_REFIRE }),
        why: 'An ablative chamber soaks back for many minutes after a burn. Fire it hot and the case reaches its redline early.' },
      { label: 'Main chamber', eval: v => ({ value: `PT-501 ${P(v.ch('PT-501'))}, OD-504 ${fmt(v.ch('OD-504'), 'voltage')} V`, ok: v.ch('PT-501') < psi(5) && v.ch('OD-504') < 0.3 }) },
    ] },
  { id: 'SAF', name: 'Safety', role: 'People and hazards',
    items: [
      { label: 'Test cell', eval: v => ({ value: `${v.facility.area}, headcount ${v.facility.personnel}`, ok: v.facility.area === 'SECURED' && v.facility.personnel === 0 }) },
      { label: 'Door interlock', eval: v => ({ value: v.facility.door, ok: v.facility.door === 'LOCKED' }) },
      { label: 'Warning announcement', eval: v => ({ value: v.paMade ? 'made' : 'not made', ok: v.paMade }) },
      { label: 'Propellant hazard', eval: v => ({ value: hot(v) ? 'OX-1 and FU-1 on board' : v.loaded === 'water' ? 'water only' : 'tanks empty', ok: true }) },
      { label: 'Safety violations this session', eval: v => ({ value: v.safetyViolations ? `${v.safetyViolations} logged` : 'none', ok: v.safetyViolations === 0 }) },
    ] },
];
function pct(x) { return Number.isFinite(x) ? `${Math.round(x * 100)} %` : 'NO DATA'; }
