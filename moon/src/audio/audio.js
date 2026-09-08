/* =============================================================================
   AUDIO — what you can hear here, and why almost none of it travels
   -----------------------------------------------------------------------------
   Sound is a pressure wave in a fluid, and at the lunar surface there is no
   fluid to carry one. The exosphere holds something like 1e5 particles per
   cubic centimetre at night against 2.5e19 at Earth's sea level, and its mean
   free path is longer than the Moon is wide, so the gas is collisionless. That
   is the part worth being precise about. An airborne sound outdoors here is not
   faint and it is not muffled. There is no mode for it to exist in.

   So this file plays no wind, no engine heard from outside a vehicle, no
   explosion, no rumble under a distant rockfall, and no ambient drone dressed
   up as a physical sound. Anything you hear outdoors arrived some other way,
   and there are only two other ways.

   The first is that you are wearing a small pressurised machine with your head
   inside it. Apollo crews described the suits as noisy and used moulded ear
   inserts or hearing protection; the LM cabin measured 70 to 82 dBA, about 72
   once mufflers were fitted. A ventilation fan runs a few centimetres from your
   ear with nowhere for its noise to go, a pump circulates cooling water, a
   regulator answers every breath, and in a quiet moment the loudest thing in
   there is you. That is the bed for the whole game, and it is deliberately not
   silence.

   The second is structure. A boot strikes regolith and the impulse travels
   sole, boot, suit, skeleton, cochlea, without ever being airborne. Every one
   of those stages is a mass on a compliance, so the path is a low pass with a
   corner a couple of hundred hertz up. A footfall on the Moon should sound like
   a door closing two rooms away: short, dull, and over before you noticed it
   began. It must never sound like a boot recorded on gravel, because that
   recording is of a path which does not exist here.

   Three buses carry those ideas and nothing else does.

     helmet   your own bubble and the headset inside it. Present whenever the
              suit is sealed, which the mix infers from the ambient pressure
              rather than trusting a flag.
     air      whatever room you are standing in, scaled by that room's pressure
              and by nothing else.
     body     structure borne. Never gated, because a vacuum outside a hull does
              not stop the hull from ringing.

   The airlock is where the argument becomes audible. As the chamber empties the
   vent feeds the air bus and the body bus at once. The airborne share dies with
   the very gas it was travelling through, while the structure borne share does
   not change at all, so the cycle ends with you standing a metre from a roaring
   valve hearing your own fan and feeling a tremble through your boots.

   Approximations, stated plainly. No public measurement of the sound level
   inside an EMU exists, only the description "an extreme acoustic environment",
   so the levels here are chosen to be listenable for hours rather than to be
   accurate. The fan's blade passing tone sits lower and far quieter than a real
   one would, for the same reason. Reverberation is not modelled anywhere: the
   only two volumes with air in them are small and packed with equipment, and a
   few tens of milliseconds of decay reads as the colour of a box rather than as
   an echo, which two filters supply for the price of no convolver. The
   heartbeat is a game convention, held at silence until the suit is genuinely
   in trouble so that hearing it still means something.

   Everything is synthesised from oscillators and one noise buffer built at
   start up. There are no audio files to load, no network, and nothing that can
   fail except the browser refusing to hand over a context, which is answered by
   going quiet rather than by throwing.
   ========================================================================== */

import { PLAYER, ROVER } from '../config.js';

/* --- constants -------------------------------------------------------------- */

const TAU = Math.PI * 2;

/* Radiated sound power goes with the density of the gas, so amplitude goes with
   its square root; on top of that a fan or a voice loses its grip on a thinning
   gas and drives it less hard. The truth is between the two, and this exponent
   is the single most important number in the file. */
const AIR_EXPONENT = 0.75;

/* Classical absorption per metre goes as 1/pressure, so the top of the spectrum
   is the first thing to leave a room that is emptying. */
const AIR_CUTOFF_MIN = 180;
const AIR_CUTOFF_MAX = 17000;

/* The structure borne path through boot, suit and body. Two poles here and the
   rest of the low pass is in the ear's own indifference to what is left. */
const BODY_CUTOFF = 240;

const NOISE_SECONDS = 3;

/* One shot sounds are cheap but not free, and a stuck simulation can ask for
   hundreds. Past this many live voices new ones are simply dropped. */
const MAX_VOICES = 24;

/* Caution and warning tones, played into the headset and therefore audible in
   vacuum. Each pip is [offset, duration, startHz, endHz]. The patterns differ
   in rhythm rather than only in pitch, because rhythm is what a busy person
   recognises without stopping to listen. `thump` adds a structural knock for
   the two events that are physical as well as informational. */
