/* LEVEL 2 — Basic cold-gas firing.

   The whole life of one test: configure, instrument, zero, leak-check,
   clear the cell, pressurise, poll, arm, fire, safe, inspect, reduce the
   data, report. Generalised for training on a fictional stand — it is how
   such a procedure is SHAPED, not a certified procedure for real hardware.

   Every step says why it exists. `teach` is extra explanation shown only in
   tutorial mode; `why` is shown in tutorial and (on request) guided mode;
   independent mode shows the title and nothing else. */

import { psi, fmt } from '../../lib/units.js';

const P = v => `${fmt(v, 'pressure')} psig`;
const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;
const PTS = ['PT-101', 'PT-102', 'PT-201', 'PT-301', 'PT-401'];
const LP_PTS = ['PT-102', 'PT-201', 'PT-301', 'PT-401'];
const fired = v => !!v.completedSeq || v.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT'));
const lastEvent = (v, pred) => { const it = v.events.items; for (let i = it.length - 1; i >= 0; i--) if (pred(it[i])) return it[i]; return null; };

export const request = def => ({
  regSet: psi(150),
  duration: 3.0,
  supplyAssumed: psi(2200),
  title: 'CGT-1 baseline steady-state firing',
  text: 'First steady-state firing of CGT-1 S/N 002 with nozzle N-02. Single 3.0 s burn at a regulator setpoint of 150 psig. Establish baseline chamber pressure, thrust, mass flow and specific impulse for later comparison.',
  success: 'Burn of 3.0 s recorded at ≥ 1000 Hz; steady thrust and chamber pressure within ±10 % of prediction; stand safed; data reduced.',
});

