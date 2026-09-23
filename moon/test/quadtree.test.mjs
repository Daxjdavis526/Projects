/* Which tiles get drawn, checked without a renderer.

   Three hundred lines of pure selection logic that decides everything you see,
   and it had no test — while the two most expensive bugs of this project's
   development were both in it: a bounding sphere inflated to the Moon's whole
   twenty-one kilometre elevation range, which made every tile within ten
   kilometres report zero distance and refine to the finest level there is; and
   the fix for that, which tightened the same sphere for culling as well and
   punched holes in the landscape at the horizon.

   Both have a shape a test can hold: refinement must fall off with distance,
   and nothing in front of the camera may ever be culled. */
import { Quadtree } from '../src/terrain/quadtree.js';
import { tileKey, tileBoundingSphere, edgeArc, tileForUnit, children as childrenOf,
         parent as parentOf } from '../src/terrain/cubesphere.js';
import { R_MOON } from '../src/config.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* A camera at a given altitude over a given direction. */
function camAt(lat, lon, alt) {
  const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
  const r = R_MOON + alt;
  return { x: r * Math.cos(la) * Math.cos(lo), y: r * Math.sin(la), z: -r * Math.cos(la) * Math.sin(lo) };
}

/* Run select() to a fixed point: every tile it asks for is installed, until it
   stops asking. That is what the renderer does over a few seconds of streaming,
   compressed into a loop. `bounds` are the real radii a built tile carries. */
function settle(qt, cam, inView, rounds = 40, keepGoing = false) {
  let res = null;
  for (let n = 0; n < rounds; n++) {
    res = qt.select(cam, inView);
    /* `keepGoing` keeps calling select after the streaming has caught up, which
       is what standing still in the game does and what the budget controller
       needs in order to converge. */
    if (!res.request.length && !keepGoing) break;
    for (const r of res.request) {
      qt.install(r.key, { level: r.level, face: r.face, i: r.i, j: r.j,
                          bounds: { rMin: R_MOON - 200, rMax: R_MOON + 200 } });
    }
  }
  return res;
}

const finest = (draw) => draw.reduce((m, k) => Math.max(m, Number(k.split(':')[1])), -1);

console.log('refinement follows distance');
{
  const heights = [2, 100, 1000, 10000, 100000, 1000000];
  const levels = [];
  for (const alt of heights) {
    const qt = new Quadtree({ maxLevel: 18, tileBudget: 4000, cacheSize: 40000 });
    const res = settle(qt, camAt(0.67, 23.47, alt), null, 60);
    levels.push({ alt, finest: finest(res.draw), drawn: res.draw.length });
  }
  console.log('    ' + levels.map(l => `${l.alt}m:L${l.finest}(${l.drawn})`).join(' '));
  check('the finest level drawn never increases with altitude',
        levels.every((l, i) => i === 0 || l.finest <= levels[i - 1].finest));
  check('standing on the ground reaches the finest level there is',
        levels[0].finest === 18, 'L' + levels[0].finest);
  check('and from a thousand kilometres up it does not',
        levels[levels.length - 1].finest < 8, 'L' + levels[levels.length - 1].finest);
  /* The bug: at seven kilometres up, three hundred tiles of centimetre detail.
     A tile at level 17 is about twenty metres across, so drawing one from ten
     kilometres away means the sphere reported zero distance. */
  const at10km = levels.find(l => l.alt === 10000);
  check('ten kilometres up does not refine to walking scale',
        at10km.finest <= 12, 'L' + at10km.finest);
}

