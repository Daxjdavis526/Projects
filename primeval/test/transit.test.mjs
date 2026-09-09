// Crossing between the two worlds.
//
// Driven headlessly because the trip is 402,000 km and thirteen seconds of
// eased burn, and stepping it in a browser to find out where you come out is a
// four-minute round trip per attempt.

import { test, assert } from './harness.mjs';
import * as THREE from 'three';
import { SpaceStage } from '../src/ship/space.js';
import { SHIP } from '../src/config.js';

export const NAME = 'ship/transit';

/** Enough of a Game to fly a transit through. */
function fakeGame(localeId = 'moon') {
  const events = [];
  const g = {
    mode: 'SHIP',
    events,
    locale: { id: localeId, hasAtmosphere: localeId === 'planet' },
    camera: new THREE.PerspectiveCamera(),
    moonSite: { x: -600, z: -610, h: 12 },
    landingSite: { x: 1200, z: 400, h: 30 },
    moonBody: null,
    planetBody: null,
    input: { down: () => false },
    ship: {
      state: 'LANDED',
      throttle: 0,
      fuel: SHIP.maxFuel,
      gearDown: true,
      burn: 0,
      shake: 0,
      pos: new THREE.Vector3(-600, 12, -610),
      vel: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      forward: new THREE.Vector3(0, 0, -1),
      altitude: 0,
      say() {},
    },
    emit(name, ...rest) { events.push([name, ...rest]); },
    switchLocale(id) { this.locale = { id, hasAtmosphere: id === 'planet' }; },
  };
  return g;
}

/** Step the burn to completion at a fixed timestep. Returns frames used. */
function flyTransit(stage, game, dt = 1 / 60, cap = 5000) {
  let n = 0;
  while (stage.transit && n < cap) { stage.stepTransit(dt, game); n++; }
  return n;
}

export async function run() {
  test('you can leave from the pad without a fuel gauge to babysit', () => {
    const game = fakeGame('moon');
    const stage = new SpaceStage(game);
    game.ship.fuel = 0;                     // fuel should not matter any more
    assert(stage.transitBlocker(game) === null,
      `blocked on the pad: ${stage.transitBlocker(game)}`);
    assert(stage.canTransit(game), 'canTransit said no while sitting on the pad');
    assert(stage.begin(game), 'the burn refused to start');
    assert(game.ship.state === 'TRANSIT', `state is ${game.ship.state}`);
    assert(!game.ship.gearDown, 'left the pad with the gear still down');
    assert(game.ship.vel.y > 10, 'did not actually climb away from the pad');
  });

  test('the burn ends at the other world, low and slow enough to fly', () => {
    const game = fakeGame('moon');
    const stage = new SpaceStage(game);
    stage.begin(game);
    const frames = flyTransit(stage, game);
    assert(frames < 5000, 'the burn never finished');
    assert(game.locale.id === 'planet', `ended up at ${game.locale.id}`);
    assert(!stage.transit, 'still in transit after arriving');

    const s = game.ship;
    assert(Math.abs(s.pos.y - SHIP.transitArrivalAltitude) < 1,
      `arrived at ${s.pos.y.toFixed(0)} m, expected ${SHIP.transitArrivalAltitude}`);
    // Nine kilometres, not two hundred and twenty: the descent should be a
    // short one, and survivable at the speed we arrive doing.
    assert(s.pos.y <= 12000, 'arrival altitude is back to being a long haul');
    assert(-s.vel.y > 50 && -s.vel.y < 400,
      `arriving at ${(-s.vel.y).toFixed(0)} m/s, which is either a crawl or a crater`);
    assert(s.state === 'SPACE', `state after arrival is ${s.state}`);
  });

  test('the trip is not a fuel budget any more', () => {
    const game = fakeGame('moon');
    const stage = new SpaceStage(game);
    stage.begin(game);
    flyTransit(stage, game);
    assert(game.ship.fuel === SHIP.maxFuel,
      `the burn spent fuel: ${game.ship.fuel}`);
  });

  test('and it works in the other direction too', () => {
    const game = fakeGame('planet');
    const stage = new SpaceStage(game);
    assert(stage.destinationName() === 'ANVIL', 'wrong destination from the planet');
    assert(stage.begin(game), 'the return burn refused to start');
    flyTransit(stage, game);
    assert(game.locale.id === 'moon', `ended up at ${game.locale.id}`);
    const near = game.moonSite;
    const d = Math.hypot(game.ship.pos.x - near.x, game.ship.pos.z - near.z);
    assert(d < 6000, `came out ${d.toFixed(0)} m from the base, which is a walk`);
  });

  test('a transit already running does not start a second one', () => {
    const game = fakeGame('moon');
    const stage = new SpaceStage(game);
    stage.begin(game);
    assert(!stage.canTransit(game), 'allowed a second burn mid-burn');
    assert(!stage.begin(game), 'started a second burn mid-burn');
  });
}
