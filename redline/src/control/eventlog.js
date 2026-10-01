/* The event log: every command, indication, alarm, sequence step and
   technician report, time-stamped in sim time. It is the test's paper trail,
   the source for the notebook, and what the procedure engine and debrief
   read to decide what the operator actually did. */
import { Emitter } from '../lib/emitter.js';

export const CATS = {
  CMD: 'Command',       // operator command sent
  IND: 'Indication',    // hardware state changed (limit switch, DAQ online)
  SEQ: 'Sequencer',
  ALM: 'Alarm',
  ABT: 'Abort',
  INT: 'Interlock',     // blocked or warned action
  TECH: 'Technician',   // in-cell work and reports
  FAC: 'Facility',
  DAQ: 'DAQ',
  PROC: 'Procedure',
  OPR: 'Operator note',
  SYS: 'System',
  SAF: 'Safety',        // a safety rule was broken (logged even if allowed)
};

export class EventLog extends Emitter {
  constructor() { super(); this.items = []; this.seq = 0; }
  add(t, cat, text, extra = {}) {
    const e = { n: ++this.seq, t, cat, text, level: extra.level || 'info', T: extra.T ?? null, ...extra };
    this.items.push(e);
    this.emit('event', e);
    return e;
  }
  since(n) { return this.items.filter(e => e.n > n); }
  find(pred) { return this.items.find(pred); }
  filter(pred) { return this.items.filter(pred); }
  has(pred) { return this.items.some(pred); }
}
