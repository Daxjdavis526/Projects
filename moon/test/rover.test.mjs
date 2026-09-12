/* The rover, checked without a browser.

   The claim being tested is the one that makes lunar driving different: the
   wheels can only push as hard as the ground holds them down, and the ground
   holds them down with a sixth of the weight it would on Earth. */
import { Rover, MODE } from '../src/physics/rover.js';
import { ROVER, SUIT, GM_MOON, R_MOON } from '../src/config.js';
import { Suit } from '../src/physics/suit.js';
import { surfaceDistance } from '../src/physics/frames.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const flat = { heightAt: () => 0, slopeAt: () => 0, normalAt: () => ({ e: 0, n: 0, u: 1 }) };
function ramp(deg) {
  const k = Math.tan(deg * Math.PI / 180);
  const mPerDeg = R_MOON * Math.PI / 180;
  const s = Math.sin(deg * Math.PI / 180), c = Math.cos(deg * Math.PI / 180);
  return {
    heightAt: (lat) => lat * mPerDeg * k,
    slopeAt: () => deg,
    normalAt: () => ({ e: 0, n: -s, u: c }),   // downhill towards the south
  };
}
const drive = (r, seconds, input, dt = 1 / 120) => {
  for (let i = 0; i < Math.round(seconds / dt); i++) r.step(dt, input);
  return r;
};

console.log('traction');
{
  const r = new Rover({ lat: 0, lon: 0, ground: flat });
  drive(r, 1, {});
  const g = GM_MOON / (R_MOON * R_MOON);
  const limit = r.tractionLimit();
  const accel = limit / ROVER.mass;
  check('the ground can only accept about a tenth of a gravity',
    accel > 0.6 && accel < 1.4, accel.toFixed(2) + ' m/s^2');
  check('which is a sixth of what the same wheels would get on Earth',
    Math.abs(accel / (ROVER.grip * 9.81) - 1 / 6) < 0.03,
    (accel / (ROVER.grip * 9.81)).toFixed(3) + ' of Earth');

  const acc = new Rover({ lat: 0, lon: 0, ground: flat });
  let t = 0;
  while (acc.speed < 4 && t < 60) { acc.step(1 / 120, { throttle: 1 }); t += 1 / 120; }
  check('getting to 4 m/s takes several seconds', t > 2.5 && t < 15, t.toFixed(1) + ' s');
  check('and asking for full throttle spins the wheels',
    acc.slipping || acc.speed >= ROVER.speedMax - 0.01,
    acc.slipping ? 'slipping' : 'at the speed limit');
}

console.log('speed and boost');
{
  const r = new Rover({ lat: 0, lon: 0, ground: flat });
  drive(r, 60, { throttle: 1 });
  check('flat out is 60 km/h, which the Apollo rover would not recognise',
    Math.abs(r.speed - ROVER.speedMax) < 0.1, (r.speed * 3.6).toFixed(1) + ' km/h');

  const b = new Rover({ lat: 0, lon: 0, ground: flat });
  drive(b, 60, { throttle: 1 });
  let top = 0;
  for (let i = 0; i < 120 * 11; i++) { b.step(1 / 120, { throttle: 1, boost: true }); top = Math.max(top, b.speed); }
  check('boost gets it past 100 km/h', top > ROVER.speedMax * 1.4,
    (top * 3.6).toFixed(1) + ' km/h');
  check('but the drive heats up', b.boostHeat > 0.9, b.boostHeat.toFixed(2));
  drive(b, 6, { throttle: 1, boost: true });
  /* Not `<= speedMax` to the centimetre: once the drive is too hot it refuses,
     cools a little below the threshold, grants one more moment of boost and
     refuses again, so the speed hovers a hair over the cruise ceiling rather
     than sitting exactly on it. What matters is that it is nowhere near the
     boost ceiling any more. */
  check('and once it is hot the boost stops working',
    b.speed < (ROVER.speedMax + ROVER.speedBoost) / 2,
    'back to ' + (b.speed * 3.6).toFixed(1) + ' km/h');
  drive(b, 30, { throttle: 0 });
  check('and cools down again when you stop asking', b.boostHeat < 0.3, b.boostHeat.toFixed(2));

  let t = 0;
  const h = new Rover({ lat: 0, lon: 0, ground: flat });
  while (h.boostHeat < 1 && t < 60) { h.step(1 / 120, { throttle: 1, boost: true }); t += 1 / 120; }
  check('boost lasts about ten seconds before it has to rest',
    t > 6 && t < 18, t.toFixed(1) + ' s');
}

