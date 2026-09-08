// Everything you hear, synthesised on the fly.
//
// No audio files. Wind is filtered noise, a Sicklerunner's shriek is a pair of
// detuned saws through a formant chain, and thunder is a noise burst with a
// very long tail. The point of doing it this way is the distance model: the
// same roar can be a wall of sound at ten metres and a cold rumour at six
// hundred, because it is the same synth with different filters on it.

import * as THREE from 'three';
import { clamp, lerp, smoothstep } from '../math/noise.js';

const _v = new THREE.Vector3();

function noiseBuffer(ctx, seconds = 4, pink = true) {
  const n = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    if (!pink) { d[i] = white; continue; }
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buf;
}

/** A cheap exponential-decay impulse response for the distance reverb. */
function reverbBuffer(ctx, seconds = 2.6, decay = 3.2) {
  const n = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (1 - smoothstep(0, 0.01, t) * 0.2);
    }
  }
  return buf;
}

export class Audio {
  constructor() {
    this.ready = false;
    this.enabled = true;
    this.listenerPos = new THREE.Vector3();
    this.volume = 0.85;
  }

  /** Must be called from a user gesture. */
  start() {
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    const ctx = new AC();
    this.ctx = ctx;
    this.now = () => ctx.currentTime;

    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 22;
    comp.ratio.value = 5;
    comp.attack.value = 0.004;
    comp.release.value = 0.22;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    // Distance reverb send: anything far away goes through this.
    this.verb = ctx.createConvolver();
    this.verb.buffer = reverbBuffer(ctx);
    this.verbGain = ctx.createGain();
    this.verbGain.gain.value = 0.55;
    this.verb.connect(this.verbGain);
    this.verbGain.connect(this.master);

    this.pinkBuf = noiseBuffer(ctx, 4, true);
    this.whiteBuf = noiseBuffer(ctx, 2, false);

    // --- ambience beds -----------------------------------------------------
    this.beds = {};
    this.beds.wind = this._bed({ type: 'bandpass', freq: 480, q: 0.6, gain: 0 });
    this.beds.windHigh = this._bed({ type: 'highpass', freq: 1400, q: 0.5, gain: 0 });
    this.beds.rain = this._bed({ type: 'bandpass', freq: 2600, q: 0.35, gain: 0 });
    this.beds.river = this._bed({ type: 'bandpass', freq: 900, q: 0.5, gain: 0 });
    this.beds.rumble = this._bed({ type: 'lowpass', freq: 90, q: 1.4, gain: 0 });
    this.beds.interior = this._bed({ type: 'lowpass', freq: 220, q: 0.8, gain: 0 });

    // Insects and night chorus: pulsed narrow-band noise.
    this.insects = this._insectBed();
    this.night = this._nightBed();

    // Engine bed for the ship, built once and driven by throttle.
    this.engine = this._engineBed();

    // Mech servo bed.
    this.servo = this._servoBed();

    this.ready = true;
    this.listener = ctx.listener;
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  _bed({ type, freq, q, gain }) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.pinkBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start();
    return { src, filter: f, gain: g };
  }

  _insectBed() {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.pinkBuf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 6200; bp.Q.value = 14;
    const trem = ctx.createGain();
    trem.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 11;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.45;
    lfo.connect(lfoG); lfoG.connect(trem.gain);
    const out = ctx.createGain(); out.gain.value = 0;
    src.connect(bp); bp.connect(trem); trem.connect(out); out.connect(this.master);
    src.start(); lfo.start();
    return { gain: out, lfo, bp };
  }

  _nightBed() {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.pinkBuf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3300; bp.Q.value = 26;
    const trem = ctx.createGain(); trem.gain.value = 0.35;
    const lfo = ctx.createOscillator();
    lfo.type = 'square'; lfo.frequency.value = 4.2;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.6;
    lfo.connect(lfoG); lfoG.connect(trem.gain);
    const out = ctx.createGain(); out.gain.value = 0;
    src.connect(bp); bp.connect(trem); trem.connect(out); out.connect(this.master);
    src.start(); lfo.start();
    return { gain: out, lfo, bp };
  }