console.log('the count of drawn tiles stays inside a sane band');
{
  /* With a frustum, which is what the renderer always passes: a 60 degree cone
     about the camera's forward direction. Without one the walk covers the whole
     visible hemisphere, which is correct and is not what gets drawn. */
  const cone = (cam, fwd) => (sphere) => {
    const dx = sphere.x - cam.x, dy = sphere.y - cam.y, dz = sphere.z - cam.z;
    const d = Math.hypot(dx, dy, dz) || 1;
    const cosang = (dx * fwd.x + dy * fwd.y + dz * fwd.z) / d;
    /* Widened by the bounding radius, as a real frustum test is. */
    return cosang > Math.cos(Math.PI / 3) - sphere.r / d;
  };
  for (const alt of [1000, 100000]) {
    const qt = new Quadtree({ maxLevel: 18, tileBudget: 700, cacheSize: 400000 });
    const cam = camAt(0.67, 23.47, alt);
    /* Long enough for the budget feedback to settle as well as the streaming. */
    const res = settle(qt, cam, cone(cam, { x: 0, y: 1, z: 0 }), 400, true);
    check(`at ${alt} m: enough to cover the view, and inside the budget`,
          res.draw.length > 6 && res.draw.length < 700 * 1.3,
          `${res.draw.length} tiles against a budget of 700, ` +
          `split distance x${qt.budgetScale.toFixed(2)}`);
  }

  /* Walking height is the one altitude the budget cannot reach on its own, and
     the reason is worth writing down rather than papering over: below four
     kilometres the walk keeps refining everything within 220 m of the camera
     whatever the frustum says, because the shadow camera needs geometry behind
     you as well as in front. That ring is a fixed area of ground at the finest
     level available and no split distance makes it smaller. What the budget can
     do is everything beyond it, and it does: the count roughly halves. The
     resident cache is what bounds the rest. */
  const alone = (scale) => {
    const qt = new Quadtree({ maxLevel: 18, tileBudget: 700, cacheSize: 400000 });
    const cam = camAt(0.67, 23.47, 2);
    const view = cone(cam, { x: 0, y: 1, z: 0 });
    if (scale !== null) {
      /* Hold it open, to measure what the controller is actually saving. */
      Object.defineProperty(qt, 'budgetScale', { get: () => scale, set: () => {} });
    }
    return settle(qt, cam, view, 400, true).draw.length;
  };
  const unbudgeted = alone(1), budgeted = alone(null);
  check('at walking height the budget still halves the draw list',
        budgeted < unbudgeted * 0.6,
        `${unbudgeted} tiles unbudgeted, ${budgeted} budgeted`);
  /* And it comes back: the budget pulls the split distance in, it does not
     latch there. */
  const qt = new Quadtree({ maxLevel: 18, tileBudget: 700, cacheSize: 400000 });
  const low = camAt(0.67, 23.47, 2);
  settle(qt, low, cone(low, { x: 0, y: 1, z: 0 }), 400, true);
  const tight = qt.budgetScale;
  const high = camAt(0.67, 23.47, 400000);
  settle(qt, high, cone(high, { x: 0, y: 1, z: 0 }), 300, true);
  check('and it relaxes again once there is room',
        tight < 0.95 && qt.budgetScale > 0.99,
        `${tight.toFixed(2)} close in, ${qt.budgetScale.toFixed(2)} from orbit`);
}

console.log('nothing in front of the camera is ever culled');
{
  /* The horizon cull is the one that punched holes. Walk a ray from the camera
     out to the true horizon and check that every point on the ground along it
     is covered by some drawn tile's ancestry. */
  const alt = 60;
  const cam = camAt(0.0, 0.0, alt);
  const qt = new Quadtree({ maxLevel: 18, tileBudget: 6000, cacheSize: 60000 });
  const res = settle(qt, cam, null, 80);
  const drawn = new Set(res.draw);
  /* True horizon distance for a sphere: sqrt(2 R h + h^2). */
  const horizon = Math.sqrt(2 * R_MOON * alt + alt * alt);
  let holes = 0, tested = 0;
  for (let d = 5; d < horizon * 0.97; d *= 1.6) {
    /* A point d metres north of the camera, on the sphere. */
    const ang = d / R_MOON;
    const p = { x: R_MOON * Math.cos(ang), y: R_MOON * Math.sin(ang), z: 0 };
    const r = Math.hypot(p.x, p.y, p.z);
    const t = tileForUnit(18, p.x / r, p.y / r, p.z / r);
    /* Is this ground covered by a drawn tile at any level? */
    let f = t.face, l = 18, i = t.i, j = t.j, covered = false;
    while (l >= 0) {
      if (drawn.has(tileKey(f, l, i, j))) { covered = true; break; }
      const par = parentOf(f, l, i, j);
      if (!par) break;
      [f, l, i, j] = par;
    }
    tested++;
    if (!covered) holes++;
  }
  check('every point from your boots to the horizon is covered',
        holes === 0, `${holes} of ${tested} sample points uncovered`);
}

