/* =============================================================================
   SITE PREVIEWS — what a place looks like, drawn from the data already here
   -----------------------------------------------------------------------------
   A thumbnail per featured site, so choosing where to land is a look rather
   than a guess. The complaint that produced this file was "I usually get flat
   nothingness unless I guess properly", which was fair: the picker offered
   names and coordinates and no way to tell a 2 km central peak from a mare.

   Nothing is fetched and nothing is baked. Two sources, both already resident:

     - the global LOLA elevation, 16 pixels per degree, vendored for the whole
       Moon and loaded before the picker opens. `heightAt` answers anywhere,
       offline, which is what the orbit picker's readouts already rely on.
     - the LROC WAC colour mosaic, vendored as a JPEG and loaded as an ordinary
       image for the terrain material. An HTMLImageElement can be cropped
       straight onto a canvas with `drawImage`.

   So the relief comes from measurements and the colour comes from photographs,
   and the only invented thing is the light: the hillshade is lit from the
   north-west because every topographic sheet ever printed is. That is a
   drawing convention, not a claim about the sun, and it is why these read as
   maps rather than as screenshots.

   Sizes are deliberately small. A 96-sample grid over a couple of hundred
   kilometres is about two kilometres a sample, which is the resolution of the
   source, so asking for more would be inventing detail in a picture whose
   whole job is to be honest about the shape of the ground.
   ========================================================================== */

import { offsetLatLon } from '../physics/frames.js';

/* Samples across the preview. The global elevation is 1.9 km per pixel, so
   past about this there is nothing further to sample. */
const N = 96;

/**
 * Draw one site preview into a canvas.
 *
 * @param {HTMLCanvasElement} canvas  sized by CSS; its width/height are used
 * @param {object} opts {
 *   heightfield,          the resident Heightfield
 *   colour,               an HTMLImageElement of the equirectangular colour
 *                         mosaic, or null for greyscale relief
 *   lat, lon,             centre
 *   spanKm,               how wide, in kilometres
 * }
 */
export function drawPreview(canvas, opts) {
  const { heightfield, colour, lat, lon } = opts;
  const span = (opts.spanKm || 150) * 1000;
  const W = canvas.width, H = canvas.height;
  if (!W || !H || !heightfield) return false;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  /* --- the photograph, first, as the base ------------------------------- */
  /* Drawn before the relief so the shading multiplies into it. A crop of an
     equirectangular mosaic is a rectangle in degrees, and at these spans the
     distortion across it is small enough to ignore — which is not true near
     the poles, handled below. */
  let tinted = false;
  if (colour && colour.complete && colour.naturalWidth) {
    const dLat = (span / 1737400) * 180 / Math.PI;
    const cosLat = Math.max(0.08, Math.cos(lat * Math.PI / 180));
    const dLon = dLat / cosLat;
    const sx = ((lon - dLon / 2) + 180) / 360 * colour.naturalWidth;
    const sy = (90 - (lat + dLat / 2)) / 180 * colour.naturalHeight;
    const sw = dLon / 360 * colour.naturalWidth;
    const sh = dLat / 180 * colour.naturalHeight;
    try {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(colour, sx, sy, sw, sh, 0, 0, W, H);
      tinted = true;
    } catch { /* a tainted or half-loaded image is not worth a broken card */ }
  }
  if (!tinted) { ctx.fillStyle = '#6b6862'; ctx.fillRect(0, 0, W, H); }

  /* --- the relief ------------------------------------------------------- */
  const half = span / 2;
  const h = new Float32Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const north = half - (j + 0.5) / N * span;
      const east = (i + 0.5) / N * span - half;
      const p = offsetLatLon(lat, lon, Math.atan2(east, north) * 180 / Math.PI,
                             Math.hypot(east, north));
      /* Explicitly unband-limited: a preview wants every metre of relief the
         model has, not the subset some tile happens to be drawing. */
      h[j * N + i] = heightfield.heightAt(p.lat, p.lon, 0);
    }
  }

  const cell = span / N;
  /* Shading is multiplied over the photograph, so it has to average to about
     one or the whole card goes dark. */
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const l = h[j * N + Math.max(0, i - 1)], r = h[j * N + Math.min(N - 1, i + 1)];
      const u = h[Math.max(0, j - 1) * N + i], dn = h[Math.min(N - 1, j + 1) * N + i];
      const gx = (r - l) / (2 * cell), gy = (dn - u) / (2 * cell);
      /* Lit from the north-west at forty-five degrees, the sheet convention.
         The gain is enough that a crater reads as a hole at any span, and
         bounded above well short of double so a sunlit terrace keeps its
         texture instead of going to white — at 4.0 and a ceiling of 2.05
         Tycho's central peak was a featureless blob. */
      const lite = (gx - gy) * 2.6;
      const shade = Math.max(0.2, Math.min(1.75, 1 + lite));
      const x0 = Math.floor(i * W / N), x1 = Math.floor((i + 1) * W / N);
      const y0 = Math.floor(j * H / N), y1 = Math.floor((j + 1) * H / N);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const o = (y * W + x) * 4;
          d[o] = Math.min(255, d[o] * shade);
          d[o + 1] = Math.min(255, d[o + 1] * shade);
          d[o + 2] = Math.min(255, d[o + 2] * shade);
          d[o + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  /* A cross at the centre, because the card is a place and not a region: this
     is the point the LAND button will fly to. */
  ctx.strokeStyle = 'rgba(232,201,160,.85)';
  ctx.lineWidth = 1;
  const cx = Math.round(W / 2) + 0.5, cy = Math.round(H / 2) + 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy); ctx.lineTo(cx - 2, cy);
  ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 5, cy);
  ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy - 2);
  ctx.moveTo(cx, cy + 2); ctx.lineTo(cx, cy + 5);
  ctx.stroke();
  return true;
}

/** A scale note for the card, so nobody reads a 2400 km basin as a crater. */
export function spanLabel(spanKm) {
  return spanKm >= 1000 ? `${(spanKm / 1000).toFixed(1)} thousand km across`
    : `${spanKm} km across`;
}
