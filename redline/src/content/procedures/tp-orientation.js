/* LEVEL 18 — Turbopump stand orientation.

   A turbopump on a bench: what spins, what drives it, what loads it, what
   measures it. Fill the tanks, turn the rotor by hand, pressurise to the
   personnel limit and see what a stopped pump does to the pressures — then
   safe a stand whose tank regulators can vent as well as feed. Nothing
   spins in this level. */

import { psi } from '../../lib/units.js';
import { near } from './common.js';
import { TP_PTS } from './tp-common.js';

const click = (id, title, why) => ({
  id: 'K-' + id, kind: 'action', station: 'TC', title, focus: [id],
  text: `Click ${id} on the P&ID and read its card.`, why, check: v => v.inspected.has(id),
});

export function procedure(def) {
  const R = def.ratings;
  return {
    id: 'tp-orientation',
    title: 'OR-TP-001 · Turbopump stand orientation',
    sections: [
      { id: 'A', title: 'TS-3', steps: [
        { id: 'A1', num: '1.1', kind: 'info', station: 'TC', title: 'A turbopump on a bench',
          text: 'TS-3 tests TPA-1, the turbopump for a pump-fed engine: an oxidiser pump and a fuel pump on one shaft with a small turbine. A pressure-fed engine needs tanks at the pressure the injector needs; a pump-fed one keeps its tanks at a few bar and lets the pumps make the rest. Here both pumps run on water, from two run tanks to a catch tank, and the turbine runs on cold nitrogen. Nothing spins in this level.',
          why: 'Every turbopump is spun on a bench, on water and cold gas, before it is ever asked to feed an engine. A turbopump fault found on an engine is found the expensive way.' },
        { id: 'A2', num: '1.2', kind: 'info', station: 'TC', title: 'Read the P&ID',
          text: 'Top: the nitrogen bank and header, feeding three regulators — the two tank regulators and, on the right, PR-330, the turbine drive. Middle: the run tanks with their pumps directly below; the shaft runs right through the ox pump and the fuel pump to the turbine. Bottom: the two discharge lines through a ball valve, a flowmeter and a throttle valve to the catch tank. The shaft lights up and the impellers turn when the SPEED PICKUPS say it is turning.',
          why: 'The pumps make the pressure; the throttles decide the flow; the turbine supplies the power; the speed is the balance of the three.' },
      ] },
      { id: 'K', label: 'A', title: 'The hardware', steps: [
        click('N2-B', 'The nitrogen bank', 'Pressurant for the tanks and drive gas for the turbine — the turbine is by far the bigger user.'),
        click('PR-410', 'A tank regulator', 'RELIEVING: it can bring a tank down as well as up. That is what makes a suction test possible.'),
        click('T-410', 'The ox-side run tank', 'Its pressure is the ox pump\'s suction pressure. Its scale is the pump\'s fuel gauge.'),
        click('P-OX', 'The oxidiser pump', 'It makes HEAD — energy per unit weight. The pressure rise is head times density, so the same pump makes more pressure on a denser liquid.'),
        click('TPA-1', 'The turbopump', 'One shaft, two pumps, one turbine, two speed pickups. Speed is the redline that matters most.'),
        click('TURB', 'The turbine', 'Drive gas through nozzles onto a row of blades. Its efficiency depends on blade speed against gas speed.'),
        click('TSV-332', 'The turbine start valve', 'The only way to take power off the shaft. The abort shuts it first.'),
        click('DV-414', 'A discharge valve', 'Open before the turbine starts, shut only after the rotor has coasted down. A pump against a shut valve is DEADHEADED.'),
        click('FCV-418', 'A throttle valve', 'Sets the flow the pump sees: the knob that walks the pump along its curve.'),
      ].map((st, i) => ({ ...st, num: `1.${3 + i}` })) },
      { id: 'B', title: 'Instruments', steps: [
        { id: 'B1', num: '3.1', kind: 'action', station: 'DAQ', title: 'Power up the DAQ', text: 'Console ▸ DAQ ▸ Power ON.', check: v => v.daq.online },
        { id: 'B2', num: '3.2', kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers', text: 'Console ▸ DAQ ▸ ZERO PTs. Everything is vented.',
          check: v => v.has(e => e.zero) },
        { id: 'B3', num: '3.3', kind: 'action', station: 'DAQ', title: 'Tare the tank scales while the tanks are EMPTY',
          text: 'Console ▸ DAQ ▸ TARE (tank scales).',
          check: v => v.has(e => e.tare && e.tare.some(o => o.id === 'WT-411')) && Math.abs(v.ch('WT-411')) < 0.1 },
      ] },
      { id: 'C', title: 'Fill, and turn the rotor', steps: [
        { id: 'C1', num: '4.1', kind: 'action', station: 'PROP', title: 'Technician: fill both tanks with water',
          text: 'FACILITY ▸ Technician ▸ Fill tanks (the vents are open).', check: v => v.ch('WT-411') > 30 && v.ch('WT-421') > 30 },
        { id: 'C2', num: '4.2', kind: 'action', station: 'PROP', title: 'Technician: turn the rotor by hand',
          text: 'FACILITY ▸ Technician ▸ Turn rotor. Read the breakaway torque and how it felt in the log.',
          why: 'Before anything else, on any test day: does it turn freely? A rotor that drags, scrapes or feels gritty does not get spun.',
          check: v => v.inspected.has('turn-rotor') },
      ] },
      { id: 'D', title: 'Pressurise (≤ 50 psig)', steps: [
        { id: 'D1', num: '5.1', kind: 'action', station: 'PROP', title: 'Technician: open HV-300', text: 'Watch PT-301.', check: v => v.ch('PT-301') > psi(1500) },
        { id: 'D2', num: '5.2', kind: 'action', station: 'PROP', title: 'Close VV-301, VV-413 and VV-423; open IV-301',
          check: v => ['VV-301', 'VV-413', 'VV-423'].every(id => v.cmd(id) === 0) && v.ch('IV-301-ZSO') === 1 },
        { id: 'D3', num: '5.3', kind: 'action', station: 'PROP', title: 'PR-410 and PR-420 → 40 psig',
          text: 'Watch PT-410 and PT-420 lock up — and PT-413/414 and PT-423/424: with the pumps stopped and the discharge valves shut, the pump inlet and discharge both read tank pressure.',
          why: 'A stopped pump adds nothing. Every pressure difference you see on a spin is the impeller\'s work.',
          check: v => near(v.ch('PT-410'), psi(40), psi(4)) && near(v.ch('PT-420'), psi(40), psi(4)) },
        { id: 'D4', num: '5.4', kind: 'action', station: 'PROP', title: 'Now turn PR-410 DOWN to 20 psig',
          text: 'Watch PT-410 follow it down — with the tank vent shut. The regulator\'s relief port is bleeding the tank to its new setpoint.',
          why: 'This is what makes a suction test possible: the inlet pressure of a running pump can be brought down at a controlled rate, without anyone touching a vent.',
          check: v => near(v.sp['PR-410'], psi(20), psi(1)) && near(v.ch('PT-410'), psi(20), psi(4)) && v.cmd('VV-413') === 0 },
      ] },
      { id: 'E', title: 'Safe it', steps: [
        { id: 'E1', num: '6.1', kind: 'action', station: 'PROP', title: 'All three regulators → 0; close IV-301',
          check: v => ['PR-410', 'PR-420', 'PR-330'].every(id => v.sp[id] === 0) && v.ch('IV-301-ZSC') === 1 },
        { id: 'E2', num: '6.2', kind: 'action', station: 'PROP', title: 'Open VV-301, VV-413 and VV-423',
          check: v => ['VV-301', 'VV-413', 'VV-423'].every(id => v.cmd(id) === 1) },
        { id: 'E3', num: '6.3', kind: 'verify', station: 'PROP', title: 'Is the system vented?',
          text: 'Every pressure channel downstream of IV-301 below 3 psig.',
          why: 'The header between IV-301 and three shut regulators only empties through VV-301. The drive line between PR-330 and the shut turbine start valve held nothing this time — PR-330 was never opened — but on a test day it will.',
          check: v => TP_PTS.every(id => v.ch(id) < R.VENTED),
          failMsg: 'Something is still pressurised. Which transducer?' },
        { id: 'E4', num: '6.4', kind: 'info', station: 'TC', title: 'Orientation complete',
          text: 'Next: Level 19, the first spin — at half speed, then at design.', why: '' },
      ] },
    ],
  };
}

export default {
  id: 'tp-orient',
  title: 'Turbopump stand orientation',
  objective: 'Orientation — no spin',
  request: () => ({ tankP: psi(40), title: 'Orientation', text: 'Learn TS-3 and TPA-1. No spin.' }),
  procedure,
};
