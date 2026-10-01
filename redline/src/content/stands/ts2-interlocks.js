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
    { id: 'FIRE-COLD-PROP', on: ['arm', 'fire'], sev: ALL_BLOCK, safety: true,
      test: c => c.loaded === 'propellants' && (c.plan?.mode || 'single') !== 'hot',
      msg: 'Propellants are loaded but the plan is a cold flow.',
      why: 'A cold-flow plan has no igniter and no ignition check: it would spray oxidiser and fuel through the engine, unlit, into the cell. Load the hot-fire plan, or drain and load water.' },
    { id: 'FIRE-HOT-WATER', on: ['arm', 'fire'], sev: S('block', 'block', 'warn'),
      test: c => c.plan?.mode === 'hot' && c.loaded !== 'propellants',
      msg: 'Hot-fire plan with no propellants loaded.',
      why: 'There is nothing to burn: the ignition check will abort the run. Load propellants, or load a cold-flow plan.' },
    { id: 'FIRE-IGNCHECK', on: ['arm', 'fire'], sev: S('block', 'block', 'warn'),
      test: c => c.plan?.mode === 'hot' && !((c.plan.ignCheck ?? 0.5) >= Math.abs(c.plan.lead ?? 0) + 0.3 && (c.plan.ignLead ?? 0.5) > 0 && (c.plan.ignOff ?? 1) > (c.plan.ignCheck ?? 0.5)),
      msg: 'Igniter timing does not cover the start.',
      why: 'The igniter must be sparking before the first propellant arrives and still sparking at the ignition check, and the check must come after both manifolds can have primed (≈0.3 s after the later main valve). Otherwise the check aborts a good start — or a late light makes a hard one.' },
    { id: 'FIRE-BURNLIMIT', on: ['arm', 'fire'], sev: S('block', 'block', 'warn'), safety: true,
      test: c => c.plan?.mode === 'hot' && c.plan.duration > def.design.burnLimit,
      msg: `Burn longer than the heat-sink chamber's ${def.design.burnLimit} s limit.`,
      why: 'The chamber is uncooled copper: the throat redline will abort the run before the plan ends, and if the redline is wrong the throat melts.' },
    { id: 'FIRE-HOTWALL', on: ['arm'], sev: S('block', 'warn', 'warn'),
      test: c => c.plan?.mode === 'hot' && c.wallT('TC-803') > R.WALL_REFIRE,
      msg: 'Throat still hot from the last run (TC-803 above 150 °C).',
      why: 'A heat-sink chamber starts every run from its current temperature. Start hot and the throat redline comes early — wait for it to cool.' },
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
