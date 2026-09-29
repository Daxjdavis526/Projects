/* Test-stand sound, all synthesised: valve clicks, the pneumatic actuator,
   gas through the vent stack, the thruster jet, relay clacks, and alarm
   tones that are meant to be noticed without being arcade-like. The cell
   microphone hears the physical gas, so the jet and vent levels follow the
   true flow — a hiss where nothing should be flowing is evidence. */

export class Audio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.6;
  }

  ensure() {
    if (this.ctx || !this.enabled) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = this.volume; this.master.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    const loop = (filterType, freq, q) => {
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(this.master); src.start();
      return g;
    };
    this.jetHiss = loop('bandpass', 1800, 0.6);
    this.jetRumble = loop('lowpass', 160, 0.7);
    this.vent = loop('highpass', 2600, 0.5);
    return ctx;
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.ctx) this.master.gain.setTargetAtTime(on ? this.volume : 0, this.ctx.currentTime, 0.05);
  }

  /* per-frame continuous levels */
  flow({ thrust, vent }) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const k = Math.min(1, thrust / 8);
    this.jetHiss.gain.setTargetAtTime(0.32 * k, t, 0.012);
    this.jetRumble.gain.setTargetAtTime(0.5 * k, t, 0.02);
    this.vent.gain.setTargetAtTime(Math.min(0.25, vent * 25), t, 0.04);
  }

  _burst(dur, type, freq, q, gain, when = 0) {
    const ctx = this.ctx, t = ctx.currentTime + when;
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t, Math.random()); src.stop(t + dur + 0.02);
  }
  _tone(freq, dur, gain, when = 0, type = 'sine', slide = null) {
    const ctx = this.ctx, t = ctx.currentTime + when;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }

  play(name, data = {}) {
    if (!this.enabled || !this.ensure()) return;
    switch (name) {
      case 'valve':
        if (data.id === 'IV-101') { this._burst(0.18, 'bandpass', 900, 0.8, 0.12); this._tone(90, 0.08, 0.25, 0.55); this._burst(0.02, 'highpass', 2000, 0.7, 0.2, 0.55); }
        else if (data.id === 'HV-100') break;
        else { this._burst(0.012, 'bandpass', 3200, 1.2, 0.35); this._tone(140, 0.04, 0.18); }
        break;
      case 'arm': this._burst(0.015, 'bandpass', 1800, 1, 0.4); this._burst(0.015, 'bandpass', 1500, 1, 0.3, 0.05); break;
      case 'countdown': [0, 1, 2, 3, 4].forEach(i => this._tone(i === 4 ? 1320 : 880, 0.07, 0.05, i)); break;
      case 'alarm': {
        const lv = data.level;
        if (lv === 'redline') { for (let i = 0; i < 3; i++) { this._tone(1040, 0.14, 0.14, i * 0.3, 'triangle'); this._tone(780, 0.14, 0.14, i * 0.3 + 0.15, 'triangle'); } }
        else if (lv === 'warning') { this._tone(880, 0.16, 0.09, 0, 'triangle'); this._tone(660, 0.16, 0.09, 0.2, 'triangle'); }
        else { this._tone(660, 0.18, 0.06, 0, 'sine'); this._tone(880, 0.22, 0.05, 0.22, 'sine'); }
        break;
      }
      case 'abort': this._tone(700, 0.9, 0.12, 0, 'sawtooth', 220); break;
    }
  }
}
