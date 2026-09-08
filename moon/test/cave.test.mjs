/* The cave under the Mare Tranquillitatis pit, checked against the paper.

   Carrer et al. 2024 is the only evidence anyone has for an accessible cave on
   the Moon, and it is radar evidence: a forward model that reproduces a Mini-RF
   anomaly, not a picture of a cave. So what this file checks is that the void in
   the game is the void in the paper — the two published slopes, the published
   width, the published depth range, a length that is honestly "tens of metres"
   — and that the game says out loud it is a model rather than an image, and
   that the second geometry the radar cannot rule out gets a mention.

   The rest is walking: into the mouth, along the floor, into the walls, and up
   against the point where the roof comes down far enough that a person in a
   suit has to stop. */
import { Cave, CONDUIT, floorBoulders } from '../src/game/cave.js';
import { PITS, pitById, shaftRadiusAt, buildPitRaster } from '../src/data/pits.js';
import { Heightfield, Raster } from '../src/terrain/heightfield.js';
import { LABEL } from '../src/config.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const PLAIN = -1500;
const pit = pitById('tranquillitatis_pit');
const cave = new Cave({ pit, baseHeight: PLAIN });
/* Absolute elevation from a depth below the plain, which is how the paper
   talks and how the pit's own numbers read. */
const at = (e, n) => cave.toGeographic(e, n);
const floorU = (e, n) => cave.floorLocal(e, n);

console.log('the conduit is the one in the paper');
{
  check('roof dips 55 degrees, floor 45, which is their model B',
    CONDUIT.roofSlope === 55 && CONDUIT.floorSlope === 45);
  check('the passage is 45 m wide', CONDUIT.width === 45,
    'their simulations tested 15, 30, 55, 100 and 200');
  check('it runs east, off the wall the atlas says the floor slopes under',
    CONDUIT.bearing === 90);

  /* The published depth band is 130-170 m below the surface. The pit floor is
     already 125 m down, so the conduit has to bottom out inside that band. */
  const deepest = -cave.deepestU;
  check('and it bottoms out inside the published 130-170 m band',
    deepest > 130 && deepest <= 170, `${deepest.toFixed(1)} m below the plain`);
  check('the roof comes down to meet the floor, which is what ends it',
    Math.abs(cave.ceilingLocal(cave.mouthR + cave.length, 0) -
             cave.floorLocal(cave.mouthR + cave.length, 0)) < 0.01);
  check('leaving a conduit that is honestly "tens of metres long"',
    cave.length > 20 && cave.length < 100, `${cave.length.toFixed(0)} m`);
  check('the mouth is 19 m high, which the two slopes and the depth band fix',
    Math.abs(cave.ceilingLocal(cave.mouthR + 1, 0) -
             cave.floorLocal(cave.mouthR + 1, 0) - 19) < 0.01);
}

console.log('the mouth meets the pit without a step');
{
  /* The cave has to open exactly where the terrain puts the shaft wall, or
     there is a lip at the door. */
  check('the mouth sits on the shaft wall on the conduit bearing',
    Math.abs(cave.mouthR - shaftRadiusAt(pit, CONDUIT.bearing)) < 1e-9,
    `${cave.mouthR.toFixed(2)} m east of the centre`);

  const hf = new Heightfield();
  hf.addRaster(new Raster({
    id: 'bg', bbox: [-180, -90, 180, 90], width: 8, height: 8, res_m: 118,
    priority: 1, source: 'test', label: LABEL.MEASURED, wrapX: true,
  }, new Float32Array(64).fill(PLAIN)));
  const { spec, data } = buildPitRaster(pit, PLAIN);
  hf.addRaster(new Raster(spec, data));

  /* Walk east from the middle of the pit floor out into the conduit, taking
     the ground from the cave where it has an opinion and the height field
     where it does not, exactly as the player's ground source does. */
  let worst = 0, worstAt = 0, prev = null;
  for (let e = 0; e < cave.mouthR + CONDUIT.skirt; e += 0.25) {
    const p = at(e, 0);
    /* Stand on whatever the ground turns out to be, an eye above it. */
    const fu = floorU(e, 0);
    const alt = PLAIN + (fu === null ? -pit.depth : fu) + 1;
    const c = cave.floorAt(p.lat, p.lon, alt);
    const h = c === null ? hf.heightAt(p.lat, p.lon) : c;
    if (prev !== null && Math.abs(h - prev) > worst) { worst = Math.abs(h - prev); worstAt = e; }
    prev = h;
  }
  check('and the floor is continuous all the way out through it',
    worst < 0.5, `worst step ${worst.toFixed(2)} m at ${worstAt.toFixed(1)} m east`);

  /* Then the ramp starts, and it is the paper's 45 degrees. */
  const a = floorU(cave.mouthR + CONDUIT.skirt + 5, 0);
  const b = floorU(cave.mouthR + CONDUIT.skirt + 15, 0);
  check('past the overhang the floor tips into the published 45 degree ramp',
    Math.abs(Math.atan2(a - b, 10) * 180 / Math.PI - 45) < 0.5,
    `${(Math.atan2(a - b, 10) * 180 / Math.PI).toFixed(1)} deg`);
  check('which is too steep to walk back up without the jetpack',
    CONDUIT.floorSlope > Math.atan(0.75) * 180 / Math.PI,
    '45 deg against a 37 deg friction angle');
}