export function procedure(def) {
  const R = def.ratings;
  return {
    id: 'cg-basic-firing',
    title: 'TP-CG-002 · Baseline steady-state firing',
    sections: [
      { id: 'A', title: 'Pre-test', steps: [
        { id: 'A1', num: '1.1', kind: 'info', station: 'TC', title: 'Review the test request',
          text: v => `${v.request.text} Pre-test prediction at ${P(v.request.regSet)}: chamber ≈ ${v.prediction ? P(v.prediction.Pc) : '…'}, thrust ≈ ${v.prediction ? v.prediction.F.toFixed(2) + ' N' : '…'}, mass flow ≈ ${v.prediction ? (v.prediction.mdot * 1e3).toFixed(1) + ' g/s' : '…'}.`,
          why: 'Before touching anything, know what the test is for, what "success" means, and what the data SHOULD look like. The prediction is what every number you see later will be compared against — a firing with no prediction produces numbers, not results.',
          teach: 'The prediction comes from a model of the hardware as designed. If the real hardware is off-nominal, the data will disagree with it. That disagreement is usually the first clue that something is wrong.' },
        { id: 'A2', num: '1.2', kind: 'action', station: 'PROP', title: 'Technician: stand walkdown',
          text: 'Console ▸ FACILITY ▸ Technician ▸ Walkdown. The technician checks the stand physically: fittings, tubing supports, the thruster mount, the exhaust path, cables.',
          why: 'Most test-stand problems are found by eye before any gas flows: a loose fitting, a tool left on the thrust stand, a cable across the exhaust.',
          check: v => v.has(e => e.cat === 'TECH' && e.text.startsWith('Walkdown complete')), focus: ['CGT-1'] },
        { id: 'A3', num: '1.3', kind: 'verify', station: 'CTL', title: 'Verify the commanded valve line-up',
          text: 'Confirm on the console: IV-101 CLOSED, VV-101 and VV-201 OPEN (venting), PR-101 setpoint 0, fire circuit SAFE.',
          why: 'Start every test from a known, safe configuration. The vents are normally-open valves: open is their safe, de-energised state, so the system cannot hold pressure until they are deliberately closed.',
          check: v => v.cmd('IV-101') === 0 && v.cmd('VV-101') === 1 && v.cmd('VV-201') === 1 && v.regSet === 0 && !v.armed,
          failMsg: 'The commanded line-up is not the safe starting configuration.', focus: ['IV-101', 'VV-101', 'VV-201', 'PR-101'] },
      ] },
      { id: 'B', title: 'Instrumentation', steps: [
        { id: 'B1', num: '2.1', kind: 'action', station: 'DAQ', title: 'Power up the DAQ',
          text: 'Console ▸ DAQ ▸ Power ON. Wait for ONLINE (≈4 s).',
          why: 'Nothing that follows can be verified without data. The DAQ also runs the redline checks, so the stand is never pressurised without it.',
          check: v => v.daq.online },
        { id: 'B2', num: '2.2', kind: 'verify', station: 'DAQ', title: 'Channel check: every channel live and plausible',
          text: 'Look at every channel. With the system vented, pressure transducers should read near zero, thermocouples near room temperature and each other, the load cell near zero. Nothing flat-lined, nothing off-scale.',
          why: 'A channel that is dead, disconnected or wildly offset is far cheaper to find now than in the middle of a firing. "Plausible" means: does this number make physical sense for the state the system is in?',
          teach: 'Notice the transducers are not exactly zero, and not all the same. Every sensor starts the day with a small zero offset. That is what the next step removes — but only because you know the true pressure right now is zero.',
          check: v => v.staleChannels.length === 0 && PTS.every(id => Math.abs(v.ch(id)) < psi(20)) && Math.abs(v.ch('LC-501')) < 0.5 &&
            ['TC-101', 'TC-301', 'TC-401'].every(id => v.ch(id) > 283 && v.ch(id) < 303),
          failMsg: 'At least one channel is not reading what a vented, ambient system should.' },
        { id: 'B3', num: '2.3', kind: 'verify', station: 'CTL', title: 'Valve position verification',
          text: 'IV-101 indicates CLOSED on its limit switches (ZSC = 1, ZSO = 0) — the indication, not just the command.',
          why: 'A command is what you asked for; an indication is what the hardware says it did. The two are different things, and the P&ID shows the indication.',
          check: v => v.ch('IV-101-ZSC') === 1 && v.ch('IV-101-ZSO') === 0, focus: ['IV-101'] },
      ] },
      { id: 'C', title: 'Zero and calibration', steps: [
        { id: 'C1', num: '3.1', kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers',
          text: 'Console ▸ DAQ ▸ ZERO PTs, with everything vented. Afterwards each should read 0.0 ± 0.3 psig.',
          why: 'A zero is only correct if the true pressure is zero when it is taken. Zero a transducer under pressure and that pressure becomes its "zero": it will read low by that amount for the rest of the day.',
          check: v => { const z = lastEvent(v, e => e.zero); return !!z && PTS.every(id => near(v.ch(id), 0, psi(0.4))); },
          audit: v => { const z = lastEvent(v, e => e.zero); return !!z && z.zero.every(o => Math.abs(o.removed) < psi(5)); } },
        { id: 'C2', num: '3.2', kind: 'action', station: 'DAQ', title: 'Tare the load cell',
          text: 'Console ▸ DAQ ▸ TARE LC. LC-501 should then read 0.00 ± 0.02 N.',
          why: 'Removes the weight of the hardware on the stand and the load cell\'s own offset, so the channel reads only what the thruster adds.',
          check: v => !!lastEvent(v, e => e.tare) && near(v.ch('LC-501'), 0, 0.03), focus: ['LC-501'] },
        { id: 'C3', num: '3.3', kind: 'record', station: 'DAQ', title: 'Load-cell shunt calibration',
          text: 'Console ▸ DAQ ▸ SHUNT CAL ON. Record the LC-501 reading. Expected 25.00 N ± 0.5 %.',
          why: 'A shunt resistor across one arm of the bridge produces a known electrical imbalance equivalent to 25.00 N. If the channel does not read it, the signal-conditioning chain or the calibration factor in the DAQ is wrong — and every thrust number would be wrong by the same ratio.',
          teach: 'A shunt calibration checks the electronics and the numbers typed into the DAQ. It does NOT check the load cell\'s mechanical sensitivity — for that you would hang known weights on the stand.',
          record: { channel: 'LC-501', unit: 'N', validate: (x, v) => {
            const m = v.ch('LC-501');
            if (!near(m, 25, 5)) return { ok: false, msg: 'Shunt cal is not on — LC-501 is not reading the shunt value.' };
            if (!near(x, m, 0.05)) return { ok: false, msg: `Recorded ${x.toFixed(2)} N but LC-501 reads ${m.toFixed(2)} N.` };
            return near(m, 25, 0.125) ? { ok: true, msg: `Shunt ${m.toFixed(2)} N — within 0.5 %.` } : { ok: false, msg: `Shunt ${m.toFixed(2)} N is outside 25.00 ± 0.125 N.` };
          } }, focus: ['LC-501'] },
        { id: 'C4', num: '3.4', kind: 'action', station: 'DAQ', title: 'Shunt calibration OFF',
          text: 'Console ▸ DAQ ▸ SHUNT CAL OFF. LC-501 returns to ≈ 0.00 N.',
          why: 'Forgetting the shunt on adds 25 N to every thrust sample.',
          check: v => v.has(e => e.cat === 'DAQ' && /shunt calibration OFF/.test(e.text)) && near(v.ch('LC-501'), 0, 0.5) },
      ] },
      { id: 'D', title: 'DAQ configuration', steps: [
        { id: 'D1', num: '4.1', kind: 'action', station: 'DAQ', title: 'Set the sample rate for a transient test (≥ 1000 Hz)',
          text: 'Console ▸ DAQ ▸ Rate. The facility default is 250 Hz, which is fine for watching a tank blow down and useless for a valve that opens in 3 ms.',
          why: 'You cannot see anything faster than about one-fifth of the sample rate, and an anti-alias filter smooths away the rest. The fire-valve current dip and the chamber-pressure rise last a few milliseconds; the thrust stand rings at ≈120 Hz.',
          teach: 'Faster is not free: more bandwidth also means more noise on every channel, and more data. Choose the rate for the fastest thing you need to see.',
          check: v => v.daq.rate >= 1000 },
      ] },
      { id: 'E', title: 'Supply and low-pressure leak check', steps: [
        { id: 'E1', num: '5.1', kind: 'action', station: 'PROP', title: 'Technician: open the bottle valve HV-100',
          text: 'Console ▸ FACILITY ▸ Technician ▸ Open HV-100. PT-101 rises to bottle pressure; everything downstream of IV-101 stays vented.',
          why: 'HV-100 is a hand valve at the bottle, so it has to be opened now, while people are allowed in the cell. After the cell is cleared, nobody can reach it.',
          check: v => v.cmd('HV-100') === 1 && v.ch('PT-101') > psi(300), focus: ['HV-100', 'N2-K'] },
        { id: 'E2', num: '5.2', kind: 'record', station: 'PROP', title: 'Record supply pressure (PT-101)',
          text: v => `Record PT-101. Minimum for this test: ${P(R.SUPPLY_MIN)}. Compare with the technician's dial-gauge reading in the log.`,
          why: 'A test needs enough supply to finish. Two independent readings (PT-101 and the bottle gauge) that agree give confidence in both.',
          record: { channel: 'PT-101', unit: 'psig', validate: (x, v) => {
            const m = v.ch('PT-101') / psi(1);
            if (!near(x, m, 10)) return { ok: false, msg: `PT-101 reads ${m.toFixed(0)} psig; you recorded ${x}.` };
            return m >= R.SUPPLY_MIN / psi(1) ? { ok: true, msg: 'Supply adequate.' } : { ok: false, msg: `Supply ${m.toFixed(0)} psig is below the ${R.SUPPLY_MIN / psi(1)} psig minimum.` };
          } } },
        { id: 'E3', num: '5.3', kind: 'action', station: 'PROP', title: 'Close vent valves VV-101 and VV-201',
          text: 'Command both vents CLOSED.',
          why: 'Closed vents are what let the system hold pressure. They are energised to close, so a power failure opens them again and vents the system.',
          check: v => v.cmd('VV-101') === 0 && v.cmd('VV-201') === 0, focus: ['VV-101', 'VV-201'] },
        { id: 'E4', num: '5.4', kind: 'action', station: 'PROP', title: 'Open supply isolation IV-101',
          text: 'Command IV-101 OPEN and watch it travel. PT-102 (regulator inlet) rises to supply pressure.',
          why: 'The regulator is now loaded with supply pressure on its inlet but, with its dome at zero, it stays shut.',
          check: v => v.ch('IV-101-ZSO') === 1 && v.ch('PT-102') > psi(300), focus: ['IV-101'] },
        { id: 'E5', num: '5.5', kind: 'action', station: 'PROP', title: 'Pressurise to leak-check pressure: PR-101 → 50 psig',
          text: 'Set the regulator to 50 psig and wait for PT-201 and PT-301 to settle at about 50.',
          why: 'Leak-check first at a pressure people are allowed to be near (≤ 50 psig). A leak found now is fixed with a wrench; found at 150 psig it is found by the cell being cleared and the test lost.',
          check: v => near(v.regSet, psi(50), psi(1)) && near(v.ch('PT-201'), psi(50), psi(3)) && near(v.ch('PT-301'), psi(50), psi(3)), focus: ['PR-101', 'EPC-101'] },
        { id: 'E6', num: '5.6', kind: 'hold', station: 'PROP', title: 'Isolate and hold: 60 s leak check',
          text: 'Close IV-101 and set PR-101 to 0. That traps gas in two sections: HP (PT-102) between IV-101 and the regulator, and LP (PT-201/301) downstream. START HOLD and watch both for 60 s. Limit: LP decay < 1.0 psi/min.',
          why: 'A closed, isolated volume that loses pressure is leaking (or cooling). The regulator must be shut for this: a regulator that is still regulating quietly replaces whatever leaks out of the low side, and hides the leak.',
          teach: 'Use sim speed ×5 to make the hold pass faster. Watch the slope, not the value: a leak of 1 psi/min is invisible on a gauge and obvious on a 60-second trend.',
          hold: {
            seconds: 60,
            store: 'leakCheck',
            pre: v => (v.cmd('IV-101') === 0 && v.regSet === 0 && v.cmd('VV-201') === 0 && v.cmd('VV-101') === 0 && v.ch('PT-301') > psi(40))
              ? { ok: true } : { ok: false, msg: 'Isolate first: IV-101 closed, PR-101 at 0, both vents closed, LP section pressurised.' },
            evaluate: v => {
              const lp = v.stats('PT-301', 50), hp = v.stats('PT-102', 50);
              const rate = lp ? lp.slope : NaN;
              const perMin = rate * 60 / psi(1);
              const ok = Number.isFinite(rate) && perMin > -1.0;
              const res = { value: rate, hpValue: hp ? hp.slope : NaN, ok, msg: `LP decay ${perMin.toFixed(2)} psi/min${hp ? `, HP ${(hp.slope * 60 / psi(1)).toFixed(1)} psi/min` : ''} — ${ok ? 'within limit' : 'EXCEEDS 1.0 psi/min limit'}` };
              return res;
            },
          }, focus: ['IV-101', 'PR-101'] },
      ] },
      { id: 'F', title: 'Clear the test cell', steps: [
        { id: 'F1', num: '6.1', kind: 'action', station: 'SAF', title: 'Clear and secure the test cell',
          text: 'Console ▸ FACILITY ▸ Clear cell. Sweep, headcount, door closed and interlocked, beacons amber.',
          why: 'From here on the system goes above the 50 psig personnel limit, and then the thruster fires. The door interlock is also what allows the fire circuit to be armed at all.',
          check: v => v.facility.area === 'SECURED' },
        { id: 'F2', num: '6.2', kind: 'action', station: 'SAF', title: 'Warning announcement',
          text: 'Console ▸ FACILITY ▸ PA announcement.',
          why: 'Everyone in earshot is told that the cell is hazardous. A thruster firing is loud and sudden.',
          check: v => v.paMade },
      ] },
      { id: 'G', title: 'Pressurise to test conditions', steps: [
        { id: 'G1', num: '7.1', kind: 'action', station: 'PROP', title: 'Open IV-101',
          text: 'Supply back onto the regulator inlet.', why: 'The regulator was shut for the leak check; it needs supply again.',
          check: v => v.ch('IV-101-ZSO') === 1, focus: ['IV-101'] },
        { id: 'G2', num: '7.2', kind: 'action', station: 'PROP', title: v => `Set PR-101 to the test pressure (${P(v.request.regSet)})`,
          text: 'Command the setpoint and watch EPC-101 slew up to it, then PT-201 lock up. It takes several seconds; the EPC is rate-limited.',
          why: 'Command, then confirm. The number you typed is a request; the EPC feedback and PT-201 are what actually happened.',
          check: v => near(v.regSet, v.request.regSet, psi(1)) && near(v.ch('PT-201'), v.request.regSet, psi(4)), focus: ['PR-101', 'EPC-101'] },
        { id: 'G3', num: '7.3', kind: 'verify', station: 'PROP', title: 'Verify lock-up and static agreement',
          text: 'PT-201 at setpoint (within a few psi), PT-201 and PT-301 agree within 2 psi, PT-401 ≈ 0 behind the closed fire valve, PT-201 steady (not creeping toward the relief at 250).',
          why: 'With no flow there is no pressure drop anywhere, so every transducer on a connected volume must read the same. Disagreement now means a bad transducer. Pressure behind the closed fire valve means it leaks. A creeping outlet means a regulator seat leak.',
          check: v => { const s = v.stats('PT-201', 3);
            return near(v.ch('PT-201'), v.regSet, psi(5)) && near(v.ch('PT-201'), v.ch('PT-301'), psi(2)) && Math.abs(v.ch('PT-401')) < psi(2) && (!s || s.slope < psi(0.3)); },
          failMsg: 'One of: outlet not at setpoint, PT-201/PT-301 disagree, pressure behind SV-301, or outlet creeping.', focus: ['PR-101', 'SV-301'] },
        { id: 'G4', num: '7.4', kind: 'action', station: 'DAQ', title: 'Pre-fire load-cell tare (system pressurised)',
          text: 'Look at LC-501 now: it no longer reads zero, though nothing is firing. TARE LC again.',
          why: 'Pressurising the feed line to the thruster pushes on the thrust stand — pressure tare. The zero you took vented is not the zero you fire from. (Post-test analysis also subtracts a pre-fire baseline, as a second line of defence.)',
          check: v => { const t = lastEvent(v, e => e.tare); return !!t && t.t > (lastEvent(v, e => e.cat === 'CMD' && /setpoint/.test(e.text))?.t ?? Infinity) && near(v.ch('LC-501'), 0, 0.03); },
          focus: ['LC-501'] },
      ] },
      { id: 'H', title: 'Sequence and data', steps: [
        { id: 'H1', num: '8.1', kind: 'action', station: 'TC', title: v => `Load the firing plan: single burn, ${v.request.duration.toFixed(1)} s`,
          text: 'Console ▸ FIRE CONTROL ▸ plan. The sequencer opens SV-301 at T-0 and closes it at the end of the burn by itself.',
          why: 'Burn timing is done by the sequencer, not by a hand on a switch, so every firing is repeatable to the millisecond and the abort logic knows where in the test it is.',
          check: v => v.plan.mode === 'single' && near(v.plan.duration, v.request.duration, 0.001) && v.has(e => e.cat === 'SEQ' && e.text.startsWith('Firing plan loaded')) },
        { id: 'H2', num: '8.2', kind: 'action', station: 'DAQ', title: 'Start DAQ recording',
          text: 'Console ▸ DAQ ▸ RECORD. Recording starts now so the file has a quiet pre-fire baseline; with auto-stop on, it stops by itself a few seconds after shutdown.',
          why: 'The strip charts are a live view, not a record. A firing without recording produced no data.',
          check: v => v.daq.recording },
      ] },
      { id: 'I', title: 'Go / no-go', steps: [
        { id: 'I1', num: '9.1', kind: 'poll', station: 'TC', title: 'Go/no-go poll',
          text: 'Console ▸ FIRE CONTROL ▸ POLL. Each station reports; you make the call. NO-GO is always an acceptable answer.',
          why: 'Every station confirms from its own data that the stand is ready. Its value is in the NO-GO it can produce: a problem caught before firing costs minutes; after, it costs hardware.' },
      ] },
      { id: 'J', title: 'Arm and fire', steps: [
        { id: 'J1', num: '10.1', kind: 'action', station: 'TC', title: 'Arm the fire circuit',
          text: 'FIRE CONTROL ▸ ARM. The beacons go red.',
          why: 'Arming powers the fire-valve circuit. It is interlocked with the cell door and is the last step before the sequence.',
          check: v => v.armed || !!v.completedSeq },
        { id: 'J2', num: '10.2', kind: 'action', station: 'TC', title: 'FIRE — and monitor',
          text: 'FIRE starts a 5-second countdown. During the burn watch PT-401 and LC-501 against the prediction. Your hand is on ABORT. If the data stops making sense, abort: an abort costs a run, a late abort can cost the article.',
          why: 'The operator is part of the protection system. Automatic redlines catch what they were written for; the operator catches everything else.',
          teach: 'Ask, continuously: What state is the system in? What should happen next? What do the instruments say? Does that make physical sense? Is it safe to continue?',
          check: v => !!v.completedSeq || v.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT')) },
      ] },
      { id: 'K', title: 'Post-fire', steps: [
        { id: 'K1', num: '11.1', kind: 'verify', station: 'PROP', title: 'Verify normal shutdown',
          text: 'Chamber pressure back to ≈ 0, SV-301 coil current 0, fire circuit SAFE, regulator back at lock-up.',
          why: 'A fire valve that did not close is the most dangerous state a cold-gas stand has. Confirm it from the data, not from the command.',
          check: v => Math.abs(v.ch('PT-401')) < psi(2) && Math.abs(v.ch('SV-301-I')) < 0.05 && !v.armed },
        { id: 'K2', num: '11.2', kind: 'action', station: 'DAQ', title: 'Recording stopped and file saved',
          text: 'The run appears in the NOTEBOOK and ANALYSIS lists.',
          why: 'Confirm the data exists before you take the stand apart.',
          check: v => v.runs.some(r => r.tFire !== null) },
      ] },
      { id: 'L', title: 'Safe the stand', steps: [
        { id: 'L1', gate: fired, num: '12.1', kind: 'action', station: 'PROP', title: 'PR-101 setpoint → 0', text: 'Dome vented; regulator shuts.',
          why: 'Shut off the source of low-side pressure first.', check: v => v.regSet === 0 },
        { id: 'L2', gate: fired, num: '12.2', kind: 'action', station: 'PROP', title: 'Close IV-101', text: 'Supply isolated. Confirm ZSC.',
          why: 'Isolate the stored energy from the test system.', check: v => v.ch('IV-101-ZSC') === 1 },
        { id: 'L3', gate: fired, num: '12.3', kind: 'action', station: 'PROP', title: 'Open vents VV-201 and VV-101',
          text: 'Vent the low side and the high side. Watch PT-102: the gas trapped between IV-101 and the shut regulator only leaves through VV-101.',
          why: 'Every section must be vented through its own path. A trapped volume is the classic way to be surprised by pressure in a system you thought was safe.',
          check: v => v.cmd('VV-201') === 1 && v.cmd('VV-101') === 1 },
        { id: 'L4', num: '12.4', kind: 'verify', station: 'PROP', title: 'Verify the test system is vented',
          text: 'PT-102, PT-201, PT-301, PT-401 all below 3 psig. (PT-101 still reads bottle pressure: the bottle is still open.)',
          why: 'Vented means verified vented, on every section, before anyone opens the door.',
          check: v => LP_PTS.every(id => v.ch(id) < R.VENTED) },
      ] },
      { id: 'M', title: 'Return to safe / open the cell', steps: [
        { id: 'M1', num: '13.1', kind: 'action', station: 'SAF', title: 'Enter the cell', text: 'FACILITY ▸ Enter cell.',
          why: 'Only now: disarmed, vented, verified.', check: v => v.facility.area === 'OPEN' && !!v.completedSeq },
        { id: 'M2', num: '13.2', kind: 'action', station: 'PROP', title: 'Technician: close HV-100', text: 'Close the bottle.',
          why: 'Stored gas stays in the bottle overnight, not in the lines.', check: v => v.cmd('HV-100') === 0 && !!v.completedSeq },
        { id: 'M3', num: '13.3', kind: 'action', station: 'PROP', title: 'Bleed the supply section',
          text: 'The section between HV-100 and IV-101 still holds bottle pressure (PT-101). With VV-101 open, open IV-101 until PT-101 < 3 psig, then close IV-101.',
          why: 'Closing the bottle does not vent the pipe after it. Another trapped volume.',
          check: v => v.ch('PT-101') < R.VENTED && v.cmd('HV-100') === 0 && v.cmd('IV-101') === 0 && !!v.completedSeq, focus: ['IV-101', 'VV-101'] },
      ] },
      { id: 'N', title: 'Post-test inspection and data', steps: [
        { id: 'N1', num: '14.1', kind: 'action', station: 'PROP', title: 'Technician: post-test visual inspection',
          text: 'FACILITY ▸ Technician ▸ Inspect article.', why: 'Hardware condition is data too. Look before anything is disturbed.',
          check: v => v.has(e => e.cat === 'TECH' && e.text.startsWith('Post-test visual')) },
        { id: 'N2', num: '14.2', kind: 'action', station: 'TC', title: 'Open the run in ANALYSIS',
          text: 'Review the chamber-pressure and thrust traces around T-0 and shutdown, and the automatic reductions.',
          why: 'The firing is not the test; the data is.', check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { id: 'N3', num: '14.3', kind: 'record', station: 'TC', title: 'Record steady-state thrust (N)',
          text: 'From the analysis view (baseline-corrected, steady window).',
          why: 'Reading a number off a reduction is the start. Knowing which window, which baseline and which assumptions produced it is the job.',
          record: { unit: 'N', validate: (x, v) => {
            const run = v.runs.find(r => r.metrics?.summary?.F !== undefined);
            if (!run) return { ok: false, msg: 'No reduced run yet.' };
            const F = run.metrics.summary.F;
            return near(x, F, Math.max(0.05, 0.03 * F)) ? { ok: true, msg: `${F.toFixed(2)} N` } : { ok: false, msg: `Reduction gives ${F.toFixed(2)} N.` };
          } } },
        { id: 'N4', num: '14.4', kind: 'verify', station: 'TC', title: 'Compare with prediction',
          text: 'Is the measured thrust within ±10 % of the pre-test prediction? If not, the test is not complete — it is an investigation.',
          why: 'This comparison is the verdict on the test.',
          check: v => { const run = v.runs.find(r => r.metrics?.summary?.F !== undefined); const p = run?.meta.config.prediction;
            return !!run && !!p && Math.abs(run.metrics.summary.F / p.F - 1) < 0.10; },
          failMsg: 'Measured thrust is not within ±10 % of the prediction. Something is not nominal.' },
        { id: 'N5', num: '14.5', kind: 'action', station: 'TC', title: 'File the test report',
          text: 'NOTEBOOK ▸ the run ▸ write the result and any anomalies ▸ File report.',
          why: 'A test that is not written up did not happen. Somebody will need to know, in a year, what was done and what was seen.',
          check: v => [...v.flags].some(f => f.startsWith('report:')) },
      ] },
    ],
  };
}

export default {
  id: 'cg-basic',
  title: 'Basic cold-gas firing',
  objective: 'Baseline 3.0 s steady-state firing at 150 psig',
  request,
  procedure,
  setup(session) {
    session.daq.setRate(250);          // facility default: slow
  },
};
