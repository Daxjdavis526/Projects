/* TS-1's own interlocks: the rules about its plumbing. The generic ones
   (fire circuit, cell, DAQ) are in control/interlocks.js. */

import { psi } from '../../lib/units.js';
import { S, ALL_BLOCK } from '../../control/interlocks.js';

export function interlocks(def) {
  const R = def.ratings;
  const downstreamPTs = ['PT-102', 'PT-201', 'PT-301'];
  const maxDownstream = c => Math.max(...downstreamPTs.map(id => c.meas(id)).filter(Number.isFinite), -Infinity);
  return [
    { id: 'FIRE-SETPOINT', on: ['fire'], sev: S('block', 'warn', 'allow'),
      test: c => c.regSet < psi(5),
      msg: 'Regulator setpoint is zero.',
      why: 'There is nothing to fire with. The firing will show a valve click and no chamber pressure.' },
    { id: 'ENTER-PRESS', on: ['enterCell'], sev: S('block', 'warn', 'allow'), safety: true,
      test: c => maxDownstream(c) > R.PERSONNEL_MAX,
      msg: 'Test system is pressurised above the personnel limit (50 psig).',
      why: 'Stored gas at pressure is stored energy. Personnel work on or near the system only below the personnel limit; vent first.' },
    { id: 'REG-PERSONNEL', on: ['regSet'], sev: S('block', 'warn', 'allow'), safety: true,
      test: (c, x) => x.value > R.PERSONNEL_MAX && c.facility.area !== 'SECURED',
      msg: 'Setpoint above the 50 psig personnel limit with the cell open.',
      why: 'Clear and secure the cell before pressurising beyond the personnel limit.' },
    { id: 'REG-MEOP', on: ['regSet'], sev: S('warn', 'warn', 'warn'),
      test: (c, x) => x.value > R.MEOP_LP && x.value <= R.REG_MAX_CMD,
      msg: 'Setpoint above the low-pressure MEOP (200 psig).',
      why: 'Above the maximum expected operating pressure you are eating into the margin to the relief valve (250 psig). Legitimate for a characterisation test; not for a routine firing.' },
    { id: 'REG-MAX', on: ['regSet'], sev: ALL_BLOCK,
      test: (c, x) => x.value > R.REG_MAX_CMD,
      msg: 'Setpoint above the EPC software limit (240 psig).',
      why: 'The EPC will not command a dome pressure this close to the relief setting.' },
    { id: 'IV-VENTING', on: ['valve'], sev: S('warn', 'warn', 'allow'),
      test: (c, x) => x.id === def.supplyIso && x.open && c.cmd('VV-101') === 1,
      msg: 'VV-101 is open: supply gas will flow straight to the vent.',
      why: 'Close the vents before opening the supply, unless you intend to purge through them.' },
    { id: 'REG-VENTING', on: ['regSet'], sev: S('warn', 'warn', 'allow'),
      test: (c, x) => x.value > 0 && c.cmd('VV-201') === 1,
      msg: 'VV-201 is open: the regulator will flow to the vent.',
      why: 'The outlet pressure will sag below setpoint and you will be wasting supply gas.' },
  ];
}
