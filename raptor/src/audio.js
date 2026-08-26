// Synthesised audio with honest acoustic propagation.
//
// Nothing here is a sample: the engines are additive synthesis driven by fan
// speed, the wind is filtered noise driven by dynamic pressure. Exterior
// listeners hear the jet through a retarded-time solution — the sound you hear
// now was emitted where the aircraft *was*, which gives Doppler, distance
// attenuation, air absorption and, above Mach 1, an aircraft that arrives
// before its own noise.

const C_SOUND = 340.29;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

function noiseBuffer(ctx, seconds = 3) {
  const b = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    last = 0.96 * last + 0.04 * w;      // slight pink tilt
    d[i] = w * 0.7 + last * 1.6;
  }
  return b;
}

/** An N-wave: the classic double crack of a sonic boom. */
function boomBuffer(ctx) {
  const dur = 0.42, sr = ctx.sampleRate;
  const b = ctx.createBuffer(1, Math.floor(sr * dur), sr);
  const d = b.getChannelData(0);
  const spike = (i, at, w, amp) => {
    const t = (i / sr - at) / w;
    return t < 0 || t > 1 ? 0 : amp * (1 - t) * Math.exp(-t * 2.2);
  };
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    let v = spike(i, 0.002, 0.055, 1.0) - spike(i, 0.115, 0.075, 0.85);
    // low rumble tail as the ground reflects it
    v += (Math.random() * 2 - 1) * 0.30 * Math.exp(-t * 7.0);
    v += Math.sin(2 * Math.PI * 34 * t) * 0.22 * Math.exp(-t * 5.0);
    d[i] = clamp(v, -1, 1);
  }
  return b;
}

/** Web Audio throws on a non-finite value; never hand it one. */
function at(param, value, time, tau = 0.05) {
  if (!isFinite(value) || !isFinite(time)) return;
  param.setTargetAtTime(value, time, tau);
}

class Osc {
  constructor(ctx, type, freq, gain, dest) {
    this.o = ctx.createOscillator();
    this.o.type = type;
    this.o.frequency.value = freq;
    this.g = ctx.createGain();
    this.g.gain.value = gain;
    this.o.connect(this.g).connect(dest);
    this.o.start();
    this.base = freq;
  }
  set(freq, gain, t, tau = 0.05) {
    at(this.o.frequency, freq, t, tau);
    at(this.g.gain, gain, t, tau);
  }
}

export class AudioEngine {
  constructor() {
    this.ready = false;
    this.enabled = true;
    this.masterVolume = 0.75;
    this.mode = 'cockpit';       // 'cockpit' | 'exterior'
    this._history = [];          // {t, x,y,z, vx,vy,vz, mach}
    this._time = 0;
    this._lastF = 1;
    this._boomCooldown = 0;
    this._warn = null;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.masterVolume;
    this.master.connect(ctx.destination);

    // Propagation chain: delay (finite speed of sound) -> distance gain ->
    // air absorption lowpass -> stereo pan -> master.
    this.delay = ctx.createDelay(40);
    this.delay.delayTime.value = 0;
    this.distGain = ctx.createGain();
    this.distGain.gain.value = 1;
    this.absorb = ctx.createBiquadFilter();
    this.absorb.type = 'lowpass';
    this.absorb.frequency.value = 18000;
    this.panner = ctx.createStereoPanner();
    this.delay.connect(this.distGain).connect(this.absorb).connect(this.panner).connect(this.master);

    // Everything the aircraft emits goes into engineBus.
    this.engineBus = ctx.createGain();
    this.engineBus.connect(this.delay);

    // --- engine synthesis ---
    const nb = noiseBuffer(ctx);
    this.noiseBuf = nb;

    // core rumble
    this.rumble = ctx.createBufferSource();
    this.rumble.buffer = nb; this.rumble.loop = true;
    this.rumbleFilter = ctx.createBiquadFilter();
    this.rumbleFilter.type = 'lowpass'; this.rumbleFilter.frequency.value = 220;
    this.rumbleFilter.Q.value = 1.4;
    this.rumbleGain = ctx.createGain(); this.rumbleGain.gain.value = 0;
    this.rumble.connect(this.rumbleFilter).connect(this.rumbleGain).connect(this.engineBus);
    this.rumble.start();

    // afterburner roar: broadband, resonant, with crackle
    this.abSrc = ctx.createBufferSource();
    this.abSrc.buffer = nb; this.abSrc.loop = true;
    this.abFilter = ctx.createBiquadFilter();
    this.abFilter.type = 'bandpass'; this.abFilter.frequency.value = 480; this.abFilter.Q.value = 0.55;
    this.abShaper = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = i / 512 - 1;
      curve[i] = Math.tanh(x * 2.6);
    }
    this.abShaper.curve = curve;
    this.abGain = ctx.createGain(); this.abGain.gain.value = 0;
    this.abSrc.connect(this.abFilter).connect(this.abShaper).connect(this.abGain).connect(this.engineBus);
    this.abSrc.start();