const ALARMS = {
  /* Three fast pips high in the voice band, where a headset is loudest.
     Oxygen is the one you must act on immediately. */
  o2: { type: 'square', peak: 0.15, thump: 0,
        pips: [[0, 0.085, 990, 990], [0.12, 0.085, 990, 990], [0.24, 0.13, 990, 990]] },
  /* A slow two tone warble, easy to tell from the oxygen pips while you are
     looking at something else. */
  co2: { type: 'triangle', peak: 0.16, thump: 0,
         pips: [[0, 0.16, 620, 620], [0.17, 0.16, 780, 780],
                [0.34, 0.16, 620, 620], [0.51, 0.20, 780, 780]] },
  /* Falling, because the thing it is about is falling. */
  power: { type: 'triangle', peak: 0.15, thump: 0,
           pips: [[0, 0.28, 700, 420], [0.36, 0.34, 700, 380]] },
  /* Rising and unhurried: a thermal margin is a problem you have minutes for. */
  thermal: { type: 'sine', peak: 0.16, thump: 0,
             pips: [[0, 0.30, 520, 900], [0.40, 0.34, 560, 980]] },
  /* The only alarm that is also an event you are inside of, so it gets a siren
     in the headset and a knock in the structure at the same time. */
  pressure: { type: 'sawtooth', peak: 0.13, thump: 0.55,
              pips: [[0, 0.5, 620, 1180], [0.5, 0.5, 1180, 620], [1.0, 0.45, 620, 1180]] },
  /* Felt first and reported second, which is this whole file in one alarm. */
  impact: { type: 'triangle', peak: 0.11, thump: 1.0,
            pips: [[0.18, 0.22, 440, 380]] },
  default: { type: 'triangle', peak: 0.12, thump: 0,
             pips: [[0, 0.14, 740, 740], [0.19, 0.18, 590, 590]] },
};

/* Interface sounds. These are generated by the suit computer and delivered to
   the headset, so like the alarms they exist in vacuum. They are quieter than
   the alarms by a wide margin because they happen a hundred times an hour. */
const BEEPS = {
  select:  { type: 'sine',   peak: 0.055, pips: [[0, 0.035, 1320, 1320]] },
  confirm: { type: 'sine',   peak: 0.070, pips: [[0, 0.05, 880, 880], [0.055, 0.09, 1320, 1320]] },
  deny:    { type: 'square', peak: 0.050, pips: [[0, 0.13, 200, 168]] },
  comms:   { type: 'sine',   peak: 0.030, pips: [[0, 0.025, 1900, 1250]] },
  default: { type: 'sine',   peak: 0.055, pips: [[0, 0.035, 1100, 1100]] },
};

/* --- helpers ---------------------------------------------------------------- */

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

/**
 * Coerce one snapshot field to a number. Callers legitimately supply booleans
 * for things like `heating`, fractions for the same field elsewhere, and state
 * names for `airlock`, so all three are accepted rather than argued with.
 */
function num(v, d = 0) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : d;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    return (v === '' || v === 'closed' || v === 'sealed' || v === 'idle' || v === 'none') ? 0 : 1;
  }
  return d;
}

/** A half sine window of `width` starting at phase `at`, wrapping at 1. */
function pulse(phase, at, width) {
  let x = phase - at;
  if (x < 0) x += 1;
  return x < width ? Math.sin(x / width * Math.PI) : 0;
}

/**
 * setTargetAtTime is the only ramp that can be re-aimed every single frame
 * without cancelling anything first, which is what makes a mix driven from a
 * render loop click free. `tau` is the exponential time constant, so the value
 * is about 95 per cent of the way there after three of them.
 */
function setT(param, value, now, tau) {
  if (!Number.isFinite(value)) return;
  param.setTargetAtTime(value, now, tau);
}

/* ============================================================================ */

export class Sound {
  /**
   * @param {object} opts {
   *   volume       0..1 master, default 0.8
   *   muted        boolean
   *   autoCaution  repeat a quiet caution tone while suit.warnings is non empty
   *   context      an AudioContext to borrow instead of making one; it will not
   *                be closed by dispose()
   * }
   */
  constructor(opts = {}) {
    this.volume = clamp01(num(opts.volume, 0.8));
    this.muted = !!opts.muted;
    this.autoCaution = opts.autoCaution !== false;
    this.borrowed = opts.context || null;

    /* Nothing touches the Web Audio API until start(). A page that never gets a
       user gesture must never have created a context, and a browser with the
       API missing entirely has to reach the end of the frame loop unharmed. */
    this.ctx = null;
    this.n = null;
    this.noise = null;
    this.ok = false;
    this.voices = 0;

    /* Per frame state. Everything update() needs to remember lives here so that
       the frame path itself allocates nothing. */
    this.primed = false;
    this.time = 0;
    this.breathPhase = 0;
    this.pumpPhase = 0;
    this.heartPhase = 0;
    this.cautionPhase = 0;
    this.cabinPhase = 0;
    this.prevSteps = -1;
    this.prevStepPhase = 0;
    this.prevGrounded = true;
    this.prevImpact = 0;
    this.prevPressure = 1;
    this.prevCanopy = 0;
    this.servoLevel = 0;
    this.commsFlash = 0;
    this.wheelArmed = true;
    this.lastStepAt = -1;
    this.lastWheelAt = -1;
    this.lastAlarmAt = Object.create(null);
  }

  /* --- lifecycle ------------------------------------------------------------ */

