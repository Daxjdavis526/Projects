/* Building blocks shared by the cold-gas procedures.

   A test procedure is mostly the same scaffolding around a different middle:
   configure, instrument, zero, leak-check, clear the cell, pressurise …
   … safe, open the cell, inspect. Each builder returns one section; a
   procedure is a list of them. `finalize` numbers the steps (section.step)
   and gives each an id of section letter + position, so a procedure reads
   as data and a new exercise is a new middle.

   Generalised for training on a fictional stand. It is how such procedures
   are shaped, not a certified procedure for any real hardware. */

import { psi, fmt } from '../../lib/units.js';

export const P = v => `${fmt(v, 'pressure')} psig`;
export const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;
export const PTS = ['PT-101', 'PT-102', 'PT-201', 'PT-301', 'PT-401'];
export const LP_PTS = ['PT-102', 'PT-201', 'PT-301', 'PT-401'];
export const fired = v => !!v.completedSeq || v.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT'));
export const lastEvent = (v, pred) => { const it = v.events.items; for (let i = it.length - 1; i >= 0; i--) if (pred(it[i])) return it[i]; return null; };
export const fullScale = def => id => { const x = def.sensors.find(q => q.id === id); return x ? x.range[1] - x.range[0] : Infinity; };

/* Runs recorded this session that satisfy a predicate (newest last). */
export const runsWhere = (v, pred) => v.runs.filter(r => r.tFire !== null && !r.aborted && r.metrics && pred(r));

/* Number steps and assign ids. */
export function finalize(proc) {
  proc.sections.forEach((sec, i) => {
    sec.steps.forEach((st, j) => {
      st.id ??= `${sec.id}${j + 1}`;
      st.num ??= `${i + 1}.${j + 1}`;
    });
  });
  return proc;
}

export function pretest(def, sec = 'A', { reviewText } = {}) {
  return { id: sec, title: 'Pre-test', steps: [
    { kind: 'info', station: 'TC', title: 'Review the test request',
      text: reviewText || (v => `${v.request.text} Pre-test prediction at ${P(v.request.regSet)}: chamber ≈ ${v.prediction ? P(v.prediction.Pc) : '…'}, thrust ≈ ${v.prediction ? v.prediction.F.toFixed(2) + ' N' : '…'}, mass flow ≈ ${v.prediction ? (v.prediction.mdot * 1e3).toFixed(1) + ' g/s' : '…'}.`),
      why: 'Before touching anything, know what the test is for, what "success" means, and what the data SHOULD look like. The prediction is what every number you see later will be compared against — a firing with no prediction produces numbers, not results.',
      teach: 'The prediction comes from a model of the hardware as designed. If the real hardware is off-nominal, the data will disagree with it. That disagreement is usually the first clue that something is wrong.' },
    { kind: 'action', station: 'PROP', title: 'Technician: stand walkdown',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Walkdown. The technician checks the stand physically: fittings, tubing supports, the thruster mount, the exhaust path, cables.',
      why: 'Most test-stand problems are found by eye before any gas flows: a loose fitting, a tool left on the thrust stand, a cable across the exhaust.',
      check: v => v.has(e => e.cat === 'TECH' && e.text.startsWith('Walkdown complete')), focus: ['CGT-1'] },
    { kind: 'verify', station: 'CTL', title: 'Verify the commanded valve line-up',
      text: 'Confirm on the console: IV-101 CLOSED, VV-101 and VV-201 OPEN (venting), PR-101 setpoint 0, fire circuit SAFE.',
      why: 'Start every test from a known, safe configuration. The vents are normally-open valves: open is their safe, de-energised state, so the system cannot hold pressure until they are deliberately closed.',
      check: v => v.cmd('IV-101') === 0 && v.cmd('VV-101') === 1 && v.cmd('VV-201') === 1 && v.regSet === 0 && !v.armed,
      failMsg: 'The commanded line-up is not the safe starting configuration.', focus: ['IV-101', 'VV-101', 'VV-201', 'PR-101'] },
  ] };
}

