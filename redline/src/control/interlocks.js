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

export const S = (tutorial, guided, independent) => ({ tutorial, guided, independent, fault: independent, sandbox: independent });
export const ALL_BLOCK = S('block', 'block', 'block');

/* ctx is built by the controller: measured values, command states,
   facility and fire-circuit state. `a` is the action, `x` its arguments. */
export function standardInterlocks(def) {
  return [...genericInterlocks(), ...(def.interlocks ? def.interlocks(def) : [])];
}

/* Rules every stand has: the fire circuit, the cell, the DAQ, zeroing. The
   rules about a particular stand's plumbing live with that stand. */
function genericInterlocks() {
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
    { id: 'ENTER-ARMED', on: ['enterCell'], sev: ALL_BLOCK,
      test: c => c.armed,
      msg: 'Fire circuit armed.', why: 'Disarm before anyone opens the cell door.' },
    { id: 'ZERO-PRESS', on: ['zero'], sev: S('block', 'warn', 'allow'),
      // "pressurised" relative to each transducer's range: a 5000 psi
      // transducer's ordinary zero offset is several psi
      test: (c, x) => (x.ids || c.zeroableIds).some(id => id.startsWith('PT') && Math.abs(c.meas(id)) > Math.max(psi(5), 0.01 * c.fs(id))),
      msg: 'One or more transducers read well above zero.',
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
