/* The surface streamer, checked without a browser or a network.

   This is the state machine that decides what to ask NASA for and what to say
   when the answer does not come, and it had no test — which is how four
   recorded-and-never-read error fields, a reference to an identifier that does
   not exist in scope, and a dropped imagery exception all survived in the one
   subsystem whose entire job is being honest about what it knows.

   `Streams` is injected, so everything here runs against a fake that can be
   made to fail, to answer with nothing, or to answer with something worse than
   the ground already has — the three cases the overlay has to tell apart. */
import { SurfaceStreamer } from '../src/data/surface.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* Node has no performance.now in the global scope of older releases and the
   streamer's imagery throttle wants one. */
if (typeof performance === 'undefined') globalThis.performance = { now: () => Date.now() };

const heightfield = { sampleData: () => ({ res_m: 1895 }) };
const terrain = { added: [], imagery: null,
  addStreamedRaster(spec) { this.added.push(spec); },
  setImagery(bitmap, bounds) { this.imagery = { bitmap, bounds }; } };

function makeStreamer(streams, opts = {}) {
  const t = { ...terrain, added: [], imagery: null };
  const s = new SurfaceStreamer(streams, { heightfield: opts.heightfield || heightfield, terrain: t });
  s.terrainSpy = t;
  return s;
}

/* A patch of usable elevation, 33 x 33, all at one height. */
const patch = (res_m, h = -1900) => ({
  data: new Float32Array(33 * 33).fill(h), width: 33, height: 33,
  res_m, source: 'a real service',
});

console.log('a request that fails says so');
{
  const s = makeStreamer({ enabled: true,
    elevation: async () => ({ failed: true, error: 'HTTP 503' }),
    imageryTile: async () => { throw new Error('HTTP 503'); },
    status: () => 'unreachable' });
  await s.fetchRing(s.rings[0], 0.67, 23.47);
  check('the reason is kept on the ring', s.rings[0].lastError === 'HTTP 503');
  check('and the ring stays un-centred so it retries', s.rings[0].centre === null);
  const d = s.describe();
  check('and it reaches the overlay', d.elevationError === 'HTTP 503', JSON.stringify(d));
  check('with no elevation layer claimed', d.elevation === null);

  s.lastImageryAt = -1e9;                 // past the throttle
  await s.updateImagery(0.67, 23.47, 2);
  check('a dropped imagery request is no longer dropped',
        s.describe().imageryError === 'HTTP 503');
}

console.log('a request that succeeds with nothing better says something else');
{
  const s = makeStreamer({ enabled: true,
    /* 2 km per pixel where the ground is already 1895 m per pixel. */
    elevation: async () => patch(2000),
    imageryTile: async () => null, status: () => 'ok' });
  await s.fetchRing(s.rings[0], 0.67, 23.47);
  const d = s.describe();
  check('nothing was added to the terrain', s.terrainSpy.added.length === 0);
  check('there is no error, because nothing failed', d.elevationError === null);
  check('the overlay is told the best on offer was worse',
        d.elevationSkipped === 2000, JSON.stringify(d));
  check('the ring is centred, so the same square is not re-asked for',
        s.rings[0].centre !== null);
  /* The distinction the whole thing exists for. */
  check('which is a different answer from a failure',
        d.elevationSkipped !== null && d.elevationError === null);
}

console.log('a request that succeeds with something better is used');
{
  const s = makeStreamer({ enabled: true,
    elevation: async () => patch(59), imageryTile: async () => null, status: () => 'ok' });
  await s.fetchRing(s.rings[0], 0.67, 23.47);
  const d = s.describe();
  check('the layer went to the terrain', s.terrainSpy.added.length === 1);
  check('at the resolution it actually has', d.elevation && d.elevation.res_m === 59);
  check('labelled as measured', d.elevation && d.elevation.label === 'MEASURED');
  check('and nothing is reported wrong',
        d.elevationError === null && d.elevationSkipped === null);
}

console.log('a patch with no valid samples in it');
{
  /* `Streams.elevation` rejects anything under half valid, so this should be
     unreachable — but it used to reach for `current.h`, an identifier that
     does not exist in this scope, which turns a bad patch into a
     ReferenceError swallowed by the catch and retried forever. */
  const bad = patch(59);
  bad.data.fill(NaN);
  const s = makeStreamer({ enabled: true,
    elevation: async () => bad, imageryTile: async () => null, status: () => 'ok' });
  await s.fetchRing(s.rings[0], 0.67, 23.47);
  check('is refused rather than throwing', s.rings[0].layer === null);
  check('with a reason, not a ReferenceError',
        s.rings[0].lastError === 'no valid samples', String(s.rings[0].lastError));
  check('and nothing reached the terrain', s.terrainSpy.added.length === 0);
}

console.log('holes inside an otherwise good patch are filled, not left as NaN');
{
  const holed = patch(59, -1900);
  for (let i = 0; i < 300; i++) holed.data[i] = NaN;      // 27 % missing
  const s = makeStreamer({ enabled: true,
    elevation: async () => holed, imageryTile: async () => null, status: () => 'ok' });
  await s.fetchRing(s.rings[0], 0.67, 23.47);
  check('the patch was accepted', s.terrainSpy.added.length === 1);
  check('and every sample in it is finite',
        holed.data.every(Number.isFinite), 'a NaN here punches a hole in the Moon');
  check('filled with the surrounding surface', Math.abs(holed.data[0] + 1900) < 1e-6);
}

console.log('imagery');
{
  const tile = { bitmap: {}, bounds: { latMin: 0, latMax: 1, lonMin: 23, lonMax: 24 },
                 level: 8, key: 'k', atBest: false, res_m: 83, source: 'LROC WAC' };
  const s = makeStreamer({ enabled: true, elevation: async () => null,
    imageryTile: async () => tile, status: () => 'ok' });
  s.lastImageryAt = -1e9;
  await s.updateImagery(0.5, 23.5, 2);
  check('a tile is laid on the terrain', s.terrainSpy.imagery !== null);
  check('and described honestly', s.describe().imagery.res_m === 83);
  check('with no error outstanding', s.describe().imageryError === null);

  /* Anything coarser than the vendored colour map is a rectangle, not an
     improvement. */
  const coarse = makeStreamer({ enabled: true, elevation: async () => null,
    imageryTile: async () => ({ ...tile, res_m: 2600, key: 'c' }), status: () => 'ok' });
  coarse.lastImageryAt = -1e9;
  await coarse.updateImagery(0.5, 23.5, 400000);
  check('a 2.6 km tile is refused', coarse.terrainSpy.imagery === null);
}

console.log('streaming off does nothing at all');
{
  const s = makeStreamer({ enabled: false, elevation: async () => patch(59),
    imageryTile: async () => null, status: () => 'off' });
  s.update(0.67, 23.47, 2);
  check('no ring is even considered', s.rings.every(r => !r.busy && r.centre === null));
  check('and the overlay says off', s.describe().status === 'off');
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