  /**
   * Build the graph. Must be called from inside a user gesture, because every
   * browser now refuses to start an AudioContext outside one. Safe to call
   * again; later calls only resume a context the browser has suspended.
   *
   * @returns {Promise<boolean>} whether there is any audio at all
   */
  async start() {
    if (this.ok) return this._resume();
    try {
      const Ctx = this.borrowed
        ? null
        : (globalThis.AudioContext || globalThis.webkitAudioContext);
      if (!this.borrowed && !Ctx) return false;
      this.ctx = this.borrowed || new Ctx({ latencyHint: 'interactive' });
      this._build();
      this.ok = true;
      this.time = this.ctx.currentTime;
      await this._resume();
      return this.ok;
    } catch (err) {
      /* A blocked or exhausted audio device is not a reason to stop the game.
         Everything below degrades to silence from here. */
      this.ok = false;
      this.ctx = null;
      this.n = null;
      return false;
    }
  }

  async _resume() {
    try {
      if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();
    } catch (err) { /* stays suspended, stays silent */ }
    return this.ok;
  }

  /** Release the device. The context is only closed if we were the ones to open it. */
  dispose() {
    const n = this.n;
    this.ok = false;
    this.n = null;
    try {
      if (n) {
        n.hissA.stop(); n.hissB.stop();
        n.fanTone.stop(); n.cabinHum.stop(); n.heartOsc.stop(); n.cautionOsc.stop();
        n.motorOsc.stop();
        n.master.disconnect();
        n.limiter.disconnect();
      }
      if (this.ctx && !this.borrowed) this.ctx.close();
    } catch (err) { /* already gone */ }
    this.ctx = null;
    this.noise = null;
  }

  /* --- mixer controls ------------------------------------------------------- */

  setVolume(v) {
    this.volume = clamp01(num(v, this.volume));
    this._applyMaster();
  }

  setMuted(m) {
    this.muted = !!m;
    this._applyMaster();
  }

  _applyMaster() {
    if (!this.ok) return;
    try {
      const g = this.n.master.gain;
      const now = this.ctx.currentTime;
      /* A linear ramp rather than setTargetAtTime, because an exponential
         approach to mute leaves an audible residue behind for a long time. */
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(this.muted ? 0 : this.volume, now + 0.06);
    } catch (err) { /* silence is an acceptable outcome */ }
  }

  /* --- the persistent graph -------------------------------------------------- */

