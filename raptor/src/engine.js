// Two independently modelled afterburning turbofans.
//
// Each engine tracks a spool state (0 = idle, 1 = military power) plus an
// afterburner state. Thrust falls off with density and rises a little with ram
// recovery at high Mach, the way a real fixed-geometry-ish turbofan does.

import { AC } from './config.js';

const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

class Engine {
  constructor(index) {
    this.index = index;
    this.spool = 0;          // 0..1 idle->mil
    this.ab = 0;             // 0..1 afterburner
    this.n1 = 0.60;          // fan speed fraction, for gauges and audio
    this.egt = 420;          // K, indicated
    this.thrust = 0;
    this.fuelFlow = 0;
    this.running = true;
  }

  update(dt, throttle, air, mach, alt) {
    // throttle 0..1 is military range; 1.0..1.5 requests afterburner
    const demandSpool = clamp(throttle, 0, 1);
    const demandAB = clamp((throttle - 1) / 0.5, 0, 1);

    const up = dt / AC.spoolUpTime, down = dt / AC.spoolDownTime;
    // spooling is faster when the engine is already hot
    const bias = 0.6 + 0.8 * this.spool;
    if (demandSpool > this.spool) this.spool = Math.min(demandSpool, this.spool + up * bias);
    else this.spool = Math.max(demandSpool, this.spool - down);

    // the augmentor lights and dies much faster than the core spools
    const abRate = dt / (demandAB > this.ab ? 0.9 : 0.6);
    this.ab += clamp(demandAB - this.ab, -abRate, abRate);
    if (this.spool < 0.55) this.ab = Math.max(0, this.ab - dt * 3);   // won't light at low power

    if (!this.running) { this.spool = Math.max(0, this.spool - dt * 0.5); this.ab = 0; }

    this.n1 = 0.58 + 0.42 * this.spool + 0.02 * this.ab;

    // density lapse, with ram recovery above ~M 0.6
    const sigma = air.rho / 1.225;
    const lapse = Math.pow(sigma, 0.72);
    const ram = 1 + 0.42 * Math.max(0, mach - 0.55) - 0.12 * Math.max(0, mach - 1.9);

    const mil = AC.thrustMil * lapse * ram;
    const abMax = AC.thrustAB * lapse * ram;
    const core = mil * (AC.idleFraction + (1 - AC.idleFraction) * this.spool);
    this.thrust = core + (abMax - mil) * this.ab * this.spool;

    this.fuelFlow = this.thrust > 0
      ? core * AC.sfcMil + (this.thrust - core) * AC.sfcAB
      : 0;

    const target = 420 + 780 * this.spool + 520 * this.ab;
    this.egt += (target - this.egt) * Math.min(1, dt * 1.5);
    return this.thrust;
  }
}

export class Propulsion {
  constructor() {
    this.engines = [new Engine(0), new Engine(1)];
    this.throttle = 0;       // 0..1.5 (>1 = afterburner)
    this.fuelFlow = 0;
    this._thrust = 0;
    this._air = { rho: 1.225 };
    this._mach = 0;
    this._alt = 0;
  }

  get afterburner() { return Math.max(this.engines[0].ab, this.engines[1].ab); }
  get n1() { return 0.5 * (this.engines[0].n1 + this.engines[1].n1); }
  get spool() { return 0.5 * (this.engines[0].spool + this.engines[1].spool); }

  update(dt, air, mach, alt, fuelRemaining) {
    this._air = air; this._mach = mach; this._alt = alt;
    let t = 0, f = 0;
    for (const e of this.engines) {
      e.running = fuelRemaining > 0;
      t += e.update(dt, this.throttle, air, mach, alt);
      f += e.fuelFlow;
    }
    this._thrust = t;
    this.fuelFlow = f;
  }

  /** Total thrust, recomputed lazily for the current air state. */
  totalThrust() { return this._thrust; }
}
