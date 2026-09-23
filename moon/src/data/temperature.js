/* =============================================================================
   TEMPERATURE — how hot the ground actually is
   -----------------------------------------------------------------------------
   The Moon has the widest surface temperature range of anywhere humans have
   stood. Diviner measures the equatorial noon at 387 to 397 K and the pre-dawn
   at about 95 K, and inside a permanently shadowed polar crater it reads as low
   as 25 K, which is colder than the surface of Pluto. That is not a detail. It
   is the reason a suit spends most of its battery on thermal control and most
   of its water on boiling heat away, and it is why walking from sunlight into a
   shadow is a real event rather than a change of lighting.

   Four global maps are vendored at Diviner's own half a degree: the maximum and
   minimum over the day, and the values at local noon and local midnight. What
   happens between them is derived here, and derived is the right word.

   In sunlight a surface with almost no thermal inertia sits close to radiative
   equilibrium, where temperature goes as the fourth root of the cosine of the
   solar incidence angle. That is why the lunar terminator is so sharp
   thermally: the fourth root is flat near noon and falls off a cliff near the
   horizon.

   At night there is nothing driving it and the surface simply radiates away
   what little heat the top few centimetres hold, cooling fast at first and then
   very slowly. Diviner's own curves show dusk about thirty kelvin warmer than
   dawn for exactly that reason, and that asymmetry is reproduced here.

   Half a degree is fifteen kilometres. Everything from this file is labelled
   REGIONAL, and the number is a brightness temperature averaged over that
   footprint: the shadowed side of the boulder next to you is much colder than
   this says.
   ========================================================================== */

import { decodeElevationPng } from '../terrain/png16.js';

/**
 * The model, kept pure so it can be tested against the published curves.
 *
 * @param {object} t { max, min, noon, midnight } in kelvin, from Diviner
 * @param {number} sunElDeg  the Sun's elevation above the local horizon
 * @param {number} nightFraction  0 at sunset, 1 at sunrise; ignored in daylight
 * @returns {number} kelvin
 */
export function temperatureFrom(t, sunElDeg, nightFraction) {
  if (sunElDeg > 0) {
    /* Radiative equilibrium: T proportional to the fourth root of cos(incidence),
       and cos(incidence) on level ground is the sine of the Sun's elevation. */
    const mu = Math.min(1, Math.sin(sunElDeg * Math.PI / 180));
    return t.min + (t.max - t.min) * Math.pow(mu, 0.25);
  }
  /* Night. Dusk starts warm because the ground has been in the Sun all day. */
  const f = Math.max(0, Math.min(1, nightFraction));
  const dusk = t.midnight + DUSK_EXCESS;
  return f < 0.5
    ? dusk + (t.midnight - dusk) * ease(f * 2)
    : t.midnight + (t.min - t.midnight) * ease((f - 0.5) * 2);
}

/* Diviner sees dusk about thirty kelvin above dawn at low latitudes: the
   regolith is still radiating away the day it just had. */
const DUSK_EXCESS = 30;

/* Cooling is fast at first and then very slow, which this curve gives without
   pretending to be a thermal model of the top centimetre of regolith. */
function ease(x) { return 1 - Math.pow(1 - x, 2.4); }

/* --- pits and caves ----------------------------------------------------------
   Diviner sees the pits, and what it sees is the best argument anyone has for
   going into one.

   Horvath, Hayne and Paige measured the Mare Tranquillitatis and Mare Ingenii
   pits glowing about a hundred kelvin warmer than the ground around them at
   night, modelled what that implies about the inside, and found three numbers
   worth putting in a game. Near the equator a regolith floor in the open part
   of a pit can pass 420 K at noon — hotter than the plain outside, because it
   is being cooked by the sunlit wall opposite as well as by the Sun. Beyond the
   opening, in permanent shadow, the temperature is nearly constant at about
   290 K: seventeen degrees Celsius, room temperature, the whole lunar day and
   the whole lunar night, because a shaded cavity comes into radiative
   equilibrium with itself. And a cave under a pit would raise the night-time
   temperature of the ground above it by 0.1 K, which is why nobody can find
   one from orbit this way.

   Two of those are used directly. The third — the day-time temperature of a
   patch of pit floor that is shaded but still open to the sky — is not
   published, so it is bounded rather than invented: never colder than the
   cavity value, because the walls it can see are hotter than that.

   Horvath, T. et al. (2022), Thermal and Illumination Environments of Lunar
   Pits and Caves, Geophysical Research Letters, doi 10.1029/2022GL099710.
   ------------------------------------------------------------------------- */

