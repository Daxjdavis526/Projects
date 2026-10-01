/* Limit checking, on MEASURED values only — the redline system can no more
   see the true state than the operator can. A failed transducer can trip a
   real redline, and a real problem can hide behind a healthy-looking one.

   Alarms latch: once tripped, an alarm stays in the list until the operator
   acknowledges it, even if the value has returned to normal ("RTN"), so a
   one-second excursion during a firing is not missed because nobody was
   looking at that moment. */

import { Emitter } from '../lib/emitter.js';
import { fmt, fmtT } from '../lib/units.js';

export const LEVELS = { caution: 1, warning: 2, redline: 3 };

export class Alarms extends Emitter {
  constructor(session) {
    super();
    this.s = session;
    const def = session.def;
    this.limits = def.limits.map(l => ({ ...l, since: null }));
    this.list = [];                 // alarms in display order (newest first)
    this.byId = new Map();
    this.health = new Map();        // per-channel staleness tracker
    this.indications = (def.indications || []).map(i => ({ ...i }));
    this.discPrev = new Map();
  }

  _raise(id, level, text, extra = {}) {
    let a = this.byId.get(id);
    const t = this.s.t;
    if (a && a.active) return a;
    if (a) {
      a.active = true; a.acked = false; a.t = t; a.count++; a.value = extra.value;
      this.list.splice(this.list.indexOf(a), 1); this.list.unshift(a);
    } else {
      a = { id, level, text, t, T: this.s.controller.testTime(), active: true, acked: false, count: 1, ...extra };
      this.byId.set(id, a);
      this.list.unshift(a);
    }
    const ch = extra.channel ? ` ${extra.channel} = ${fmt(extra.value, this.s.daq.channel(extra.channel)?.quantity)}` : '';
    this.s.log.add(t, 'ALM', `${level.toUpperCase()}: ${text}${ch}`, { level, alarm: id, T: this.s.controller.testTime() });
    this.s.audio('alarm', { level });
    this.emit('raise', a);
    return a;
  }

  _clear(id) {
    const a = this.byId.get(id);
    if (a && a.active) { a.active = false; a.tRtn = this.s.t; this.emit('rtn', a); }
  }

  ack(id) {
    const a = this.byId.get(id);
    if (!a) return;
    a.acked = true;
    if (!a.active) { this.list.splice(this.list.indexOf(a), 1); this.byId.delete(id); }
    this.emit('ack', a);
  }
  ackAll() { for (const a of [...this.list]) this.ack(a.id); }

  get master() {
    let lvl = 0;
    for (const a of this.list) if (!a.acked) lvl = Math.max(lvl, LEVELS[a.level]);
    return lvl;
  }

  evaluate(ctx) {
    const s = this.s, daq = s.daq, t = s.t;
    if (!daq.online) {
      if (ctx.armed || ctx.seqActive) this._raise('DAQ-OFFLINE', 'warning', 'DAQ offline while armed — no redline monitoring');
      return;
    }
    this._clear('DAQ-OFFLINE');
    for (const L of this.limits) {
      let active = true;
      if (L.when) { try { active = !!L.when(ctx); } catch { active = false; } }
      const v = daq.latest(L.channel);
      if (!active || Number.isNaN(v)) { L.since = null; if (this.byId.get(L.id)?.active) this._clear(L.id); continue; }
      const hi = typeof L.hi === 'function' ? L.hi(ctx) : L.hi;
      const lo = typeof L.lo === 'function' ? L.lo(ctx) : L.lo;
      const over = (hi !== undefined && v > hi) || (lo !== undefined && v < lo);
      if (over) {
        if (L.since === null) L.since = t;
        if (t - L.since >= (L.persist ?? 0)) {
          const a = this._raise(L.id, L.level, L.text, { channel: L.channel, value: v, limit: v > (hi ?? Infinity) ? hi : lo });
          if (L.action === 'abort' && !a.aborted && !(s.controller.abort && !s.controller.abort.reset)) {
            a.aborted = true;
            s.controller.triggerAbort(`${L.text} (${L.channel} ${fmt(v, daq.channel(L.channel).quantity)})`, 'auto',
                                      { limit: L.id, channel: L.channel, value: v });
          }
        }
      } else {
        L.since = null;
        const a = this.byId.get(L.id);
        if (a?.active) { this._clear(L.id); a.aborted = false; }
      }
    }
    // valve position disagree: command vs limit switches
    for (const ind of this.indications) {
      const c = s.controller.cmd[ind.valve];
      const zso = daq.latest(ind.zso), zsc = daq.latest(ind.zsc);
      const agrees = c ? zso === 1 && zsc === 0 : zsc === 1 && zso === 0;
      const key = 'DISAGREE-' + ind.valve;
      if (!agrees) {
        ind.since ??= t;
        if (t - ind.since > ind.timeout) this._raise(key, 'caution', `${ind.valve} position disagrees with command (${c ? 'OPEN' : 'CLOSED'} commanded)`);
      } else { ind.since = null; this._clear(key); }
      // log indication transitions like an HMI event list
      const k = zso * 2 + zsc, prev = this.discPrev.get(ind.valve);
      if (prev !== undefined && prev !== k) {
        const txt = zso === 1 ? 'OPEN' : zsc === 1 ? 'CLOSED' : 'TRAVEL';
        s.log.add(t, 'IND', `${ind.valve} indicates ${txt}`, { T: s.controller.testTime() });
      }
      this.discPrev.set(ind.valve, k);
    }
    // channel health: stale (identical samples) or dropping out
    for (const ch of daq.channels) {
      if (ch.kind !== 'analog') continue;
      const v = daq.latest(ch.id);
      let h = this.health.get(ch.id);
      if (!h) { h = { v, since: t, nan: 0 }; this.health.set(ch.id, h); }
      if (Number.isNaN(v)) { h.nan++; if (h.nan > 3) this._raise('DAQ-' + ch.id, 'caution', `${ch.id} signal dropout`); continue; }
      h.nan = 0;
      if (v !== h.v) { h.v = v; h.since = t; this._clear('STALE-' + ch.id); this._clear('DAQ-' + ch.id); }
      else if (t - h.since > 2.0) this._raise('STALE-' + ch.id, 'caution', `${ch.id} not updating (flat-lined)`);
    }
  }

  describe(a) {
    return `${fmtT(a.T)} ${a.level} ${a.text}`;
  }
}