console.log('stopping');
{
  const r = new Rover({ lat: 0, lon: 0, ground: flat });
  drive(r, 60, { throttle: 1 });
  const v0 = r.speed;
  let d = 0, t = 0;
  while (Math.abs(r.speed) > 0.05 && t < 60) {
    d += Math.abs(r.speed) / 120; r.step(1 / 120, { brake: true }); t += 1 / 120;
  }
  /* Braking is the same traction budget as driving, so at 60 km/h in a sixth
     of a gravity it takes more than a hundred metres to stop. This is the
     number that should make anyone think twice before boosting downhill. */
  check('stopping from full speed takes over a hundred metres',
    d > 60 && d < 200, `${d.toFixed(0)} m from ${(v0 * 3.6).toFixed(0)} km/h`);
  check('which is six times an Earth car doing the same speed',
    d > (v0 * v0 / (2 * ROVER.grip * 9.81)) * 4,
    `${d.toFixed(0)} m against ${(v0 * v0 / (2 * ROVER.grip * 9.81)).toFixed(0)} m on Earth`);
}

console.log('steering');
{
  const r = new Rover({ lat: 0, lon: 0, ground: flat });
  drive(r, 25, { throttle: 0.35 });
  const slow = r.speed;
  const h0 = r.heading;
  drive(r, 6, { throttle: 0.35, steer: 1 });
  const turnedSlow = Math.abs(((r.heading - h0 + 540) % 360) - 180);
  check('it turns', turnedSlow > 5, turnedSlow.toFixed(0) + ' degrees in six seconds');

  const f = new Rover({ lat: 0, lon: 0, ground: flat });
  drive(f, 60, { throttle: 1, boost: true });
  drive(f, 3, { throttle: 1, boost: true, steer: 1 });
  check('but hard cornering at speed slides rather than turning',
    f.sliding, f.sliding ? 'sliding' : 'gripping at ' + (f.speed * 3.6).toFixed(0) + ' km/h');
}

console.log('slopes');
{
  const gentle = new Rover({ lat: 0, lon: 0, ground: ramp(10) });
  drive(gentle, 10, {});
  check('a ten degree slope can be parked on', Math.abs(gentle.speed) < 0.6,
    gentle.speed.toFixed(2) + ' m/s');

  const steep = new Rover({ lat: 0, lon: 0, ground: ramp(40) });
  drive(steep, 10, {});
  check('a forty degree slope slides it downhill', Math.abs(steep.speed) > 0.5,
    steep.speed.toFixed(2) + ' m/s');

  const timeTo = (ground) => {
    const r = new Rover({ lat: 0, lon: 0, ground, heading: 0 });
    let t = 0;
    while (r.speed < 3 && t < 120) { r.step(1 / 120, { throttle: 1 }); t += 1 / 120; }
    return t;
  };
  const flatT = timeTo(flat), climbT = timeTo(ramp(20));
  check('it can climb twenty degrees, but it takes twice as long to get going',
    climbT > flatT * 1.6 && climbT < 60,
    `${climbT.toFixed(1)} s uphill against ${flatT.toFixed(1)} s on the flat`);
  const tooSteep = new Rover({ lat: 0, lon: 0, ground: ramp(45), heading: 0 });
  drive(tooSteep, 20, { throttle: 1 });
  check('and it cannot climb forty five: gravity beats the traction budget',
    tooSteep.speed < 0, (tooSteep.speed * 3.6).toFixed(1) + ' km/h, sliding backwards');
}

/* Getting air, which is the whole point of a fast vehicle in a sixth of a
   gravity. A rise that ends is a ramp: drive up it at the boost ceiling and the
   wheels should leave the ground for long enough to notice, and the vehicle
   should come down on them rather than staying in the air for ever. */
console.log('leaving the ground');
{
  const mPerDeg = R_MOON * Math.PI / 180;
  /* Rising at ten degrees until the lip, flat after it. */
  const lipLat = 200 / mPerDeg;
  const k = Math.tan(10 * Math.PI / 180);
  const jump = {
    heightAt: (lat) => Math.min(lat, lipLat) * mPerDeg * k,
    slopeAt: (lat) => (lat < lipLat ? 10 : 0),
    normalAt: (lat) => (lat < lipLat
      ? { e: 0, n: -Math.sin(0.1745), u: Math.cos(0.1745) } : { e: 0, n: 0, u: 1 }),
  };
  const r = new Rover({ lat: 0, lon: 0, heading: 0, ground: jump });
  r.speed = ROVER.speedBoost;
  let air = 0;
  for (let i = 0; i < 120 * 40; i++) {
    r.step(1 / 120, { throttle: 1, boost: true });
    air = Math.max(air, r.airborneFor);
  }
  check('the lip throws it into the air', air > 0.5, air.toFixed(1) + ' s of air');
  check('and it lands again rather than flying away',
    r.airborneFor < 1 && r.contact.some(Boolean), r.airborneFor.toFixed(2) + ' s airborne now');
}