  /**
   * One noise buffer serves the entire file. It is white tilted towards the low
   * end by a one pole filter, which is roughly what machinery noise looks like
   * and is much cheaper than putting another filter on every node that wants
   * some. The filter is primed on the tail of the buffer before the pass that
   * writes it, so its state at the end of the pass matches the state it started
   * with and the loop point has no step in it.
   */
  _makeNoise(seconds) {
    const ctx = this.ctx;
    const len = Math.max(1024, Math.floor(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    let last = 0;
    for (let i = Math.max(0, len - 4096); i < len; i++) last = 0.86 * last + 0.14 * d[i];

    let peak = 1e-6;
    for (let i = 0; i < len; i++) {
      const w = d[i];
      last = 0.86 * last + 0.14 * w;
      const v = w * 0.55 + last * 2.2;
      d[i] = v;
      const a = v < 0 ? -v : v;
      if (a > peak) peak = a;
    }
    const k = 0.9 / peak;
    for (let i = 0; i < len; i++) d[i] *= k;
    return buf;
  }

  _build() {
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    this.noise = this._makeNoise(NOISE_SECONDS);

    const gain = (v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
    const filt = (type, f, q) => {
      const b = ctx.createBiquadFilter();
      b.type = type; b.frequency.value = f;
      if (q != null) b.Q.value = q;
      return b;
    };
    const osc = (type, f) => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = f; o.start(t0);
      return o;
    };
    const hiss = (rate) => {
      const s = ctx.createBufferSource();
      s.buffer = this.noise;
      s.loop = true;
      s.playbackRate.value = rate;
      s.start(t0, Math.random() * this.noise.duration);
      return s;
    };

    const n = {};

    /* --- master ------------------------------------------------------------- */
    /* The compressor is a safety net, not an effect. Several beds and a handful
       of one shots can line up by accident, and the alternative to catching that
       is a click in somebody's headphones. */
    n.limiter = ctx.createDynamicsCompressor();
    n.limiter.threshold.value = -9;
    n.limiter.knee.value = 6;
    n.limiter.ratio.value = 12;
    n.limiter.attack.value = 0.004;
    n.limiter.release.value = 0.22;
    n.master = gain(this.muted ? 0 : this.volume);
    n.master.connect(n.limiter).connect(ctx.destination);

    /* --- the three paths ---------------------------------------------------- */
    n.airLP = filt('lowpass', AIR_CUTOFF_MAX, 0.7);
    n.air = gain(0);
    n.air.connect(n.airLP).connect(n.master);

    n.bodyLP1 = filt('lowpass', BODY_CUTOFF, 0.7);
    n.bodyLP2 = filt('lowpass', BODY_CUTOFF * 1.6, 0.6);
    n.body = gain(0.9);
    n.body.connect(n.bodyLP1).connect(n.bodyLP2).connect(n.master);

    n.helmet = gain(1);
    n.helmet.connect(n.master);

    /* Two sources at unrelated rates, so the beds that share the buffer are not
       correlated enough to phase against one another. */
    n.hissA = hiss(1.0);
    n.hissB = hiss(0.71);

    /* --- suit ventilation --------------------------------------------------- */
    n.fanBand = filt('bandpass', 900, 0.55);
    n.fanGain = gain(0);
    n.hissB.connect(n.fanBand).connect(n.fanGain).connect(n.helmet);
    n.fanTone = osc('triangle', 400);
    n.fanToneGain = gain(0);
    n.fanTone.connect(n.fanToneGain).connect(n.helmet);

    /* --- cooling loop pump --------------------------------------------------- */
    n.pumpBand = filt('bandpass', 190, 2.6);
    n.pumpGain = gain(0);
    n.hissA.connect(n.pumpBand).connect(n.pumpGain).connect(n.helmet);

    /* --- breathing ----------------------------------------------------------- */
    n.breathBand = filt('bandpass', 480, 1.1);
    n.breathGain = gain(0);
    n.hissA.connect(n.breathBand).connect(n.breathGain).connect(n.helmet);

    /* --- your own heart ------------------------------------------------------ */
    /* Onto the body bus, because that is honestly how it reaches you. */
    n.heartOsc = osc('sine', 46);
    n.heartGain = gain(0);
    n.heartOsc.connect(n.heartGain).connect(n.body);

    /* --- radio --------------------------------------------------------------- */
    /* Three kilohertz of bandwidth because voice links are built that way, and
       it is in your ear whether or not there is air anywhere near you. */
    n.commsBand = filt('bandpass', 1400, 0.85);
    n.commsGain = gain(0);
    n.hissB.connect(n.commsBand).connect(n.commsGain).connect(n.helmet);

    /* --- master caution ------------------------------------------------------ */
    n.cautionOsc = osc('triangle', 560);
    n.cautionGain = gain(0);
    n.cautionOsc.connect(n.cautionGain).connect(n.helmet);

    /* --- suit fabric and joint bearings -------------------------------------- */
    n.fabricBand = filt('bandpass', 1800, 0.8);
    n.fabricGain = gain(0);
    n.hissA.connect(n.fabricBand).connect(n.fabricGain).connect(n.helmet);

    /* --- cabin air, for the two places that have some -------------------------- */
    n.cabinLP = filt('lowpass', 900, 1.1);
    n.cabinGain = gain(0);
    n.hissB.connect(n.cabinLP).connect(n.cabinGain).connect(n.air);
    n.cabinHum = osc('triangle', 108);
    n.cabinHumGain = gain(0);
    n.cabinHum.connect(n.cabinHumGain).connect(n.air);

    /* --- rover drive ---------------------------------------------------------- */
    /* One sawtooth through a resonant low pass is a gear mesh. It is split two
       ways on purpose: the structural copy is what you feel through the seat and
       is always there, and the airborne copy only exists if the cabin has air in
       it, which the air bus decides and this file does not. */
    n.motorOsc = osc('sawtooth', 90);
    n.motorLP = filt('lowpass', 320, 4.5);
    n.motorBody = gain(0);
    n.motorAir = gain(0);
    n.motorOsc.connect(n.motorLP);
    n.motorLP.connect(n.motorBody).connect(n.body);
    n.motorLP.connect(n.motorAir).connect(n.air);

    n.tyreBand = filt('bandpass', 170, 1.3);
    n.tyreGain = gain(0);
    n.hissA.connect(n.tyreBand).connect(n.tyreGain).connect(n.body);

    /* --- mechanisms ----------------------------------------------------------- */
    /* A high Q band on noise is a servo. Body bus only: you are strapped to the
       frame the mechanism is bolted to, and that is far the loudest path even
       when there is air in the cabin as well. */
    n.servoBand = filt('bandpass', 340, 5.0);
    n.servoGain = gain(0);
    n.hissB.connect(n.servoBand).connect(n.servoGain).connect(n.body);

    /* --- vents, and the jetpack, which is also a vent -------------------------- */
    n.ventBand = filt('bandpass', 1200, 0.85);
    n.ventAir = gain(0);
    n.ventBody = gain(0);
    n.hissA.connect(n.ventBand);
    n.ventBand.connect(n.ventAir).connect(n.air);
    n.ventBand.connect(n.ventBody).connect(n.body);

    this.n = n;
  }

  /* --- one shots -------------------------------------------------------------- */

  /** A short oscillator with an envelope, disconnected the moment it is done. */
  _tone(dest, type, f0, f1, at, dur, peak, attack = 0.004) {
    if (!this.ok || this.voices >= MAX_VOICES || peak <= 0) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, f0), at);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(peak, at + Math.min(attack, dur * 0.4));
    /* Exponential rather than linear, because loudness is logarithmic and a
       linear fade sounds as though it stopped before it did. */
    g.gain.exponentialRampToValueAtTime(peak * 0.001, at + dur);
    o.connect(g).connect(dest);
    o.start(at);
    o.stop(at + dur + 0.01);
    this.voices++;
    o.onended = () => {
      this.voices--;
      try { o.disconnect(); g.disconnect(); } catch (err) { /* already torn down */ }
    };
  }

