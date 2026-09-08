/* The save file, checked without a browser.

   The claim being tested is narrow and was false: that what `capture` writes,
   `restore` reads. Four fields were written into the file every three minutes
   and read by nothing — the waypoint list, the places you had been, whether
   you were in the rover, and the meal and sleep clocks — so a save looked
   complete, came back subtly wrong, and no test that did not compare the two
   halves against each other could have seen it. That comparison is what this
   file is. It walks the captured object rather than a list of field names,
   so a field added to `capture` and forgotten in `restore` fails here without
   anybody remembering to extend the test. */
import { Save } from '../src/game/save.js';
import { Visited } from '../src/game/visited.js';
import { Needs } from '../src/game/shelter.js';
import { Rover, MODE } from '../src/physics/rover.js';
import { ShipInterior } from '../src/game/interior.js';
import { Track } from '../src/game/track.js';
import { Suit } from '../src/physics/suit.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const flat = { heightAt: () => 0, slopeAt: () => 0, normalAt: () => ({ e: 0, n: 0, u: 1 }) };

/* A stand-in for the live game: the same shape `main.js` hands the save
   system, with the real Rover, Suit, Needs and Visited in it, and the walking
   physics replaced by the one method the save actually calls. */
function makeGame() {
  const rover = new Rover({ lat: 0.6, lon: 23.4, ground: flat });
  const suit = new Suit();
  const eva = {
    player: { llh: { lat: 0.6, lon: 23.5, h: 0 }, yaw: 0, pitch: 0,
              distance: 0, stepsTaken: 0, jetHeat: 0 },
    suit, view: 'first', lampMode: 0,
    place(lat, lon) { this.player.llh.lat = lat; this.player.llh.lon = lon; },
  };
  const wps = [];
  const game = {
    state: { simMs: 0, timeRate: 1, qualityName: 'high' },
    base: null,
    vehicle: { rover, dust: 0 },
    eva,
    shelter: { needs: new Needs() },
    visited: new Visited(),
    track: new Track(),
    driving: false,
    get waypoints() { return wps; },
    set waypoints(v) { wps.length = 0; wps.push(...(v || [])); },
    settle(lat, lon, heading) {
      const interior = new ShipInterior({ lat, lon, heading, groundHeight: -1900 });
      this.base = { lat, lon, heading, interior,
                    get cabinDust() { return interior.cabinDust; } };
    },
  };
  return game;
}

/* Everything the save is supposed to carry, set to a value that is not the
   value a fresh game has. */
function dirty(g) {
  g.state.simMs = 1750000000000;
  g.state.timeRate = 60;
  g.settle(0.67416, 23.47314, 137);
  const r = g.vehicle.rover;
  r.place(0.6800, 23.4600, 42);
  r.mode = MODE.CLOSED;
  r.canopy = 1;
  r.supplies.o2 = 3.25;
  r.supplies.water = 11.5;
  r.distance = 8421;
  r.rolled = true;
  r.boostHeat = 0.42;
  g.vehicle.dust = 0.31;
  g.eva.place(0.6790, 23.4550);
  g.eva.player.yaw = 1.23;
  g.eva.player.pitch = -0.4;
  g.eva.player.distance = 3120;
  g.eva.player.stepsTaken = 4109;
  g.eva.player.jetHeat = 0.66;
  g.eva.view = 'third';
  g.eva.lampMode = 2;
  g.eva.suit.o2 = 0.71;
  g.eva.suit.co2 = 0.18;
  g.eva.suit.power = 0.55;
  g.eva.suit.elapsed = 7200;
  g.eva.suit.dust = 0.44;
  g.base.interior.cabinDust = 0.31;
  g.shelter.needs.sinceMeal = 5 * 3600;
  g.shelter.needs.sinceSleep = 19 * 3600;
  g.shelter.needs.sleepDebt = 1800;
  g.driving = true;
  g.waypoints = [{ lat: 0.7, lon: 23.6 }, { lat: 0.9, lon: 23.9 }];
  g.visited.record('Sabine', { lat: 1.38, lon: 20.07, simMs: 1749000000000 });
  g.visited.record('Moltke', { lat: -0.56, lon: 24.22, simMs: 1749500000000 });
  for (let m = 0; m <= 4000; m += 25) g.track.add(0.6 + m / 30300, 23.4);
  return g;
}

