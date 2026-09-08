/* What it is like to move on the Moon, checked without a browser.

   The claims being tested are the ones that separate lunar locomotion from
   Earth locomotion played slowly: gravity is a sixth, traction is a sixth,
   and your mass is not. */
import { Player, GAIT, lopeThreshold, stoppingDistance, FRICTION } from '../src/physics/player.js';
import { PLAYER, GM_MOON, R_MOON } from '../src/config.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* A perfectly flat world at datum height, and a ramp, so slopes can be tested
   without dragging the real heightfield in. */
const flat = { heightAt: () => 0, slopeAt: () => 0, normalAt: () => ({ e: 0, n: 0, u: 1 }) };
/* A constant slope rising towards the north. The interface matches the real
   heightfield exactly: slope in degrees, normal in local east/north/up. */
function ramp(deg) {
  const k = Math.tan(deg * Math.PI / 180);
  const mPerDeg = R_MOON * Math.PI / 180;      // one degree of latitude, 30.3 km
  const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180);
  return {
    heightAt: (lat) => lat * mPerDeg * k,
    slopeAt: () => deg,
    normalAt: () => ({ e: 0, n: -s, u: c }),   // tilted towards the south, downhill
  };
}

const run = (p, seconds, input, dt = 1 / 120) => {
  const n = Math.round(seconds / dt);
  for (let i = 0; i < n; i++) p.step(dt, typeof input === 'function' ? input(i * dt) : input);
  return p;
};

console.log('gravity');
{
  const p = new Player({ lat: 0, lon: 0, ground: flat });
  p.place(0, 0, 2.0);
  let t = 0;
  const dt = 1 / 480;
  while (p.agl > 0.001 && t < 10) { p.step(dt, {}); t += dt; }
  /* h = g t^2 / 2 with g = GM/r^2 at the surface. */
  const g = GM_MOON / (R_MOON * R_MOON);
  const expect = Math.sqrt(2 * 2.0 / g);
  check('a two metre drop takes 1.57 s, not 0.64 s',
    Math.abs(t - expect) < 0.05, `${t.toFixed(2)} s vs ${expect.toFixed(2)} s`);
  check('the same drop on Earth would be four tenths of that',
    Math.abs(expect / Math.sqrt(2 * 2.0 / 9.81) - 2.46) < 0.05);
  check('lunar surface gravity is 1.62 m/s^2', Math.abs(g - 1.62) < 0.01, g.toFixed(4));
}

console.log('jumping');
{
  const p = new Player({ lat: 0, lon: 0, ground: flat });
  let high = 0;
  p.step(1 / 120, { jump: true });
  run(p, 4, {}, 1 / 480);
  const q = new Player({ lat: 0, lon: 0, ground: flat });
  q.step(1 / 480, { jump: true });
  /* Time it, rather than asserting a monotonic counter is not negative and a
     height already forced by the line above — which is what this did, and it
     is the flagship physics suite. */
  let hang = 0;
  const dt = 1 / 480;
  for (let i = 0; i < 480 * 4; i++) {
    q.step(dt, {});
    high = Math.max(high, q.agl);
    if (q.agl > 0.001) hang += dt;
  }
  check('a jump clears about half a metre', Math.abs(high - PLAYER.jumpHeight) < 0.05,
    high.toFixed(2) + ' m');
  /* Ballistic: up and down again under 1.62 m/s^2 from the take-off speed that
     reaches that height. Four times as long as the same jump on Earth, and
     that is the number this suite exists to defend. */
  const g = GM_MOON / (R_MOON * R_MOON);
  const expect = 2 * Math.sqrt(2 * PLAYER.jumpHeight / g);
  check('and hangs in the air for the time lunar gravity says',
    Math.abs(hang - expect) < 0.06, `${hang.toFixed(2)} s vs ${expect.toFixed(2)} s`);
  check('which is well over a second, and four times the Earth figure',
    hang > 1.2 && Math.abs(expect / (2 * Math.sqrt(2 * PLAYER.jumpHeight / 9.81)) - 2.46) < 0.05,
    hang.toFixed(2) + ' s');
}

