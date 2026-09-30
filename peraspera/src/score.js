// The soundtrack player. Everything here is synthesised with WebAudio at the
// moment it is needed — a felt piano, pads, strings, a cello, bells, plucks,
// drums, and some forty kinds of sound effect — from the event list that
// music.js composes. The film's clock reads this AudioContext, so picture and
// sound stay locked together.

import { mtof, hash, clamp } from './kit.js';
import { SCORE } from './music.js';
import { thrustC6, C6_BURN } from './data.js';

const LOOKAHEAD = 0.35;

export class Score {
  // ac: pass an OfflineAudioContext to render without a speaker (tools/audio.html)
  constructor(context = null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ac = context || new AC({ latencyHint: 'playback' });
    const ac = this.ac;
    this.muted = false;
    this.running = false;
    this.volume = ac.createGain();
    this.volume.gain.value = 0.5;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    // a fast limiter after the glue compressor, for the ignitions
    const lim = ac.createDynamicsCompressor();
    lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.1;
    this.volume.connect(comp).connect(lim).connect(ac.destination);
    this.noise = { white: this.makeNoise('white'), pink: this.makeNoise('pink'), brown: this.makeNoise('brown') };
    this.ir = this.makeImpulse(3.2, 2.6);
    this.shaper = this.makeShaper(2.2);
    this.session = null;
  }

  // ─── clock ──────────────────────────────────────────────────────────────

  filmTime() { return this.T0 + (this.ac.currentTime - this.A0); }
  at(t) { return Math.max(this.ac.currentTime + 0.005, this.A0 + (t - this.T0)); }

  setMuted(m) {
    this.muted = m;
    this.volume.gain.setTargetAtTime(m ? 0 : 0.5, this.ac.currentTime, 0.05);
  }

