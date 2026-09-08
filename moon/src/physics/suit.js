/* =============================================================================
   SUIT — the life support that decides how long you can stay outside
   -----------------------------------------------------------------------------
   Pure: no DOM, no three.js, so the whole consumable model runs in the tests.

   An EVA suit is not an oxygen bar. It is a spacecraft the size of a person,
   and four separate things run out at four different rates:

     oxygen      what you breathe, and the gas that holds the suit at pressure
     the scrubber  which absorbs carbon dioxide until it saturates
     water       the sublimator boils it to space to carry heat away, and you
                 drink a little of it
     electricity which runs the fan, the pump, the radio and the lights

   On Apollo the binding constraint was usually the scrubber or the feedwater,
   not oxygen, and that is modelled here rather than assumed away. The numbers
   come from the Apollo A7L portable life support system, the Shuttle and
   station EMU, and the published xEMU requirements; they are in config.js with
   their sources noted in RESEARCH.md. The specific capacities of this
   particular near-future suit are fiction, but they are fiction of a plausible
   size: about eight hours of work with a real reserve on top.

   Failure is not a sudden death. Oxygen reaching zero means the suit can no
   longer hold pressure or replace what you breathe, and the sequence that
   follows is well documented from altitude-chamber work: useful consciousness
   for a short time, then unconsciousness. The game represents that as losing
   consciousness and being recovered, and never shows anything worse. Carbon
   dioxide is the more insidious one, because it degrades judgement long before
   it does anything dramatic, so it is surfaced early and loudly.
   ========================================================================== */

import { SUIT } from '../config.js';

export const MODE = { REALISTIC: 'realistic', RELAXED: 'relaxed', UNLIMITED: 'unlimited' };

/* Suit partial pressure of CO2, in millimetres of mercury, from the fraction of
   the scrubber that is used up. A fresh canister holds it near zero; a spent one
   lets it climb to the point where the flight rules say terminate. */
export function co2PartialPressure(saturation) {
  return 26 * Math.pow(Math.max(0, Math.min(1.4, saturation)), 2.2);
}

export class Suit {
  constructor(opts = {}) {
    this.mode = opts.mode || MODE.REALISTIC;
    this.reset();
  }

  reset() {
    this.o2 = SUIT.o2Capacity;              // kg
    this.o2Reserve = SUIT.o2Secondary;      // kg, the purge bottle
    this.co2 = 0;                           // kg absorbed by the scrubber
    this.power = SUIT.powerCapacity;        // Wh
    this.water = SUIT.waterCapacity;        // kg
    this.pressure = SUIT.pressure;          // kPa
    this.lights = false;
    /* Assume the sunlit case until told otherwise, so an endurance figure asked
       for before the first step is not quietly optimistic about the cooling. */
    this.cooling = true;
    this.heating = false;
    this.elapsed = 0;                       // seconds of EVA
    this.unconsciousFor = 0;
    this.recovered = 0;
    this.warnings = [];
    this.worstCo2 = 0;
    return this;
  }

  /**
   * What a full recharge would take out of whoever is providing it: the
   * shortfall against a full suit, not the capacity, so topping up a nearly
   * full suit is nearly free.
   */
  refillCost() {
    return {
      o2: Math.max(0, SUIT.o2Capacity - this.o2) +
          Math.max(0, SUIT.o2Secondary - this.o2Reserve),
      co2: Math.max(0, this.co2),
      water: Math.max(0, SUIT.waterCapacity - this.water),
    };
  }

  /** A full recharge, from the ship or the rover. */
  recharge() {
    this.o2 = SUIT.o2Capacity;
    this.o2Reserve = SUIT.o2Secondary;
    this.co2 = 0;
    this.power = SUIT.powerCapacity;
    this.water = SUIT.waterCapacity;
    this.elapsed = 0;
    this.unconsciousFor = 0;
    return this;
  }

  get rate() { return SUIT.modes[this.mode] ?? 1; }
  get o2Fraction() { return this.o2 / SUIT.o2Capacity; }
  get co2Fraction() { return this.co2 / SUIT.co2Capacity; }
  get powerFraction() { return this.power / SUIT.powerCapacity; }
  get waterFraction() { return this.water / SUIT.waterCapacity; }
  get co2mmHg() { return co2PartialPressure(this.co2Fraction); }
  get unconscious() { return this.unconsciousFor > 0; }

  /**
   * How much longer you can stay out, in seconds, on the consumable that will
   * run out first. This is the number a person actually watches.
   */
  endurance(exertion = 0.35) {
    if (this.rate === 0) return Infinity;
    const h = this.rates(exertion);
    const times = [
      (this.o2 + this.o2Reserve) / h.o2, (SUIT.co2Capacity - this.co2) / h.co2,
      this.power / h.power, this.water / h.water,
    ].filter(t => Number.isFinite(t) && t >= 0);
    /* The difficulty setting stretches the clock rather than removing it. */
    return Math.min(...times) * 3600 / this.rate;
  }

  /** Which consumable is the binding one right now. */
  /* Which consumable will run out first. The difficulty scale is the same for
     all four, so it cannot change the answer and is left out here. */
  limiting(exertion = 0.35) {
    const h = this.rates(exertion);
    const t = {
      oxygen: (this.o2 + this.o2Reserve) / h.o2,
      scrubber: (SUIT.co2Capacity - this.co2) / h.co2,
      power: this.power / h.power,
      water: this.water / h.water,
    };
    return Object.entries(t).sort((a, b) => a[1] - b[1])[0][0];
  }