  /** A short filtered burst of the shared noise buffer. */
  _hit(dest, type, f, q, at, dur, peak) {
    if (!this.ok || this.voices >= MAX_VOICES || peak <= 0 || !this.noise) return;
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    const b = ctx.createBiquadFilter();
    const g = ctx.createGain();
    s.buffer = this.noise;
    s.loop = true;
    /* Start somewhere arbitrary in the buffer. Two footfalls that are identical
       sample for sample are the fastest way to make a synthetic sound obvious. */
    s.loopStart = 0;
    s.loopEnd = this.noise.duration;
    b.type = type; b.frequency.value = f;
    if (q != null) b.Q.value = q;
    g.gain.setValueAtTime(peak, at);
    g.gain.exponentialRampToValueAtTime(peak * 0.001, at + dur);
    s.connect(b).connect(g).connect(dest);
    s.start(at, Math.random() * (this.noise.duration - 0.1));
    s.stop(at + dur + 0.01);
    this.voices++;
    s.onended = () => {
      this.voices--;
      try { s.disconnect(); b.disconnect(); g.disconnect(); } catch (err) { /* gone */ }
    };
  }

  /** Play one of the pip patterns above into the headset. */
  _pattern(table, kind, gainScale) {
    const spec = table[kind] || table.default;
    const at = this.ctx.currentTime + 0.01;
    for (let i = 0; i < spec.pips.length; i++) {
      const p = spec.pips[i];
      this._tone(this.n.helmet, spec.type, p[2], p[3], at + p[0], p[1],
                 spec.peak * gainScale, 0.006);
    }
    return spec;
  }

  /**
   * A caution or warning. These come out of the suit computer into the headset,
   * so unlike almost everything else in the game they are unaffected by where
   * you are standing and by whether there is anything to stand in.
   *
   * @param {string} kind 'o2' | 'co2' | 'power' | 'thermal' | 'pressure' | 'impact'
   */
  alarm(kind) {
    if (!this.ok) return;
    try {
      const now = this.ctx.currentTime;
      /* A warning that repeats faster than it can be read is just noise. */
      const last = this.lastAlarmAt[kind];
      if (last !== undefined && now - last < 0.7) return;
      this.lastAlarmAt[kind] = now;
      const spec = this._pattern(ALARMS, kind, 1);
      if (spec.thump > 0) this._thump(spec.thump);
    } catch (err) { /* an alarm that fails to sound must not stop the game */ }
  }

  /**
   * Interface feedback.
   * @param {string} kind 'select' | 'confirm' | 'deny' | 'comms'
   */
  beep(kind) {
    if (!this.ok) return;
    try {
      this._pattern(BEEPS, kind, 1);
      /* A squelch is the carrier opening, so the hiss bed jumps with the click
         rather than the click arriving on its own. update() decays the flash. */
      if (kind === 'comms') this.commsFlash = 1;
    } catch (err) { /* ignored */ }
  }

  /** A structural knock: something hit the hull, or the hull hit something. */
  _thump(strength) {
    const at = this.ctx.currentTime + 0.006;
    this._tone(this.n.body, 'sine', 120 * (1 + 0.3 * strength), 44, at, 0.22, 0.7 * strength, 0.002);
    this._hit(this.n.body, 'lowpass', 210, 0.9, at, 0.13, 0.6 * strength);
  }

  /**
   * A boot arriving. Everything about this is structure borne and that is the
   * point: the impulse travels sole, boot, suit, skeleton, ear, and each of
   * those stages throws away the top of the spectrum. What is left is a short
   * dull knock with almost no attack detail, which is nothing like the sound of
   * the same boot recorded through air on Earth.
   */
  _footfall(weight, long) {
    const at = this.ctx.currentTime + 0.005;
    this._tone(this.n.body, 'sine', long ? 96 : 120, long ? 40 : 52, at,
               long ? 0.20 : 0.13, 0.55 * weight, 0.002);
    this._hit(this.n.body, 'lowpass', 190, 0.9, at, 0.085, 0.45 * weight);
    /* The one part of a footstep that is genuinely airborne, because it happens
       inside the helmet with you: the suit taking up the shock. */
    this._hit(this.n.helmet, 'bandpass', 1700, 0.8, at + 0.004, 0.07, 0.05 * weight);
  }

  /* --- the frame path ---------------------------------------------------------- */

  /**
   * Called every frame. Allocates nothing: the graph exists already and this
   * only aims AudioParams at new values. The exception is the handful of one
   * shot nodes a footfall or a suspension knock needs, which are short lived and
   * disconnect themselves.
   *
   * Every field is optional. A snapshot with nothing in it produces a suited
   * player standing still in vacuum, which is the correct default for the Moon.
   */
  update(s) {
    if (!this.ok || !s) return;
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    try {
      this._frame(s);
    } catch (err) {
      /* One bad frame must not take the audio down for the rest of the session,
         and it certainly must not take the render loop down with it. */
    }
  }