  start(T) {
    this.stop();
    const ac = this.ac;
    if (ac.state !== 'running' && !ac.startRendering) ac.resume();
    const s = { out: ac.createGain(), wet: ac.createGain(), conv: ac.createConvolver(), beds: new Set() };
    s.conv.buffer = this.ir;
    s.wet.connect(s.conv).connect(s.out);
    s.out.connect(this.volume);
    this.session = s;
    this.T0 = T;
    this.A0 = ac.currentTime + 0.08;
    const { notes, sfx } = SCORE;
    // anything already sounding at T joins in from where it would be
    this.ni = lowerBound(notes, T);
    for (let i = lowerBound(notes, T - 12); i < this.ni; i++) {
      const e = notes[i];
      if (e.t + e.d > T + 0.4 && (e.v === 'pad' || e.v === 'strings' || e.v === 'drone' || e.v === 'cello')) this.note({ ...e, d: e.t + e.d - T, att: 0.4 }, this.at(T));
    }
    this.xi = lowerBound(sfx, T);
    for (let i = lowerBound(sfx, T - 45); i < this.xi; i++) {
      const e = sfx[i];
      if (e.dur && e.t + e.dur > T + 0.5) this.effect(e, this.at(T), T - e.t);
    }
    this.running = true;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 40);
    this.tick();
  }

  // Offline: schedule everything in [T, T + dur) at once, starting at audio time 0.
  renderRange(T, dur) {
    this.start(T);
    clearInterval(this.timer);
    this.A0 = 0;
    const { notes, sfx, beds } = SCORE;
    const end = T + dur;
    while (this.ni < notes.length && notes[this.ni].t < end) { const e = notes[this.ni++]; this.note(e, this.at(e.t)); }
    while (this.xi < sfx.length && sfx[this.xi].t < end) { const e = sfx[this.xi++]; this.effect(e, this.at(e.t), 0); }
    beds.forEach((b) => { if (b.a < end && b.b > T) this.bed(b, Math.max(T, b.a)); });
  }

  stop() {
    clearInterval(this.timer);
    this.running = false;
    const s = this.session;
    if (s) {
      const now = this.ac.currentTime;
      s.out.gain.setTargetAtTime(0, now, 0.03);
      setTimeout(() => s.out.disconnect(), 250);
    }
    this.session = null;
  }

  tick() {
    if (!this.session) return;
    const now = this.filmTime();
    const horizon = now + LOOKAHEAD;
    const { notes, sfx, beds } = SCORE;
    while (this.ni < notes.length && notes[this.ni].t < horizon) { const e = notes[this.ni++]; this.note(e, this.at(e.t)); }
    while (this.xi < sfx.length && sfx[this.xi].t < horizon) { const e = sfx[this.xi++]; this.effect(e, this.at(e.t), 0); }
    beds.forEach((b, i) => {
      if (this.session.beds.has(i) || b.a > horizon || b.b < now) return;
      this.session.beds.add(i);
      this.bed(b, Math.max(now, b.a));
    });
  }

  // ─── building blocks ───────────────────────────────────────────────────

  makeNoise(kind) {
    const ac = this.ac, n = ac.sampleRate * 3;
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w * 0.5;
      else if (kind === 'pink') { b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0527; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12; }
      else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    }
    return buf;
  }
  makeImpulse(len, decay) {
    const ac = this.ac, n = Math.floor(ac.sampleRate * len);
    const buf = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay) * (i < 200 ? i / 200 : 1);
    }
    return buf;
  }
  makeShaper(k) {
    const n = 1024, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(k * x) / Math.tanh(k); }
    return curve;
  }
  osc(type, f, t, stop) {
    const o = this.ac.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f, t);
    o.start(t); o.stop(stop);
    return o;
  }
  src(kind, t, stop, rate = 1) {
    const s = this.ac.createBufferSource();
    s.buffer = this.noise[kind]; s.loop = true; s.playbackRate.value = rate;
    s.start(t, Math.random() * 2.5); s.stop(stop);
    return s;
  }
  filter(type, f, q = 0.7) {
    const b = this.ac.createBiquadFilter();
    b.type = type; b.frequency.value = f; b.Q.value = q;
    return b;
  }
  gain(v = 0) { const g = this.ac.createGain(); g.gain.value = v; return g; }
  // Route a node to the session: dry, plus a reverb send.
  out(node, wet = 0.3, pan = 0) {
    const s = this.session;
    let n = node;
    if (pan) { const p = this.ac.createStereoPanner(); p.pan.value = pan; n.connect(p); n = p; }
    n.connect(s.out);
    if (wet > 0) { const w = this.gain(wet); n.connect(w); w.connect(s.wet); }
  }
  // attack → hold → release envelope on a gain param
  env(p, t, peak, att, dur, rel) {
    p.setValueAtTime(0, t);
    p.linearRampToValueAtTime(peak, t + att);
    p.setValueAtTime(peak, t + Math.max(att, dur));
    p.linearRampToValueAtTime(0, t + Math.max(att, dur) + rel);
  }

  // ─── instruments ───────────────────────────────────────────────────────

  note(e, t) {
    if (!this.session) return;
    const f = mtof(e.m), g = e.g;
    const ac = this.ac;
    switch (e.v) {
      case 'piano': {
        const tau = clamp(1.7 - (e.m - 60) * 0.035, 0.35, 2.6);
        const end = t + e.d + 1.4;
        const lp = this.filter('lowpass', Math.min(11000, f * 7 + 1500), 0.4);
        lp.frequency.setTargetAtTime(f * 2.2 + 700, t + 0.02, 0.45);
        const a = this.gain(), o1 = this.osc('triangle', f, t, end), o2 = this.osc('sine', f * 2.002, t, end), o3 = this.osc('sine', f * 0.999, t, end);
        const g2 = this.gain(0.22), g3 = this.gain(0.5);
        o1.connect(lp); o2.connect(g2).connect(lp); o3.connect(g3).connect(lp);
        lp.connect(a);
        a.gain.setValueAtTime(0, t);
        a.gain.linearRampToValueAtTime(g, t + 0.006);
        a.gain.setTargetAtTime(g * 0.22, t + 0.02, tau);
        a.gain.setTargetAtTime(0, t + e.d, 0.22);
        this.out(a, 0.38);
        break;
      }
      case 'pad': case 'strings': case 'cello': case 'drone': {
        const att = e.att ?? (e.v === 'strings' ? 0.8 : 1.2), rel = e.rel ?? 2;
        const end = t + e.d + rel + 0.2;
        const cut = e.cut ?? (e.v === 'drone' ? 380 : e.v === 'cello' ? 1100 : e.v === 'strings' ? 2600 : 1300);
        const lp = this.filter('lowpass', cut, 0.5);
        const a = this.gain();
        const det = e.v === 'drone' ? 9 : 7;
        for (const d of [-det, det]) {
          const o = this.osc('sawtooth', f, t, end);
          o.detune.value = d;
          if (e.v === 'strings' || e.v === 'cello') {
            const lfo = this.osc('sine', 5 + (d > 0 ? 0.3 : 0), t, end), lg = this.gain(9);
            lfo.connect(lg).connect(o.detune);
          }
          o.connect(lp);
        }
        if (e.v === 'strings' || e.v === 'cello') { const hp = this.filter('highpass', e.v === 'cello' ? 60 : 180); lp.connect(hp); hp.connect(a); } else lp.connect(a);
        this.env(a.gain, t, g * (e.v === 'drone' ? 1.2 : 0.8), att, e.d, rel);
        this.out(a, e.v === 'drone' ? 0.3 : 0.55);
        break;
      }
      case 'bell': {
        const end = t + 5;
        const a = this.gain();
        for (const [r, k] of [[1, 1], [2.756, 0.28], [5.404, 0.1], [2, 0.12]]) {
          const o = this.osc('sine', f * r, t, end), og = this.gain(k);
          o.connect(og).connect(a);
        }
        a.gain.setValueAtTime(0, t);
        a.gain.linearRampToValueAtTime(g, t + 0.004);
        a.gain.setTargetAtTime(0, t + 0.01, 1.1);
        this.out(a, 0.7);
        break;
      }
      case 'pluck': {
        const end = t + e.d + 0.6;
        const lp = this.filter('lowpass', 4200, 2);
        lp.frequency.setTargetAtTime(700, t, 0.09);
        const a = this.gain();
        const o = this.osc('sawtooth', f, t, end), o2 = this.osc('triangle', f * 2, t, end);
        const g2 = this.gain(0.3);
        o.connect(lp); o2.connect(g2).connect(lp); lp.connect(a);
        a.gain.setValueAtTime(0, t);
        a.gain.linearRampToValueAtTime(g, t + 0.003);
        a.gain.setTargetAtTime(0, t + 0.01, 0.16);
        this.out(a, 0.3);
        break;
      }
      case 'bass': {
        const end = t + e.d + 0.5;
        const lp = this.filter('lowpass', 520, 0.8);
        const a = this.gain();
        const o = this.osc('sine', f, t, end), o2 = this.osc('triangle', f, t, end);
        const g2 = this.gain(0.5);
        o.connect(a); o2.connect(g2).connect(lp).connect(a);
        this.env(a.gain, t, g * 0.8, e.att ?? 0.01, e.d, e.rel ?? 0.12);
        this.out(a, 0.08);
        break;
      }
      case 'kick': {
        const o = this.osc('sine', 150, t, t + 0.6);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
        const a = this.gain();
        a.gain.setValueAtTime(g * 1.1, t); a.gain.exponentialRampToValueAtTime(0.0005, t + 0.45);
        o.connect(a); this.out(a, 0.05);
        break;
      }
      case 'snare': case 'clap': {
        const n = this.src('white', t, t + 0.4);
        const bp = this.filter('bandpass', e.v === 'clap' ? 1300 : 1900, 0.8);
        const a = this.gain();
        a.gain.setValueAtTime(0, t);
        if (e.v === 'clap') for (const dt of [0, 0.012, 0.024]) { a.gain.setValueAtTime(g * 2, t + dt); a.gain.setTargetAtTime(g * 0.3, t + dt + 0.002, 0.004); }
        else a.gain.setValueAtTime(g * 2, t);
        a.gain.setTargetAtTime(0, t + 0.03, e.v === 'clap' ? 0.06 : 0.05);
        n.connect(bp).connect(a); this.out(a, 0.25);
        break;
      }
      case 'hat': {
        const n = this.src('white', t, t + 0.12);
        const hp = this.filter('highpass', 7500);
        const a = this.gain();
        a.gain.setValueAtTime(g * 1.5, t); a.gain.setTargetAtTime(0, t + 0.004, 0.018);
        n.connect(hp).connect(a); this.out(a, 0.1);
        break;
      }
      case 'timp': {
        const o = this.osc('sine', f * 1.04, t, t + 2);
        o.frequency.setTargetAtTime(f, t, 0.05);
        const a = this.gain();
        a.gain.setValueAtTime(g * 1.5, t); a.gain.setTargetAtTime(0, t + 0.01, 0.5);
        o.connect(a);
        const n = this.src('brown', t, t + 0.3), lp = this.filter('lowpass', 300), ng = this.gain();
        ng.gain.setValueAtTime(g, t); ng.gain.setTargetAtTime(0, t, 0.05);
        n.connect(lp).connect(ng).connect(a);
        this.out(a, 0.4);
        break;
      }
    }
  }

  // ─── sound effects ─────────────────────────────────────────────────────

  noiseHit(t, kind, filt, f, q, peak, tau, wet = 0.3, pan = 0) {
    const n = this.src(kind, t, t + tau * 8 + 0.1);
    const fl = this.filter(filt, f, q), a = this.gain();
    a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(peak, t + 0.004); a.gain.setTargetAtTime(0, t + 0.006, tau);
    n.connect(fl).connect(a); this.out(a, wet, pan);
    return a;
  }
  tone(t, type, f, peak, tau, wet = 0.3, f1 = null, glide = 0.1, pan = 0) {
    const o = this.osc(type, f, t, t + tau * 8 + 0.1);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + glide);
    const a = this.gain();
    a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(peak, t + 0.004); a.gain.setTargetAtTime(0, t + 0.006, tau);
    o.connect(a); this.out(a, wet, pan);
  }
  // A continuous layer shaped by a list of [time, level] points.
  layer(t0, dur, make, points, wet = 0.3) {
    const a = this.gain();
    a.gain.setValueAtTime(0, t0);
    for (const [dt, v] of points) if (dt >= 0) a.gain.linearRampToValueAtTime(v, t0 + dt);
    make(a, t0, t0 + dur + 0.5);
    this.out(a, wet);
    return a;
  }

  effect(e, t, off) {
    if (!this.session) return;
    const g = e.g ?? 1;
    const H = (i) => hash(i, Math.floor(e.t * 100));
    switch (e.type) {
      case 'chirp': {
        const pan = (H(1) - 0.5) * 1.4;
        for (let k = 0; k < 3; k++) this.tone(t + k * 0.045, 'sine', e.f, 0.022 * g, 0.012, 0.3, null, 0, pan);
        break;
      }
      case 'bird': {
        const pan = (H(2) - 0.5) * 1.2;
        for (let k = 0; k < e.n; k++) this.tone(t + k * 0.11, 'sine', e.f * (1 + 0.1 * H(k)), 0.03 * g, 0.03, 0.4, e.f * 1.5, 0.07, pan);
        break;
      }
      case 'heart':
        this.tone(t, 'sine', 55, 0.5 * g, 0.08, 0.05, 40, 0.1);
        this.tone(t + 0.26, 'sine', 50, 0.35 * g, 0.08, 0.05, 38, 0.1);
        break;
      case 'tick':
        this.noiseHit(t, 'white', 'bandpass', e.hi ? 3200 : 2200, 4, 0.25 * g, 0.012, 0.15);
        break;
      case 'shooting':
        for (let k = 0; k < 7; k++) this.tone(t + k * 0.07, 'sine', 3200 - k * 260, 0.03, 0.25, 0.8);
        break;
      case 'page': {
        const a = this.noiseHit(t, 'pink', 'bandpass', 2600, 0.8, 0.0, 0.1, 0.2);
        a.gain.cancelScheduledValues(t);
        a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(0.18, t + 0.12); a.gain.linearRampToValueAtTime(0, t + 0.4);
        break;
      }
      case 'step': this.noiseHit(t, 'brown', 'lowpass', 350, 0.7, 0.4, 0.05, 0.1); break;
      case 'blinds':
        for (let k = 0; k < 28; k++) this.noiseHit(t + k * 0.04 + H(k) * 0.01, 'white', 'bandpass', 2800 + H(k + 9) * 1500, 3, 0.08, 0.006, 0.2);
        break;
      case 'bus':
        this.layer(t, 3.4, (a, t0, end) => {
          const n = this.src('brown', t0, end), lp = this.filter('lowpass', 500);
          const o = this.osc('sawtooth', 58, t0, end), olp = this.filter('lowpass', 260), og = this.gain(0.4);
          o.frequency.linearRampToValueAtTime(46, t0 + 3.2);
          n.connect(lp).connect(a); o.connect(olp).connect(og).connect(a);
        }, [[1.2, 0.5], [1.8, 0.5], [3.4, 0]], 0.2);
        break;
      case 'knock':
        for (let k = 0; k < 3; k++) { this.tone(t + k * 0.2, 'sine', 170, 0.4, 0.04, 0.3); this.noiseHit(t + k * 0.2, 'white', 'bandpass', 900, 1.5, 0.3, 0.02, 0.3); }
        break;
      case 'door': {
        this.noiseHit(t, 'white', 'highpass', 3000, 0.7, 0.2, 0.01, 0.2);
        this.layer(t + 0.05, 1.0, (a, t0, end) => {
          const o = this.osc('sawtooth', 85, t0, end), bp = this.filter('bandpass', 700, 9);
          const lfo = this.osc('sine', 7, t0, end), lg = this.gain(12); lfo.connect(lg).connect(o.frequency);
          o.frequency.linearRampToValueAtTime(110, t0 + 0.9);
          o.connect(bp).connect(a);
        }, [[0.1, 0.12], [0.8, 0.08], [1.0, 0]], 0.4);
        break;
      }
      case 'doorclose':
        this.tone(t, 'sine', 75, 0.5, 0.08, 0.35, 45, 0.15);
        this.noiseHit(t, 'brown', 'lowpass', 700, 0.7, 0.5, 0.06, 0.35);
        this.noiseHit(t + 0.06, 'white', 'highpass', 3500, 0.7, 0.12, 0.01, 0.2);
        break;
      case 'plane':
        this.layer(t, 10, (a, t0, end) => { const n = this.src('brown', t0, end), lp = this.filter('lowpass', 650); n.connect(lp).connect(a); }, [[5, 0.22], [10, 0]], 0.4);
        break;
      case 'weld': this.weld(t, e.dur, off); break;
      case 'grind': {
        const d = e.dur - off;
        if (d <= 0) break;
        this.layer(t, d, (a, t0, end) => {
          const n = this.src('white', t0, end), bp = this.filter('bandpass', 2600, 1.4);
          const o = this.osc('sawtooth', 175, t0, end), olp = this.filter('lowpass', 1400), og = this.gain(0.25);
          n.connect(bp).connect(a); o.connect(olp).connect(og).connect(a);
        }, [[0.3, 0.16], [Math.max(0.35, d - 0.5), 0.16], [d, 0]], 0.2);
        break;
      }
      case 'slowmo':
        this.tone(t, 'sine', 70, 0.6, 0.6, 0.5, 28, 1.4);
        this.layer(t - 0.01, 1.4, (a, t0, end) => { const n = this.src('pink', t0, end), lp = this.filter('lowpass', 3000, 1); lp.frequency.exponentialRampToValueAtTime(150, t0 + 1.3); n.connect(lp).connect(a); }, [[0.05, 0.3], [1.4, 0]], 0.6);
        break;
      case 'boom':
        this.tone(t, 'sine', 72, 0.8 * g, 0.5, 0.4, 30, 1.2);
        this.noiseHit(t, 'brown', 'lowpass', 220, 0.7, 0.7 * g, 0.4, 0.5);
        break;
      case 'crash': this.noiseHit(t, 'white', 'highpass', 3800, 0.6, 0.3 * g, 0.7, 0.5); break;
      case 'riser':
        this.layer(t, e.d, (a, t0, end) => { const n = this.src('white', t0, end), bp = this.filter('bandpass', 300, 3); bp.frequency.exponentialRampToValueAtTime(5000, t0 + e.d); n.connect(bp).connect(a); }, [[e.d, 0.4 * g], [e.d + 0.05, 0]], 0.5);
        break;
      case 'race': this.race(t, e.dur, off); break;
      case 'cheer': {
        const d = Math.max(0.5, e.dur - off);
        this.layer(t, d, (a, t0, end) => { const n = this.src('pink', t0, end), bp = this.filter('bandpass', e.kids ? 2400 : 1200, 0.6); n.connect(bp).connect(a); }, [[0.4, 0.22], [Math.max(0.5, d - 1.5), 0.19], [d, 0]], 0.5);
        for (let k = 0; k < (e.kids ? 6 : 4); k++) this.tone(t + 0.3 + H(k) * d * 0.6, 'sine', (e.kids ? 1500 : 1100) + H(k + 3) * 500, 0.025, 0.3, 0.5, (e.kids ? 2300 : 1900) + H(k + 5) * 300, 0.35);
        break;
      }
      case 'flash': this.noiseHit(t, 'white', 'highpass', 5000, 0.7, 0.12, 0.008, 0.2); break;
      case 'clank':
        for (const [f, k] of [[520, 1], [1370, 0.6], [2240, 0.4], [3610, 0.25]]) this.tone(t, 'sine', f * (0.98 + H(f) * 0.04), 0.09 * k, 0.35, 0.4);
        this.noiseHit(t, 'white', 'highpass', 2000, 0.7, 0.2, 0.01, 0.3);
        break;
      case 'clap': this.noiseHit(t, 'white', 'bandpass', 1300, 0.9, 0.5, 0.03, 0.3); break;
      case 'idle': {
        const d = e.dur - off;
        if (d <= 0) break;
        this.layer(t, d, (a, t0, end) => {
          const o = this.osc('sawtooth', 36, t0, end), lp = this.filter('lowpass', 260), am = this.gain(0.5);
          const lfo = this.osc('square', 11, t0, end), lg = this.gain(0.5); lfo.connect(lg).connect(am.gain);
          o.connect(lp).connect(am).connect(a);
        }, [[Math.min(d, 4), 0.14], [Math.max(4, d - 4), 0.18], [d, 0]], 0.3);
        break;
      }
      case 'rep':
        this.layer(t, 0.8, (a, t0, end) => { const n = this.src('pink', t0, end), bp = this.filter('bandpass', 750, 1); n.connect(bp).connect(a); }, [[0.2, 0.25], [0.8, 0]], 0.2);
        break;
      case 'type': {
        const d = e.dur - off;
        for (let s = 0, k = 0; s < d; s += 0.07 + H(k) * 0.12, k++) this.noiseHit(t + s, 'white', 'highpass', 2600 + H(k + 7) * 1000, 0.7, 0.1, 0.01, 0.15);
        break;
      }
      case 'click': this.noiseHit(t, 'white', 'highpass', 3000, 0.7, 0.14, 0.006, 0.1); this.noiseHit(t + 0.07, 'white', 'highpass', 2600, 0.7, 0.1, 0.006, 0.1); break;
      case 'cardoor': this.tone(t, 'sine', 90, 0.45, 0.07, 0.3, 55, 0.12); this.noiseHit(t, 'brown', 'lowpass', 900, 0.7, 0.45, 0.05, 0.3); break;
      case 'carstart':
        this.layer(t, 0.9, (a, t0, end) => { const o = this.osc('sawtooth', 210, t0, end), lp = this.filter('lowpass', 1200), am = this.gain(0.5); const l = this.osc('sine', 18, t0, end), lg = this.gain(0.5); l.connect(lg).connect(am.gain); o.connect(lp).connect(am).connect(a); }, [[0.1, 0.08], [0.9, 0]], 0.2);
        this.layer(t + 0.8, 2, (a, t0, end) => { const o = this.osc('sawtooth', 34, t0, end), lp = this.filter('lowpass', 220); o.connect(lp).connect(a); }, [[0.2, 0.2], [1.5, 0.12], [2, 0.05]], 0.2);
        break;
      case 'carleave': case 'carstop': {
        const leave = e.type === 'carleave';
        this.layer(t, 5, (a, t0, end) => {
          const o = this.osc('sawtooth', leave ? 40 : 60, t0, end), lp = this.filter('lowpass', 380);
          o.frequency.linearRampToValueAtTime(leave ? 85 : 32, t0 + 4);
          const n = this.src('brown', t0, end), nl = this.filter('lowpass', 500), ng = this.gain(0.5);
          o.connect(lp).connect(a); n.connect(nl).connect(ng).connect(a);
        }, leave ? [[1, 0.22], [2.5, 0.16], [5, 0]] : [[0.4, 0.16], [3.5, 0.08], [5, 0]], 0.3);
        break;
      }
      case 'slam':
        this.tone(t, 'sine', 62, 0.6, 0.12, 0.5, 38, 0.2);
        this.noiseHit(t, 'brown', 'lowpass', 1400, 0.7, 0.6, 0.08, 0.5);
        this.noiseHit(t + 0.03, 'white', 'bandpass', 420, 2, 0.2, 0.12, 0.4);
        break;
      case 'drone': {
        const d = e.dur - off;
        if (d > 0) this.layer(t, d, (a, t0, end) => { const n = this.src('brown', t0, end), lp = this.filter('lowpass', 120); n.connect(lp).connect(a); }, [[Math.min(d, 3), 0.2], [Math.max(3, d - 2), 0.2], [d, 0]], 0.3);
        break;
      }
      case 'phone':
        for (let k = 0; k < 3; k++) this.layer(t + k * 0.6, 0.4, (a, t0, end) => { const o = this.osc('square', 170, t0, end), lp = this.filter('lowpass', 420); o.connect(lp).connect(a); }, [[0.02, 0.07], [0.38, 0.07], [0.4, 0]], 0.1);
        break;
      case 'chalk': for (let k = 0; k < 4; k++) this.noiseHit(t + k * 0.16, 'white', 'bandpass', 3600, 3, 0.14, 0.02, 0.3); break;
      case 'beep': this.layer(t, 0.16, (a, t0, end) => { const o = this.osc('sine', e.hi ? 1560 : 1040, t0, end); o.connect(a); }, [[0.005, 0.1], [0.15, 0.1], [0.16, 0]], 0.3); break;
      case 'estes': this.estes(t); break;
      case 'whoop': break;   // the music carries this one
      case 'hotfire': this.hotfire(t, e.dur, off); break;
      case 'launch': {
        const d = e.dur - off;
        if (d > 0) this.layer(t, d, (a, t0, end) => {
          const n = this.src('brown', t0, end), lp = this.filter('lowpass', 140);
          const c = this.src('pink', t0, end), cl = this.filter('lowpass', 500), cg = this.gain(0.3);
          n.connect(lp).connect(a); c.connect(cl).connect(cg).connect(a);
        }, [[Math.min(d, 6), 0.35], [d, 0]], 0.5);
        break;
      }
    }
  }

  weld(t, dur, off) {
    // beads: arc on 1.8 s, off 0.45 s, crackling
    const a = this.gain(), end = t + dur - off + 0.2;
    const n = this.src('white', t, end), bp = this.filter('bandpass', 3200, 0.8);
    const o = this.osc('sawtooth', 120, t, end), olp = this.filter('lowpass', 700), og = this.gain(0.12);
    n.connect(bp).connect(a); o.connect(olp).connect(og).connect(a);
    a.gain.setValueAtTime(0, t);
    for (let s = off, k = 0; s < dur; s += 0.02 + hash(k, 3) * 0.03, k++) {
      const inBead = (s % 2.25) < 1.8;
      a.gain.setValueAtTime(inBead ? 0.06 + hash(k, 4) * 0.12 : 0, t + s - off);
    }
    a.gain.setValueAtTime(0, t + dur - off);
    this.out(a, 0.25);
  }

  race(t, dur, off) {
    const a = this.gain(), end = t + dur - off + 0.5;
    const o = this.osc('sawtooth', 110, t, end), o2 = this.osc('square', 55, t, end);
    const ws = this.ac.createWaveShaper(); ws.curve = this.shaper;
    const lp = this.filter('lowpass', 1900, 0.8), g2 = this.gain(0.35);
    o.connect(ws); o2.connect(g2).connect(ws); ws.connect(lp).connect(a);
    const rpm = (s) => {
      if (s > 38.2) return Math.max(40, 150 - (s - 38.2) * 25);
      const gear = s % 3.4;
      return 105 + 85 * (gear / 3.4) ** 0.8 + 6 * Math.sin(s * 23);
    };
    o.frequency.setValueAtTime(rpm(off), t);
    o2.frequency.setValueAtTime(rpm(off) / 2, t);
    for (let s = off; s < dur; s += 0.05) {
      const at = t + s - off;
      o.frequency.linearRampToValueAtTime(rpm(s), at);
      o2.frequency.linearRampToValueAtTime(rpm(s) / 2, at);
    }
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(0.1, t + 0.5);
    const tail = Math.max(0, 38.2 - off);
    a.gain.setValueAtTime(0.1, t + tail);
    a.gain.linearRampToValueAtTime(0.0, t + dur - off);
    this.out(a, 0.15);
    // wind rush
    const wa = this.layer(t, dur - off, (w, t0, e) => { const n = this.src('pink', t0, e), hp = this.filter('highpass', 700); n.connect(hp).connect(w); }, [[0.5, 0.12], [Math.max(0.6, tail), 0.12], [dur - off, 0]], 0.1);
    // rivals going by
    for (const s of [6, 11, 17, 21, 27, 32]) {
      if (s < off) continue;
      this.layer(t + s - off, 1.6, (b, t0, e) => {
        const r = this.osc('sawtooth', 170, t0, e), rl = this.filter('lowpass', 1400);
        r.frequency.linearRampToValueAtTime(115, t0 + 1.5);
        const ws2 = this.ac.createWaveShaper(); ws2.curve = this.shaper;
        r.connect(ws2).connect(rl).connect(b);
      }, [[0.7, 0.07], [1.6, 0]], 0.2);
    }
  }

  estes(t) {
    // the motor's roar follows its own thrust curve
    const a = this.gain(), end = t + C6_BURN + 0.3;
    const n = this.src('white', t, end), lp = this.filter('lowpass', 3800, 0.6);
    const b = this.src('brown', t, end), bl = this.filter('lowpass', 300), bg = this.gain(0.8);
    n.connect(lp).connect(a); b.connect(bl).connect(bg).connect(a);
    a.gain.setValueAtTime(0, t);
    for (let s = 0; s <= C6_BURN; s += 0.02) a.gain.linearRampToValueAtTime((thrustC6(s) / 14) * 0.4 * (0.85 + 0.15 * hash(Math.floor(s * 50), 2)), t + s);
    a.gain.linearRampToValueAtTime(0, t + C6_BURN + 0.05);
    this.out(a, 0.35);
  }

  hotfire(t, dur, off) {
    const d = dur - off;
    if (d <= 0) return;
    const a = this.gain(), end = t + d + 3;
    const n = this.src('pink', t, end), lp = this.filter('lowpass', 1100, 0.5);
    const b = this.src('brown', t, end), bl = this.filter('lowpass', 160), bg = this.gain(1.2);
    const c = this.src('white', t, end), cb = this.filter('bandpass', 2200, 0.8), cg = this.gain(0);
    n.connect(lp).connect(a); b.connect(bl).connect(bg).connect(a); c.connect(cb).connect(cg).connect(a);
    for (let s = 0, k = 0; s < d; s += 0.03, k++) cg.gain.setValueAtTime(hash(k, 9) > 0.6 ? 0.5 : 0.1, t + s);
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(0.34, t + Math.min(0.3, d));
    a.gain.setValueAtTime(0.34, t + d);
    a.gain.linearRampToValueAtTime(0, t + d + 0.35);
    this.out(a, 0.45);
    // the purge and the steam after shutdown
    this.layer(t + d + 0.2, 2.5, (s, t0, e) => { const w = this.src('white', t0, e), hp = this.filter('highpass', 3000); w.connect(hp).connect(s); }, [[0.1, 0.08], [2.5, 0]], 0.4);
  }

  // ─── ambience beds ─────────────────────────────────────────────────────

  bed(b, from) {
    const t = this.at(from);
    const end = this.at(b.b) + 0.1;
    const a = this.gain();
    const lvl = (x) => b.g * clamp(Math.min((x - b.a) / Math.max(0.01, b.f), (b.b - x) / Math.max(0.01, b.f)));
    a.gain.setValueAtTime(lvl(from), t);
    if (from < b.a + b.f) a.gain.linearRampToValueAtTime(b.g, this.at(b.a + b.f));
    a.gain.setValueAtTime(b.g, this.at(Math.max(from, b.b - b.f)));
    a.gain.linearRampToValueAtTime(0, this.at(b.b));
    const k = 0.4;   // beds sit well under the music
    const m = this.gain(k);
    a.connect(m);
    switch (b.type) {
      case 'rain': {
        const n = this.src('white', t, end), hp = this.filter('highpass', 500), lp = this.filter('lowpass', 7000);
        const p = this.src('pink', t, end), pl = this.filter('lowpass', 900), pg = this.gain(0.8);
        n.connect(hp).connect(lp).connect(a); p.connect(pl).connect(pg).connect(a);
        break;
      }
      case 'wind': {
        const n = this.src('pink', t, end), bp = this.filter('bandpass', 480, 0.6);
        const l = this.osc('sine', 0.07, t, end), lg = this.gain(220); l.connect(lg).connect(bp.frequency);
        const am = this.gain(0.7), l2 = this.osc('sine', 0.13, t, end), l2g = this.gain(0.3); l2.connect(l2g).connect(am.gain);
        n.connect(bp).connect(am).connect(a);
        break;
      }
      case 'room': case 'city': {
        const n = this.src('brown', t, end), lp = this.filter('lowpass', b.type === 'room' ? 200 : 380);
        n.connect(lp).connect(a);
        break;
      }
      case 'shop': {
        const n = this.src('brown', t, end), lp = this.filter('lowpass', 420);
        const o = this.osc('sine', 60, t, end), og = this.gain(0.12);
        n.connect(lp).connect(a); o.connect(og).connect(a);
        break;
      }
      case 'crowd': {
        const n = this.src('pink', t, end), bp = this.filter('bandpass', 1100, 0.7);
        const am = this.gain(0.8), l = this.osc('sine', 0.21, t, end), lg = this.gain(0.2); l.connect(lg).connect(am.gain);
        n.connect(bp).connect(am).connect(a);
        break;
      }
      case 'heat': {
        // cicadas
        const n = this.src('white', t, end), bp = this.filter('bandpass', 5200, 5);
        const am = this.gain(0.5), l = this.osc('square', 44, t, end), lg = this.gain(0.5); l.connect(lg).connect(am.gain);
        const sw = this.gain(0.7), l2 = this.osc('sine', 0.25, t, end), l2g = this.gain(0.3); l2.connect(l2g).connect(sw.gain);
        n.connect(bp).connect(am).connect(sw).connect(a);
        break;
      }
      case 'road': {
        const n = this.src('brown', t, end), lp = this.filter('lowpass', 260);
        const o = this.osc('sawtooth', 38, t, end), ol = this.filter('lowpass', 150), og = this.gain(0.3);
        n.connect(lp).connect(a); o.connect(ol).connect(og).connect(a);
        break;
      }
      case 'fluoro': {
        const o = this.osc('sine', 120, t, end), o2 = this.osc('sine', 240, t, end), g2 = this.gain(0.3);
        const og = this.gain(0.35);
        o.connect(og).connect(a); o2.connect(g2).connect(a);
        const n = this.src('white', t, end), hp = this.filter('highpass', 8000), ng = this.gain(0.08);
        n.connect(hp).connect(ng).connect(a);
        break;
      }
    }
    this.out(m, 0.2);
  }
}

function lowerBound(arr, t) {
  let lo = 0, hi = arr.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].t < t) lo = mid + 1; else hi = mid; }
  return lo;
}
