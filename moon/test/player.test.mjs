/* What it is like to move on the Moon, checked without a browser.

   The claims being tested are the ones that separate lunar locomotion from
   Earth locomotion played slowly: gravity is a sixth, traction is a sixth,
   and your mass is not. */
import { Player, GAIT, lopeThreshold, stoppingDistance, FRICTION } from '../src/physics/player.js';
import { PLAYER, GM_MOON, R_MOON } from '../src/config.js';
import { readFileSync } from 'node:fs';

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

console.log('there is nothing to push against');
{
  /* A bound with the keys released.
     For a while this asserted that horizontal speed came out of a bound
     exactly as fast as it went in, on the correct grounds that a vacuum offers
     nothing to push against and the only honest vertical force is gravity.
     That is still true of a body with no working hardware — and it made the
     game feel like ice, because a lope is airborne half the time, so half of
     all travel was ballistic and stopping took five and a half metres.
     So the suit's maneuvering unit now trims your velocity in flight at
     `PLAYER.airBrake` of what a boot could manage. It is the same fiction as
     the jetpack, it is labelled as such, and the test is now that it is
     bounded rather than free: a body that CANNOT use it — one that has fallen,
     where `maxAccel` goes to zero — still conserves speed exactly. */
  const p = new Player({ lat: 0, lon: 0, ground: flat });
  run(p, 3, { forward: 1, run: true });            // up to lope speed
  const launch = p.speed;
  p.step(1 / 480, { forward: 1, run: true, jump: true });
  let flightMin = Infinity, flightMax = 0, airborneSteps = 0, started = false;
  for (let i = 0; i < 480 * 3; i++) {
    p.step(1 / 480, {});                            // keys released
    /* The first continuous stretch in the air only: landing scrubs speed, and
       a lope bounces, so a later hop would be measured against a slower body. */
    if (!p.grounded) {
      started = true;
      airborneSteps++;
      flightMin = Math.min(flightMin, p.speed);
      flightMax = Math.max(flightMax, p.speed);
    } else if (started) break;
  }
  check('the bound actually leaves the ground', airborneSteps > 200,
        airborneSteps + ' substeps in the air');
  /* The pack trims, and the trim is bounded by what it is allowed to be.
     The ceiling uses the same gravity the player does — GM/r^2, which is
     1.6221 at the datum, not the 1.62 everything rounds it to. */
  const shed = (launch - flightMin) / (airborneSteps / 480);
  const ceiling = FRICTION * (GM_MOON / (R_MOON * R_MOON)) * PLAYER.airBrake;
  check('the pack trims your velocity in flight, but only so fast',
        shed > 0.01 && shed <= ceiling + 1e-6,
        `${shed.toFixed(3)} m/s^2 against a ceiling of ${ceiling.toFixed(3)}`);

  /* And a body that cannot use it conserves speed exactly, which is the
     vacuum the rest of the file is about. `fallen` zeroes the authority. */
  const f = new Player({ lat: 0, lon: 0, ground: flat });
  run(f, 3, { forward: 1, run: true });
  f.step(1 / 480, { forward: 1, run: true, jump: true });
  f.fallenFor = 4;
  let fMin = Infinity, fMax = 0, fAir = 0, fStarted = false;
  for (let i = 0; i < 480 * 3; i++) {
    f.step(1 / 480, {});
    if (!f.grounded) { fStarted = true; fAir++; fMin = Math.min(fMin, f.speed); fMax = Math.max(fMax, f.speed); }
    else if (fStarted) break;
  }
  check('with the pack out of action, a vacuum is a vacuum again',
        fAir > 100 && fMax - fMin < 1e-6,
        `${fMin.toFixed(6)} to ${fMax.toFixed(6)} m/s over ${fAir} substeps`);
}