  _frame(s) {
    const n = this.n;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    let dt = num(s.dt, now - this.time);
    if (!(dt > 0)) dt = 0;
    if (dt > 0.1) dt = 0.1;      // a tab that was in the background
    this.time = now;

    const p = s.player;
    const suit = s.suit;
    const rv = s.rover;
    const ship = s.ship;

    /* --- where you are ----------------------------------------------------- */
    const env = typeof s.environment === 'string' ? s.environment : 'suit';
    const inShip = env === 'ship';
    const closedRover = env === 'rover_closed';
    const openRover = env === 'rover_open';
    const onRover = closedRover || openRover;

    /* An absent pressure is inferred from where you are rather than assumed to
       be one, because the wrong default here is the one that would put airborne
       sound on the surface of the Moon. */
    const pressure = clamp01(num(s.pressure, (inShip || closedRover) ? 1 : 0));

    /* A suit is only sealed and running hard when there is a reason for it, so
       the helmet bed rises exactly as the ambient pressure falls. This one line
       is what makes an airlock cycle a crossfade between two worlds instead of a
       fade out followed by a fade in. */
    const helmetEnv = inShip ? 0.10 : closedRover ? 0.45 : 1;
    const helmet = Math.max(helmetEnv, 1 - pressure);
    /* The headset is strapped to your head in every one of these places. */
    const headset = 0.55 + 0.45 * helmet;
    const cabin = inShip ? clamp01(num(ship && ship.interiorLevel, 1)) : closedRover ? 1 : 0;

    setT(n.helmet.gain, helmet, now, 0.25);
    setT(n.air.gain, Math.pow(pressure, AIR_EXPONENT), now, 0.08);
    setT(n.airLP.frequency,
         AIR_CUTOFF_MIN + (AIR_CUTOFF_MAX - AIR_CUTOFF_MIN) * pressure * pressure, now, 0.10);
    /* The body bus is never touched by pressure. Nothing here is boosted when
       the air goes; the structural path simply stops being masked, which is the
       whole of the effect and all of it is honest. */

    /* --- the suit ------------------------------------------------------------ */
    const power = clamp01(num(suit && suit.powerFraction, 1));
    const o2 = clamp01(num(suit && suit.o2Fraction, 1));
    const co2 = clamp01(num(suit && suit.co2Fraction, 0));
    const cooling = clamp01(num(suit && suit.cooling, 0));
    const heating = clamp01(num(suit && suit.heating, 0));
    const warnings = (suit && suit.warnings && suit.warnings.length) || 0;

    /* A battery that is nearly flat cannot spin the fan at rate. The bed sags in
       pitch and in level together, which is the first sign that anything is
       wrong and it arrives well before any alarm does. */
    const sag = 0.55 + 0.45 * Math.min(1, power * 3);
    setT(n.fanGain.gain, 0.10 * sag * (0.78 + 0.4 * cooling), now, 0.25);
    setT(n.fanBand.frequency, 640 + 420 * sag, now, 0.30);
    /* A resistive heater makes no sound at all. What you hear when it runs is
       the converter feeding it, which is why heating shows up as a tone and not
       as a hiss. */
    setT(n.fanToneGain.gain, 0.011 * sag + 0.010 * heating, now, 0.25);
    setT(n.fanTone.frequency, 300 + 130 * sag, now, 0.30);

    /* The cooling loop pump is a positive displacement machine, so it arrives as
       a train of pulses at its shaft rate rather than as a steady noise. The
       modulation is computed here rather than with an oscillator wired into the
       gain parameter: below a few hertz JavaScript is smooth enough, it costs no
       node, and a wired oscillator cannot be scaled to zero without the sum
       going negative and the bed reappearing inverted. */
    this.pumpPhase = (this.pumpPhase + dt * (1.35 + 0.55 * cooling)) % 1;
    const beat = 0.5 - 0.5 * Math.cos(this.pumpPhase * TAU);
    setT(n.pumpGain.gain, (0.012 + 0.05 * cooling) * sag * (0.25 + 0.75 * beat * beat * beat),
         now, 0.02);

    /* --- breathing ----------------------------------------------------------- */
    /* Ventilation follows carbon dioxide far more strongly than it follows
       oxygen. The medullary and carotid chemoreceptors answer arterial PCO2
       within a breath or two, while a falling oxygen fraction does very little
       until it is nearly too late. So co2Fraction is the loud term here, o2 is a
       small one, and that asymmetry is also the honest reason the suit worries
       about its scrubber before it worries about its tank. */
    const exertion = clamp01(num(p && p.exertion, 0));
    const gait = (p && typeof p.gait === 'string') ? p.gait : 'stand';
    const rate = 13 + 15 * exertion + 22 * co2 * co2 + 5 * (1 - o2) * (1 - o2);
    this.breathPhase = (this.breathPhase + dt * rate / 60) % 1;
    const ph = this.breathPhase;
    const inhale = ph < 0.38 ? Math.sin(ph / 0.38 * Math.PI) : 0;
    const exhale = (ph > 0.45 && ph < 0.95) ? Math.sin((ph - 0.45) / 0.5 * Math.PI) : 0;
    const depth = 0.35 + 0.5 * exertion + 0.45 * co2;
    setT(n.breathGain.gain,
         (0.30 + 0.70 * helmet) * 0.115 * depth * (inhale * 0.85 + exhale), now, 0.03);
    /* An inhale is drawn through the regulator and is brighter than an exhale,
       which is mostly your own chest heard from inside a closed helmet. */
    setT(n.breathBand.frequency, inhale > exhale ? 780 : 330, now, 0.05);

    /* --- your own heart ------------------------------------------------------- */
    /* You do not normally hear it. You do when things are going badly, and that
       is a real perceptual effect rather than a game trope: pulse pressure rises
       and the conducted sound rises with it. Held at exactly zero the rest of
       the time so that hearing it always means something. */
    const distress = clamp01(Math.max(co2 * 1.35 - 0.45, 0.85 - o2 * 1.2, 0.8 - power * 1.6));
    const bpm = 62 + 46 * exertion + 55 * distress;
    this.heartPhase = (this.heartPhase + dt * bpm / 60) % 1;
    const lub = pulse(this.heartPhase, 0, 0.085);
    const dub = pulse(this.heartPhase, 0.17, 0.07) * 0.6;
    setT(n.heartGain.gain, distress * distress * 0.55 * (lub + dub), now, 0.012);
    setT(n.heartOsc.frequency, 42 + 12 * distress, now, 0.5);

    /* --- radio and caution ---------------------------------------------------- */
    this.commsFlash *= Math.exp(-dt / 0.22);
    setT(n.commsGain.gain,
         headset * (0.010 * (0.4 + 0.6 * power) + 0.055 * this.commsFlash), now, 0.05);

    /* The one shot alarms are the events; this is the state. It repeats slowly
       under everything else for as long as a warning is standing. */
    if (this.autoCaution && warnings > 0) {
      this.cautionPhase = (this.cautionPhase + dt / (warnings > 1 ? 1.6 : 2.8)) % 1;
      setT(n.cautionGain.gain, (this.cautionPhase < 0.13 ? 0.045 : 0) * headset, now, 0.008);
      setT(n.cautionOsc.frequency, warnings > 1 ? 740 : 560, now, 0.02);
    } else {
      this.cautionPhase = 0;
      setT(n.cautionGain.gain, 0, now, 0.05);
    }

    /* --- limbs ----------------------------------------------------------------- */
    /* Fabric and joint bearings, which you hear because they are attached to you
       and not because the sound goes anywhere. Driven by how fast the limbs are
       actually swinging rather than by speed alone, so a hard stop is not silent
       and standing still is. */
    const speed = Math.max(0, num(p && p.speed, 0));
    const stepPhase = num(p && p.stepPhase, 0);
    const jet = clamp01(num(p && p.jetOn, 0));
    const swing = Math.min(1, speed / PLAYER.sprint) *
      (0.45 + 0.55 * Math.abs(Math.sin(stepPhase * TAU)));
    const moving = (gait === 'flight' || gait === 'jet') ? 0.25 : 1;
    setT(n.fabricGain.gain, helmet * (0.020 * swing * moving + 0.045 * jet), now, 0.07);
    setT(n.fabricBand.frequency, 1500 + 900 * swing, now, 0.10);

    /* --- cabin air ------------------------------------------------------------- */
    /* Slow enough to compute here. A ship has ducting and distant machinery; a
       rover cabin is nine cubic metres and its fans are small and close. */
    this.cabinPhase = (this.cabinPhase + dt * 0.17) % 1;
    const distant = 1 + 0.18 * Math.sin(this.cabinPhase * TAU);
    setT(n.cabinGain.gain, cabin * (inShip ? 0.15 : 0.10) * distant, now, 0.5);
    setT(n.cabinLP.frequency, inShip ? 850 : 1500, now, 0.6);
    setT(n.cabinHumGain.gain, cabin * (inShip ? 0.032 : 0.018), now, 0.5);
    setT(n.cabinHum.frequency, inShip ? 108 : 164, now, 0.6);

    /* --- rover ------------------------------------------------------------------ */
    /* Torque is what puts sound into a structure, not speed. A motor holding a
       slope at a standstill is loud and a motor coasting downhill is nearly
       silent, so the level follows the throttle while only the pitch follows the
       wheels. The airborne copy is sent to the air bus and therefore exists only
       when the canopy is down and the cabin is up to pressure; with the canopy
       open the same motor reaches you through the seat alone. */
    const throttle = onRover ? Math.min(1, Math.abs(num(rv && rv.throttle, 0))) : 0;
    const rspeed = onRover ? Math.abs(num(rv && rv.speed, 0)) : 0;
    const boost = onRover ? clamp01(num(rv && rv.boost, 0)) : 0;
    const rfrac = Math.min(1, rspeed / ROVER.speedBoost);
    const drive = onRover ? (0.045 + 0.16 * throttle + 0.05 * boost) : 0;
    setT(n.motorBody.gain, drive, now, 0.10);
    setT(n.motorAir.gain, drive * 0.55, now, 0.10);
    setT(n.motorOsc.frequency, 78 + 52 * rspeed, now, 0.12);
    setT(n.motorLP.frequency, 240 + 190 * rspeed + 320 * throttle, now, 0.15);
    /* Wheels grinding through regolith, conducted up the suspension into the
       frame you are sitting on. */
    setT(n.tyreGain.gain, onRover ? 0.085 * rfrac : 0, now, 0.12);
    setT(n.tyreBand.frequency, 150 + 60 * rfrac, now, 0.20);

    /* A hatch or a canopy is a mechanism you are sitting on. Whether `canopy`
       arrives as a fraction that sweeps or as a flag that flips, it is the rate
       of change that makes the noise, so both forms read correctly. */
    const canopy = num(rv && rv.canopy, this.prevCanopy);
    const canopyRate = dt > 0 ? Math.abs(canopy - this.prevCanopy) / dt : 0;
    this.prevCanopy = canopy;
    this.servoLevel = Math.max(this.servoLevel * Math.exp(-dt / 0.18),
                               Math.min(1, canopyRate * 1.5));
    setT(n.servoGain.gain, this.servoLevel * 0.085, now, 0.03);

    /* --- vents, and the airlock ------------------------------------------------- */
    /* This is the point of the file.
       Gas leaving through an orifice is loud, and how much of it reaches you
       depends only on where you are standing. The airborne share travels through
       the very gas that is leaving, so it dies with it and the air bus above
       kills it without this code having to say anything. The structure borne
       share travels floor, boot, suit, bone, and does not care at all. Both come
       from one source so they cannot drift out of agreement.

       The driver is the rate of change of pressure rather than any flag, because
       that is what actually corresponds to gas moving. `ship.airlock` only says
       how wide the valve is. */
    const dp = dt > 0 ? (this.prevPressure - pressure) / dt : 0;
    this.prevPressure = pressure;
    const airlock = clamp01(num(ship && ship.airlock, 0));
    const flow = Math.min(1, Math.abs(dp) * 4) * (0.55 + 0.45 * airlock);
    /* The jetpack is FICTIONAL, but it is still a nozzle, and a nozzle bolted to
       your back is the same physics as a vent bolted to a wall: nothing at all
       through the air outside, plenty through the harness. */
    const nozzle = Math.max(flow, jet);
    setT(n.ventAir.gain, nozzle * 0.5, now, 0.05);
    setT(n.ventBody.gain, nozzle * (0.22 + 0.45 * jet), now, 0.05);
    /* Choked flow through a fixed orifice thins and rises as the upstream
       pressure falls, right up to the point where there is nothing left to
       whistle with. */
    setT(n.ventBand.frequency, 900 + 2600 * (1 - pressure), now, 0.15);

    /* --- events --------------------------------------------------------------- */
    /* The first frame after start() establishes the edges rather than firing on
       them, otherwise arriving mid stride plays a phantom footfall. */
    const grounded = (p && typeof p.grounded === 'boolean') ? p.grounded : true;
    const steps = (p && typeof p.steps === 'number') ? p.steps : -1;
    const impact = Math.max(0, num(p && p.lastImpact, 0));

    if (this.primed) {
      const airborne = gait === 'flight' || gait === 'jet' || gait === 'fallen';
      /* A step count is unambiguous, so prefer it. Falling back on the stride
         phase wrapping covers a snapshot that omits it. */
      const stepped = steps >= 0
        ? (this.prevSteps >= 0 && steps > this.prevSteps)
        : (stepPhase + 0.5 < this.prevStepPhase);
      if (stepped && grounded && !airborne && now - this.lastStepAt > 0.09) {
        this.lastStepAt = now;
        /* A lope is a bound. Both boots arrive together after a long airborne
           phase, so it lands heavier and lower than a walking step does. */
        const lope = gait === 'lope';
        this._footfall(Math.min(1, 0.35 + 0.45 * Math.min(1, speed / PLAYER.lope)), lope);
      }
      if (grounded && !this.prevGrounded) {
        this._footfall(Math.min(1.4, 0.5 + impact / PLAYER.fallHurt), true);
      }
      /* A wheel dropping into a crater rim. Rearmed by falling back below the
         threshold, so a per frame impulse and a running level both work. */
      if (onRover) {
        const wheel = Math.min(1, Math.abs(num(rv && rv.wheelImpact, 0)));
        if (this.wheelArmed && wheel > 0.12 && now - this.lastWheelAt > 0.07) {
          this.wheelArmed = false;
          this.lastWheelAt = now;
          this._thump(0.25 + 0.6 * wheel);
        } else if (wheel < 0.05) {
          this.wheelArmed = true;
        }
      }
    }

    this.primed = true;
    this.prevSteps = steps;
    this.prevStepPhase = stepPhase;
    this.prevGrounded = grounded;
    this.prevImpact = impact;
  }
}