/* Walk two captured objects and report every leaf that differs. `savedAt` is
   the wall clock at the moment of writing and is expected to differ. */
function diff(a, b, path = '', out = []) {
  if (path === 'savedAt' || path === 'reason') return out;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      out.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
      return out;
    }
    a.forEach((v, i) => diff(v, b[i], `${path}[${i}]`, out));
    return out;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      diff(a[k], b[k], path ? `${path}.${k}` : k, out);
    }
    return out;
  }
  if (a !== b) out.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
  return out;
}

console.log('a round trip through the save file');
{
  const written = Save.capture(dirty(makeGame()));
  /* Through JSON, because that is what localStorage actually stores — a Map
     or a class instance that survives in memory does not survive this. */
  const onDisk = JSON.parse(JSON.stringify(written));
  const fresh = makeGame();
  const res = Save.restore(fresh, onDisk);
  check('the save is recognised', res.ok === true, res.why || '');

  const back = Save.capture(fresh);
  const d = diff(written, back);
  check('everything captured comes back identical', d.length === 0,
        d.length ? d.join('; ') : `${Object.keys(written).length} fields`);
}

console.log('the fields that were written and never read');
{
  const g = dirty(makeGame());
  const data = JSON.parse(JSON.stringify(Save.capture(g)));
  const fresh = makeGame();
  Save.restore(fresh, data);
  check('the waypoints come back', fresh.waypoints.length === 2 &&
        Math.abs((fresh.waypoints[1] || {}).lon - 23.9) < 1e-9);
  check('the places you had been come back', fresh.visited.size === 2 &&
        fresh.visited.has('Sabine') && fresh.visited.has('Moltke'));
  const sabine = fresh.visited.list().find((e) => e.name === 'Sabine');
  check('and with the time you got there', !!sabine && sabine.simMs === 1749000000000);
  check('you are still in the rover', fresh.driving === true);
  check('the meal clock does not reset', Math.abs(fresh.shelter.needs.sinceMeal - 5 * 3600) < 1e-9);
  check('the sleep debt does not reset', Math.abs(fresh.shelter.needs.sleepDebt - 1800) < 1e-9);
  check('a rolled rover is still rolled', fresh.vehicle.rover.rolled === true);
  check('the boost is still hot', Math.abs(fresh.vehicle.rover.boostHeat - 0.42) < 1e-9);
  check('the jetpack is still hot', Math.abs(fresh.eva.player.jetHeat - 0.66) < 1e-9);
  check('the suit is still dirty', Math.abs(fresh.eva.suit.dust - 0.44) < 1e-9);
  check('and so is the cabin', Math.abs(fresh.base.cabinDust - 0.31) < 1e-9);
  check('the traverse comes back as a line', fresh.track.size > 100,
        `${fresh.track.size} points, ${(fresh.track.length / 1000).toFixed(2)} km`);
}

console.log('and it refuses what it does not recognise');
{
  const g = makeGame();
  check('a missing file', Save.restore(g, null).ok === false);
  check('a future version', Save.restore(g, { version: 2 }).ok === false);
}

console.log('the record of where you have been');
{
  const v = new Visited();
  const tycho = { inside: true, f: ['Tycho', 'crater', -43.31, -11.36, 85], km: 12 };
  check('arriving records the place', !!v.step(tycho, { simMs: 1, lat: -43.3, lon: -11.3 }));
  check('and does so once', v.step(tycho, { simMs: 2 }) === null && v.size === 1);
  check('the first arrival is the one kept', v.list()[0].simMs === 1);
  check('being near but outside is not being there',
        v.step({ inside: false, f: ['Plato'], km: 40 }) === null && v.size === 1);
  check('a load drops anything malformed',
        new Visited([{ name: 'Plato' }, null, { lat: 1 }, { name: 'Plato' }]).size === 1);
  check('a round trip through JSON keeps it',
        new Visited(JSON.parse(JSON.stringify(v.capture()))).has('Tycho'));
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
