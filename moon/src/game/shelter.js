/* =============================================================================
   SHELTER — the hours you spend not exploring
   -----------------------------------------------------------------------------
   Eating, drinking and sleeping, on the timescales a person actually needs
   them, which is the point: a lunar day is 29 and a half Earth days long, so
   waiting for the Sun to come up is not a pause, it is two weeks. Being able to
   sleep through it, or to sleep until the Sun reaches a particular angle
   because that is when the shadows will be doing something interesting, is the
   difference between the lunar day being a fact and it being a feature.

   The needs themselves are deliberately quiet. A meal every six to eight hours
   and a sleep every sixteen to twenty is roughly what a working person does,
   and nothing here nags: the panel tells you how long it has been when you are
   somewhere you could do something about it, and otherwise stays out of the
   way.

   Sleeping is only possible somewhere pressurised, because taking a helmet off
   is the whole point of a shelter. The ship has a bed. The rover has a bunk
   that folds out of the rear bulkhead, which is a worse bed and a much better
   view.
   ========================================================================== */

const HOUR = 3600;

export class Needs {
  constructor() {
    this.sinceMeal = 2 * HOUR;
    this.sinceSleep = 5 * HOUR;
    this.sleepDebt = 0;
  }

  /** @param {number} dt seconds of simulated time */
  step(dt) {
    this.sinceMeal += dt;
    this.sinceSleep += dt;
    /* Past twenty hours awake, tiredness starts to accumulate rather than just
       counting up. It is shown, and it never kills anyone. */
    if (this.sinceSleep > 20 * HOUR) this.sleepDebt += dt;
    return this;
  }

  eat() { this.sinceMeal = 0; return this; }

  sleep(hours) {
    this.sinceSleep = 0;
    this.sleepDebt = Math.max(0, this.sleepDebt - hours * HOUR * 2);
    this.sinceMeal += hours * HOUR * 0.5;      // you wake up hungry
    return this;
  }

  /** Plain words, because a hunger bar would be worse than useless here. */
  describe() {
    const h = (s) => (s / HOUR).toFixed(0);
    const hungry = this.sinceMeal > 7 * HOUR;
    const tired = this.sinceSleep > 18 * HOUR;
    return {
      meal: `last ate ${h(this.sinceMeal)} h ago`,
      sleep: `awake ${h(this.sinceSleep)} h`,
      hungry, tired,
      note: tired ? 'you should sleep' : hungry ? 'you should eat' : '',
    };
  }
}

/**
 * How long until the Sun reaches a given elevation at a place, searching
 * forward. Returns hours, or null if it does not happen within a lunar day.
 *
 * The Sun moves across the lunar sky at about half a degree an hour, so this
 * steps coarsely and then refines, which is fast enough to run on a click.
 */
export function hoursUntilSunElevation(skyAt, ephemerisAt, jdFromUnixMs,
                                       simMs, lat, lon, targetDeg, rising = true) {
  const at = (ms) => skyAt(ephemerisAt(jdFromUnixMs(ms)), lat, lon, 0).sunEl;
  let prev = at(simMs);
  const stepH = 2;
  for (let h = stepH; h <= 30 * 24; h += stepH) {
    const el = at(simMs + h * HOUR * 1000);
    const crossed = rising ? (prev < targetDeg && el >= targetDeg)
                           : (prev > targetDeg && el <= targetDeg);
    if (crossed) {
      /* Bisect the two hour window down to a minute. */
      let lo = h - stepH, hi = h;
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        const m = at(simMs + mid * HOUR * 1000);
        if (rising ? m >= targetDeg : m <= targetDeg) hi = mid; else lo = mid;
      }
      return hi;
    }
    prev = el;
  }
  return null;
}

export class Shelter {
  /**
   * @param {object} opts { el, onRest }
   *   onRest(hours, what) advances the clock and restores what it should
   */
  constructor(opts) {
    this.root = opts.el;
    this.onRest = opts.onRest;
    this.needs = new Needs();
    this.open = false;
    this.where = null;
    if (this.root) {
      this.root.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.hours) this.onRest(Number(b.dataset.hours), 'sleep');
        else if (b.dataset.sun) this.onRest(null, 'sun:' + b.dataset.sun);
        else if (b.dataset.do) this.onRest(0, b.dataset.do);
      });
    }
  }

  /** @param {string|null} where 'ship', 'rover', or null when outside */
  update(where, info) {
    if (where !== this.where) {
      this.where = where;
      if (this.root) this.root.style.display = where ? 'block' : 'none';
      if (where) this.render(where, info);
    } else if (where && this.root && this.root.style.display !== 'none') {
      this.render(where, info);
    }
  }

  render(where, info) {
    const n = this.needs.describe();
    const el = (id) => document.getElementById(id);
    if (el('sh-where')) el('sh-where').textContent =
      where === 'ship' ? 'aboard the ship' : 'in the rover, pressurised';
    if (el('sh-needs')) el('sh-needs').textContent =
      `${n.meal} · ${n.sleep}${n.note ? ' · ' + n.note : ''}`;
    if (el('sh-sun')) el('sh-sun').textContent = info && info.sunEl !== undefined
      ? `sun ${info.sunEl.toFixed(1)}° · ${info.nextSunrise !== null && info.nextSunrise !== undefined
          ? `sunrise in ${info.nextSunrise.toFixed(0)} h` : 'daylight'}`
      : '';
    const resupply = el('sh-resupply');
    if (resupply) resupply.style.display = where === 'ship' ? '' : 'none';
  }
}