console.log('gaits');
{
  check('walking gives way to loping below a metre per second',
    Math.abs(lopeThreshold() - 0.74) < 0.03, lopeThreshold().toFixed(2) + ' m/s');

  const walk = new Player({ lat: 0, lon: 0, ground: flat });
  run(walk, 6, { forward: 0.25 });
  check('a gentle input stays a walk', walk.gait === GAIT.WALK,
    `${walk.gait} at ${walk.speed.toFixed(2)} m/s`);
  check('and a walk keeps both feet near the ground', walk.agl < 0.05, walk.agl.toFixed(3) + ' m');

  const lope = new Player({ lat: 0, lon: 0, ground: flat });
  let airborne = 0, samples = 0;
  for (let i = 0; i < 120 * 20; i++) {
    lope.step(1 / 120, { forward: 1, run: true });
    if (i > 120 * 8) { samples++; if (!lope.grounded) airborne++; }
  }
  check('asking for speed produces a bounding gait, not a fast walk',
    lope.gait === GAIT.LOPE || lope.gait === GAIT.FLIGHT, lope.gait);
  check('a loper spends much of the time off the ground',
    airborne / samples > 0.3, `${(100 * airborne / samples).toFixed(0)} % airborne`);
  check('and covers ground at a few metres a second',
    lope.speed > 2 && lope.speed < 4.2, lope.speed.toFixed(2) + ' m/s');
  check('taking long strides', lope.distance / Math.max(1, lope.stepsTaken) > 1.5,
    (lope.distance / lope.stepsTaken).toFixed(2) + ' m per stride');
}

console.log('traction');
{
  /* Reaching speed is slow because a boot cannot push hard on a sixth of a
     weight, and stopping is slower still. */
  const p = new Player({ lat: 0, lon: 0, ground: flat });
  let t = 0;
  while (p.speed < 2.5 && t < 30) { p.step(1 / 120, { forward: 1, run: true }); t += 1 / 120; }
  check('getting up to 2.5 m/s takes seconds, not a stride',
    t > 1.2 && t < 8, t.toFixed(2) + ' s');

  const before = { ...p.llh };
  const v0 = p.speed;
  let d = 0, t2 = 0;
  while (p.speed > 0.05 && t2 < 30) { const s = p.speed; p.step(1 / 120, {}); d += s / 120; t2 += 1 / 120; }
  const predicted = stoppingDistance(v0);
  check('stopping from a lope takes metres of runway',
    d > predicted * 0.5 && d < predicted * 2.5,
    `${d.toFixed(1)} m travelled, ${predicted.toFixed(1)} m predicted`);
  check('which is far longer than on Earth',
    predicted > stoppingDistance(v0, 9.81) * 4, predicted.toFixed(1) + ' m vs ' +
    stoppingDistance(v0, 9.81).toFixed(1) + ' m');
  check('friction angle is in the Apollo range', FRICTION > 0.6 && FRICTION < 1.2,
    (Math.atan(FRICTION) * 180 / Math.PI).toFixed(0) + ' degrees');
}

console.log('slopes');
{
  const gentle = new Player({ lat: 0, lon: 0, ground: ramp(15) });   // under the friction angle
  run(gentle, 8, {});
  check('a fifteen degree slope is standable', gentle.speed < 0.2,
    gentle.speed.toFixed(3) + ' m/s');

  const steep = new Player({ lat: 0, lon: 0, ground: ramp(42) });
  run(steep, 8, {});
  check('a forty-two degree slope slides you down it', steep.speed > 0.3,
    steep.speed.toFixed(2) + ' m/s');
}

console.log('falls');
{
  const p = new Player({ lat: 0, lon: 0, ground: flat });
  p.place(0, 0, 30);                       // a 30 m drop, about 6 s of falling
  run(p, 12, {}, 1 / 240);
  check('a thirty metre fall arrives hard', p.lastImpact > PLAYER.fallHurt,
    p.lastImpact.toFixed(1) + ' m/s');
  check('and knocks you over rather than killing you', p.stumbles === 1,
    p.stumbles + ' stumble(s), back on your feet after');
  const q = new Player({ lat: 0, lon: 0, ground: flat });
  q.place(0, 0, 1.0);
  run(q, 4, {}, 1 / 240);
  check('a one metre step down does not', q.stumbles === 0,
    q.lastImpact.toFixed(2) + ' m/s');
}

console.log('jetpack (FICTIONAL)');
{
  const p = new Player({ lat: 0, lon: 0, ground: flat });
  run(p, 3, { jet: true });
  check('the pack lifts you clear of the ground', p.agl > 5, p.agl.toFixed(1) + ' m');
  let t = 3;
  while (p.jetHeat < 1 && t < 60) { p.step(1 / 120, { jet: true }); t += 1 / 120; }
  check('but overheats after about eight seconds', t > 5 && t < 12, t.toFixed(1) + ' s');
  const hot = p.jetHeat;
  run(p, 6, {});
  check('and cools down again when released', p.jetHeat < hot - 0.3,
    `${hot.toFixed(2)} to ${p.jetHeat.toFixed(2)}`);
  check('it never runs out of propellant, so nobody gets stranded',
    p.jetHeat < 1.001);
}