export function instrumentation(def, sec = 'B') {
  const FS = fullScale(def);
  return { id: sec, title: 'Instrumentation', steps: [
    { kind: 'action', station: 'DAQ', title: 'Power up the DAQ',
      text: 'Console ▸ DAQ ▸ Power ON. Wait for ONLINE (≈4 s).',
      why: 'Nothing that follows can be verified without data. The DAQ also runs the redline checks, so the stand is never pressurised without it.',
      check: v => v.daq.online },
    { kind: 'verify', station: 'DAQ', title: 'Channel check: every channel live and plausible',
      text: 'Look at every channel. With the system vented, pressure transducers should read near zero, thermocouples near room temperature and each other, the load cell and flowmeter near zero. Nothing flat-lined, nothing off-scale.',
      why: 'A channel that is dead, disconnected or wildly offset is far cheaper to find now than in the middle of a firing. "Plausible" means: does this number make physical sense for the state the system is in?',
      teach: 'Notice the transducers are not exactly zero, and not all the same. Every sensor starts the day with a small zero offset. That is what the next step removes — but only because you know the true pressure right now is zero.',
      check: v => v.staleChannels.length === 0 && PTS.every(id => Math.abs(v.ch(id)) < 0.015 * FS(id)) && Math.abs(v.ch('LC-501')) < 0.5 &&
        ['TC-101', 'TC-301', 'TC-401'].every(id => v.ch(id) > 283 && v.ch(id) < 303),
      failMsg: 'At least one channel is not reading what a vented, ambient system should.' },
    { kind: 'verify', station: 'CTL', title: 'Valve position verification',
      text: 'IV-101 indicates CLOSED on its limit switches (ZSC = 1, ZSO = 0) — the indication, not just the command.',
      why: 'A command is what you asked for; an indication is what the hardware says it did. The two are different things, and the P&ID shows the indication.',
      check: v => v.ch('IV-101-ZSC') === 1 && v.ch('IV-101-ZSO') === 0, focus: ['IV-101'] },
  ] };
}

export function zeroCal(def, sec = 'C') {
  const FS = fullScale(def);
  return { id: sec, title: 'Zero and calibration', steps: [
    { kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers',
      text: 'Console ▸ DAQ ▸ ZERO PTs, with everything vented. Afterwards each should read zero to within its noise (a few tenths of a psi on the 500 psi transducers, a few psi on the 5000 psi ones).',
      why: 'A zero is only correct if the true pressure is zero when it is taken. Zero a transducer under pressure and that pressure becomes its "zero": it will read low by that amount for the rest of the day.',
      check: v => { const z = lastEvent(v, e => e.zero); return !!z && PTS.every(id => near(v.ch(id), 0, 0.002 * FS(id))); },
      audit: v => { const z = lastEvent(v, e => e.zero); return !!z && z.zero.every(o => Math.abs(o.removed) < Math.max(psi(5), 0.01 * FS(o.id))); } },
    { kind: 'action', station: 'DAQ', title: 'Tare the load cell',
      text: 'Console ▸ DAQ ▸ TARE LC. LC-501 should then read 0.00 ± 0.02 N.',
      why: 'Removes the weight of the hardware on the stand and the load cell\'s own offset, so the channel reads only what the thruster adds.',
      check: v => !!lastEvent(v, e => e.tare) && near(v.ch('LC-501'), 0, 0.03), focus: ['LC-501'] },
    { kind: 'record', station: 'DAQ', title: 'Load-cell shunt calibration',
      text: 'Console ▸ DAQ ▸ SHUNT CAL ON. Record the LC-501 reading. Expected 25.00 N ± 0.5 %.',
      why: 'A shunt resistor across one arm of the bridge produces a known electrical imbalance equivalent to 25.00 N. If the channel does not read it, the signal-conditioning chain or the calibration factor in the DAQ is wrong — and every thrust number would be wrong by the same ratio.',
      teach: 'A shunt calibration checks the electronics and the numbers typed into the DAQ. It does NOT check the load cell\'s mechanical sensitivity — for that you would hang known weights on the stand.',
      record: { channel: 'LC-501', unit: 'N', validate: (x, v) => {
        const m = v.ch('LC-501');
        if (!near(m, 25, 5)) return { ok: false, msg: 'Shunt cal is not on — LC-501 is not reading the shunt value.' };
        if (!near(x, m, 0.05)) return { ok: false, msg: `Recorded ${x.toFixed(2)} N but LC-501 reads ${m.toFixed(2)} N.` };
        return near(m, 25, 0.125) ? { ok: true, msg: `Shunt ${m.toFixed(2)} N — within 0.5 %.` } : { ok: false, msg: `Shunt ${m.toFixed(2)} N is outside 25.00 ± 0.125 N.` };
      } }, focus: ['LC-501'] },
    { kind: 'action', station: 'DAQ', title: 'Shunt calibration OFF',
      text: 'Console ▸ DAQ ▸ SHUNT CAL OFF. LC-501 returns to ≈ 0.00 N.',
      why: 'Forgetting the shunt on adds 25 N to every thrust sample.',
      check: v => v.has(e => e.cat === 'DAQ' && /shunt calibration OFF/.test(e.text)) && near(v.ch('LC-501'), 0, 0.5) },
  ] };
}

