/* TS-3's own interlocks. The generic ones (fire circuit, cell, DAQ) are in
   control/interlocks.js. */

import { psi } from '../../lib/units.js';
import { S, ALL_BLOCK } from '../../control/interlocks.js';

const TANK_REGS = ['PR-410', 'PR-420'];
const VENT_OF = { 'PR-410': 'VV-413', 'PR-420': 'VV-423' };

export function interlocks(def) {
  const R = def.ratings;
  const maxSystem = c => Math.max(...['PT-302', 'PT-410', 'PT-420', 'PT-336', 'PT-333', 'PT-414', 'PT-424'].map(id => c.meas(id)).filter(Number.isFinite), -Infinity);
  return [
    { id: 'FIRE-DRY', on: ['arm', 'fire'], sev: ALL_BLOCK, safety: true,
      test: c => c.loaded !== 'water',
      msg: 'The run tanks are empty.',
      why: 'A pump with no liquid has no load. Spin the turbine and the shaft runs away to overspeed in a second or two — the most dangerous thing a turbopump can do.' },
    { id: 'FIRE-SETPOINT', on: ['fire'], sev: S('block', 'warn', 'allow'),
      test: c => !(c.sp['PR-410'] > psi(5)) || !(c.sp['PR-420'] > psi(5)),
      msg: 'A run tank has no pressure setpoint.',
      why: 'The tank pressure IS the pump\'s suction pressure. An unpressurised tank gives a pump almost no NPSH: it will cavitate as soon as it turns.' },
    { id: 'FIRE-NPSH', on: ['arm', 'fire'], sev: S('block', 'warn', 'allow'),
      test: c => c.plan?.mode !== 'suction' && (c.sp['PR-410'] < R.NPSH_MIN_TANK || c.sp['PR-420'] < R.NPSH_MIN_TANK),
      msg: `Tank setpoint below ${Math.round(R.NPSH_MIN_TANK / 6894.757)} psig for a run that is not a suction test.`,
      why: 'Below that the pumps run close to cavitation at design speed. Low suction pressure belongs in a suction test, where it is the point.' },
    { id: 'FIRE-SPEED', on: ['arm', 'fire'], sev: ALL_BLOCK,
      test: c => (c.plan?.ctl || 'speed') === 'speed' && !(c.plan.speed > 0 && c.plan.speed <= R.N_MAX_PLAN),
      msg: 'Planned speed above 105 % of design (or not set).',
      why: 'The redline is at 110 %. A plan above 105 % leaves the speed controller no room to overshoot without tripping it.' },
    { id: 'FIRE-DRIVE', on: ['arm', 'fire'], sev: S('block', 'block', 'warn'),
      test: c => c.plan?.ctl === 'pressure' && !(c.sp['PR-330'] > psi(20)),
      msg: 'Pressure-controlled run with no drive pressure set on PR-330.',
      why: 'In pressure control the turbine gets exactly what PR-330 is set to. Zero turns nothing.' },
    { id: 'FIRE-DRIVEMAX', on: ['arm', 'fire'], sev: S('block', 'block', 'warn'),
      test: c => c.plan?.ctl === 'pressure' && c.sp['PR-330'] > psi(260),
      msg: 'Drive pressure above 260 psig in pressure control.',
      why: 'At 260 psig the turbine can drive the shaft past 105 % if the pumps unload. Use speed control above that.' },
    { id: 'FIRE-THROTTLE', on: ['arm', 'fire'], sev: S('block', 'block', 'warn'), safety: true,
      test: c => {
        const p = c.plan || {};
        const xs = p.mode === 'map' ? (p.thrSteps || []) : [p.thrOx ?? p.thr, p.thrFu ?? p.thr];
        return !xs.length || xs.some(x => !(x >= 0.25));
      },
      msg: 'A throttle position below 25 %.',
      why: 'Nearly shut throttles nearly deadhead the pumps: little flow, a hot casing, and a shaft that speeds up because the load has gone.' },
    { id: 'FIRE-SUCTION', on: ['arm', 'fire'], sev: S('block', 'block', 'warn'),
      test: c => c.plan?.mode === 'suction' && !(c.plan.pEnd >= psi(2) && c.plan.pEnd < (c.sp[c.plan.side === 'fu' ? 'PR-420' : 'PR-410'] ?? 0)),
      msg: 'Suction ramp end pressure is not below the starting tank pressure (or is below 2 psig).',
      why: 'A suction test brings the tank DOWN from where it starts, and stops above atmospheric.' },
    { id: 'FIRE-DRIVEVENT', on: ['arm', 'fire'], sev: S('block', 'block', 'warn'),
      test: c => c.cmd('VV-338') === 1,
      msg: 'The drive line vent VV-338 is open.',
      why: 'Open, it bleeds the drive gas to the cell: the turbine gets less than PR-330 says, and SC-330 winds up chasing it.' },
    { id: 'ARM-SUPPLY', on: ['arm'], sev: S('block', 'warn', 'allow'),
      test: c => !(c.meas('PT-301') >= R.SUPPLY_MIN),
      msg: 'Bottle bank below 1200 psig.',
      why: 'The turbine uses about 0.1 kg of nitrogen a second. A low bank droops the drive pressure through the run and can leave the speed controller with nothing to give.' },
    { id: 'ENTER-SPIN', on: ['enterCell'], sev: ALL_BLOCK, safety: true,
      test: c => c.meas('SPD') > 300,
      msg: 'The turbopump is turning.',
      why: 'A rotor at speed stores tens of kilojoules. Nobody enters the cell until it has stopped.' },
    { id: 'ENTER-PRESS', on: ['enterCell'], sev: S('block', 'warn', 'allow'), safety: true,
      test: c => maxSystem(c) > R.PERSONNEL_MAX,
      msg: 'Tanks or lines are pressurised above the personnel limit (50 psig).',
      why: 'Vent first.' },
    { id: 'REG-PERSONNEL', on: ['regSet'], sev: S('block', 'warn', 'allow'), safety: true,
      test: (c, x) => x.value > R.PERSONNEL_MAX && c.facility.area !== 'SECURED',
      msg: 'Setpoint above the 50 psig personnel limit with the cell open.',
      why: 'Clear and secure the cell before pressurising beyond the personnel limit.' },
    { id: 'REG-MEOP', on: ['regSet'], sev: S('warn', 'warn', 'warn'),
      test: (c, x) => TANK_REGS.includes(x.id) && x.value > R.TANK_MEOP && x.value <= R.REG_MAX_CMD,
      msg: 'Tank setpoint above MEOP (120 psig).',
      why: 'You are eating into the margin to the tank reliefs (150 psig).' },
    { id: 'REG-MAX', on: ['regSet'], sev: ALL_BLOCK,
      test: (c, x) => x.value > (x.id === 'PR-330' ? R.DRIVE_MAX : R.REG_MAX_CMD),
      msg: 'Setpoint above the EPC software limit.',
      why: 'The EPC will not command a dome pressure this close to the relief setting (drive: 420 psig).' },
    { id: 'REG-DRIVE-SC', on: ['regSet'], sev: S('block', 'warn', 'warn'),
      test: (c, x) => x.id === 'PR-330' && c.seqActive && (c.plan?.ctl || 'speed') === 'speed',
      msg: 'SC-330 is driving PR-330.',
      why: 'In speed control the controller owns the drive pressure; a hand setpoint fights it until its next correction.' },
    { id: 'REG-VENTING', on: ['regSet'], sev: S('warn', 'warn', 'allow'),
      test: (c, x) => VENT_OF[x.id] && x.value > 0 && c.cmd(VENT_OF[x.id]) === 1,
      msg: 'That tank\'s vent is open: the regulator will flow straight out of it.',
      why: 'Close the tank vent before pressurising the tank.' },
    { id: 'IV-VENTING', on: ['valve'], sev: S('warn', 'warn', 'allow'),
      test: (c, x) => x.id === 'IV-301' && x.open && c.cmd('VV-301') === 1,
      msg: 'VV-301 is open: gas will flow straight to the vent.', why: 'Close the header vent first.' },
    { id: 'MAIN-MANUAL', on: ['valve'], sev: S('block', 'block', 'warn'),
      test: (c, x) => def.sequencedValves.includes(x.id),
      msg: 'The turbine start valve, the discharge valves and the throttles are operated by the sequencer.',
      why: 'A turbine started by hand is a spin with no recording, no speed control and no abort coverage.' },
  ];
}
