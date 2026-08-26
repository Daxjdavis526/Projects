/* ============================================================================
   audio.js — procedural ambient drone
   ----------------------------------------------------------------------------
   Three slow detuned voices through a lowpass, plus a whisper of filtered
   noise. The whole texture deepens and darkens as the scale grows: intimate
   near Earth, vast at the horizon. Starts only on user gesture; mutable.
   ========================================================================== */
import { clamp } from './scale.js';

export class Ambient {
  constructor() {
    this.ctx = null;
    this.on = false;
    this.master = null;
    this.filter = null;
    this.voices = [];
    this.swellGain = null;
  }
  _init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = 0;
    this.master.connect(c.destination);
    this.filter = c.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 260;
    this.filter.Q.value = 0.6;
    this.filter.connect(this.master);
    const freqs = [55, 82.41, 110.0];
    freqs.forEach((f, i) => {
      const o = c.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = (i - 1) * 4;
      const g = c.createGain();
      g.gain.value = [0.5, 0.3, 0.12][i];
      o.connect(g); g.connect(this.filter);
      o.start();
      // slow independent breathing
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.02 + i * 0.013;
      const lg = c.createGain(); lg.gain.value = [0.14, 0.1, 0.05][i];
      lfo.connect(lg); lg.connect(g.gain);
      lfo.start();
      this.voices.push({ o, g });
    });
    // airy noise
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    const nf = c.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 0.4;
    const ng = c.createGain(); ng.gain.value = 0.015;
    src.connect(nf); nf.connect(ng); ng.connect(this.master);
    src.start();
    // swell bus for flights
    this.swellGain = c.createGain();
    this.swellGain.gain.value = 0;
    const so = c.createOscillator();
    so.type = 'sine'; so.frequency.value = 164.8;
    so.connect(this.swellGain); this.swellGain.connect(this.filter);
    so.start();
  }
  toggle() {
    this._init();
    this.on = !this.on;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(this.on ? 0.16 : 0, this.ctx.currentTime, 1.2);
    return this.on;
  }
  swell() {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    this.swellGain.gain.cancelScheduledValues(t);
    this.swellGain.gain.setTargetAtTime(0.10, t, 1.6);
    this.swellGain.gain.setTargetAtTime(0, t + 2.4, 2.2);
  }
  update(ctx) {
    if (!this.ctx || !this.on) return;
    const n = clamp((ctx.logS - 6) / 21, 0, 1);
    const t = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(300 - 190 * n, t, 0.8);
    this.voices.forEach((v, i) => {
      const base = [55, 82.41, 110.0][i];
      v.o.frequency.setTargetAtTime(base * (1 - 0.35 * n), t, 1.5);
    });
  }
}
