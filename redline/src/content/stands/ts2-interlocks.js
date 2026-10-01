/* TS-2's own interlocks. The generic ones (fire circuit, cell, DAQ) are in
   control/interlocks.js. */

import { psi } from '../../lib/units.js';
import { S, ALL_BLOCK } from '../../control/interlocks.js';

const TANK_REGS = ['PR-610', 'PR-620'];
const VENT_OF = { 'PR-610': 'VV-711', 'PR-620': 'VV-721' };

export function interlocks(def) {
  const R = def.ratings;
  const maxSystem = c => Math.max(...['PT-602', 'PT-710', 'PT-720', 'PT-630', 'PT-715', 'PT-725'].map(id => c.meas(id)).filter(Number.isFinite), -Infinity);
  return [
    { id: 'FIRE-SETPOINT', on: ['fire'], sev: S('block', 'warn', 'allow'),
      test: c => {
        const p = c.plan || {};
        return (p.sides !== 'fuel' && !(c.sp['PR-610'] > psi(5))) || (p.sides !== 'ox' && !(c.sp['PR-620'] > psi(5)));
      },
      msg: 'A tank that is to flow has no pressurant setpoint.',
      why: 'An unpressurised tank pushes nothing: the main valve will open on a dry line.' },
    { id: 'ARM-PURGE', on: ['arm'], sev: S('block', 'warn', 'allow'),
      test: c => !(c.meas('PT-630') >= R.PURGE_MIN),
      msg: 'Purge pressure is below 100 psig.',
      why: 'The abort sequence purges both manifolds. Without purge pressure, an abort leaves propellant sitting in the injector.' },
    { id: 'ENTER-PRESS', on: ['enterCell'], sev: S('block', 'warn', 'allow'), safety: true,
      test: c => maxSystem(c) > R.PERSONNEL_MAX,
      msg: 'Tanks or lines are pressurised above the personnel limit (50 psig).',
      why: 'Two pressurised tanks of liquid are stored energy and a spray hazard. Vent first.' },
    { id: 'REG-PERSONNEL', on: ['regSet'], sev: S('block', 'warn', 'allow'), safety: true,
      test: (c, x) => x.value > R.PERSONNEL_MAX && c.facility.area !== 'SECURED',
      msg: 'Setpoint above the 50 psig personnel limit with the cell open.',
      why: 'Clear and secure the cell before pressurising beyond the personnel limit.' },
    { id: 'REG-MEOP', on: ['regSet'], sev: S('warn', 'warn', 'warn'),
      test: (c, x) => TANK_REGS.includes(x.id) && x.value > R.TANK_MEOP && x.value <= R.REG_MAX_CMD,
      msg: 'Tank setpoint above MEOP (600 psig).',
      why: 'You are eating into the margin to the tank reliefs (660 psig).' },
    { id: 'REG-MAX', on: ['regSet'], sev: ALL_BLOCK,
      test: (c, x) => x.value > (x.id === 'PR-630' ? R.PURGE_MAX : R.REG_MAX_CMD),
      msg: 'Setpoint above the EPC software limit.',
      why: 'The EPC will not command a dome pressure this close to the relief setting (purge: 300 psig).' },
    { id: 'REG-VENTING', on: ['regSet'], sev: S('warn', 'warn', 'allow'),
      test: (c, x) => VENT_OF[x.id] && x.value > 0 && c.cmd(VENT_OF[x.id]) === 1,
      msg: 'That tank\'s vent is open: the regulator will flow straight out of it.',
      why: 'Close the tank vent before pressurising the tank.' },
    { id: 'IV-VENTING', on: ['valve'], sev: S('warn', 'warn', 'allow'),
      test: (c, x) => x.id === 'IV-601' && x.open && c.cmd('VV-601') === 1,
      msg: 'VV-601 is open: pressurant will flow straight to the vent.', why: 'Close the header vent first.' },
    { id: 'MAIN-MANUAL', on: ['valve'], sev: S('block', 'block', 'warn'),
      test: (c, x) => def.mainValves.includes(x.id),
      msg: 'Main valves are operated by the sequencer.',
      why: 'A main valve opened by hand is a flow with no recording, no timing and no abort coverage.' },
    { id: 'PURGE-INTO-FLOW', on: ['valve'], sev: S('warn', 'warn', 'allow'),
      test: (c, x) => ['PV-631', 'PV-632'].includes(x.id) && x.open && c.seqActive,
      msg: 'Opening a purge by hand during a sequence.', why: 'The sequencer is running the purges; a hand purge into a flowing manifold changes the flow.' },
  ];
}