console.log('a node hands over only when all four children have arrived');
{
  const qt = new Quadtree({ maxLevel: 4, tileBudget: 4000, cacheSize: 40000 });
  const cam = camAt(0, 0, 5);
  /* One pass: nothing is resident, so the roots are requested. */
  qt.select(cam, null);
  /* Install the roots, then exactly three of one root's four children. */
  for (let f = 0; f < 6; f++) {
    qt.install(tileKey(f, 0, 0, 0), { level: 0, face: f, i: 0, j: 0,
      bounds: { rMin: R_MOON - 200, rMax: R_MOON + 200 } });
  }
  const res1 = qt.select(cam, null);
  const wantedRoot = res1.draw.map(k => k.split(':')).find(p => p[1] === '0');
  check('with no children at all, the root itself is drawn', !!wantedRoot,
        res1.draw.slice(0, 4).join(' '));

  const kids = childrenOf(Number(wantedRoot[0]), 0, 0, 0);
  for (let n = 0; n < 3; n++) {
    const k = kids[n];
    qt.install(tileKey(k[0], k[1], k[2], k[3]), { level: k[1], face: k[0], i: k[2], j: k[3],
      bounds: { rMin: R_MOON - 200, rMax: R_MOON + 200 } });
  }
  const res2 = qt.select(cam, null);
  const stillRoot = res2.draw.includes(tileKey(Number(wantedRoot[0]), 0, 0, 0));
  const anyKid = kids.some(k => res2.draw.includes(tileKey(k[0], k[1], k[2], k[3])));
  check('three of four children is not enough to hand over',
        stillRoot && !anyKid, `root drawn ${stillRoot}, a child drawn ${anyKid}`);

  const k4 = kids[3];
  qt.install(tileKey(k4[0], k4[1], k4[2], k4[3]),
    { level: k4[1], face: k4[0], i: k4[2], j: k4[3],
      bounds: { rMin: R_MOON - 200, rMax: R_MOON + 200 } });
  const res3 = qt.select(cam, null);
  check('the fourth completes it and the children take over',
        !res3.draw.includes(tileKey(Number(wantedRoot[0]), 0, 0, 0)));
}

console.log('the tile under the camera is asked for first');
{
  const qt = new Quadtree({ maxLevel: 16 });
  const res = qt.select(camAt(0.67, 23.47, 3), null);
  check('the highest-priority requests are the descent chain',
        res.request.length > 0 && res.request[0].priority <= -1000,
        'priority ' + res.request[0].priority);
  check('and the chain reaches the ground under you',
        res.request.some(r => r.level === 16));
  /* Whole quadruplets, because a node hands over only when all four arrive. */
  const atMax = res.request.filter(r => r.level === 16);
  check('as whole quadruplets, not single tiles', atMax.length >= 4, atMax.length + ' tiles');
}

console.log('eviction keeps what is live and drops what is not');
{
  const qt = new Quadtree({ maxLevel: 6, cacheSize: 30 });
  settle(qt, camAt(0, 0, 400), null, 40);
  const here = new Set(qt.select(camAt(0, 0, 400), null).draw);
  const before = qt.tiles.size;
  /* Move to the other side of the Moon and settle there. */
  const res = settle(qt, camAt(0, 180, 400), null, 60);
  /* `cacheSize` is a target, not a ceiling: a tile wanted this frame is never
     evicted however far over the limit that leaves the cache, because evicting
     what is on screen is a hole. What it guarantees is that ground you have
     left goes away. */
  const kept = [...here].filter(k => qt.tiles.has(k)).length;
  check('the ground you left is released', kept < here.size * 0.5,
        `${kept} of ${here.size} old tiles still held; cache ${before} -> ${qt.tiles.size}`);
  check('and nothing being drawn was evicted',
        res.draw.every(k => qt.isResident(k)));
}

console.log('a stale tile asks to be rebuilt while it keeps drawing');
{
  const qt = new Quadtree({ maxLevel: 5, tileBudget: 4000, cacheSize: 40000 });
  settle(qt, camAt(0, 0, 300), null, 40);
  const res0 = qt.select(camAt(0, 0, 300), null);
  const victim = res0.draw[0];
  qt.tiles.get(victim).stale = true;
  const res1 = qt.select(camAt(0, 0, 300), null);
  check('it is still drawn', res1.draw.includes(victim));
  check('and it is queued ahead of new work',
        res1.request.some(r => r.key === victim && r.priority < -1000),
        JSON.stringify(res1.request.find(r => r.key === victim)));
  /* Once only: a second frame must not queue the same rebuild twice within it. */
  const inOneFrame = res1.request.filter(r => r.key === victim).length;
  check('exactly once per frame', inOneFrame === 1, inOneFrame + ' times');
}

console.log('finestAt walks up to whatever is actually resident');
{
  const qt = new Quadtree({ maxLevel: 8 });
  const t = tileForUnit(8, 1, 0, 0);
  check('nothing resident gives nothing', qt.finestAt(t.face, 8, t.i, t.j) === null);
  let f = t.face, l = 8, i = t.i, j = t.j;
  for (let n = 0; n < 5; n++) { const p = parentOf(f, l, i, j); [f, l, i, j] = p; }
  qt.install(tileKey(f, l, i, j), { level: l, face: f, i, j });
  const got = qt.finestAt(t.face, 8, t.i, t.j);
  check('an ancestor five levels up is found', got && got.level === l, got && 'L' + got.level);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