/* Noise, and data that jumps.
   -----------------------------------------------------------------------------
   The reason the previous version of the "getting air" term shipped broken is
   that its only test was an analytic ramp: perfectly smooth, no noise, no level
   of detail, nothing streaming. On the real thing it levitated continuously and
   flew off with the camera in it.
   Three surfaces it now has to survive. Regolith-scale noise at the speeds this
   vehicle can reach; a tile refining or a raster landing, which moves the whole
   surface by metres between one frame and the next; and a pit being cut, which
   is a 125 m hole appearing underneath. None of them is terrain the wheels are
   riding over, and none of them may throw the vehicle. */
console.log('not being launched by the data');
{
  const mPerDeg = R_MOON * Math.PI / 180;
  /* Band-limited bumps, as the drawn mesh carries them: a metre of wavelength
     and a few centimetres of amplitude. */
  const bumpy = {
    heightAt: (lat, lon) => {
      const x = lat * mPerDeg, y = lon * mPerDeg;
      return 0.06 * Math.sin(x / 1.0) + 0.04 * Math.sin(y / 1.3 + 1.7)
           + 0.03 * Math.sin(x / 2.7 + 0.4);
    },
    slopeAt: () => 3,
    normalAt: () => ({ e: 0, n: 0, u: 1 }),
  };
  const r = new Rover({ lat: 0, lon: 0, heading: 0, ground: bumpy });
  let air = 0, worstUp = 0;
  for (let i = 0; i < 120 * 60; i++) {
    r.step(1 / 120, { throttle: 1, boost: true });
    if (r.airborneFor > air) air = r.airborneFor;
    worstUp = Math.max(worstUp, r.height);
  }
  check('a minute at the boost ceiling over real bumps does not levitate it',
    worstUp < ROVER.clearance + 1.0 && air < 1.0,
    `${(r.speed * 3.6).toFixed(0)} km/h, hull peaked at ${worstUp.toFixed(2)} m, longest hop ${air.toFixed(2)} s`);

  /* Now the same drive, with the whole surface stepping by metres the way a
     streamed raster does. */
  let offset = 0;
  const stepping = {
    heightAt: (lat, lon) => bumpy.heightAt(lat, lon) + offset,
    slopeAt: () => 3,
    normalAt: () => ({ e: 0, n: 0, u: 1 }),
  };
  const q = new Rover({ lat: 0, lon: 0, heading: 0, ground: stepping });
  let qAir = 0, qUp = 0;
  for (let i = 0; i < 120 * 40; i++) {
    if (i % 240 === 0) offset += (i % 480 === 0) ? 3 : -3;
    q.step(1 / 120, { throttle: 1, boost: true });
    if (q.airborneFor > qAir) qAir = q.airborneFor;
    qUp = Math.max(qUp, q.height);
  }
  check('and a raster arriving every two seconds does not either',
    qUp < ROVER.clearance + 1.0 && qAir < 1.0,
    `hull peaked at ${qUp.toFixed(2)} m, longest hop ${qAir.toFixed(2)} s`);

  /* A pit being cut: 125 m, in one frame. */
  let hole = 0;
  const cut = {
    heightAt: () => hole,
    slopeAt: () => 0,
    normalAt: () => ({ e: 0, n: 0, u: 1 }),
  };
  const c2 = new Rover({ lat: 0, lon: 0, heading: 0, ground: cut });
  for (let i = 0; i < 240; i++) c2.step(1 / 120, {});
  hole = -125;
  let flung = 0;
  for (let i = 0; i < 120 * 3; i++) { c2.step(1 / 120, {}); flung = Math.max(flung, c2.vertical); }
  check('and a 125 m pit appearing underneath does not fling it upward',
    flung < 0.5, 'peak climb ' + flung.toFixed(2) + ' m/s');
}

