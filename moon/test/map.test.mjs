/* The map's projection, both ways.

   The nav console only ever needed one direction: given a place, where does it
   go on the sheet. The full map needs the other one too, because a waypoint is
   placed by clicking the ground — which makes `fromXY` the only genuinely new
   arithmetic in the whole thing, and the only piece that can be wrong in a way
   that looks fine. A mark dropped 200 m from where the pointer was would pass
   any visual check and send you to the wrong place.

   So this is a round trip: take a pixel, ask what is under it, ask where that
   place lands, and expect the pixel back. It has to hold at every span the map
   offers and at latitudes where a plate carrée would have fallen apart — the
   projection is range-and-bearing about the centre, so it stays a great circle
   at 4000 km and stays sane at the poles, which is why it is built that way
   rather than as a lat/lon rectangle.

   Pure frames.js. No DOM, no canvas, nothing rendered. */
import { toXY, fromXY } from '../src/ui/relief.js';
import { surfaceDistance } from '../src/physics/frames.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* The spans the map actually offers, ends and middle. */
const SPANS = [400, 2500, 40000, 250000, 1000000, 4000000];
const W = 1170, H = 737;            // a real measured canvas, deliberately not square

console.log('a pixel means a place, and that place means the pixel back');
{
  let worst = 0, worstAt = '';
  for (const centre of [{ lat: 0.674, lon: 23.473 },      // Apollo 11, on the equator
                        { lat: -43.31, lon: -11.36 },      // Tycho
                        { lat: 26.13, lon: 3.63 },         // Hadley, northern near side
                        { lat: -88.5, lon: 120.0 },        // near the south pole
                        { lat: 0, lon: 179.4 }]) {         // hard against the antimeridian
    for (const span of SPANS) {
      for (const [fx, fy] of [[0.5, 0.5], [0.1, 0.1], [0.9, 0.2], [0.35, 0.85], [0.99, 0.99]]) {
        const x = fx * W, y = fy * H;
        const p = fromXY(centre, x, y, span, W, H);
        const [bx, by] = toXY(centre, p.lat, p.lon, span, W, H);
        const err = Math.hypot(bx - x, by - y);
        if (err > worst) {
          worst = err;
          worstAt = `${centre.lat}°/${centre.lon}° at ${span} m, (${fx}, ${fy})`;
        }
      }
    }
  }
  check('every pixel round trips to within a pixel', worst < 1.0,
    `worst ${worst.toFixed(3)} px — ${worstAt}`);
}

console.log('and the geometry is the geometry');
{
  const centre = { lat: 10, lon: 20 };
  const span = 4000;
  /* The centre pixel is the centre place. */
  const mid = fromXY(centre, W / 2, H / 2, span, W, H);
  check('the middle of the sheet is where you are',
    surfaceDistance(centre.lat, centre.lon, mid.lat, mid.lon) < 0.5,
    surfaceDistance(centre.lat, centre.lon, mid.lat, mid.lon).toFixed(3) + ' m off');

  /* North is up, and it does not rotate. Straight up from the middle has to be
     due north of it and nothing else — the map's whole caption says so. */
  const up = fromXY(centre, W / 2, H / 2 - H * 0.25, span, W, H);
  check('straight up the sheet is due north',
    up.lat > centre.lat && Math.abs(up.lon - centre.lon) < 1e-6,
    `${(up.lat - centre.lat).toFixed(5)}° of latitude, ${(up.lon - centre.lon).toFixed(8)}° of longitude`);
  /* Due east is a great circle, not a parallel, so heading 90 from 10°N does
     drift in latitude — about 5 cm over a kilometre, which is d²tan(lat)/2R.
     The tolerance is a metre rather than a nanodegree for that reason. */
  const right = fromXY(centre, W / 2 + W * 0.25, H / 2, span, W, H);
  const drift = surfaceDistance(centre.lat, centre.lon, right.lat, centre.lon);
  check('and across it is due east',
    right.lon > centre.lon && drift < 1.0,
    `${(right.lon - centre.lon).toFixed(5)}° of longitude, ${drift.toFixed(2)} m of latitude drift`);

  /* Scale. A quarter of the width is a quarter of the span, which is what
     makes the grid and the "x km across" caption mean the same thing. */
  const d = surfaceDistance(centre.lat, centre.lon, right.lat, right.lon);
  check('a quarter of the way across is a quarter of the span',
    Math.abs(d - span * 0.25) < span * 0.002,
    `${d.toFixed(1)} m against ${(span * 0.25).toFixed(1)} m`);

  /* The vertical scale is the same as the horizontal one, on a canvas that is
     not square. Getting this wrong is the classic version of this bug: the map
     would be stretched and every distance read off it would be wrong in one
     axis only. */
  /* The one that matters. A quarter of the WIDTH in pixels and a quarter of
     the width in pixels going UP have to be the same distance on the ground,
     or the sheet is anisotropic: craters come out as ellipses and a range read
     off it depends on which way you measured. This failed when written — both
     axes were divided by `span` regardless of the canvas shape, a 1.59x squash
     on a 1170x737 map, invisible on the 240x240 nav console it came from. */
  const upSame = fromXY(centre, W / 2, H / 2 - W * 0.25, span, W, H);
  const dv = surfaceDistance(centre.lat, centre.lon, upSame.lat, upSame.lon);
  check('and the sheet is not stretched on a non-square canvas',
    Math.abs(dv - span * 0.25) < span * 0.002,
    `${dv.toFixed(1)} m up against ${d.toFixed(1)} m across, for the same pixels`);
}

console.log('the antimeridian is not a wall');
{
  /* Range and bearing does not care where the dateline is; a lat/lon rectangle
     would have torn here. Step west across it and the distance stays small. */
  const centre = { lat: 5, lon: 179.7 };
  const span = 40000;
  const p = fromXY(centre, W / 2 + W * 0.4, H / 2, span, W, H);
  const d = surfaceDistance(centre.lat, centre.lon, p.lat, p.lon);
  check('crossing 180° keeps the distance it should have',
    Math.abs(d - span * 0.4) < span * 0.01,
    `${(d / 1000).toFixed(2)} km, at ${p.lon.toFixed(3)}° of longitude`);
  const [bx] = toXY(centre, p.lat, p.lon, span, W, H);
  check('and comes back to the same pixel', Math.abs(bx - (W / 2 + W * 0.4)) < 1.0,
    `${bx.toFixed(2)} against ${(W / 2 + W * 0.4).toFixed(2)}`);
}

console.log(failures ? `\nmap: ${failures} FAILED` : '\nmap: all checks passed');
process.exit(failures ? 1 : 0);