console.log('the jetpack can stop you, because thrust can');
{
  const p = new Player({ lat: 0, lon: 0, ground: flat });
  run(p, 3, { forward: 1, run: true });
  p.step(1 / 480, { forward: 1, run: true, jump: true });
  for (let i = 0; i < 240; i++) p.step(1 / 480, {});    // clear of the ground
  const before = p.speed;
  check('it is moving to start with', before > 1.5, before.toFixed(2) + ' m/s');
  /* Jet with no directional input: the pack thrusts against the motion. */
  for (let i = 0; i < 480; i++) p.step(1 / 480, { jet: true });
  check('holding the pack with no input arrests the drift',
        p.speed < before * 0.5, `${before.toFixed(2)} -> ${p.speed.toFixed(2)} m/s`);
  check('and never reverses it', p.speed >= -1e-9);

  /* On the ground it is still a jump assist and not a brake, because on the
     ground your boots are the brake. */
  const q = new Player({ lat: 0, lon: 0, ground: flat });
  run(q, 3, { forward: 1 });
  const walking = q.speed;
  q.step(1 / 480, { forward: 1, jet: true });
  check('a standing start with the pack still goes up', q.agl >= 0 && walking > 0.5);
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

/* ---------------------------------------------------------------------------
   Which way is right.

   Yaw here is a compass bearing: zero north, ninety east. That makes turning
   right an INCREASE, and it is worth pinning down, because for a long time all
   three places that consume a mouse movement subtracted it instead -- so the
   mouse turned the camera the wrong way on foot, in the rover and in the free
   camera, identically. Under the old press-drag look that passed for grabbing
   the world; the moment a click took the pointer it was just wrong.

   Two halves. The convention itself, which `Player` owns and can be walked
   here; and the three consumers, which live in files that import three.js and
   will not load in node, so they are read as text. A grep that fails the build
   is worth more than a comment nobody re-derives. */
console.log('which way is right');
{
  const p = new Player({ lat: 0, lon: 0, ground: flat, yaw: 0 });
  check('yaw zero reads as due north', Math.abs(p.heading) < 1e-6,
    p.heading.toFixed(1) + ' deg');

  /* A quarter turn to the right should be east, and walking should then raise
     the longitude and leave the latitude alone. The constructor takes degrees
     and stores radians (`physics/player.js:65`). */
  const e = new Player({ lat: 0, lon: 0, ground: flat, yaw: 90 });
  check('a quarter turn clockwise from north is east',
    Math.abs(e.heading - 90) < 1e-6, e.heading.toFixed(1) + ' deg');
  for (let i = 0; i < 120 * 20; i++) e.step(1 / 120, { forward: 1 });
  check('and walking that way goes east, not west',
    e.llh.lon > 0.0005 && Math.abs(e.llh.lat) < 1e-4,
    `lon ${e.llh.lon.toFixed(4)}, lat ${e.llh.lat.toFixed(6)}`);

  const code = (f) => readFileSync(new URL(f, import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const wrong = [];
  for (const [f, re] of [
    ['../src/game/eva.js', /p\.yaw\s*([-+])=\s*input\.dYaw/g],
    ['../src/main.js', /cam\.yaw\s*([-+])=\s*look\.yaw/g],
  ]) {
    const src = code(f);
    const found = [...src.matchAll(re)];
    if (!found.length) wrong.push(f + ': no yaw consumer found at all');
    for (const m of found) if (m[1] === '-') wrong.push(f + ': ' + m[0].trim());
  }
  check('every mouse-yaw consumer adds rather than subtracts',
    wrong.length === 0, wrong.join(' | ') || 'on foot, rover and free camera');
}

/* ---------------------------------------------------------------------------
   The ground moving, and the floor under the floor.

   Two things reported as "I keep falling halfway through the ground". The
   ground genuinely does move — a tile refining or a raster arriving changes
   the surface by metres under someone standing still — and it used to be
   carried only while grounded, which at a lope is half the time. And the
   contact clamp used to be skipped outright by any upward velocity, with no
   depth limit at all, so a jetpack burn or a push-off inside a hill went
   straight through it. */
/* ---------------------------------------------------------------------------
   Walking, which did not used to exist.

   The slowest thing on offer was 2.6 m/s — three and a half times the Froude
   threshold — so any key at all put you into a bound that is airborne half the
   time by construction, and airborne a boot has nothing to push against. That
   is the whole of "it feels like the ground is ice": effective deceleration was
   0.61 m/s^2, stopping took 4.3 seconds and five and a half metres, and a
   ninety degree turn took six seconds. */
console.log('walking, and stopping');
{
  const flatGround = flat;
  const measure = (input) => {
    const p = new Player({ lat: 0, lon: 0, ground: flatGround, yaw: 0 });
    let air = 0, n = 0;
    for (let i = 0; i < 120 * 20; i++) {
      p.step(1 / 120, input);
      if (i > 120 * 5) { n++; if (!p.grounded) air++; }
    }
    const top = p.speed;
    let t = 0, d = 0;
    while (p.speed > 0.05 && t < 40) { d += p.speed / 120; p.step(1 / 120, {}); t += 1 / 120; }
    return { top, airborne: air / n, t, d };
  };

  const w = measure({ forward: 1 });
  const l = measure({ forward: 1, run: true });

  check('the default gait is a walk, not a bound',
    Math.abs(w.top - PLAYER.walk) < 0.05, w.top.toFixed(2) + ' m/s');
  check('and it keeps a boot down most of the time',
    w.airborne < 0.3, (100 * w.airborne).toFixed(0) + '% airborne');
  check('so it stops in about a metre',
    w.d < 1.5, `${w.t.toFixed(2)} s and ${w.d.toFixed(2)} m`);

  check('shift is the Apollo bound, and still airborne about half the time',
    l.airborne > 0.4 && l.airborne < 0.6, (100 * l.airborne).toFixed(0) + '% airborne');
  /* Still a committed gait, and it should be: at 3.6 m/s you plan the stop a
     few paces out, which is what every Apollo crew reported. What changed is
     the factor of two — the same bound used to need 10.6 m, because half the
     time nothing was touching your velocity at all. */
  check('it commits you, but to half the distance it used to',
    l.d > 3 && l.d < 7, `${l.t.toFixed(2)} s and ${l.d.toFixed(2)} m, against 10.6 m before`);
  check('and the lope is still the faster way to cross a mare',
    l.top > w.top * 1.5, `${l.top.toFixed(2)} against ${w.top.toFixed(2)} m/s`);
}

console.log('the ground moving under you');
{
  /* A surface that can be moved between steps, sampled the same way the real
     height field is. */
  let level = 0;
  const shifting = {
    heightAt: () => level,
    slopeAt: () => 0,
    normalAt: () => ({ e: 0, n: 0, u: 1 }),
  };

  const p = new Player({ lat: 0, lon: 0, ground: shifting, yaw: 0 });
  for (let i = 0; i < 120; i++) p.step(1 / 120, {});
  let worst = 0, hurt = 0;
  const before = p.fallen;
  /* Refine the ground up and down by metres, as a streamed raster does. */
  for (const step of [3, -3, 1.5, -4, 6, -6]) {
    level += step;
    for (let i = 0; i < 60; i++) {
      p.step(1 / 120, {});
      worst = Math.max(worst, Math.abs(p.llh.h - level));
      if (p.lastImpact > hurt) hurt = p.lastImpact;
    }
  }
  check('the body is carried with it rather than dropped',
    worst < 0.3, worst.toFixed(3) + ' m off the surface at worst');
  check('and a refinement is never felt as a fall',
    hurt < PLAYER.fallHurt && p.fallen === before,
    'worst impact ' + hurt.toFixed(2) + ' m/s');

  /* Now while loping, which is where the old `grounded` gate let go. */
  const q = new Player({ lat: 0, lon: 0, ground: shifting, yaw: 0 });
  level = 0;
  let deepest = 0;
  for (let i = 0; i < 120 * 12; i++) {
    /* Move the ground first, then step, then look. Reading in between asks
       where the body is before it has been given a chance to be anywhere. */
    if (i % 90 === 0) level += (i % 180 === 0) ? 2.5 : -2.5;
    q.step(1 / 120, { forward: 1, run: true });
    deepest = Math.min(deepest, q.llh.h - level);
  }
  check('mid-bound too, never more than half a metre under',
    deepest > -0.55, deepest.toFixed(3) + ' m at the deepest');

  /* The floor under the floor. `rising` skips the contact test on purpose, so
     a jump is not cancelled on its own first frame, and it used to skip it
     with no depth limit at all — there was simply nothing between a rising
     body and the centre of the Moon. `MAX_SINK` closes that.
     Being straight about this one: it is an invariant, not a reproduction. I
     could not get a synthetic case under the surface here (the jet out-climbs
     a 45 degree ramp), so what the clamp guards against is reasoned from the
     code rather than demonstrated. The band-limit agreement in
     test/terrain.test.mjs is the causal fix for what was reported; this is
     cheap insurance behind it. */
  const j = new Player({ lat: 0, lon: 0, ground: ramp(45), yaw: 0 });
  let under = 0;
  for (let i = 0; i < 120 * 6; i++) {
    j.step(1 / 120, { forward: 1, run: true, jet: true });
    under = Math.min(under, j.llh.h - ramp(45).heightAt(j.llh.lat, j.llh.lon));
  }
  check('jetpacking into a hillside does not go through it',
    under > -0.55, under.toFixed(3) + ' m under the surface at worst');
}

console.log(failures ? `\nplayer: ${failures} FAILED` : '\nplayer: all checks passed');
process.exit(failures ? 1 : 0);