console.log('rolling over');
{
  const r = new Rover({ lat: 0, lon: 0, ground: flat });
  r.roll = 1.2;
  r.step(1 / 120, {});
  check('too much roll puts it on its side', r.rolled);
  drive(r, 2, { throttle: 1 });
  check('and a rolled rover does not drive', Math.abs(r.speed) < 0.2,
    r.speed.toFixed(2) + ' m/s');
  r.recover();
  check('recovery puts it back on its wheels', !r.rolled && r.roll === 0);
  drive(r, 5, { throttle: 1 });
  check('and it drives again', r.speed > 0.2, r.speed.toFixed(2) + ' m/s');
}

/* Left alone.
   -----------------------------------------------------------------------------
   Three ways the vehicle used to get away from you. Parked, only the residual
   drag held it -- 0.12 of the brake force over 1450 kg, which is 0.43 m/s^2,
   and gravity down a slope beats that from fifteen degrees, so a rover left on
   anything but the flat drove itself off. Dismounting never touched its speed,
   so stepping out at the cruise ceiling abandoned a driverless vehicle that
   coasted 324 m. And `place` did not clear what the suspension remembers, so
   restoring a save computed a climb rate between two different sites and
   launched it on arrival. */
console.log('left alone, it stays where it is');
{
  const slope = new Rover({ lat: 0, lon: 0, ground: ramp(20), heading: 0 });
  const from = { lat: slope.lat, lon: slope.lon };
  /* `parked` is what the Vehicle layer passes when nobody is aboard. */
  drive(slope, 60, { throttle: 0, parked: true });
  const drift = surfaceDistance(from.lat, from.lon, slope.lat, slope.lon);
  check('a minute parked on a twenty degree slope does not move it',
    drift < 1.0 && Math.abs(slope.speed) < 0.1,
    `${drift.toFixed(2)} m, ${slope.speed.toFixed(3)} m/s`);

  /* But the parking brake is still only a brake: past the friction angle the
     ground cannot hold the wheels however hard they are held. */
  /* 44 rather than 48: past about 46 the nose-up pitch alone trips the
     rollover threshold, and a rolled rover has its speed damped on purpose,
     which would be measuring the wrong thing. */
  const tooSteep = new Rover({ lat: 0, lon: 0, ground: ramp(44), heading: 0 });
  drive(tooSteep, 30, { throttle: 0, parked: true });
  check('and past the friction angle it slides anyway, brake or no brake',
    Math.abs(tooSteep.speed) > 0.5, tooSteep.speed.toFixed(2) + ' m/s');

  /* Coasting is not parking: a driver off the throttle still rolls. */
  const coast = new Rover({ lat: 0, lon: 0, ground: flat });
  drive(coast, 30, { throttle: 1 });
  const rolling = coast.speed;
  drive(coast, 1, { throttle: 0 });
  check('a driver off the throttle still coasts, which is not the same thing',
    coast.speed > rolling * 0.9, `${rolling.toFixed(1)} -> ${coast.speed.toFixed(1)} m/s`);

  /* A teleport must not be read as terrain. */
  const moved = new Rover({ lat: 0, lon: 0, ground: ramp(20), heading: 0 });
  drive(moved, 10, { throttle: 1 });
  moved.place(40, 120, 90);
  let flung = 0;
  for (let i = 0; i < 120 * 3; i++) { moved.step(1 / 120, {}); flung = Math.max(flung, moved.vertical); }
  check('and being put somewhere else does not launch it on arrival',
    flung < 0.5 && moved.airborneFor < 0.2, 'peak climb ' + flung.toFixed(2) + ' m/s');
}

console.log('open and closed');
{
  const r = new Rover({ lat: 0, lon: 0, ground: flat });
  check('it starts open, in vacuum', r.mode === MODE.OPEN && r.pressure === 0);
  r.step(1 / 60, { toggleCanopy: true });
  check('the canopy starts closing', r.mode === MODE.CLOSING);
  drive(r, 20, {});
  check('it seals', r.mode === MODE.CLOSED && r.canopy === 1);
  check('and then takes time to come up to pressure', r.pressure > 0.05 && r.pressure < 1,
    (r.pressure * 100).toFixed(0) + ' %');
  drive(r, 40, {});
  check('reaching a full cabin in under a minute', r.pressure === 1);

  r.step(1 / 60, { toggleCanopy: true });
  drive(r, 5, {});
  check('opening again vents first, with the canopy still shut',
    r.canopy === 1 && r.pressure < 1, `canopy ${r.canopy}, ${(r.pressure * 100).toFixed(0)} % pressure`);
  drive(r, 40, {});
  check('and only then opens', r.mode === MODE.OPEN && r.canopy === 0);
}

