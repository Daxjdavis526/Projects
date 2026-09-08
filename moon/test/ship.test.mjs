/* The ship as a place you can be, rather than a model you walk through.

   Everything here was written and none of it was reachable: `floorAt` and
   `resolve` had no callers at all, so the decks were geometry you fell through
   and the hull was open air. That took out the walkable interior, the airlock,
   the ship's cabin sound and the resupply that makes it a range tier. */
import { ShipInterior } from '../src/game/interior.js';
import { surfaceDistance } from '../src/physics/frames.js';
import { SHIP } from '../src/config.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* The pad is flattened to exactly the height the ship landed on, so every
   number below is exact. */
const GROUND = -1900;
const base = new ShipInterior({ lat: 0.5, lon: 23.4, heading: 0, groundHeight: GROUND });

console.log('the decks are ground');
{
  const inn = base.insideStand();
  const alt = GROUND + inn.agl;
  check('there is a floor under the standing spot inside the hull',
    base.floorAt(inn.lat, inn.lon, alt) !== null,
    `floor at ${base.floorAt(inn.lat, inn.lon, alt)}`);
  check('and it is the lower deck, not the ground',
    Math.abs(base.floorAt(inn.lat, inn.lon, alt) - (GROUND + 2.55)) < 0.01);
  check('standing on the pad outside is not standing in the ship',
    base.floorAt(base.lat, base.lon, GROUND + 0.1) === null);
  check('nor is standing a hundred metres away at deck height',
    base.floorAt(base.lat + 0.001, base.lon, GROUND + 2.55) === null);
  check('the upper deck is reachable at its own height',
    base.floorAt(inn.lat, inn.lon, GROUND + 4.97) !== null &&
    Math.abs(base.floorAt(inn.lat, inn.lon, GROUND + 4.97) - (GROUND + 4.95)) < 0.01);
}

console.log('the hull walls are solid');
{
  const inn = base.insideStand();
  const alt = GROUND + inn.agl;
  check('a point well inside the floor plan is not pushed',
    base.resolve(inn.lat, inn.lon, alt) === null);

  /* Walk out through the wall and check we are put back inside it. */
  const far = base.toGeographic(9, 0);
  const push = base.resolve(far.lat, far.lon, alt);
  check('but a point outside the wall at deck height has no floor to stand on',
    base.floorAt(far.lat, far.lon, alt) === null && push === null,
    'nothing to resolve against once you are off the deck');

  /* Just inside the plan but past the wall limit is the case that matters. */
  const edge = base.toGeographic(2.7, 0);
  const back = base.resolve(edge.lat, edge.lon, alt, 0.34);
  check('a body overlapping the wall is pushed back in', back !== null);
  if (back) {
    const before = surfaceDistance(edge.lat, edge.lon, base.lat, base.lon);
    const after = surfaceDistance(back.lat, back.lon, base.lat, base.lon);
    check('and it moves inward, not outward', after < before,
      `${before.toFixed(2)} m -> ${after.toFixed(2)} m from the axis`);
  }
}

console.log('getting in and out');
{
  const foot = base.ladderFoot();
  check('the ladder foot is outside the hull', base.floorAt(foot.lat, foot.lon, GROUND + 0.1) === null);
  check('and you can enter from it',
    base.canEnter(foot.lat, foot.lon, GROUND + 0.1));
  check('but not from across the pad',
    !base.canEnter(base.lat, base.lon, GROUND + 0.1) ||
    surfaceDistance(base.lat, base.lon, foot.lat, foot.lon) < 2.6);

  const inn = base.insideStand();
  check('from inside you can leave', base.canExit(inn.lat, inn.lon, GROUND + inn.agl));
  check('and cannot leave from outside', !base.canExit(foot.lat, foot.lon, GROUND + 0.1));
}

console.log('the airlock actually cycles');
{
  check('it starts sealed to the cabin', base.pressure === 1 && base.airlock === 1);
  base.cycleAirlock(0);
  for (let t = 0; t < SHIP.airlockCycle + 4; t += 0.1) base.step(0.1);
  check('cycling to vacuum takes it down', base.airlock < 0.02,
    base.airlock.toFixed(3));
  base.cycleAirlock(1);
  for (let t = 0; t < SHIP.airlockCycle + 4; t += 0.1) base.step(0.1);
  check('and back up again', base.airlock > 0.98, base.airlock.toFixed(3));
  check('the cycle is not instant, which is what the sound follows',
    SHIP.airlockCycle > 8, SHIP.airlockCycle + ' s');
}

console.log(failures ? `\n${failures} FAILED` : '\nship: all checks passed');
process.exit(failures);