export function daqConfig(def, sec = 'D', { minRate = 1000, title, text, why, teach } = {}) {
  return { id: sec, title: 'DAQ configuration', steps: [
    { kind: 'action', station: 'DAQ', title: title || `Set the sample rate for a transient test (≥ ${minRate} Hz)`,
      text: text || 'Console ▸ DAQ ▸ Rate. The facility default is 250 Hz, which is fine for watching a tank blow down and useless for a valve that opens in 3 ms.',
      why: why || 'You cannot see anything faster than about one-fifth of the sample rate, and an anti-alias filter smooths away the rest. The fire-valve current dip and the chamber-pressure rise last a few milliseconds; the thrust stand rings at ≈120 Hz.',
      teach: teach || 'Faster is not free: more bandwidth also means more noise on every channel, and more data. Choose the rate for the fastest thing you need to see.',
      check: v => v.daq.rate >= minRate },
  ] };
}

export function supplyLeak(def, sec = 'E') {
  const R = def.ratings;
  return { id: sec, title: 'Supply and low-pressure leak check', steps: [
    { kind: 'action', station: 'PROP', title: 'Technician: open the bottle valve HV-100',
      text: 'Console ▸ FACILITY ▸ Technician ▸ Open HV-100. PT-101 rises to bottle pressure; everything downstream of IV-101 stays vented.',
      why: 'HV-100 is a hand valve at the bottle, so it has to be opened now, while people are allowed in the cell. After the cell is cleared, nobody can reach it.',
      check: v => v.cmd('HV-100') === 1 && v.ch('PT-101') > psi(300), focus: ['HV-100', 'N2-K'] },
    { kind: 'record', station: 'PROP', title: 'Record supply pressure (PT-101)',
      text: v => `Record PT-101. Minimum for this test: ${P(R.SUPPLY_MIN)}. Compare with the technician's dial-gauge reading in the log.`,
      why: 'A test needs enough supply to finish. Two independent readings (PT-101 and the bottle gauge) that agree give confidence in both.',
      record: { channel: 'PT-101', unit: 'psig', validate: (x, v) => {
        const m = v.ch('PT-101') / psi(1);
        if (!near(x, m, 10)) return { ok: false, msg: `PT-101 reads ${m.toFixed(0)} psig; you recorded ${x}.` };
        return m >= R.SUPPLY_MIN / psi(1) ? { ok: true, msg: 'Supply adequate.' } : { ok: false, msg: `Supply ${m.toFixed(0)} psig is below the ${R.SUPPLY_MIN / psi(1)} psig minimum.` };
      } } },
    { kind: 'action', station: 'PROP', title: 'Close vent valves VV-101 and VV-201',
      text: 'Command both vents CLOSED.',
      why: 'Closed vents are what let the system hold pressure. They are energised to close, so a power failure opens them again and vents the system.',
      check: v => v.cmd('VV-101') === 0 && v.cmd('VV-201') === 0, focus: ['VV-101', 'VV-201'] },
    { kind: 'action', station: 'PROP', title: 'Open supply isolation IV-101',
      text: 'Command IV-101 OPEN and watch it travel. PT-102 (regulator inlet) rises to supply pressure.',
      why: 'The regulator is now loaded with supply pressure on its inlet but, with its dome at zero, it stays shut.',
      check: v => v.ch('IV-101-ZSO') === 1 && v.ch('PT-102') > psi(300), focus: ['IV-101'] },
    { kind: 'action', station: 'PROP', title: 'Pressurise to leak-check pressure: PR-101 → 50 psig',
      text: 'Set the regulator to 50 psig and wait for PT-201 and PT-301 to settle at about 50.',
      why: 'Leak-check first at a pressure people are allowed to be near (≤ 50 psig). A leak found now is fixed with a wrench; found at 150 psig it is found by the cell being cleared and the test lost.',
      check: v => near(v.regSet, psi(50), psi(1)) && near(v.ch('PT-201'), psi(50), psi(3)) && near(v.ch('PT-301'), psi(50), psi(3)), focus: ['PR-101', 'EPC-101'] },
    { kind: 'hold', station: 'PROP', title: 'Isolate and hold: 60 s leak check',
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
          return { value: rate, hpValue: hp ? hp.slope : NaN, ok, msg: `LP decay ${perMin.toFixed(2)} psi/min${hp ? `, HP ${(hp.slope * 60 / psi(1)).toFixed(1)} psi/min` : ''} — ${ok ? 'within limit' : 'EXCEEDS 1.0 psi/min limit'}` };
        },
      }, focus: ['IV-101', 'PR-101'] },
  ] };
}