export const PIT_THERMAL = {
  /** Permanent shadow beyond the opening: a blackbody cavity, near-constant. */
  caveK: 290,
  /** The 2-D model's ">420 K" on a regolith-covered equatorial pit floor at
      noon, about 20 K over the warmest surface Diviner has measured. Their 3-D
      model, run for two lunar days rather than to equilibrium, peaks nearer
      415 K with the same floor. */
  peakFloorK: 422,
  /** How much hotter than the open surface, at the Sun's highest. The paper's
      own comparison is "about 20 K higher than the warmest equatorial
      surfaces", so this is that, not a fitted number. */
  sunExcessK: 22,
  /** What Diviner actually measured at night, over the surrounding surface. */
  nightExcessK: 100,
  source: 'Horvath, Hayne & Paige 2022, GRL, doi 10.1029/2022GL099710',
};

/**
 * The temperature inside a pit, given what it would be out on the plain.
 *
 * @param {number} surfaceK what the open surface at this place and hour reads
 * @param {object} where { inCave, sunlit, sunElDeg }
 * @returns {{kelvin:number, why:string}}
 */
export function pitTemperature(surfaceK, where) {
  if (where.inCave) {
    return { kelvin: PIT_THERMAL.caveK, why: 'permanent shadow, radiative equilibrium' };
  }
  if (where.sunElDeg <= 0) {
    /* Night: the measurement, not a model. The floor holds the day's heat and
       re-radiates against walls that do the same, and Diviner watches it glow. */
    return {
      kelvin: Math.min(PIT_THERMAL.caveK, surfaceK + PIT_THERMAL.nightExcessK),
      why: 'pit floor at night, ~100 K over the surrounding surface',
    };
  }
  if (where.sunlit) {
    /* Day, in the Sun: the Sun plus the wall opposite. Interpolated between the
       open surface and the published peak, which is what makes this DERIVED. */
    const mu = Math.sin(where.sunElDeg * Math.PI / 180);
    return {
      kelvin: Math.min(PIT_THERMAL.peakFloorK, surfaceK + PIT_THERMAL.sunExcessK * mu),
      why: 'sunlit pit floor, warmed by the wall opposite',
    };
  }
  /* Day, in the wall's shadow: no published figure. It cannot be colder than
     the cavity value, because everything it can see is hotter than that. */
  return {
    kelvin: Math.max(PIT_THERMAL.caveK, Math.min(surfaceK, PIT_THERMAL.peakFloorK)),
    why: 'shaded pit floor, bounded below by the cavity value',
  };
}

export class TemperatureMap {
  constructor(manifest) {
    this.spec = manifest;
    this.layers = null;
    this.width = manifest ? manifest.w : 0;
    this.height = manifest ? manifest.h : 0;
    this.scale = manifest ? manifest.scale : 10;
  }

  /** Load the four rasters. Everything degrades to null if they are missing. */
  async load(base) {
    if (!this.spec) return null;
    const names = Object.keys(this.spec.layers);
    const decoded = await Promise.all(names.map(async (k) => {
      const res = await fetch(base + this.spec.layers[k]);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return decodeElevationPng(await res.arrayBuffer(), 0);
    }));
    this.layers = {};
    names.forEach((k, i) => { this.layers[k] = decoded[i].data; });
    this.width = decoded[0].width;
    this.height = decoded[0].height;
    return this;
  }

  /** The four Diviner values under a point, in kelvin. */
  sample(lat, lon) {
    if (!this.layers) return null;
    const x = Math.min(this.width - 1, Math.max(0, Math.floor((lon + 180) / 360 * this.width)));
    const y = Math.min(this.height - 1, Math.max(0, Math.floor((90 - lat) / 180 * this.height)));
    const i = y * this.width + x;
    const s = this.scale;
    return {
      max: this.layers.max[i] / s, min: this.layers.min[i] / s,
      noon: this.layers.noon[i] / s, midnight: this.layers.predawn[i] / s,
    };
  }

  /**
   * @param {number} lat @param {number} lon
   * @param {number} sunElDeg @param {number} localSolarHour 0..24
   * @returns {{kelvin, celsius, source, label, diviner}|null}
   */
  at(lat, lon, sunElDeg, localSolarHour) {
    const t = this.sample(lat, lon);
    if (!t) return null;
    /* Local solar time runs 0 at midnight to 24; the night is the half from 18
       round through 0 to 6. */
    const h = ((localSolarHour % 24) + 24) % 24;
    const nightFraction = h >= 18 ? (h - 18) / 12 : h <= 6 ? (h + 6) / 12 : 0;
    const kelvin = temperatureFrom(t, sunElDeg, nightFraction);
    return {
      kelvin, celsius: kelvin - 273.15, diviner: t,
      label: 'REGIONAL', source: this.spec.source,
    };
  }
}
