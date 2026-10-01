/* A sensor: the only way the operator learns anything about the physics.

   REAL state goes in; MEASURED state comes out, through a chain every real
   transducer has:

     truth ──► response lag ──► sensitivity ──► + mains hum ──► anti-alias
           ──► + zero offset + bias ──► × chain gain ──► + noise
           ──► − zero correction ──► quantise ──► saturate ──► (faults)

   · lag         a diaphragm, a thermocouple bead, a filter capacitor
   · sensitivity the transducer's own gain (a load cell's mechanical
                 sensitivity). A shunt calibration cannot see an error here.
   · zero offset every transducer drifts a little overnight; zeroing removes
                 it — IF the zero is taken when the true value is zero.
                 Zero a pressurised transducer and the line pressure becomes
                 its "zero".
   · chain gain  the signal-conditioning and scaling: excitation, amplifier
                 gain, the calibration factor typed into the DAQ. A shunt
                 calibration checks this.
   · noise       broadband, so it grows with the DAQ bandwidth (sample rate)
   · saturation  the amplifier rails a little beyond the calibrated range

   Faults (Phase 4) plug in as fields: bias, chainGain, mechGain, stuckAt,
   open, noiseScale, drift, intermittent. None of them know they are faults. */

export class Sensor {
  constructor(spec, getter, rng) {
    this.spec = spec;
    this.id = spec.id;
    this.kind = spec.kind;
    this.quantity = spec.quantity;
    this.get = getter;
    this.rng = rng;
    this.discrete = spec.quantity === 'discrete';
    this.range = spec.range || [0, 1];
    const span = this.range[1] - this.range[0];
    this.span = span;
    this.lo = this.range[0] - 0.05 * span;           // amplifier rails
    this.hi = this.range[1] + 0.10 * span;
    this.lsb = spec.bits ? span / Math.pow(2, spec.bits) : 0;
    this.tau = spec.tau ?? 0;
    this.noise = spec.noise ?? 0;
    this.hum = spec.hum ?? 0;
    this.humPhase = rng.uniform(0, 2 * Math.PI);
    this.zeroable = spec.zeroable !== false && !this.discrete;
    this.zeroOffset = spec.zeroSigma ? rng.gauss() * spec.zeroSigma : 0;
    this.zeroCorr = 0;
    this.shunt = false;
    this.shuntValue = spec.shuntCal ?? 0;
    // fault hooks
    this.bias = 0;
    this.chainGain = 1;
    this.mechGain = 1;
    this.noiseScale = 1;
    this.drift = 0;              // SI units per second
    this.driftAcc = 0;
    this.stuckAt = null;
    this.open = false;           // open circuit: reads off-scale
    this.intermittent = 0;       // probability per sample of a dropout starting
    this.dropN = 0;              // samples left in the current dropout
    this.dropValue = NaN;        // what a dropout reads: no data — or, for a frequency counter that has lost its pulses, zero
    this.lagScale = 1;
    // state
    const v0 = this.discrete ? getter() : getter() * this.mechGain;
    this.y = v0;                 // lagged truth
    this.aa1 = v0; this.aa2 = v0;
    this.value = NaN;            // last sampled output
    this.ema = NaN;              // slow average of the pre-zero reading, for zeroing
  }

  /* Advance the analogue front end by dt at time t (called at the DAQ's
     internal conversion rate, well above its output rate). fc is the
     anti-alias corner frequency the DAQ currently uses. */
  update(t, dt, fc) {
    if (this.discrete) return;
    const x = this.get() * this.mechGain;
    const tau = this.tau * this.lagScale;
    if (tau > 0) this.y += (x - this.y) * (1 - Math.exp(-dt / tau));
    else this.y = x;
    const s = this.y + (this.hum ? this.hum * Math.sin(2 * Math.PI * 60 * t + this.humPhase) : 0);
    const a = 1 - Math.exp(-2 * Math.PI * fc * dt);
    this.aa1 += (s - this.aa1) * a;
    this.aa2 += (this.aa1 - this.aa2) * a;
    if (this.drift) this.driftAcc += this.drift * dt;
  }

  /* Produce one DAQ sample. `noiseBw` scales white noise with bandwidth. */
  sample(t, noiseBw) {
    if (this.discrete) {
      let v = this.get() ? 1 : 0;
      if (this.stuckAt !== null) v = this.stuckAt;
      if (this.open) v = 0;
      this.value = v;
      return v;
    }
    let v;
    if (this.open) {
      v = this.hi;                                    // open bridge/TC reads off-scale high
    } else if (this.stuckAt !== null) {
      v = this.stuckAt;
    } else {
      v = this.aa2;
      if (this.shunt) v += this.shuntValue;          // shunt: known imbalance in the bridge
      v = (v + this.zeroOffset + this.bias + this.driftAcc) * this.chainGain;
      v += this.rng.gauss() * this.noise * this.noiseScale * noiseBw;
    }
    // the amplifier rails and the ADC quantises the raw signal…
    if (this.lsb) v = Math.round(v / this.lsb) * this.lsb;
    if (v < this.lo) v = this.lo;
    if (v > this.hi) v = this.hi;
    // …and the zero is a software offset applied after conversion
    if (!this.open && this.stuckAt === null) {
      this.ema = Number.isNaN(this.ema) ? v : this.ema + (v - this.ema) * 0.02;
      v -= this.zeroCorr;
    }
    // a loose connector drops out in bursts of a few to tens of ms, not
    // single samples
    if (this.dropN > 0) { this.dropN--; v = this.dropValue; }
    else if (this.intermittent && this.rng.chance(this.intermittent)) { this.dropN = 20 + Math.floor(this.rng.next() * 200); v = this.dropValue; }
    this.value = v;
    return v;
  }

  /* Zero: take the current reading as the new zero. Returns what it
     removed, so the caller can log it. */
  zero() {
    if (!this.zeroable || Number.isNaN(this.ema)) return null;
    const prev = this.zeroCorr;
    this.zeroCorr = this.ema;
    return this.zeroCorr - prev;
  }

  /* Start of a new DAQ configuration: forget the running average. */
  resetAverages() { this.ema = NaN; }
}