export function clearCell(def, sec = 'F') {
  return { id: sec, title: 'Clear the test cell', steps: [
    { kind: 'action', station: 'SAF', title: 'Clear and secure the test cell',
      text: 'Console ▸ FACILITY ▸ Clear cell. Sweep, headcount, door closed and interlocked, beacons amber.',
      why: 'From here on the system goes above the 50 psig personnel limit, and then the thruster fires. The door interlock is also what allows the fire circuit to be armed at all.',
      check: v => v.facility.area === 'SECURED' },
    { kind: 'action', station: 'SAF', title: 'Warning announcement',
      text: 'Console ▸ FACILITY ▸ PA announcement.',
      why: 'Everyone in earshot is told that the cell is hazardous. A thruster firing is loud and sudden.',
      check: v => v.paMade },
  ] };
}

export function pressurise(def, sec = 'G') {
  return { id: sec, title: 'Pressurise to test conditions', steps: [
    { kind: 'action', station: 'PROP', title: 'Open IV-101',
      text: 'Supply back onto the regulator inlet.', why: 'The regulator was shut for the leak check; it needs supply again.',
      check: v => v.ch('IV-101-ZSO') === 1, focus: ['IV-101'] },
    { kind: 'action', station: 'PROP', title: v => `Set PR-101 to the test pressure (${P(v.request.regSet)})`,
      text: 'Command the setpoint and watch EPC-101 slew up to it, then PT-201 lock up. It takes several seconds; the EPC is rate-limited.',
      why: 'Command, then confirm. The number you typed is a request; the EPC feedback and PT-201 are what actually happened.',
      check: v => near(v.regSet, v.request.regSet, psi(1)) && near(v.ch('PT-201'), v.request.regSet, psi(4)), focus: ['PR-101', 'EPC-101'] },
    { kind: 'verify', station: 'PROP', title: 'Verify lock-up and static agreement',
      text: 'PT-201 at setpoint (within a few psi), PT-201 and PT-301 agree within 2 psi, PT-401 ≈ 0 behind the closed fire valve, PT-201 steady (not creeping toward the relief at 250).',
      why: 'With no flow there is no pressure drop anywhere, so every transducer on a connected volume must read the same. Disagreement now means a bad transducer. Pressure behind the closed fire valve means it leaks. A creeping outlet means a regulator seat leak.',
      check: v => { const s = v.stats('PT-201', 3);
        return near(v.ch('PT-201'), v.regSet, psi(5)) && near(v.ch('PT-201'), v.ch('PT-301'), psi(2)) && Math.abs(v.ch('PT-401')) < psi(2) && (!s || s.slope < psi(0.3)); },
      failMsg: 'One of: outlet not at setpoint, PT-201/PT-301 disagree, pressure behind SV-301, or outlet creeping.', focus: ['PR-101', 'SV-301'] },
    { kind: 'action', station: 'DAQ', title: 'Pre-fire load-cell tare (system pressurised)',
      text: 'Look at LC-501 now: it no longer reads zero, though nothing is firing. TARE LC again.',
      why: 'Pressurising the feed line to the thruster pushes on the thrust stand — pressure tare. The zero you took vented is not the zero you fire from. (Post-test analysis also subtracts a pre-fire baseline, as a second line of defence.)',
      check: v => { const t = lastEvent(v, e => e.tare); return !!t && t.t > (lastEvent(v, e => e.cat === 'CMD' && /setpoint/.test(e.text))?.t ?? Infinity) && near(v.ch('LC-501'), 0, 0.03); },
      focus: ['LC-501'] },
  ] };
}

