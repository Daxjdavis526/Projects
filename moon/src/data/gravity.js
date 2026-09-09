/* =============================================================================
   GRAVITY — GRAIL's free-air anomaly, from disk
   -----------------------------------------------------------------------------
   The mascons are real. Mare Serenitatis pulls about 300 milligals harder than
   the reference field, which is a fifth of a percent of lunar gravity: a real,
   measured, mapped variation that no human standing on it could possibly feel.
   So it is shown as a number and never applied to the physics, which is what
   the brief asked for and the opposite of what would be fun to exaggerate.

   `data/grail4.png` has been in the repository the whole time — built by
   tools/build_data.py, recorded in the manifest, 791 KB — and nothing read it.
   DATA_SOURCES.md claimed the layer was "streamed + vendored 4 ppd", and half
   of that was a file on disk with no reader. This is the reader. It also makes
   the gravity row work with streaming off or the network gone, which is the
   only row on the science overlay that had no vendored fallback at all.

   Values are milligals of free-air anomaly, stored as whole milligals plus the
   pipeline's 32768 bias, four pixels per degree.
   ========================================================================== */

import { decodeElevationPng } from '../terrain/png16.js';

/* The reference value the overlay adds the anomaly to. GM/r^2 at the mean
   radius; a milligal is 1e-5 m/s^2. */
export const G_REFERENCE = 1.6246;

export class GravityMap {
  /** @param {object} manifest the `gravity` block of data/manifest.json */
  constructor(manifest) {
    this.spec = manifest || null;
    this.data = null;
    this.width = manifest ? manifest.w : 0;
    this.height = manifest ? manifest.h : 0;
  }

  /** Load the raster. Returns null rather than throwing if it is not there. */
  async load(base) {
    if (!this.spec) return null;
    const res = await fetch(base + this.spec.path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await decodeElevationPng(await res.arrayBuffer(), this.spec.bias ?? 32768);
    this.data = d.data;
    this.width = d.width;
    this.height = d.height;
    return this;
  }

  /** Free-air anomaly in milligals, or null if the raster is not loaded. */
  mGal(lat, lon) {
    if (!this.data) return null;
    const x = Math.min(this.width - 1, Math.max(0,
      Math.floor((((lon + 180) % 360 + 360) % 360) / 360 * this.width)));
    const y = Math.min(this.height - 1, Math.max(0,
      Math.floor((90 - lat) / 180 * this.height)));
    return this.data[y * this.width + x];
  }

  /**
   * What the overlay wants: the local acceleration and the anomaly that made
   * it. Four pixels per degree is 7.6 km, so this is a regional figure and is
   * labelled as one.
   */
  at(lat, lon) {
    const a = this.mGal(lat, lon);
    if (a === null) return null;
    return {
      freeAir_mGal: a,
      g: G_REFERENCE + a * 1e-5,
      res_deg: 1 / (this.spec.ppd || 4),
      source: this.spec.source,
    };
  }
}
