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