export function pollSection(sec = 'I', { text, why } = {}) {
  return { id: sec, title: 'Go / no-go', steps: [
    { kind: 'poll', station: 'TC', title: 'Go/no-go poll',
      text: text || 'Console ▸ FIRE CONTROL ▸ POLL. Each station reports; you make the call. NO-GO is always an acceptable answer.',
      why: why || 'Every station confirms from its own data that the stand is ready. Its value is in the NO-GO it can produce: a problem caught before firing costs minutes; after, it costs hardware.' },
  ] };
}

/* Safing after the last firing. `done` gates the steps so they do not tick
   themselves off at the start, when the stand is safe already. */
export function safeStand(def, sec = 'L', done = fired) {
  const R = def.ratings;
  return { id: sec, title: 'Safe the stand', steps: [
    { gate: done, kind: 'action', station: 'PROP', title: 'PR-101 setpoint → 0', text: 'Dome vented; regulator shuts.',
      why: 'Shut off the source of low-side pressure first.', check: v => v.regSet === 0 },
    { gate: done, kind: 'action', station: 'PROP', title: 'Close IV-101', text: 'Supply isolated. Confirm ZSC.',
      why: 'Isolate the stored energy from the test system.', check: v => v.ch('IV-101-ZSC') === 1 },
    { gate: done, kind: 'action', station: 'PROP', title: 'Open vents VV-201 and VV-101',
      text: 'Vent the low side and the high side. Watch PT-102: the gas trapped between IV-101 and the shut regulator only leaves through VV-101.',
      why: 'Every section must be vented through its own path. A trapped volume is the classic way to be surprised by pressure in a system you thought was safe.',
      check: v => v.cmd('VV-201') === 1 && v.cmd('VV-101') === 1 },
    { kind: 'verify', station: 'PROP', title: 'Verify the test system is vented',
      text: 'PT-102, PT-201, PT-301, PT-401 all below 3 psig. (PT-101 still reads bottle pressure: the bottle is still open.)',
      why: 'Vented means verified vented, on every section, before anyone opens the door.',
      check: v => LP_PTS.every(id => v.ch(id) < R.VENTED) },
  ] };
}

