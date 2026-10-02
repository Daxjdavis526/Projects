/* Test-stand sound, all synthesised: valve clicks, the pneumatic actuator,
   relay clacks, alarm tones meant to be noticed without being arcade-like —
   and the cell itself, driven by what is physically happening in it
   (cellState, sim/visual.js):

     roar       band-limited noise, as loud as the jet's acoustic power
                (½·ṁ·U², of which a rocket radiates ~0.5 % as sound), its
                balance set by the jet-noise peak frequency ~0.2·U/D — a
                small jet hisses, a big one rumbles
     crackle    the impulsive crackle of a supersonic jet
     chug       a tone at the chamber's chug frequency, as strong as the chug
     screech    a tone at the acoustic mode, as strong as the screech
     whine      a turbopump at its shaft frequency, the inducer's 3× and the
                impeller's 6× blade passing; cavitation crackle; bearing
                grind
     gas, water the turbine exhaust, the vent stack, water into the catch
                tank

   Where you listen from matters. In the console the cell microphone comes
   through a speaker (band-limited); on a cell camera it is full range; on
   the bunker's long lens it arrives late (sound covers 343 m a second) and
   without its top end. */

const clamp01 = x => Math.max(0, Math.min(1, x));

export class Audio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.6;
    this.listener = { mode: 'console', dist: 0 };
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
    // crackle: sparse, sharp, asymmetric impulses
    const cb = ctx.createBuffer(1, len, ctx.sampleRate), cd = cb.getChannelData(0);
    for (let i = 0; i < len; i++) if (Math.random() < 0.0016) { const a = (0.4 + Math.random() * 0.6) * (Math.random() < 0.8 ? 1 : -1); for (let k = 0; k < 24 && i + k < len; k++) cd[i + k] += a * Math.exp(-k / 3) * (k % 2 ? -0.6 : 1); }
    // the cell field: everything the cell microphone hears, through the
    // listening point (filter, delay, level)
    this.fieldIn = ctx.createGain();
    this.fieldHP = ctx.createBiquadFilter(); this.fieldHP.type = 'highpass'; this.fieldHP.frequency.value = 20;
    this.fieldLP = ctx.createBiquadFilter(); this.fieldLP.type = 'lowpass'; this.fieldLP.frequency.value = 7000; this.fieldLP.Q.value = 0.5;
    this.fieldDelay = ctx.createDelay(1.0); this.fieldDelay.delayTime.value = 0;
    this.fieldOut = ctx.createGain(); this.fieldOut.gain.value = 0.7;
    this.fieldIn.connect(this.fieldHP); this.fieldHP.connect(this.fieldLP); this.fieldLP.connect(this.fieldDelay); this.fieldDelay.connect(this.fieldOut); this.fieldOut.connect(this.master);
    const loop = (b, filterType, freq, q) => {
      const src = ctx.createBufferSource(); src.buffer = b; src.loop = true;
      src.loopStart = 0; src.playbackRate.value = 0.97 + Math.random() * 0.06;
      const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(this.fieldIn); src.start(0, Math.random() * 1.5);
      g.f = f;
      return g;
    };
    const tone = (type, freq, lp) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
      const g = ctx.createGain(); g.gain.value = 0;
      if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); f.connect(g); } else o.connect(g);
      g.connect(this.fieldIn); o.start();
      g.o = o;
      return g;
    };
    this.v = {
      roarLow: loop(buf, 'lowpass', 150, 0.8),
      roarMid: loop(buf, 'bandpass', 650, 0.6),
      roarHi: loop(buf, 'highpass', 2600, 0.5),
      hiss: loop(buf, 'bandpass', 4200, 0.7),
      crackle: loop(cb, 'highpass', 500, 0.5),
      chug: tone('sawtooth', 110, 600),
      screech: tone('sine', 3300),
      shaft: tone('sine', 100),
      ind: tone('sine', 300),
      blade: tone('triangle', 600, 9000),
      cav: loop(buf, 'bandpass', 3200, 0.9),
      grind: loop(buf, 'bandpass', 420, 4),
      gas: loop(buf, 'bandpass', 1400, 0.45),
      water: loop(buf, 'lowpass', 1100, 0.6),
      vent: loop(buf, 'highpass', 2600, 0.5),
    };
    this.setListener(this.listener.mode, this.listener.dist);
    return ctx;
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.ctx) this.master.gain.setTargetAtTime(on ? this.volume : 0, this.ctx.currentTime, 0.05);
  }

  /* 'console' (the cell mic on a control-room speaker), 'camera' (full
     range, at the camera), 'far' (dist metres away: late and dull). */
  setListener(mode, dist = 0) {
    this.listener = { mode, dist };
    if (!this.ctx) return;
    const t = this.ctx.currentTime, set = (p, v) => p.setTargetAtTime(v, t, 0.08);
    if (mode === 'camera') { set(this.fieldHP.frequency, 20); set(this.fieldLP.frequency, 18000); set(this.fieldOut.gain, 1.0); this.fieldDelay.delayTime.setValueAtTime(0, t); }
    else if (mode === 'far') { set(this.fieldHP.frequency, 20); set(this.fieldLP.frequency, 2800); set(this.fieldOut.gain, 0.6); this.fieldDelay.delayTime.setValueAtTime(Math.min(0.9, dist / 343), t); }
    else { set(this.fieldHP.frequency, 140); set(this.fieldLP.frequency, 6500); set(this.fieldOut.gain, 0.7); this.fieldDelay.delayTime.setValueAtTime(0, t); }
  }

  /* Per frame: the cell, from its visual/acoustic state. */
  cell(st) {
    if (!this.ctx || !this.enabled) return;
    if (!st) { for (const g of Object.values(this.v)) g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05); return; }
    const t = this.ctx.currentTime, v = this.v, s = st.sound, j = st.jet;
    const set = (g, x, tc = 0.03) => g.gain.setTargetAtTime(x, t, tc);
    const P = s.jetPower;
    const Lw = P > 1 ? 10 * Math.log10(0.005 * P / 1e-12) : 0;
    const loud = clamp01((Lw - 100) / 58);
    const lit = !!j?.lit;
    const fp = j && j.Uj > 0 ? Math.max(80, Math.min(16000, 0.2 * j.Uj / Math.max(1e-3, j.Dj))) : 1000;
    const hi = clamp01(Math.log10(fp / 300) / 2);
    // separation makes the low end lurch
    const sep = s.sep ? 0.6 + 0.8 * Math.random() : 1;
    set(v.roarLow, loud * (lit ? 0.85 : 0.25) * (1 - 0.45 * hi) * sep, 0.02);
    set(v.roarMid, loud * (lit ? 0.5 : 0.3));
    set(v.roarHi, loud * (0.12 + 0.3 * hi));
    set(v.hiss, lit ? 0 : loud * 0.8);
    set(v.crackle, lit ? loud * 0.9 : loud * 0.15);
    v.chug.o.frequency.setTargetAtTime(s.chugF || 110, t, 0.05);
    set(v.chug, Math.min(0.5, (s.chug || 0) * 3));
    v.screech.o.frequency.setTargetAtTime((s.hfF || 3300) * (1 + 0.003 * (Math.random() - 0.5)), t, 0.01);
    set(v.screech, Math.min(0.32, (s.hf || 0) * 4));
    // turbopump
    const f1 = (s.rpm || 0) / 60, n = (s.rpm || 0) / 36000;
    v.shaft.o.frequency.setTargetAtTime(Math.max(1, f1), t, 0.02);
    v.ind.o.frequency.setTargetAtTime(Math.max(1, Math.min(19000, 3 * f1)), t, 0.02);
    v.blade.o.frequency.setTargetAtTime(Math.max(1, Math.min(19000, 6 * f1)), t, 0.02);
    set(v.shaft, Math.min(0.12, 0.1 * n * n));
    set(v.ind, Math.min(0.06, 0.05 * n * n));
    set(v.blade, Math.min(0.08, 0.07 * n * n));
    set(v.cav, (s.cav || 0) * Math.min(1, n * 1.2) * (0.25 + 0.75 * Math.random()) * 0.6, 0.01);
    set(v.grind, (s.grind || 0) * Math.min(1, n * 1.5) * 0.5);
    set(v.gas, Math.min(0.35, (s.gas || 0) * 9));
    set(v.water, Math.min(0.3, (s.liquid || 0) * 0.5));
    set(v.vent, Math.min(0.25, (s.vent || 0) * 25), 0.04);
  }

  _burst(dur, type, freq, q, gain, when = 0, out = this.master) {
    const ctx = this.ctx, t = ctx.currentTime + when;
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(out);
    src.start(t, Math.random()); src.stop(t + dur + 0.02);
  }
  _tone(freq, dur, gain, when = 0, type = 'sine', slide = null, out = this.master) {
    const ctx = this.ctx, t = ctx.currentTime + when;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
  }

  play(name, data = {}) {
    if (!this.enabled || !this.ensure()) return;
    const F = this.fieldIn;
    switch (name) {
      case 'valve':
        if (data.pneumatic) { this._burst(0.18, 'bandpass', 900, 0.8, 0.12); this._tone(90, 0.08, 0.25, 0.55); this._burst(0.02, 'highpass', 2000, 0.7, 0.2, 0.55); }
        else if (data.hand) break;
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
      // the cell: these go through the listening point
      case 'ignition': this._tone(75, 0.3, 0.5, 0, 'sine', 35, F); this._burst(0.25, 'lowpass', 500, 0.7, 0.5, 0, F); break;
      case 'hardstart': {
        const k = Math.min(3, (data.ratio || 1.5) - 1);
        this._burst(0.9, 'lowpass', 1800, 0.6, 0.9 + 0.3 * k, 0, F); this._tone(48, 0.7, 0.9, 0, 'sine', 25, F); this._burst(0.08, 'highpass', 1500, 0.5, 0.8, 0, F);
        break;
      }
      case 'shutdown': this._burst(0.12, 'bandpass', 700, 0.8, 0.35, 0, F); this._burst(0.6, 'bandpass', 1600, 0.6, 0.12, 0.05, F); break;
    }
  }
}
