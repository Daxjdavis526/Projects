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
import { regolithBrdf } from './photometry.js';

/* Degrees. See targetLuminance: this is what stops a polar sunrise from
   blowing out. It is only a fallback; a caller that knows what the ground
   around the camera is doing passes `slopeSpreadDeg` measured from it. */
const SLOPE_SPREAD_DEG = 10;

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
 *   slopeSpreadDeg how steeply the ground around here runs, degrees: the
 *                  brightest thing in frame is lit as though the Sun stood
 *                  this much higher than it does
   *   albedo         local normal albedo
   *   groundFraction 0..1, how much of the frame is ground rather than sky
 *   viewMu         cosine of the angle the ground is seen at, 0.35 standing
 *   phaseDeg       angle between the Sun and the view direction; small means
 *                  looking down-sun, where the surface is at its brightest
   *   earthIllum     0..1 illuminated fraction of the Earth
   *   earthElevation degrees; below zero contributes nothing
   *   lampLuminance  extra light the player is carrying
   * }
   */
  static targetLuminance(s) {
    /* Not the level-ground incidence. Real terrain has slopes, and near the
       poles that is the whole story: with the Sun half a degree up, level
       ground reflects almost nothing while every slope tilted towards the Sun
       is brightly lit, and an exposure set from the level-ground value opens
       eight stops and turns those slopes into white paper. The Moon's RMS
       slope at hundred-metre baselines is around seven degrees, so the
       brightest thing in frame is lit as though the Sun were about ten degrees
       higher than it is. */
    const el = s.sunElevation ?? 0;
    /* Ten degrees is the Moon's RMS slope at hundred-metre baselines, but the
       Moon is not uniformly rough: a mare plain runs two or three degrees and a
       saturated highland or a crater wall runs twenty-five. Metering flat
       ground with the highland figure makes the mare too dark; metering a
       cratered highland with the mare figure blows every sunward slope to white
       paper, which is exactly what the first screenshot pass showed at nine
       degrees of Sun on the far side. So the caller measures it where the
       camera actually is rather than reading it off a table. */
    const spread = Math.max(2, Math.min(28, s.slopeSpreadDeg ?? SLOPE_SPREAD_DEG));
    const sunEl = el <= 0 ? 0
      : Math.sin(Math.min(90, el + spread) * Math.PI / 180);
    const albedo = s.albedo ?? OPTICS.albedoMare;
    const ground = s.groundFraction ?? 0.55;
    /* The same photometry the shader uses, so the camera cannot over-expose the
       very thing it is pointed at. Two effects matter and neither is small.
       Regolith seen edge-on is brighter than regolith seen from above, which is
       why the far distance is the brightest part of a lunar photograph. And
       looking down-sun, within a few degrees of zero phase, the opposition
       surge nearly doubles it, which is why a nadir view under a high Sun looks
       washed out to any exposure set from the Sun angle alone. */
    const mu = Math.max(0.05, s.viewMu ?? 0.35);
    const phase = (s.phaseDeg ?? OPTICS.normalisePhase * 180 / Math.PI) * Math.PI / 180;
    const sunlit = albedo * regolithBrdf(sunEl, mu, phase) * (s.sunVisible ?? 1);
    const earthEl = Math.max(0, Math.sin((s.earthElevation ?? -90) * Math.PI / 180));
    const earthshine = albedo * earthEl * (s.earthIllum ?? 0) *
      (EARTHSHINE_FULL / SOLAR_CONSTANT);
    const lamp = s.lampLuminance ?? 0;
    /* The sky contributes nothing at all: there is no atmosphere to scatter
       anything into it. But a black sky must not be allowed to drag the average
       down and open the exposure until the ground blows out, which is what a
       plain area-weighted average does. An eye or a camera pointed at a bright
       thing against black exposes for the bright thing. So the ground's own
       brightness dominates whenever any of it is in frame, and looking up buys
       most of a stop rather than five. */
    const framing = 0.35 + 0.65 * ground;
    return framing * (sunlit + earthshine + lamp) + 1e-6;
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
