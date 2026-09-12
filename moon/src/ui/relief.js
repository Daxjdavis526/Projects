/* =============================================================================
   RELIEF — the shape of the ground, drawn from the heightfield
   -----------------------------------------------------------------------------
   One hillshade, used by the rover's nav console and by the full-screen map.
   It was written for the console and lifted out here when the map arrived,
   because a second copy of it would have drifted from the first within a week
   and the two are looking at the same ground.

   Slope shading rather than an elevation ramp. A driver needs to see where the
   ground gets steep, and a colour ramp keyed to absolute height says nothing
   useful inside a single crater — everything in Tycho is "low" and everything
   on its rim is "high", which you already knew. Lit from the north-west,
   because every topographic sheet ever printed is; that is a drawing
   convention and not a claim about the Sun, which is why these read as maps
   rather than as views.

   The amber is a warning and has to stay one, so it starts where a rover
   starts to struggle rather than wherever the ground stops being flat.

   `ui/preview.js` has its own version of this and keeps it: it composites the
   LROC colour mosaic over the relief at a single site's scale, which is a
   different job with different sampling, and merging the two would make both
   worse.
   ========================================================================== */

import { offsetLatLon, surfaceDistance, bearing } from '../physics/frames.js';

/* Samples across the shaded square. The nav console is 240 pixels over a
   couple of kilometres, so ten metres a sample is already finer than the
   terrain under most of it, and the full map is only ever coarser per pixel. */
const N = 96;

/* Where the amber starts: a gradient of 0.47 is about 25 degrees, which is
   past the traction limit on regolith at a sixth of a gravity. Squaring the
   ratio keeps the gentle majority grey instead of tinting the whole sheet. */
const STEEP = 0.47;

/**
 * Shade a square of ground into a canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {ImageData} img a reusable ImageData the size of the canvas
 * @param {object} o {
 *   hf          the heightfield to sample
 *   lat, lon    centre
 *   span        metres across
 *   W, H        the canvas size in pixels
 * }
 * @returns {{lo: number, hi: number}} the elevation range covered, for a caption
 */
export function drawRelief(ctx, img, o) {
  const { hf, lat, lon, span, W, H } = o;
  /* `span` is metres ACROSS THE WIDTH, and the height covers whatever the
     aspect ratio makes it. One scale for both axes, which sounds obvious and
     was not what this did at first: it mapped a square of ground onto the
     canvas whatever shape the canvas was. On the nav console, which is 240 by
     240, that is the same thing and nothing was ever wrong. On a full-screen
     map at 1170 by 737 it is a 1.59x vertical squash — round craters drawn as
     ellipses, and a distance read off the sheet depending on which way you
     measured it. test/map.test.mjs checks the scales agree. */
  const spanX = span, spanY = span * (H / W);
  const halfX = spanX / 2, halfY = spanY / 2;
  const d = img.data;
  let lo = Infinity, hi = -Infinity;
  const h = new Float32Array(N * N);
  /* Band-limited to the grid this is drawn on, which matters more here than
     anywhere else in the project. `heightAt` will happily synthesise detail
     down to a quarter of a metre, and sampling that on a grid 68 m wide — a
     6.5 km map across 96 samples — is sampling noise far below Nyquist. The
     first version of this map did exactly that and drew Mare Tranquillitatis,
     which is famously flat, as a field of diagonal streaks with the amber
     too-steep warning firing on every one of them.

     Three times the sample spacing is the same convention terrain/cubesphere.js
     uses for a tile's vertices, for the same reason. So the map shows the
     landforms it can actually resolve and nothing finer, and the amber then
     means a real slope rather than a procedural pebble. */
  const cellX = spanX / N, cellY = spanY / N;
  const minLambda = Math.max(cellX, cellY) * 3;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const north = halfY - (j + 0.5) * cellY;
      const east = (i + 0.5) * cellX - halfX;
      const p = offsetLatLon(lat, lon, Math.atan2(east, north) * 180 / Math.PI,
                             Math.hypot(east, north));
      const v = hf ? hf.heightAt(p.lat, p.lon, minLambda) : 0;
      h[j * N + i] = v;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const l = h[j * N + Math.max(0, i - 1)], r = h[j * N + Math.min(N - 1, i + 1)];
      const u = h[Math.max(0, j - 1) * N + i], dn = h[Math.min(N - 1, j + 1) * N + i];
      /* Each gradient over its own cell size — the two are only equal on a
         square canvas, and using one for both tilts the shading. */
      const gx = (r - l) / (2 * cellX), gy = (dn - u) / (2 * cellY);
      const shade = Math.max(0, Math.min(1, 0.55 + 0.75 * (gx * 0.7071 - gy * 0.7071)));
      const grade = Math.hypot(gx, gy) / STEEP;
      const steep = Math.min(1, grade * grade);
      const base = 30 + 160 * shade;
      const rr = base + 75 * steep, gg = base - 18 * steep, bb = base - 52 * steep;
      /* Scale the coarse grid up into the image. */
      const x0 = Math.floor(i * W / N), x1 = Math.floor((i + 1) * W / N);
      const y0 = Math.floor(j * H / N), y1 = Math.floor((j + 1) * H / N);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const q = (y * W + x) * 4;
          d[q] = rr; d[q + 1] = gg; d[q + 2] = bb; d[q + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return { lo, hi };
}

/**
 * Where a place lands on such a square, in pixels.
 *
 * Range and bearing rather than a projection, because that is what the game
 * already computes everywhere else and it is exact at any span: at 2 km it is
 * indistinguishable from a plane, and at 4000 km it is still the right great
 * circle when a plate carrée would have gone badly wrong.
 */
export function toXY(centre, lat, lon, span, W, H) {
  const range = surfaceDistance(centre.lat, centre.lon, lat, lon);
  const b = bearing(centre.lat, centre.lon, lat, lon) * Math.PI / 180;
  /* One scale, set by the width, for both axes. See the note in drawRelief. */
  const s = W / span;
  return [W / 2 + Math.sin(b) * range * s, H / 2 - Math.cos(b) * range * s];
}

/**
 * And the inverse: what place is under a pixel.
 *
 * The map has to be clickable for waypoints to be placeable on it, and this is
 * the only new maths the map needed — everything else it draws, the nav console
 * was already drawing.
 *
 * @returns {{lat: number, lon: number}}
 */
export function fromXY(centre, x, y, span, W, H) {
  const s = span / W;
  const east = (x - W / 2) * s;
  const north = (H / 2 - y) * s;
  const range = Math.hypot(east, north);
  if (range < 1e-6) return { lat: centre.lat, lon: centre.lon };
  const brg = Math.atan2(east, north) * 180 / Math.PI;
  return offsetLatLon(centre.lat, centre.lon, brg, range);
}
