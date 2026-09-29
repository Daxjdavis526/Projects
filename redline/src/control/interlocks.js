/* Interlocks and operating rules.

   Three kinds of consequence, and the choice between them is the point:

   · block  a hard interlock. The action does not happen. Some are hardware
            (the fire circuit physically cannot energise the fire valve unless
            armed; arming needs the cell door locked) and block in every mode.
   · warn   the operator is told why this is unwise and the action happens
            anyway, if they confirm.
   · allow  nothing stops it; the consequences arrive through the physics
            (a transducer zeroed under pressure reads low for the rest of the
            day) or through the safety record.

   Training rules tighten or loosen by mode: tutorial blocks what an
   independent test conductor would merely be trusted not to do. Rules that
   are about safety, not procedure, are logged as safety violations whenever
   they are not blocked. Harmless differences in order are not rules at all. */

import { psi } from '../lib/units.js';

const S = (tutorial, guided, independent) => ({ tutorial, guided, independent, fault: independent, sandbox: independent });
const ALL_BLOCK = S('block', 'block', 'block');

/* ctx is built by the controller: measured values, command states,
   facility and fire-circuit state. `a` is the action, `x` its arguments. */
export function standardInterlocks(def) {
  const R = def.ratings;
  const downstreamPTs = ['PT-102', 'PT-201', 'PT-301'];
  const maxDownstream = c => Math.max(...downstreamPTs.map(id => c.meas(id)).filter(Number.isFinite), -Infinity);
  return [
    { id: 'FIRE-ARM', on: ['fire'], sev: ALL_BLOCK,
      test: c => !c.armed,
      msg: 'Fire circuit not armed.',
      why: 'The fire valve is powered through the arming circuit. Unarmed, the sequencer has nothing to switch.' },
    { id: 'FIRE-ABORT', on: ['fire', 'arm'], sev: ALL_BLOCK,
      test: c => c.abortActive,
      msg: 'Abort in progress or not reset.',
      why: 'After an abort the stand must be brought to a known state and the abort reset before anything is re-armed.' },
    { id: 'FIRE-SEQ', on: ['fire'], sev: ALL_BLOCK,
      test: c => c.seqActive,
      msg: 'A firing sequence is already running.', why: '' },
    { id: 'ARM-AREA', on: ['arm'], sev: ALL_BLOCK,
      test: c => c.facility.area !== 'SECURED',
      msg: 'Test cell not secured.',
      why: 'The arming key is interlocked with the cell door. Nobody may be in the cell with the fire circuit live.' },
    { id: 'ARM-DAQ', on: ['arm'], sev: S('block', 'block', 'warn'),
      test: c => !c.daqOnline,
      msg: 'DAQ is not online.',
      why: 'Firing blind: no redline monitoring and no data. Stand rules require a live DAQ before arming.' },
    { id: 'ARM-POLL', on: ['arm'], sev: S('block', 'warn', 'allow'),
      test: c => !c.pollGo,
      msg: 'No GO from a go/no-go poll since the stand configuration last changed.',
      why: 'The poll is where every station confirms, from its own data, that the stand is ready. Arming without it skips the one step designed to catch what the conductor missed.' },
    { id: 'FIRE-REC', on: ['fire'], sev: S('block', 'warn', 'allow'),
      test: c => !c.recording,
      msg: 'DAQ is not recording.',
      why: 'The live display is not a record. Fire without recording and the firing produced no data.' },
    { id: 'FIRE-SETPOINT', on: ['fire'], sev: S('block', 'warn', 'allow'),
      test: c => c.regSet < psi(5),
      msg: 'Regulator setpoint is zero.',
      why: 'There is nothing to fire with. The firing will show a valve click and no chamber pressure.' },
    { id: 'ENTER-ARMED', on: ['enterCell'], sev: ALL_BLOCK,
      test: c => c.armed,
      msg: 'Fire circuit armed.', why: 'Disarm before anyone opens the cell door.' },
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
    { id: 'ZERO-PRESS', on: ['zero'], sev: S('block', 'warn', 'allow'),
      test: (c, x) => (x.ids || c.zeroableIds).some(id => id.startsWith('PT') && Math.abs(c.meas(id)) > psi(5)),
      msg: 'One or more transducers read above 5 psig.',
      why: 'A zero must be taken with the true pressure at zero. Zero a pressurised transducer and it will read low by that pressure until re-zeroed.' },
    { id: 'TARE-PRESS', on: ['tare'], sev: S('warn', 'allow', 'allow'),
      test: c => c.seqActive,
      msg: 'Taring during a firing sequence.', why: 'The tare will include thrust.' },
    { id: 'TECH-AREA', on: ['tech'], sev: ALL_BLOCK,
      test: c => c.facility.area !== 'OPEN',
      msg: 'The cell is not open to personnel.',
      why: 'Technician work happens in the cell. Enter the cell first — which means safing anything hazardous.' },
    { id: 'DAQ-RATE', on: ['daqRate'], sev: ALL_BLOCK,
      test: c => c.recording, msg: 'Cannot change sample rate while recording.', why: '' },
    { id: 'DAQ-OFF-ARMED', on: ['daqPower'], sev: S('block', 'block', 'warn'),
      test: (c, x) => !x.on && (c.armed || c.seqActive), msg: 'Powering off the DAQ while armed.',
      why: 'That removes redline monitoring.' },
  ];
}

export function evaluate(rules, mode, ctx, action, args) {
  const hits = [];
  for (const r of rules) {
    if (!r.on.includes(action)) continue;
    let violated = false;
    try { violated = r.test(ctx, args); } catch { violated = false; }
    if (!violated) continue;
    hits.push({ rule: r, sev: r.sev[mode] || 'allow' });
  }
  // Report the most severe; among blocks, a hard interlock (one that blocks
  // in every mode) outranks a training rule.
  const order = { block: 3, warn: 2, allow: 1 };
  const rank = h => order[h.sev] * 2 + (h.rule.sev.independent === 'block' ? 1 : 0);
  hits.sort((a, b) => rank(b) - rank(a));
  return hits;
}