  _engineBed() {
    const ctx = this.ctx;
    const low = ctx.createOscillator();
    low.type = 'sawtooth'; low.frequency.value = 46;
    const low2 = ctx.createOscillator();
    low2.type = 'sawtooth'; low2.frequency.value = 69;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 3;
    const hiss = ctx.createBufferSource();
    hiss.buffer = this.pinkBuf; hiss.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass'; hp.frequency.value = 2400; hp.Q.value = 0.6;
    const hissG = ctx.createGain(); hissG.gain.value = 0.5;
    const out = ctx.createGain(); out.gain.value = 0;
    low.connect(lp); low2.connect(lp); lp.connect(out);
    hiss.connect(hp); hp.connect(hissG); hissG.connect(out);
    out.connect(this.master);
    low.start(); low2.start(); hiss.start();
    return { low, low2, lp, hissG, gain: out };
  }

  _servoBed() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 190;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 6;
    const out = ctx.createGain(); out.gain.value = 0;
    osc.connect(bp); bp.connect(out); out.connect(this.master);
    osc.start();
    return { osc, bp, gain: out };
  }

  // -------------------------------------------------------------------------
  // spatial one-shots
  // -------------------------------------------------------------------------

  /**
   * Build a panner + distance filter chain for a world-space sound.
   * Returns { input, panner, dist } — connect a source to `input`.
   */
  _spatial(pos, { refDistance = 12, maxDistance = 2600, rolloff = 1.1, verbSend = 0.35 } = {}) {
    const ctx = this.ctx;
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = refDistance;
    panner.maxDistance = maxDistance;
    panner.rolloffFactor = rolloff;
    if (panner.positionX) {
      panner.positionX.value = pos.x; panner.positionY.value = pos.y; panner.positionZ.value = pos.z;
    } else {
      panner.setPosition(pos.x, pos.y, pos.z);
    }
    // Air absorption: distant things lose their top end.
    const d = pos.distanceTo(this.listenerPos);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = clamp(19000 * Math.exp(-d / 420) + 380, 320, 19000);
    lp.Q.value = 0.4;
    const dry = ctx.createGain();
    dry.gain.value = 1;
    lp.connect(panner);
    panner.connect(dry);
    dry.connect(this.master);
    // Distant sounds get more reverb — that is most of what makes them distant.
    const send = ctx.createGain();
    send.gain.value = clamp(verbSend * smoothstep(30, 500, d), 0, 0.9);
    panner.connect(send);
    send.connect(this.verb);
    return { input: lp, panner, distance: d };
  }

  env(gain, t0, { attack = 0.01, hold = 0.05, release = 0.3, peak = 1 }) {
    gain.gain.cancelScheduledValues(t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    gain.gain.setValueAtTime(Math.max(0.0002, peak), t0 + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
  }

  /**
   * A creature voice. `pitch` scales the fundamental (0.15 for a Dreadcrown,
   * 2.6 for a Dartleg); `power` is how much of the throat is behind it.
   */
  voice(pos, { pitch = 1, power = 1, length = 1.4, rasp = 0.6, kind = 'call' } = {}) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx, t0 = this.now();
    const s = this._spatial(pos, { refDistance: 14 + power * 26, maxDistance: 4200, rolloff: 0.9, verbSend: 0.5 });

    const base = 62 * pitch;
    const out = ctx.createGain();
    out.gain.value = 0;
    // Two detuned saws for the body of the call.
    for (const [mul, det, g] of [[1, 0, 0.55], [1.005, 3, 0.35], [2.01, -4, 0.16]]) {
      const o = ctx.createOscillator();
      o.type = kind === 'roar' ? 'sawtooth' : 'square';
      o.frequency.setValueAtTime(base * mul * 0.72, t0);
      o.frequency.exponentialRampToValueAtTime(base * mul * 1.18, t0 + length * 0.22);
      o.frequency.exponentialRampToValueAtTime(base * mul * 0.55, t0 + length);
      o.detune.value = det;
      const og = ctx.createGain(); og.gain.value = g;
      o.connect(og); og.connect(out);
      o.start(t0); o.stop(t0 + length + 0.4);
    }
    // Breath / rasp.
    const n = ctx.createBufferSource();
    n.buffer = this.pinkBuf;
    n.loop = true;
    const nbp = ctx.createBiquadFilter();
    nbp.type = 'bandpass';
    nbp.frequency.setValueAtTime(700 * pitch, t0);
    nbp.frequency.exponentialRampToValueAtTime(240 * pitch, t0 + length);
    nbp.Q.value = 1.1;
    const ng = ctx.createGain(); ng.gain.value = rasp * 0.5;
    n.connect(nbp); nbp.connect(ng); ng.connect(out);
    n.start(t0); n.stop(t0 + length + 0.4);

    // Formants give it a throat instead of a buzzer.
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass'; f1.frequency.value = 420 * Math.pow(pitch, 0.6); f1.Q.value = 2.4;
    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass'; f2.frequency.value = 1180 * Math.pow(pitch, 0.5); f2.Q.value = 3.2;
    const mix = ctx.createGain();
    out.connect(f1); f1.connect(mix);
    out.connect(f2); f2.connect(mix);
    out.connect(mix);

    const shaper = ctx.createWaveShaper();
    shaper.curve = this._distCurve(0.4 + power * 0.5);
    mix.connect(shaper);

    const env = ctx.createGain();
    shaper.connect(env);
    env.connect(s.input);
    this.env(env, t0, {
      attack: kind === 'roar' ? 0.06 : 0.03,
      hold: length * 0.42,
      release: length * 0.75,
      peak: 0.55 * power,
    });
    this.env(out, t0, { attack: 0.02, hold: length * 0.5, release: length * 0.6, peak: 0.9 });
  }

  _distCurve(amount) {
    if (!this._curves) this._curves = new Map();
    const key = Math.round(amount * 10);
    if (this._curves.has(key)) return this._curves.get(key);
    const n = 1024, c = new Float32Array(n);
    const k = amount * 40;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * 2 - 1;
      c[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }
    this._curves.set(key, c);
    return c;
  }

  /** A short filtered-noise burst: footsteps, impacts, rustle. */
  burst(pos, { freq = 700, q = 1.0, length = 0.12, peak = 0.35, type = 'bandpass', refDistance = 6 } = {}) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx, t0 = this.now();
    const s = this._spatial(pos, { refDistance, maxDistance: 900, rolloff: 1.5, verbSend: 0.2 });
    const n = ctx.createBufferSource();
    n.buffer = this.whiteBuf;
    n.loop = true;
    n.playbackRate.value = 0.7 + Math.random() * 0.6;
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq * (0.85 + Math.random() * 0.3); f.Q.value = q;
    const g = ctx.createGain();
    n.connect(f); f.connect(g); g.connect(s.input);
    this.env(g, t0, { attack: 0.004, hold: length * 0.2, release: length, peak });
    n.start(t0); n.stop(t0 + length * 2 + 0.1);
  }

  /** A tonal zap with a pitch sweep: the SUNDER, the mech cannon. */
  zap(pos, { f0 = 1800, f1 = 180, length = 0.24, peak = 0.5, noise = 0.4, type = 'sawtooth' } = {}) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx, t0 = this.now();
    const s = this._spatial(pos, { refDistance: 10, maxDistance: 2200, rolloff: 1.0, verbSend: 0.35 });
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + length);
    const og = ctx.createGain();
    o.connect(og);
    this.env(og, t0, { attack: 0.003, hold: length * 0.15, release: length, peak });
    og.connect(s.input);
    if (noise > 0) {
      const n = ctx.createBufferSource();
      n.buffer = this.whiteBuf; n.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(f0 * 1.4, t0);
      bp.frequency.exponentialRampToValueAtTime(Math.max(60, f1), t0 + length);
      bp.Q.value = 1.2;
      const ng = ctx.createGain();
      n.connect(bp); bp.connect(ng); ng.connect(s.input);
      this.env(ng, t0, { attack: 0.002, hold: length * 0.1, release: length * 0.9, peak: peak * noise });
      n.start(t0); n.stop(t0 + length * 2 + 0.1);
    }
    o.start(t0); o.stop(t0 + length * 2 + 0.1);
  }

  /** A rising charge whine. */
  charge(pos, seconds = 1.5) {
    if (!this.ready || !this.enabled) return null;
    const ctx = this.ctx, t0 = this.now();
    const s = this._spatial(pos, { refDistance: 8, maxDistance: 600, rolloff: 1.4, verbSend: 0.2 });
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(180, t0);
    o.frequency.exponentialRampToValueAtTime(2400, t0 + seconds);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(90, t0);
    o2.frequency.exponentialRampToValueAtTime(1180, t0 + seconds);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.28, t0 + seconds * 0.9);
    o.connect(g); o2.connect(g); g.connect(s.input);
    o.start(t0); o2.start(t0);
    return {
      stop: () => {
        const t = this.now();
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);
        o.stop(t + 0.15); o2.stop(t + 0.15);
      },
    };
  }

  /** Thunder: a crack, then a very long low tail. */
  thunder(distance = 900) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx;
    const delay = clamp(distance / 340, 0, 8);
    const t0 = this.now() + delay;
    const near = smoothstep(1800, 120, distance);
    const n = ctx.createBufferSource();
    n.buffer = this.pinkBuf; n.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(lerp(220, 5200, near), t0);
    lp.frequency.exponentialRampToValueAtTime(lerp(60, 400, near), t0 + 3.4);
    lp.Q.value = 0.8;
    const g = ctx.createGain();
    n.connect(lp); lp.connect(g); g.connect(this.master);
    const peak = lerp(0.10, 0.72, near);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02 + (1 - near) * 0.4);
    g.gain.exponentialRampToValueAtTime(peak * 0.4, t0 + 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.6 + near * 2);
    n.start(t0); n.stop(t0 + 7);
    // Send some of it to the reverb so it rolls around the valley.
    const sendG = ctx.createGain();
    sendG.gain.value = 0.5;
    g.connect(sendG); sendG.connect(this.verb);
  }

  // -------------------------------------------------------------------------

  /** Per-frame: move the listener and set the ambience mix. */
  update(dt, state) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx;
    const L = ctx.listener;
    const p = state.position, f = state.forward, u = state.up;
    this.listenerPos.copy(p);
    if (L.positionX) {
      const t = ctx.currentTime;
      L.positionX.setTargetAtTime(p.x, t, 0.02);
      L.positionY.setTargetAtTime(p.y, t, 0.02);
      L.positionZ.setTargetAtTime(p.z, t, 0.02);
      L.forwardX.setTargetAtTime(f.x, t, 0.02);
      L.forwardY.setTargetAtTime(f.y, t, 0.02);
      L.forwardZ.setTargetAtTime(f.z, t, 0.02);
      L.upX.setTargetAtTime(u.x, t, 0.02);
      L.upY.setTargetAtTime(u.y, t, 0.02);
      L.upZ.setTargetAtTime(u.z, t, 0.02);
    } else {
      L.setPosition(p.x, p.y, p.z);
      L.setOrientation(f.x, f.y, f.z, u.x, u.y, u.z);
    }

    const set = (node, v, tau = 0.35) => node.gain.setTargetAtTime(Math.max(0.0001, v), ctx.currentTime, tau);
    const air = state.atmosphere;
    const inside = state.interior ? 1 : 0;
    const muffle = lerp(1, 0.28, inside);

    set(this.beds.wind.gain, air * (0.05 + state.wind * 0.34) * muffle);
    this.beds.wind.filter.frequency.setTargetAtTime(
      lerp(300, 900, state.wind) * lerp(1, 0.5, state.altitudeT), ctx.currentTime, 0.5);
    set(this.beds.windHigh.gain, air * state.wind * 0.11 * muffle * (0.4 + state.altitudeT));
    set(this.beds.rain.gain, air * state.rain * 0.42 * muffle);
    set(this.beds.river.gain, air * state.river * 0.30 * muffle);
    set(this.beds.rumble.gain, (state.volcano * 0.5 + state.quake * 0.8) * 0.6);
    set(this.beds.interior.gain, inside * 0.05);
    set(this.insects.gain, air * state.insects * 0.045 * muffle);
    set(this.night.gain, air * state.nightChorus * 0.05 * muffle);
    this.night.lfo.frequency.setTargetAtTime(3.4 + state.nightChorus * 2.2, ctx.currentTime, 1.0);

    // Engines: pitch and hiss track the throttle.
    const th = state.engine;
    set(this.engine.gain, th.level * 0.30, 0.08);
    this.engine.low.frequency.setTargetAtTime(38 + th.level * 46 + th.speed * 0.02, ctx.currentTime, 0.15);
    this.engine.low2.frequency.setTargetAtTime(57 + th.level * 74, ctx.currentTime, 0.15);
    this.engine.lp.frequency.setTargetAtTime(240 + th.level * 1600 + th.speed * 1.2, ctx.currentTime, 0.2);
    this.engine.hissG.gain.setTargetAtTime(0.15 + th.level * 0.55 + th.heat * 0.5, ctx.currentTime, 0.2);

    set(this.servo.gain, state.servo * 0.055, 0.1);
    this.servo.osc.frequency.setTargetAtTime(150 + state.servo * 260, ctx.currentTime, 0.08);
  }

  setVolume(v) {
    this.volume = clamp(v, 0, 1);
    if (this.master) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
  }
}