export function returnSafe(def, sec = 'M', done = fired) {
  const R = def.ratings;
  return { id: sec, title: 'Return to safe / open the cell', steps: [
    { kind: 'action', station: 'SAF', title: 'Enter the cell', text: 'FACILITY ▸ Enter cell.',
      why: 'Only now: disarmed, vented, verified.', check: v => v.facility.area === 'OPEN' && done(v) },
    { kind: 'action', station: 'PROP', title: 'Technician: close HV-100', text: 'Close the bottle.',
      why: 'Stored gas stays in the bottle overnight, not in the lines.', check: v => v.cmd('HV-100') === 0 && done(v) },
    { kind: 'action', station: 'PROP', title: 'Bleed the supply section',
      text: 'The section between HV-100 and IV-101 still holds bottle pressure (PT-101). With VV-101 open, open IV-101 until PT-101 < 3 psig, then close IV-101.',
      why: 'Closing the bottle does not vent the pipe after it. Another trapped volume.',
      check: v => v.ch('PT-101') < R.VENTED && v.cmd('HV-100') === 0 && v.cmd('IV-101') === 0 && done(v), focus: ['IV-101', 'VV-101'] },
  ] };
}

export const inspectStep = () => ({ kind: 'action', station: 'PROP', title: 'Technician: post-test visual inspection',
  text: 'FACILITY ▸ Technician ▸ Inspect article.', why: 'Hardware condition is data too. Look before anything is disturbed.',
  check: v => v.has(e => e.cat === 'TECH' && e.text.startsWith('Post-test visual')) });

export const reportStep = () => ({ kind: 'action', station: 'TC', title: 'File the test report',
  text: 'NOTEBOOK ▸ a run of this test ▸ write the result and any anomalies ▸ File report.',
  why: 'A test that is not written up did not happen. Somebody will need to know, in a year, what was done and what was seen.',
  check: v => [...v.flags].some(f => f.startsWith('report:')) });

/* The steps of one firing within a series: set the point, confirm lock-up
   and re-tare, then record-arm-fire, and check the run. `match(run)` says
   which recorded run belongs to this point. */
export function firingPoint(def, { label, regSet, planText, match, sec }) {
  return [
    { kind: 'action', station: 'PROP', title: `${label}: PR-101 → ${fmt(regSet, 'pressure', 0)} psig, locked up`,
      text: 'Command the setpoint, wait for PT-201 to lock up, and look at PT-301 and PT-401 before you go on.',
      why: 'Every point starts from a verified static condition — the same checks as before the first firing, faster.',
      check: v => near(v.regSet, regSet, psi(1)) && near(v.ch('PT-201'), regSet, psi(5)) && Math.abs(v.ch('PT-401')) < psi(2) },
    { kind: 'action', station: 'DAQ', title: `${label}: re-tare LC-501 at this pressure`,
      text: 'The pressure tare changes with feed pressure; re-tare before each point.',
      why: 'A thrust sweep against pressure with a pressure-dependent zero error would put a false slope into the result.',
      check: v => { const t = lastEvent(v, e => e.tare); const sp = lastEvent(v, e => e.cat === 'CMD' && /setpoint/.test(e.text));
        return !!t && !!sp && t.t > sp.t && near(v.regSet, regSet, psi(1)); } },
    { kind: 'action', station: 'TC', title: `${label}: record, arm, fire — ${planText}`,
      text: 'Load the plan, start recording, arm, FIRE. The run appears in ANALYSIS when recording stops.',
      why: 'One firing, one file, one row in the campaign table.',
      check: v => runsWhere(v, match).length > 0 },
  ];
}