    // turbine: blade-passing tones, a few harmonics
    this.turbGain = ctx.createGain(); this.turbGain.gain.value = 0;
    this.turbGain.connect(this.engineBus);
    this.turbines = [
      new Osc(ctx, 'sawtooth', 900, 0.06, this.turbGain),
      new Osc(ctx, 'square', 1800, 0.025, this.turbGain),
      new Osc(ctx, 'sine', 2700, 0.02, this.turbGain),
      new Osc(ctx, 'sine', 320, 0.10, this.turbGain),
    ];

    // --- airframe / cockpit bus, never delayed (you are in the cockpit) ---
    this.localBus = ctx.createGain();
    this.localBus.connect(this.master);

    this.windSrc = ctx.createBufferSource();
    this.windSrc.buffer = nb; this.windSrc.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass'; this.windFilter.frequency.value = 700; this.windFilter.Q.value = 0.4;
    this.windGain = ctx.createGain(); this.windGain.gain.value = 0;
    this.windSrc.connect(this.windFilter).connect(this.windGain).connect(this.localBus);
    this.windSrc.start();

    this.rattleSrc = ctx.createBufferSource();
    this.rattleSrc.buffer = nb; this.rattleSrc.loop = true;
    this.rattleFilter = ctx.createBiquadFilter();
    this.rattleFilter.type = 'bandpass'; this.rattleFilter.frequency.value = 90; this.rattleFilter.Q.value = 2.0;
    this.rattleGain = ctx.createGain(); this.rattleGain.gain.value = 0;
    this.rattleSrc.connect(this.rattleFilter).connect(this.rattleGain).connect(this.localBus);
    this.rattleSrc.start();

    // rolling / tyre noise
    this.rollSrc = ctx.createBufferSource();
    this.rollSrc.buffer = nb; this.rollSrc.loop = true;
    this.rollFilter = ctx.createBiquadFilter();
    this.rollFilter.type = 'lowpass'; this.rollFilter.frequency.value = 300;
    this.rollGain = ctx.createGain(); this.rollGain.gain.value = 0;
    this.rollSrc.connect(this.rollFilter).connect(this.rollGain).connect(this.localBus);
    this.rollSrc.start();

    // breathing (only audible under g)
    this.breathGain = ctx.createGain(); this.breathGain.gain.value = 0;
    this.breathFilter = ctx.createBiquadFilter();
    this.breathFilter.type = 'bandpass'; this.breathFilter.frequency.value = 420; this.breathFilter.Q.value = 1.1;
    this.breathSrc = ctx.createBufferSource();
    this.breathSrc.buffer = nb; this.breathSrc.loop = true;
    this.breathSrc.connect(this.breathFilter).connect(this.breathGain).connect(this.localBus);
    this.breathSrc.start();

    // cockpit muffling — engaged in first person, bypassed outside
    this.cockpitFilter = ctx.createBiquadFilter();
    this.cockpitFilter.type = 'lowpass';
    this.cockpitFilter.frequency.value = 20000;

