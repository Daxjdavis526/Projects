/* =============================================================================
   AUDIO — cinematic score, honestly labelled
   -----------------------------------------------------------------------------
   Sound does not propagate through vacuum. Everything here is an artistic
   representation, driven by the physics state the way a documentary composer
   scores a cut — and the UI says so.

   Synthesised live with the Web Audio API, no samples:
     bed        filtered brown noise, always faintly present
     rumble     sub-oscillator whose gain tracks core density during collapse
     shimmer    high, glassy detuned pair during the neutrino burst
     thump      one-shot filtered impact at core bounce
     bloom      slow pad swell at shock breakout
   ========================================================================== */

export class Score {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._lastPhase = null;
  }

  /* Must be called from a user gesture. */
  init() {
    if (this.ctx) return;
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.master = ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(ctx.destination);

    /* --- bed: brown noise through a slow lowpass ------------------------ */
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
    const bedSrc = ctx.createBufferSource();
    bedSrc.buffer = buf; bedSrc.loop = true;
    this.bedFilt = ctx.createBiquadFilter();
    this.bedFilt.type = 'lowpass'; this.bedFilt.frequency.value = 120;
    this.bedGain = ctx.createGain(); this.bedGain.gain.value = 0.16;
    bedSrc.connect(this.bedFilt).connect(this.bedGain).connect(this.master);
    bedSrc.start();

    /* --- rumble: two detuned subs, gain driven by rho_c ------------------ */
    this.rumbleGain = ctx.createGain(); this.rumbleGain.gain.value = 0;
    for (const f of [31, 47.3]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = 0.5;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 90;
      o.connect(lp).connect(g).connect(this.rumbleGain);
      o.start();
    }
    this.rumbleGain.connect(this.master);

    /* --- shimmer: glassy detuned pair for the neutrino burst ------------- */
    this.shimGain = ctx.createGain(); this.shimGain.gain.value = 0;
    for (const f of [1244.5, 1247.9, 1866.2]) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = 0.33;
      o.connect(g).connect(this.shimGain);
      o.start();
    }
    const shimHp = ctx.createBiquadFilter(); shimHp.type = 'highpass'; shimHp.frequency.value = 900;
    this.shimGain.connect(shimHp).connect(this.master);
  }

  /* one-shot: deep filtered impact */
  thump(strength = 1) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(24, t + 1.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9 * strength, t);
    g.gain.exponentialRampToValueAtTime(1e-4, t + 2.8);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + 3);
    const n = ctx.createBufferSource();
    const nb = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (nd.length * 0.12));
    n.buffer = nb;
    const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 300;
    const ng = ctx.createGain(); ng.gain.value = 0.5 * strength;
    n.connect(nf).connect(ng).connect(this.master);
    n.start(t);
  }

  update(snap, dt) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const set = (param, v, tc = 0.25) => param.setTargetAtTime(v, t, tc);

    /* rumble follows collapse: log density above the progenitor's core */
    let r = 0;
    if (snap.phase === 'collapse') r = Math.min(Math.log10(snap.rho_c / 3e9) / 5.2, 1) * 0.5;
    else if (snap.phase === 'bounce') r = 0.55;
    else if (snap.phase === 'stall') r = 0.28;
    else if (snap.phase === 'explosion') r = 0.35;
    set(this.rumbleGain.gain, r * 0.35);

    /* shimmer follows the neutrino luminosity */
    const s = snap.L_nu > 1e51 ? Math.min(Math.log10(snap.L_nu / 1e51) / 2.6, 1) : 0;
    set(this.shimGain.gain, s * 0.05, 0.4);

    /* bed opens up in the aftermath */
    const bed = snap.phase === 'free' || snap.phase === 'sedov' ? 0.10 : 0.16;
    set(this.bedGain.gain, bed, 2);

    /* phase-edge one-shots */
    if (snap.phase !== this._lastPhase) {
      if (snap.phase === 'bounce') this.thump(1.0);
      if (snap.phase === 'explosion') this.thump(0.6);
      if (snap.phase === 'detonation') this.thump(0.9);
      this._lastPhase = snap.phase;
    }
  }

  setMuted(m) {
    this.enabled = !m;
    if (this.master) this.master.gain.value = m ? 0 : 0.55;
  }
}