console.log('the rock is solid');
{
  const deep = PLAIN - pit.depth - 10;          // in the passage, past the mouth
  const e = cave.mouthR + CONDUIT.skirt + 10;

  const through = at(e, 30);                     // beyond the 22.5 m half width
  const push = cave.resolve(through.lat, through.lon, deep, 0.34);
  check('you cannot walk out through the side wall', push !== null);
  if (push) {
    const l = cave.toLocal(push.lat, push.lon);
    check('and you end up back inside it', Math.abs(l.n) <= cave.halfW,
      `${l.n.toFixed(2)} m off the axis against a ${cave.halfW} m half width`);
  }

  const inside = at(e, 5);
  check('but walking down the middle of it is fine',
    cave.resolve(inside.lat, inside.lon, deep, 0.34) === null);

  /* The far end. The void carries on past the point a standing person fits,
     so the wall you meet is headroom rather than rock. */
  const far = at(cave.mouthR + cave.length - 1, 0);
  const stop = cave.resolve(far.lat, far.lon, PLAIN + floorU(cave.mouthR + cave.length - 1, 0) + 1, 0.34);
  check('and the passage stops you before the roof does', stop !== null);
  if (stop) {
    const x = cave.toLocal(stop.lat, stop.lon).e - cave.mouthR;
    const head = cave.ceilingLocal(cave.mouthR + x, 0) - cave.floorLocal(cave.mouthR + x, 0);
    check('at about the height of a person in a suit', head > 1.7 && head < 2.2,
      `${head.toFixed(2)} m of headroom, ${x.toFixed(0)} m in`);
  }

  /* The rest of the pit wall is wall. The atlas reports the rim overhanging on
     three sides, and it is tempting to turn that into a ring of walkable floor
     under it — but how much of that space is open and how much is talus is not
     published, so the only void here is the one the radar found. */
  for (const [side, b] of [['north', 0], ['west', 270], ['south', 180]]) {
    const p = at(shaftRadiusAt(pit, b) * Math.sin(b * Math.PI / 180) * 1.15,
                 shaftRadiusAt(pit, b) * Math.cos(b * Math.PI / 180) * 1.15);
    check(`the ${side} wall is a wall, not a recess`,
      cave.floorAt(p.lat, p.lon, PLAIN - pit.depth + 1) === null);
  }
  check('though the atlas still records which sides overhang',
    cave.overhung(0) && cave.overhung(90) && cave.overhung(270) && !cave.overhung(180));

  /* Rock beside the conduit stays rock. */
  const beside = at(cave.mouthR + 20, 40);
  const out = cave.resolve(beside.lat, beside.lon, deep, 0.34);
  check('and the rock beside the passage pushes you out of it', out !== null);
}

console.log('under a roof, or under the sky');
{
  const deep = PLAIN - pit.depth - 10;
  const inConduit = at(cave.mouthR + CONDUIT.skirt + 10, 0);
  check('in the conduit you are under rock',
    cave.inside(inConduit.lat, inConduit.lon, deep));
  const onFloor = at(0, 0);
  check('on the pit floor you are under the sky',
    !cave.inside(onFloor.lat, onFloor.lon, PLAIN - pit.depth + 1));
  const outside = at(0, 400);
  check('and out on the plain there is no cave at all',
    cave.floorAt(outside.lat, outside.lon, PLAIN) === null &&
    !cave.inside(outside.lat, outside.lon, PLAIN));
}

console.log('the boulders are the measured ones');
{
  const rocks = floorBoulders(pit);
  const ordinary = rocks.filter(r => !r.outlier);
  const outliers = rocks.filter(r => r.outlier);
  check('the ordinary floor rocks are the 1-4 m the paper measured',
    ordinary.every(r => r.size >= 1 && r.size <= 4), `${ordinary.length} of them`);
  check('and the two 8-10 m outliers it named are there too',
    outliers.length === 2 && outliers.every(r => r.size >= 8 && r.size <= 10),
    outliers.map(r => r.size.toFixed(1) + ' m').join(', '));
  check('in the south-west of the floor, where it says they are',
    outliers.every(r => r.e < 0 && r.n < 0));
  check('and every one of them is on the floor rather than in a wall',
    rocks.every(r => {
      const b = Math.atan2(r.e, r.n) * 180 / Math.PI;
      return Math.hypot(r.e, r.n) <= shaftRadiusAt(pit, b);
    }));
  check('the same floor every time you come back',
    JSON.stringify(floorBoulders(pit)) === JSON.stringify(rocks));
}

console.log('and it says what it is');
{
  const d = cave.describe();
  check('labelled DERIVED, because nobody has seen inside it',
    d.label === LABEL.DERIVED && d.label !== LABEL.MEASURED, d.label);
  check('it cites the paper', /Carrer/.test(d.source), d.source);
  check('it says the geometry is a radar model rather than an image',
    /radar/i.test(d.note) && /not an image/i.test(d.note));
  check('and that the radar cannot rule out the other shape',
    /model A/.test(d.note));
  check('only the one pit has a cave under it',
    PITS.filter(p => p.id === 'tranquillitatis_pit').length === 1);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