console.log('crossing ground');
{
  /* Walk a long way and make sure the controller stays welded to the surface:
     no drift upwards, no falling through, position still sane. */
  const p = new Player({ lat: 10, lon: -30, ground: flat, yaw: 0 });   // due north
  let worstAgl = 0;
  for (let i = 0; i < 120 * 600; i++) {
    p.step(1 / 120, { forward: 1, run: true });
    if (p.grounded) worstAgl = Math.max(worstAgl, Math.abs(p.agl));
  }
  check('ten minutes of loping covers a couple of kilometres',
    p.distance > 1500 && p.distance < 3000, (p.distance / 1000).toFixed(2) + ' km');
  check('and never drifts off the surface', worstAgl < 0.05, worstAgl.toFixed(4) + ' m');
  check('latitude and longitude stay finite and sane',
    Number.isFinite(p.llh.lat) && Math.abs(p.llh.lat) < 90 && Number.isFinite(p.llh.lon));
  check('travelling north raises the latitude', p.llh.lat > 10.0,
    p.llh.lat.toFixed(4) + ' deg');
}

console.log('snapshot');
{
  const p = new Player({ lat: 0.674, lon: 23.473, ground: flat });
  run(p, 2, { forward: 1 });
  const s = p.snapshot();
  for (const k of ['lat', 'lon', 'alt', 'speed', 'heading', 'gait', 'grounded', 'exertion'])
    check(`snapshot carries ${k}`, s[k] !== undefined);
  check('heading reads as a compass bearing', s.heading >= 0 && s.heading < 360,
    s.heading.toFixed(0) + ' deg');
}

console.log('the ground moving under you is not a fall');
{
  /* Terrain streams in. A tile arriving at a finer level changes the surface
     under a player who has not moved, and the first version of this read every
     refinement as a two-metre drop: the player landed hard, got up, and was
     knocked down again by the next tile. */
  let surface = 0;
  const ground = {
    heightAt: () => surface,
    slopeAt: () => 0,
    normalAt: () => ({ e: 0, n: 0, u: 1 }),
  };
  const p = new Player({ ground, lat: 0, lon: 0 });
  for (let t = 0; t < 1; t += 1 / 120) p.step(1 / 120, {});
  check('the player is standing on the ground to begin with', p.grounded && !p.snapshot().fallen);

  surface = -2.4;                       // a finer tile says the ground is lower
  for (let t = 0; t < 0.5; t += 1 / 120) p.step(1 / 120, {});
  check('a refinement carries the body down with it rather than dropping it',
    p.grounded && Math.abs(p.llh.h - surface) < 0.05,
    `h ${p.llh.h.toFixed(2)} vs ground ${surface}`);
  check('and it is not counted as a fall', !p.snapshot().fallen && p.stumbles === 0,
    `${p.stumbles} stumbles`);

  surface = 1.7;                        // and back up again
  for (let t = 0; t < 0.5; t += 1 / 120) p.step(1 / 120, {});
  check('the same going up', p.grounded && Math.abs(p.llh.h - surface) < 0.05 &&
    p.stumbles === 0);

  /* A real drop still has to hurt, so the discrimination has to be by cause and
     not by size: this one happens because the player walked off it. */
  const cliff = {
    heightAt: (lat) => (lat > 0.00002 ? -9 : 0),
    slopeAt: () => 0,
    normalAt: () => ({ e: 0, n: 0, u: 1 }),
  };
  const q = new Player({ ground: cliff, lat: 0, lon: 0 });
  q.yaw = 0;
  let worst = 0, airborne = 0;
  for (let t = 0; t < 6; t += 1 / 120) {
    q.step(1 / 120, { forward: 1, run: true });
    worst = Math.max(worst, q.lastImpact);
    if (!q.grounded) airborne += 1 / 120;
  }
  check('walking off a cliff is still a fall', airborne > 2 && worst > 4,
    `${airborne.toFixed(1)} s in the air, hit at ${worst.toFixed(1)} m/s`);
}

console.log(failures ? `\nplayer: ${failures} FAILED` : '\nplayer: all checks passed');
process.exit(failures ? 1 : 0);