console.log('supplies');
{
  const r = new Rover({ lat: 0, lon: 0, ground: flat });
  const days = r.endurance() / 24;
  check('the rover carries days rather than hours', days > 4 && days < 20,
    days.toFixed(1) + ' days for one person');
  check('which is far more than the suit carries', r.endurance() > 24);
  r.consume(72, 1);
  check('three days of living draws it down', r.endurance() < days * 24 - 60,
    (r.endurance() / 24).toFixed(1) + ' days left');
  r.restock();
  check('and the ship refills it', Math.abs(r.endurance() / 24 - days) < 0.01);
  check('two people halve it', Math.abs(r.endurance(2) / r.endurance(1) - 0.5) < 0.01);
}

console.log('driving somewhere');
{
  const r = new Rover({ lat: -43.31, lon: -11.36, heading: 45, ground: flat });
  const from = { lat: r.lat, lon: r.lon };
  drive(r, 600, { throttle: 1 });
  const km = surfaceDistance(from.lat, from.lon, r.lat, r.lon) / 1000;
  check('ten minutes of driving covers ten kilometres',
    km > 8 && km < 11, km.toFixed(2) + ' km');
  check('the odometer agrees with the map',
    Math.abs(r.distance / 1000 - km) < 0.05, (r.distance / 1000).toFixed(2) + ' km driven');
  check('heading north-east raised the latitude and the longitude',
    r.lat > from.lat && r.lon > from.lon);
  check('and it is still the right way up', !r.rolled);
}

console.log('snapshot');
{
  const r = new Rover({ lat: 0, lon: 0, ground: flat });
  drive(r, 3, { throttle: 1 });
  const s = r.snapshot();
  for (const k of ['lat', 'lon', 'heading', 'speed', 'kph', 'suspension', 'contact',
                   'mode', 'canopy', 'pressure', 'boostHeat', 'supplies', 'enduranceHours'])
    check(`snapshot carries ${k}`, s[k] !== undefined);
  check('four wheels report suspension travel', s.suspension.length === 4);
}

console.log('the rover is a range tier, not a readout');
{
  const ground = { heightAt: () => 0, slopeAt: () => 0, normalAt: () => ({ e: 0, n: 0, u: 1 }) };

  /* Driving sealed has to cost something. `consume` used to be called only
     from the sleep handler, so the days-remaining figure in the nav console
     never moved while you drove and the middle tier constrained nothing. */
  const r = new Rover({ ground, lat: 0, lon: 0 });
  r.mode = MODE.CLOSED;
  r.pressure = 1;
  const before = r.endurance(1);
  r.consume(8, 1);
  check('eight hours sealed in the cabin costs eight hours of endurance',
    Math.abs((before - r.endurance(1)) - 8) < 0.6,
    `${before.toFixed(1)} h -> ${r.endurance(1).toFixed(1)} h`);

  /* A recharge comes out of the rover's tanks. Free consumables on every nap
     made the tier decorative: you could stay out indefinitely by sleeping. */
  const s = new Suit();
  for (let t = 0; t < 7 * 3600; t += 60) s.step(60, { exertion: 0.5, sunlit: true });
  const cost = s.refillCost();
  check('a suit worked for seven hours needs most of a kilogram of oxygen back',
    cost.o2 > 0.5 && cost.o2 < 1.3, cost.o2.toFixed(2) + ' kg');
  const rover = new Rover({ ground, lat: 0, lon: 0 });
  const o2Before = rover.supplies.o2;
  check('and the rover can give it', rover.rechargeSuit(s) === true);
  check('out of its own tanks, not out of nowhere',
    Math.abs((o2Before - rover.supplies.o2) - cost.o2) < 0.01,
    `${o2Before.toFixed(2)} -> ${rover.supplies.o2.toFixed(2)} kg`);
  check('topping up a full suit is free, because there is nothing to top up',
    rover.rechargeSuit(new Suit()) === true &&
    Math.abs(rover.supplies.o2 - (o2Before - cost.o2)) < 1e-9);

  /* And it has to be able to run out. */
  const empty = new Rover({ ground, lat: 0, lon: 0 });
  empty.supplies.o2 = 0.05;
  const drained = new Suit();
  for (let t = 0; t < 7 * 3600; t += 60) drained.step(60, { exertion: 0.5, sunlit: true });
  check('an empty rover refuses rather than conjuring oxygen',
    empty.rechargeSuit(drained) === false);
  check('and the suit it refused is still empty',
    drained.o2 < 0.5 * SUIT.o2Capacity);
}

console.log(failures ? `\nrover: ${failures} FAILED` : '\nrover: all checks passed');
process.exit(failures ? 1 : 0);
