/* =============================================================================
   EXPOSURE — why you cannot see the stars from a sunlit plain
   -----------------------------------------------------------------------------
   Pure, testable, and analytic rather than measured off the framebuffer: no
   readback stall, no frame of lag, deterministic in screenshots.

   Sunlit regolith reflects about a tenth of 1361 W/m^2. A shadowed slope lit
   only by earthshine gets about 1.5e-4 of that. Between the two lies a range of
   roughly seventeen stops, which no display can show at once and no eye can see
   at once either. So the camera adapts, quickly when it gets brighter and slowly
   when it gets darker, exactly as an eye does, and the stars appear only once
   the adaptation has caught up with the dark.

   That is not a stylistic choice. It is the reason the Apollo crews reported a
   black, empty sky while standing in sunlight, and could pick out stars only
   from inside a shadow with their eyes shaded.
   ========================================================================== */

import { EXPOSURE, OPTICS, EARTHSHINE_FULL, SOLAR_CONSTANT } from '../config.js';

export class Exposure {
  constructor(opts = {}) {
    this.ev = -3;
    this.evMin = opts.evMin ?? EXPOSURE.evMin;
    this.evMax = opts.evMax ?? EXPOSURE.evMax;
    this.tauUp = opts.tauBrighten ?? EXPOSURE.tauBrighten;
    this.tauDown = opts.tauDarken ?? EXPOSURE.tauDarken;
    this.reference = opts.evReference ?? EXPOSURE.evReference;
    /* A manual bias, for the photography mode and the "see the stars" setting. */
    this.bias = 0;
  }

  /**
   * The luminance the camera is pointed at, in units where sunlit mare is ~0.1.
   *
   * @param {object} s {
   *   sunElevation   degrees above the local horizon
   *   sunVisible     0..1, is the Sun actually above the local horizon profile
   *   albedo         local normal albedo
   *   groundFraction 0..1, how much of the frame is ground rather than sky
   *   earthIllum     0..1 illuminated fraction of the Earth
   *   earthElevation degrees; below zero contributes nothing
   *   lampLuminance  extra light the player is carrying
   * }
   */
  static targetLuminance(s) {
    const sunEl = Math.max(0, Math.sin((s.sunElevation ?? 0) * Math.PI / 180));
    const albedo = s.albedo ?? OPTICS.albedoMare;
    const ground = s.groundFraction ?? 0.55;
    const sunlit = albedo * sunEl * (s.sunVisible ?? 1);
    const earthEl = Math.max(0, Math.sin((s.earthElevation ?? -90) * Math.PI / 180));
    const earthshine = albedo * earthEl * (s.earthIllum ?? 0) *
      (EARTHSHINE_FULL / SOLAR_CONSTANT);
    const lamp = s.lampLuminance ?? 0;
    /* The sky itself contributes essentially nothing: no atmosphere. */
    return ground * (sunlit + earthshine + lamp) + 1e-6;
  }

  /** Advance the adaptation by dt seconds and return the exposure multiplier. */
  update(state, dt) {
    const target = Math.log2(Exposure.targetLuminance(state));
    const clamped = Math.max(this.evMin, Math.min(this.evMax, target));
    const tau = clamped > this.ev ? this.tauUp : this.tauDown;
    const k = 1 - Math.exp(-Math.max(0, dt) / tau);
    this.ev += (clamped - this.ev) * k;
    return this.exposure();
  }

  /** Jump straight to the adapted value: used when a scene starts or teleports. */
  snap(state) {
    this.ev = Math.max(this.evMin, Math.min(this.evMax,
      Math.log2(Exposure.targetLuminance(state))));
    return this.exposure();
  }

  exposure() {
    return Math.pow(2, this.reference - this.ev + this.bias);
  }

  /** How dark-adapted we are, 0 in full sun to 1 in deep shadow. */
  adaptation() {
    return Math.max(0, Math.min(1, (this.reference - this.ev) / 8));
  }
}
