/* The data acquisition system.

   It owns the sensors, converts them at a fixed internal rate (10 kHz — the
   "analogue front end"), and produces samples at the operator's chosen rate,
   each through an anti-alias filter with its corner at 35 % of that rate.
   Pick 100 Hz and a 3 ms valve transient is smeared into a slope; pick
   5 kHz and you see the valve's current dip and the stand ringing — and
   more noise, because noise bandwidth grows with sample rate.

   Every sample goes to the live store (what the strip charts draw). When
   recording is on, samples also go to a Run — the file a test engineer
   analyses afterwards. A firing without recording is a firing without data.

   Command channels record what the controller asked for; derived channels
   are computed from other measured channels, at sample time, exactly as a
   real DAQ's calculated channels are. */

import { Sensor } from './sensor.js';
import { LiveStore, RunData } from './store.js';
import { Emitter } from '../lib/emitter.js';

const INTERNAL_DT = 1e-4;

export const DAQ_RATES = [100, 250, 500, 1000, 2000, 5000];

export class DAQ extends Emitter {
  constructor(def, model, rng, commandState) {
    super();
    this.def = def;
    this.model = model;
    this.sensors = def.sensors.map(s => new Sensor(s, model.signal(s.signal), rng));
    this.sensorById = new Map(this.sensors.map(s => [s.id, s]));
    const chans = [];
    for (const s of this.sensors) {
      chans.push({ id: s.id, desc: s.spec.desc, quantity: s.quantity, gauge: s.spec.gauge,
                   kind: s.discrete ? 'discrete' : 'analog', sensor: s, range: s.range, sensorKind: s.kind });
    }
    for (const c of def.channels.commands) {
      // most commands are open/close; a positioner's is a fraction (quantity 'ratio')
      chans.push({ id: c.id, desc: c.desc, quantity: c.quantity || 'discrete', kind: 'command',
                   get: c.quantity ? () => commandState(c.target) ?? 0 : () => (commandState(c.target) ? 1 : 0), range: [0, 1] });
    }
    const g = model.gas, nom = def.nominal;
    const k = { Pamb: def.physics.ambient.P, R: g.R, fChoke: g.fChoke,
                CdAt: nom.Cd * Math.PI / 4 * nom.throatDia ** 2 };
    for (const d of def.channels.derived) {
      chans.push({ id: d.id, desc: d.desc, quantity: d.quantity, gauge: d.gauge, kind: 'derived',
                   inputs: d.inputs, fn: d.fn, k, range: null });
    }
    this.channels = chans;
    this.chById = new Map(chans.map((c, i) => [c.id, { ...c, index: i }]));
    for (const c of chans) c.index = this.chById.get(c.id).index;
    for (const c of chans) if (c.inputs) c.inIdx = c.inputs.map(id => this.chById.get(id).index);
    this.ids = chans.map(c => c.id);
    this.vals = new Float32Array(chans.length).fill(NaN);
    this.rate = 1000;
    this.store = new LiveStore(this.ids, this.rate);
    this.powered = false;
    this.bootAt = null;
    this.online = false;
    this.recording = null;
    this.maxRecord = 600;
    this.tNextInt = 0;
    this.tNextSample = 0;
    this.sampleCount = 0;
    this.channelEnabled = new Set(this.ids);   // DAQ configuration: channels in the test file
  }

  channel(id) { return this.chById.get(id); }
  sensor(id) { return this.sensorById.get(id); }
  get fc() { return 0.35 * this.rate; }
  get noiseBw() { return Math.min(2.3, Math.max(0.35, Math.sqrt(this.rate / 1000))); }

  power(on, t) {
    if (on === this.powered) return;
    this.powered = on;
    if (on) { this.bootAt = t + 4.0; this.online = false; this.emit('power', { on, t }); }
    else {
      this.online = false; this.bootAt = null;
      if (this.recording) this.stopRecording(t, 'DAQ powered off');
      this.vals.fill(NaN);
      this.emit('power', { on, t });
    }
  }

  setRate(rate) {
    if (this.recording) return false;
    this.rate = rate;
    this.store.setRate(rate);
    for (const s of this.sensors) s.resetAverages();
    this.tNextSample = 0;
    return true;
  }

  startRecording(t, meta = {}) {
    if (!this.online || this.recording) return null;
    this.recording = { run: new RunData(this.ids, this.rate), start: t, meta,
                       channels: [...this.channelEnabled] };
    this.emit('record', { on: true, t });
    return this.recording;
  }

  stopRecording(t, reason = '') {
    if (!this.recording) return null;
    const rec = this.recording;
    this.recording = null;
    rec.run.finalize();
    rec.stop = t;
    rec.reason = reason;
    this.emit('record', { on: false, t, rec });
    return rec;
  }

  /* Called after every physics sub-step with the model time. */
  tick(t) {
    if (this.powered && !this.online && t >= this.bootAt) {
      this.online = true;
      this.tNextSample = t;
      this.emit('online', { t });
    }
    while (this.tNextInt <= t) {
      const ti = this.tNextInt;
      const fc = this.fc;
      for (let i = 0; i < this.sensors.length; i++) this.sensors[i].update(ti, INTERNAL_DT, fc);
      this.tNextInt = ti + INTERNAL_DT;
      if (this.online && ti >= this.tNextSample) {
        this._sample(ti);
        this.tNextSample += 1 / this.rate;
        if (this.tNextSample < ti) this.tNextSample = ti + 1 / this.rate;
      }
    }
  }

  _sample(t) {
    const v = this.vals, chans = this.channels, bw = this.noiseBw;
    for (let i = 0; i < chans.length; i++) {
      const c = chans[i];
      if (c.sensor) v[i] = c.sensor.sample(t, bw);
      else if (c.get) v[i] = c.get();
    }
    for (let i = 0; i < chans.length; i++) {
      const c = chans[i];
      if (c.fn) {
        const ins = c.inIdx.map(k => v[k]);
        v[i] = ins.some(Number.isNaN) ? NaN : c.fn(ins, c.k);
      }
    }
    this.store.push(t, v);
    if (this.recording) {
      this.recording.run.push(t, v);
      if (t - this.recording.start > this.maxRecord) this.stopRecording(t, 'maximum record length');
    }
    this.sampleCount++;
  }

  latest(id) {
    if (!this.online) return NaN;
    const c = this.chById.get(id);
    return c ? this.vals[c.index] : NaN;
  }

  /* Zero the named sensors (all zeroable ones if none given). Returns
     [{id, removed}] for the log. */
  zero(ids) {
    const out = [];
    for (const s of this.sensors) {
      if (ids && !ids.includes(s.id)) continue;
      if (!s.zeroable) continue;
      const r = s.zero();
      if (r !== null) out.push({ id: s.id, removed: r, quantity: s.quantity });
    }
    return out;
  }
}

/* The channel list a stand's DAQ will produce, without building a DAQ —
   for looking at recorded runs when no session is running. */
export function channelList(def) {
  return [
    ...def.sensors.map(s => ({ id: s.id, desc: s.desc, quantity: s.quantity, gauge: s.gauge, kind: s.quantity === 'discrete' ? 'discrete' : 'analog' })),
    ...def.channels.commands.map(c => ({ id: c.id, desc: c.desc, quantity: 'discrete', kind: 'command' })),
    ...def.channels.derived.map(d => ({ id: d.id, desc: d.desc, quantity: d.quantity, gauge: d.gauge, kind: 'derived' })),
  ];
}