    this.boomBuf = boomBuffer(ctx);
    this.ready = true;
  }

  resume() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  setVolume(v) {
    this.masterVolume = v;
    if (this.master) this.master.gain.value = this.enabled ? v : 0;
  }
  toggle() {
    this.enabled = !this.enabled;
    if (this.master) this.master.gain.value = this.enabled ? this.masterVolume : 0;
    return this.enabled;
  }

  // -------------------------------------------------------------------------
  /** Record where the jet was, so exterior listeners can hear it late. */
  record(t, pos, vel, mach) {
    const h = this._history;
    h.push({ t, x: pos.x, y: pos.y, z: pos.z, vx: vel.x, vy: vel.y, vz: vel.z, mach });
    // keep ~35 s: enough for a listener 12 km away
    while (h.length > 2 && t - h[0].t > 35) h.shift();
  }

  _sampleAt(t) {
    const h = this._history;
    if (!h.length) return null;
    if (t <= h[0].t) return h[0];
    if (t >= h[h.length - 1].t) return h[h.length - 1];
    let lo = 0, hi = h.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (h[mid].t <= t) lo = mid; else hi = mid;
    }
    const a = h[lo], b = h[hi];
    const u = (t - a.t) / Math.max(1e-6, b.t - a.t);
    return {
      t, x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z + (b.z - a.z) * u,
      vx: a.vx + (b.vx - a.vx) * u, vy: a.vy + (b.vy - a.vy) * u, vz: a.vz + (b.vz - a.vz) * u,
      mach: a.mach + (b.mach - a.mach) * u,
    };
  }

  /**
   * Solve |L - P(t)| = c (now - t) for the *earliest* arrival.
   * Returns {sample, delay, distance} or null.
   */
  _retarded(listener, now) {
    let t = now - 0.05;
    for (let i = 0; i < 6; i++) {
      const s = this._sampleAt(t);
      if (!s) return null;
      const d = Math.hypot(listener.x - s.x, listener.y - s.y, listener.z - s.z);
      const nt = now - d / C_SOUND;
      if (Math.abs(nt - t) < 1e-3) { t = nt; break; }
      t = nt;
    }
    const s = this._sampleAt(t);
    if (!s) return null;
    const d = Math.hypot(listener.x - s.x, listener.y - s.y, listener.z - s.z);
    return { s, delay: clamp(now - t, 0, 38), distance: d };
  }

  /** Has the shock front reached the listener since the last frame? */
  _checkBoom(listener, now) {
    const h = this._history;
    if (h.length < 4) return 0;
    // f(t) = |L - P(t)| - c(now - t). The shock front is the earliest tangency.
    let minF = Infinity, minSample = null;
    for (let i = 0; i < h.length; i += 2) {
      const p = h[i];
      if (p.mach <= 1.0) continue;
      const d = Math.hypot(listener.x - p.x, listener.y - p.y, listener.z - p.z);
      const f = d - C_SOUND * (now - p.t);
      if (f < minF) { minF = f; minSample = p; }
    }
    const prev = this._lastF;
    this._lastF = minF === Infinity ? 1 : minF;
    if (minF !== Infinity && prev > 0 && minF <= 0 && this._boomCooldown <= 0 && minSample) {
      const d = Math.hypot(listener.x - minSample.x, listener.y - minSample.y, listener.z - minSample.z);
      this._boomCooldown = 0.9;
      // overpressure falls off roughly as d^-3/4 for an N-wave
      return clamp(2.4 / Math.pow(Math.max(d, 60) / 300, 0.75), 0, 1.6) * clamp(minSample.mach - 0.98, 0, 1);
    }
    return 0;
  }

  playBoom(intensity) {
    if (!this.ready || !intensity) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.boomBuf;
    src.playbackRate.value = 0.85 + Math.random() * 0.2;
    const g = ctx.createGain();
    g.gain.value = clamp(intensity, 0, 1.4) * 0.9;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 400 + 2600 * clamp(intensity, 0, 1);
    src.connect(f).connect(g).connect(this.master);
    src.start();
  }

  /** One-shot click / thump helper for gear, touchdown and switches. */
  blip(freq, dur, gain, type = 'sine') {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.4), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  thump(intensity) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 0.6;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 180;
    const g = ctx.createGain();
    g.gain.setValueAtTime(clamp(intensity, 0, 1) * 0.7, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    src.connect(f).connect(g).connect(this.master);
    src.start(t); src.stop(t + 0.4);
  }

  /** Continuous warning tone (master caution, stall, overspeed). */
  warn(on, freq = 880) {
    if (!this.ready) return;
    if (on && !this._warn) {
      const ctx = this.ctx;
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = freq;
      const g = ctx.createGain(); g.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 3.2;
      const lg = ctx.createGain(); lg.gain.value = 0.035;
      lfo.connect(lg).connect(g.gain);
      o.connect(g).connect(this.master);
      o.start(); lfo.start();
      this._warn = { o, g, lfo };
    } else if (!on && this._warn) {
      const { o, g, lfo } = this._warn;
      g.gain.cancelScheduledValues(this.ctx.currentTime);
      g.gain.value = 0;
      o.stop(); lfo.stop();
      this._warn = null;
    } else if (on && this._warn) {
      this._warn.o.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    }
  }

  // -------------------------------------------------------------------------
  /**
   * @param listener  {position, velocity, right}  world metres / m/s
   * @param fm        flight model
   * @param prop      propulsion
   * @param cockpit   true when the camera is inside the canopy
   */
  update(dt, listener, fm, prop, cockpit, weather) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx, now = ctx.currentTime;
    this._time += dt;
    this._boomCooldown = Math.max(0, this._boomCooldown - dt);

    this.record(now, fm.position, fm.velocity, fm.mach);

    const n1 = prop.n1, ab = prop.afterburner, spool = prop.spool;

    // --- source-side engine timbre ---
    const fan = 55 + n1 * 165;                       // fundamental
    this.turbines[0].set(fan * 15.6, 0.030 + 0.045 * spool, now);
    this.turbines[1].set(fan * 31.2, 0.008 + 0.020 * spool, now);
    this.turbines[2].set(fan * 46.0, 0.004 + 0.012 * spool * (1 - ab * 0.5), now);
    this.turbines[3].set(fan * 2.0, 0.030 + 0.070 * spool, now);
    at(this.turbGain.gain, 0.55, now, 0.1);

    at(this.rumbleFilter.frequency, 110 + n1 * 260 + ab * 240, now, 0.15);
    at(this.rumbleGain.gain, 0.22 + 0.55 * spool, now, 0.12);

    at(this.abFilter.frequency, 300 + ab * 900, now, 0.1);
    at(this.abGain.gain, ab * 1.15, now, 0.12);

    // --- propagation to the listener ---
    const lp = listener.position;
    const dx = lp.x - fm.position.x, dy = lp.y - fm.position.y, dz = lp.z - fm.position.z;
    const dist = Math.hypot(dx, dy, dz);

    if (cockpit) {
      at(this.delay.delayTime, 0, now, 0.05);
      at(this.distGain.gain, 0.42, now, 0.1);
      // the canopy and the helmet take the top off everything
      at(this.absorb.frequency, 1500, now, 0.15);
      at(this.panner.pan, 0, now, 0.2);
    } else {
      const ret = this._retarded(lp, now);
      if (ret) {
        at(this.delay.delayTime, ret.delay, now, 0.08);
        // inverse distance with a near-field floor
        const gain = clamp(90 / Math.max(ret.distance, 12), 0.0, 2.4);
        at(this.distGain.gain, gain, now, 0.10);

        // Doppler from the source's motion along the line of sight at emission
        const ex = lp.x - ret.s.x, ey = lp.y - ret.s.y, ez = lp.z - ret.s.z;
        const ed = Math.max(1, Math.hypot(ex, ey, ez));
        const closing = (ret.s.vx * ex + ret.s.vy * ey + ret.s.vz * ez) / ed;
        const doppler = clamp(1 / (1 - clamp(closing / C_SOUND, -0.92, 0.92)), 0.45, 2.6);
        this.turbines[0].set(fan * 15.6 * doppler, 0.030 + 0.045 * spool, now, 0.08);
        this.turbines[1].set(fan * 31.2 * doppler, 0.008 + 0.020 * spool, now, 0.08);
        this.turbines[2].set(fan * 46.0 * doppler, 0.004 + 0.012 * spool, now, 0.08);
        this.turbines[3].set(fan * 2.0 * doppler, 0.030 + 0.070 * spool, now, 0.08);
        at(this.rumbleFilter.frequency, (110 + n1 * 260 + ab * 240) * doppler, now, 0.1);

        // air absorption: high frequencies die first over distance
        at(this.absorb.frequency, clamp(19000 * Math.exp(-ret.distance / 2400), 250, 19000), now, 0.2);

        // stereo placement
        const rx = listener.right.x, ry = listener.right.y, rz = listener.right.z;
        const pan = clamp((ex * rx + ey * ry + ez * rz) / ed, -1, 1);
        at(this.panner.pan, -pan * 0.85, now, 0.15);
      }
      const boom = this._checkBoom(lp, now);
      if (boom > 0) this.playBoom(boom);
    }

    // --- local (cockpit) layers ---
    const qbar = fm.qbar;
    const windAmt = cockpit
      ? clamp(qbar / 26000, 0, 1) * 0.55
      : clamp(qbar / 60000, 0, 1) * 0.10;
    at(this.windGain.gain, windAmt * (1 + (weather ? weather.rain : 0) * 0.4), now, 0.2);
    at(this.windFilter.frequency, 400 + clamp(fm.tas, 0, 700) * 2.2, now, 0.2);

    const shake = clamp((Math.abs(fm.gLoad) - 2) / 7, 0, 1) * 0.5
      + (fm.stalled ? 0.5 : 0) + clamp((fm.mach - 0.93) * 4, 0, 1) * 0.25 * clamp(1.4 - fm.mach, 0, 1)
      + (weather ? weather.turbulence * 0.4 : 0);
    at(this.rattleGain.gain, cockpit ? shake * 0.5 : shake * 0.08, now, 0.15);

    const gs = Math.hypot(fm.velocity.x, fm.velocity.z);
    at(this.rollGain.gain, fm.onGround ? clamp(gs / 60, 0, 1) * (cockpit ? 0.35 : 0.15) : 0, now, 0.08);
    at(this.rollFilter.frequency, 160 + gs * 6, now, 0.1);

    // breathing under g, in the cockpit only
    const breath = cockpit ? clamp((Math.abs(fm.gLoad) - 3.5) / 5, 0, 1) : 0;
    const cycle = 0.5 + 0.5 * Math.sin(this._time * 3.4);
    at(this.breathGain.gain, breath * 0.22 * cycle, now, 0.06);
    at(this.breathFilter.frequency, 320 + cycle * 260, now, 0.08);
  }
}
