/* LEVEL 1 — Cold-gas stand orientation.

   No firing. Learn the room, the hardware and the instruments, then make
   gas move at a pressure people are allowed to be near and watch what every
   instrument does about it. The last section is the one that matters most:
   safing, and the gas you forgot was there. */

import { psi, fmt } from '../../lib/units.js';

const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;
const click = (id, title, why) => ({
  id: 'K-' + id, kind: 'action', station: 'TC', title, focus: [id],
  text: `Click ${id} on the P&ID and read its card.`, why, check: v => v.inspected.has(id),
});

export function procedure(def) {
  const R = def.ratings;
  return {
    id: 'cg-orientation',
    title: 'OR-CG-001 · Stand orientation',
    sections: [
      { id: 'A', title: 'The control room', steps: [
        { id: 'A1', num: '1.1', kind: 'info', station: 'TC', title: 'You are the test conductor',
          text: 'This is the control room for TS-1, a small nitrogen cold-gas thruster stand (fictional). You direct the test; stations report to you; nothing fires unless you decide it should.',
          why: 'Rocket testing is not a sequence of buttons. It is a series of decisions about the state of a system you can only see through instruments.' },
        { id: 'A2', num: '1.2', kind: 'info', station: 'TC', title: 'Read the screen',
          text: 'Centre: the P&ID (piping & instrumentation diagram) and the strip charts. Right: live channel readouts and the console you command the stand from. Left: this procedure. Bottom: the event log — every command, indication and alarm, time-stamped.',
          why: 'Everything you see is a measurement. The P&ID colours each line from the transducer on it — if the transducer is wrong, so is the picture.' },
        { id: 'A3', num: '1.3', kind: 'info', station: 'TC', title: 'Seven questions',
          text: 'Keep asking: What state is the system in? What should happen next? What do the instruments say? Do those measurements make physical sense? Is the system safe to continue? Should I abort? What does the data say happened?',
          why: 'This is the whole skill. The rest is detail.' },
      ] },
      { id: 'K', label: 'A', title: 'The hardware, source to nozzle', steps: [
        click('N2-K', 'The pressurant source: N₂ K-bottle', 'Where the energy is stored. Everything downstream exists to release it in a controlled way.'),
        click('HV-100', 'The bottle hand valve', 'Some valves can only be worked by a person standing next to them. That constrains the order of the whole procedure.'),
        click('IV-101', 'The remote isolation valve', 'The main remote shut-off between stored gas and the test system. Note its fail position and its limit switches.'),
        click('PR-101', 'The regulator', 'Turns 2200 psig into a steady test pressure — mostly. Droop, lock-up and dropout are its three habits.'),
        click('RV-201', 'The relief valve', 'Protection that you hope never to see work. It has no indication; you infer it from a pressure that stops rising.'),
        click('F-201', 'The filter', 'A component whose problems only show up while gas is flowing.'),
        click('VV-201', 'A vent valve', 'Normally OPEN: the safe state of a vent is venting.'),
        click('SV-301', 'The fire valve', 'Opened only by the sequencer, only when armed. It has no position sensor.'),
        click('CGT-1', 'The test article', 'A fictional thruster, deliberately simple.'),
        click('LC-501', 'The thrust stand', 'A mass on a spring with a load cell in the load path. It rings.'),
      ].map((st, i) => ({ ...st, num: `1.${4 + i}` })) },
      { id: 'B', title: 'Instruments', steps: [
        { id: 'B1', num: '3.1', kind: 'action', station: 'DAQ', title: 'Power up the DAQ', text: 'Console ▸ DAQ ▸ Power ON; wait for ONLINE.',
          why: 'The DAQ is your eyes. It takes a few seconds to boot.', check: v => v.daq.online },
        { id: 'B2', num: '3.2', kind: 'info', station: 'DAQ', title: 'Look at "zero"',
          text: 'Everything is vented, so every pressure is truly zero. Look at PT-201 and PT-301 in the channel list and on the plots: they read a little above or below zero, differently from each other, and they jitter.',
          why: 'That is zero offset and noise. Every real transducer has both. Knowing the true state (vented) is what lets you correct them.' },
        { id: 'B3', num: '3.3', kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers',
          text: 'Console ▸ DAQ ▸ ZERO PTs. Now they read 0.0 — with the noise still there.',
          why: 'Zeroing removes offset, not noise. And it is only right because the true pressure IS zero right now.',
          check: v => v.has(e => e.zero) },
        { id: 'B4', num: '3.4', kind: 'action', station: 'DAQ', title: 'Change the sample rate and watch the noise',
          text: 'Set the rate to 5000 Hz, then back to 1000 Hz. Watch the width of the noise band on PT-201.',
          why: 'Higher sample rate = more bandwidth = more of the noise gets through. You buy time resolution with noise.',
          check: v => v.has(e => e.cat === 'DAQ' && /Sample rate set to 5000/.test(e.text)) },
      ] },
      { id: 'C', title: 'Make gas move (≤ 50 psig)', steps: [
        { id: 'C1', num: '4.1', kind: 'action', station: 'PROP', title: 'Technician: open HV-100', text: 'FACILITY ▸ Technician ▸ Open HV-100. Watch PT-101.',
          why: 'PT-101 sits between the bottle valve and IV-101. It had nothing to measure until now.', check: v => v.ch('PT-101') > psi(300) },
        { id: 'C2', num: '4.2', kind: 'action', station: 'PROP', title: 'Close both vents', text: 'VV-101 and VV-201 CLOSED.',
          why: 'Otherwise nothing downstream can hold pressure.', check: v => v.cmd('VV-101') === 0 && v.cmd('VV-201') === 0 },
        { id: 'C3', num: '4.3', kind: 'action', station: 'PROP', title: 'Open IV-101 and watch it travel',
          text: 'Watch the IV-101 symbol: command first, then TRAVEL, then the OPEN indication. Watch PT-102 jump to supply pressure.',
          why: 'A pneumatic ball valve takes most of a second. The P&ID shows the limit switches, not your command.', check: v => v.ch('IV-101-ZSO') === 1 },
        { id: 'C4', num: '4.4', kind: 'action', station: 'PROP', title: 'Set PR-101 to 30 psig',
          text: 'Watch EPC-101 slew to 30, then PT-201 and PT-301 rise and lock up. Note how the line colour on the P&ID changes.',
          why: 'Below the 50 psig personnel limit, so people could still be in the cell.',
          check: v => near(v.regSet, psi(30), psi(1)) && near(v.ch('PT-201'), psi(30), psi(3)) },
        { id: 'C5', num: '4.5', kind: 'action', station: 'PROP', title: 'Open VV-201 for a few seconds, then close it',
          text: 'With the regulator set, open the feed vent. Watch PT-201 sag as the regulator flows gas out of the vent, and listen. Then close VV-201 and watch it lock up again.',
          why: 'Droop, made visible: the regulator needs its outlet to fall before it opens. And a leaking vent looks exactly like this, only smaller.',
          check: v => v.has(e => e.cat === 'CMD' && e.text === 'VV-201 OPEN') && v.cmd('VV-201') === 0 && v.stepDone('C4') },
      ] },
      { id: 'D', title: 'Safe it — and find the trapped gas', steps: [
        { id: 'D1', num: '5.1', kind: 'action', station: 'PROP', title: 'PR-101 → 0 and close IV-101', text: 'Regulator shut, supply isolated.',
          why: 'Remove the source before venting.', check: v => v.regSet === 0 && v.ch('IV-101-ZSC') === 1 },
        { id: 'D2', num: '5.2', kind: 'action', station: 'PROP', title: 'Open VV-201 only', text: 'Vent the low side. Watch PT-201, PT-301 fall — and PT-102.',
          why: '…PT-102 does not fall. The regulator is shut and IV-101 is shut: the gas between them has nowhere to go.',
          check: v => v.cmd('VV-201') === 1 && v.ch('PT-301') < R.VENTED },
        { id: 'D3', num: '5.3', kind: 'verify', station: 'PROP', title: 'Is the system vented?',
          text: 'Look at every pressure channel. Confirm only when every section of the test system downstream of IV-101 is below 3 psig.',
          why: 'This is the trap. A trapped volume at 2200 psig, behind a "safed" system, is how people get hurt.',
          check: v => ['PT-102', 'PT-201', 'PT-301', 'PT-401'].every(id => v.ch(id) < R.VENTED),
          failMsg: 'PT-102 still reads supply pressure: the section between IV-101 and PR-101 is trapped. Open VV-101.' },
        { id: 'D4', num: '5.4', kind: 'info', station: 'TC', title: 'Orientation complete',
          text: 'Next: Level 2, a full firing. The procedure is longer, but every step is one of the things you just did, done for a reason.',
          why: '' },
      ] },
    ],
  };
}

export default {
  id: 'cg-orient',
  title: 'Cold-gas stand orientation',
  objective: 'Orientation — no firing',
  request: () => ({ regSet: psi(30), duration: 0, supplyAssumed: psi(2200), title: 'Orientation', text: 'Learn the stand and its instruments. No firing.' }),
  procedure,
};
