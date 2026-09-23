/* =============================================================================
   PHOTOGRAPHY — taking a picture of the place you are standing
   -----------------------------------------------------------------------------
   The Moon is photogenic in a way that is hard to get at while a heads-up
   display is in the way, so this hides everything and hands over the three
   controls a photographer actually wants: where the camera is, how long the
   lens is, and how the exposure is biased.

   The focal lengths are the ones Apollo carried. The Hasselblad 500EL took a
   60 mm Biogon as standard, with a 250 mm Sonnar for distant work, and the
   film was 70 mm, so on that format 60 mm is a moderate wide angle. Those
   numbers are converted here into a field of view for a 36 mm frame, which is
   what everyone's intuition about lens lengths is calibrated to.

   Exposure bias exists because the automatic model is doing something real:
   sunlit regolith and a shadowed crater floor are seventeen stops apart, which
   no display can show at once. Opening up by three stops to see into a shadow
   is what a photographer would do, and it blows the sunlit ground out exactly
   as it would on film.

   Every frame is stamped with where and when it was taken, which is the
   metadata a real surface photograph carries.
   ========================================================================== */

const FOCAL = [24, 35, 60, 105, 250];      // mm on a 36 mm frame
const el = (id) => document.getElementById(id);

export class Photo {
  constructor(opts = {}) {
    this.active = false;
    this.focal = 2;                          // index into FOCAL, starts at 60 mm
    this.bias = 0;                           // stops
    this.showStamp = true;
    this.ui = opts.ui || document.getElementById('ui');
    this.stamp = el('photo-stamp');
    this.bar = el('photo-bar');
  }

  static fovFor(focalMm) {
    /* Horizontal field of view for a 36 mm wide frame, expressed as the
       vertical field three.js wants for a 3:2 picture. */
    return 2 * Math.atan(12 / focalMm) * 180 / Math.PI;
  }

  get fov() { return Photo.fovFor(FOCAL[this.focal]); }

  toggle() {
    this.active = !this.active;
    if (this.ui) this.ui.style.display = this.active ? 'none' : '';
    if (this.bar) this.bar.style.display = this.active ? 'flex' : 'none';
    if (this.stamp) this.stamp.style.display = this.active && this.showStamp ? 'block' : 'none';
    return this.active;
  }

  zoom(dir) {
    this.focal = Math.max(0, Math.min(FOCAL.length - 1, this.focal + dir));
    return FOCAL[this.focal];
  }

  expose(stops) {
    this.bias = Math.max(-4, Math.min(5, this.bias + stops));
    return this.bias;
  }

  /** The line stamped in the corner: where, when, and how it was shot. */
  update(info) {
    if (!this.active) return;
    if (this.bar) {
      el('photo-focal').textContent = FOCAL[this.focal] + ' mm';
      el('photo-bias').textContent = (this.bias >= 0 ? '+' : '') + this.bias.toFixed(1) + ' EV';
    }
    if (this.stamp && this.showStamp) {
      const lat = `${Math.abs(info.lat).toFixed(4)}° ${info.lat >= 0 ? 'N' : 'S'}`;
      const lon = `${Math.abs(info.lon).toFixed(4)}° ${info.lon >= 0 ? 'E' : 'W'}`;
      this.stamp.innerHTML =
        `<div>${lat}  ${lon}</div>` +
        `<div>${new Date(info.simMs).toISOString().replace('T', ' ').slice(0, 19)} UTC</div>` +
        `<div>sun ${info.sunEl.toFixed(1)}° &middot; ${FOCAL[this.focal]} mm &middot; ` +
        `${(info.bias >= 0 ? '+' : '')}${info.bias.toFixed(1)} EV</div>` +
        `<div>${info.source}</div>`;
    }
  }
}

export { FOCAL };