  /** Consumption per hour at a given exertion, before the difficulty scale. */
  rates(exertion) {
    const e = Math.max(0, Math.min(1, exertion));
    /* Metabolic rate roughly doubles between standing and working hard, and
       oxygen use, carbon dioxide production and cooling all follow it. */
    const work = 0.45 + 0.55 * e;
    return {
      o2: (SUIT.o2RateIdle + (SUIT.o2RateHard - SUIT.o2RateIdle) * e),
      co2: SUIT.co2Rate * work,
      water: SUIT.waterRate * work,
      /* Watts, which is watt-hours per hour, so it divides straight into the
         battery's capacity like the other three. */
      power: SUIT.powerBase + (this.lights ? SUIT.powerLights : 0) +
             (this.cooling ? SUIT.powerCooling : 0) +
             (this.heating ? SUIT.powerHeater : 0),
    };
  }

  /**
   * @param {number} dt seconds of simulated time
   * @param {object} s { exertion, sunlit, lights, inShelter }
   */
  step(dt, s = {}) {
    const scale = this.rate;
    this.lights = !!s.lights;
    /* Thermal control is not symmetric. In sunlight the suit is fighting to
       dump heat and the sublimator boils water; in shadow it is fighting to
       keep you warm and the heater draws power. */
    this.cooling = s.sunlit !== false;
    this.heating = s.sunlit === false;

    if (s.inShelter) { this.elapsed = 0; return this; }
    this.elapsed += dt;
    if (scale === 0) return this;                    // UNLIMITED

    const h = this.rates(s.exertion ?? 0.35);
    const hours = dt / 3600 * scale;
    const wanted = h.o2 * hours;
    const fromPrimary = Math.min(this.o2, wanted);
    this.o2 -= fromPrimary;
    /* When the primary is gone the purge bottle opens on its own. It is a walk
       home, not an extension of the day: about half an hour, and it does not
       run the scrubber, so carbon dioxide climbs the whole time. */
    if (wanted > fromPrimary) this.o2Reserve = Math.max(0, this.o2Reserve - (wanted - fromPrimary));
    this.co2 = Math.min(SUIT.co2Capacity * 1.4, this.co2 + h.co2 * hours);
    this.water = Math.max(0, this.water - h.water * hours);
    this.power = Math.max(0, this.power - h.power * hours);
    this.worstCo2 = Math.max(this.worstCo2, this.co2mmHg);

    /* Pressure holds while there is oxygen to make it up. When the oxygen is
       gone the suit cannot replace what leaks and what you breathe, and the
       pressure falls away over a couple of minutes. */
    if (this.o2 <= 0 && this.o2Reserve <= 0) {
      this.pressure = Math.max(0, this.pressure - SUIT.pressure * dt / 120);
    }
    else this.pressure = SUIT.pressure;

    /* Losing consciousness: from oxygen gone, from the scrubber saturated to
       well past the flight rules, or from the suit no longer holding pressure.
       The game recovers you rather than showing anything worse. */
    const hypoxic = this.pressure < SUIT.pressure * 0.4;
    const poisoned = this.co2mmHg > 30;
    if (hypoxic || poisoned) this.unconsciousFor += dt;
    else this.unconsciousFor = Math.max(0, this.unconsciousFor - dt * 0.5);

    this.warnings = this.checkWarnings();
    return this;
  }

  /**
   * Cautions and warnings at the levels the flight rules actually use, rather
   * than at whatever fraction looks dramatic.
   */
  checkWarnings() {
    const w = [];
    const push = (level, id, text) => w.push({ level, id, text });
    if (this.rate === 0) return w;
    const f = this.o2Fraction;
    if (f <= SUIT.reserveCriticalFraction) push('critical', 'o2', 'OXYGEN CRITICAL — RETURN NOW');
    else if (f <= SUIT.reserveWarnFraction) push('caution', 'o2', 'OXYGEN LOW');

    const c = this.co2mmHg;
    if (c >= SUIT.co2CriticalMmHg) push('critical', 'co2', 'CO2 HIGH — SCRUBBER SPENT');
    else if (c >= SUIT.co2WarnMmHg) push('caution', 'co2', 'CO2 RISING');

    if (this.powerFraction <= SUIT.reserveCriticalFraction) push('critical', 'power', 'BATTERY CRITICAL');
    else if (this.powerFraction <= SUIT.reserveWarnFraction) push('caution', 'power', 'BATTERY LOW');

    if (this.waterFraction <= SUIT.reserveCriticalFraction) push('critical', 'thermal', 'FEEDWATER CRITICAL');
    else if (this.waterFraction <= SUIT.reserveWarnFraction) push('caution', 'thermal', 'FEEDWATER LOW');

    if (this.pressure < SUIT.pressure * 0.9) push('critical', 'pressure', 'SUIT PRESSURE FALLING');
    return w;
  }

  snapshot() {
    return {
      mode: this.mode,
      o2Fraction: this.o2Fraction, co2Fraction: this.co2Fraction,
      powerFraction: this.powerFraction, waterFraction: this.waterFraction,
      o2ReserveFraction: this.o2Reserve / SUIT.o2Secondary,
      onReserve: this.o2 <= 0 && this.o2Reserve > 0,
      co2mmHg: this.co2mmHg, pressureKpa: this.pressure,
      enduranceSeconds: this.endurance(), limiting: this.limiting(),
      elapsed: this.elapsed, warnings: this.warnings,
      unconscious: this.unconscious, lights: this.lights,
      heating: this.heating, cooling: this.cooling,
    };
  }
}
