/* The rover's drawn attitude, checked against the ground it is standing on.

   This is the one test in the project that imports three.js. Everything else
   headless here is pure physics by design, but the bug this file exists for
   lived entirely in the renderer: `physics/rover.js` fits a plane through the
   four wheel contact patches and reports a correct pitch and roll, and
   `game/vehicle.js` then applied both of them negated. Climbing a twenty
   degree slope the physics said twenty degrees nose up and the model was drawn
   twenty degrees nose down — a forty degree error against the hill, which is
   what "half the rover in the air" looked like.

   Testing that needs a quaternion, so it needs three.js. The vendored module
   imports fine in node: its maths classes touch no DOM, and nothing below
   constructs a renderer. That is the whole reason this file is allowed to
   break the no-three-in-tests habit.

   What is actually asserted is not "the sign is +" — that would just restate
   the code. It is the physical claim: take the model's own nose and right
   axes, rotate them by the quaternion the renderer produced, and they should
   agree with the slope of the ground under the wheels. That fails by 40
   degrees on the old code and by a rounding error on the new.

   `vehicle.js` says `import ... from 'three'`, a bare specifier the browser
   resolves through the import map in `index.html`. Node has none, so
   `importmap.mjs` registers a resolver that answers the same names, and the
   module under test is pulled in dynamically afterwards. */
import { register } from 'node:module';
register('./importmap.mjs', import.meta.url);

const THREE = await import('../vendor/three/three.module.min.js');
const { Rover } = await import('../src/physics/rover.js');
const { Vehicle } = await import('../src/game/vehicle.js');
const { ROVER } = await import('../src/config.js');
const { enuBasis, llhToXyz, offsetLatLon } = await import('../src/physics/frames.js');

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const DEG = 180 / Math.PI;

/* A plane tilted by `deg`, rising towards the given bearing. The rover samples
   `heightAt` at four wheel positions, so the surface has to be a real function
   of position rather than a constant, or the plane fit has nothing to fit. */
function ramp(deg, upBearing = 0) {
  const slope = Math.tan(deg / DEG);
  const b = upBearing / DEG;
  return {
    heightAt: (lat, lon) => {
      /* Metres north and east of the origin, small-angle, which is all that is
         needed across a three metre wheelbase. */
      const north = lat / DEG * 1737400;
      const east = lon / DEG * 1737400 * Math.cos(lat / DEG);
      return (north * Math.cos(b) + east * Math.sin(b)) * slope;
    },
    slopeAt: () => deg,
    normalAt: () => ({ e: 0, n: 0, u: 1 }),
  };
}

/* The smallest stage and model `Vehicle` will accept. Nothing is rendered; the
   quaternion it writes onto `model.group` is the entire output under test. */
function rig(ground, heading) {
  const world = new THREE.Group();
  const model = { group: new THREE.Object3D(), animate() {}, setCanopy() {}, setDust() {} };
  const v = new Vehicle({
    stage: { world }, heightfield: ground, lat: 0, lon: 0, heading,
  });
  v.setModel(model);
  return v;
}

/* Let the suspension and the pitch/roll filters settle: both are exponentials
   with time constants under a fifth of a second. */
function settle(v, seconds = 3) {
  for (let i = 0; i < seconds * 60; i++) v.step(1 / 60, {}, false);
}

/* The model's axes, in the local east/north/up frame at the rover, after the
   renderer has had its say. `place` writes a world-space quaternion, so the
   basis has to be undone to read a pitch and a roll back out of it. */
function attitude(v) {
  const r = v.rover;
  v.place({ x: 0, y: 0, z: 0 }, 1 / 60);

  const b = enuBasis(r.lat, r.lon);
  const e = new THREE.Vector3(b.e.x, b.e.y, b.e.z);
  const n = new THREE.Vector3(b.n.x, b.n.y, b.n.z);
  const u = new THREE.Vector3(b.u.x, b.u.y, b.u.z);

  const q = v.model.group.quaternion;
  const nose = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);

  /* Read back in the same convention the physics uses, so the two numbers can
     be compared directly: pitch is how far the nose is lifted above the local
     horizontal, and roll is how far the right hand axis is — so roll comes out
     NEGATIVE when the right side is the low one, which is what `rover.js`
     means by it too. */
  return {
    pitch: Math.asin(Math.max(-1, Math.min(1, nose.dot(u)))) * DEG,
    roll: Math.asin(Math.max(-1, Math.min(1, right.dot(u)))) * DEG,
    headingOf: Math.atan2(nose.dot(e), nose.dot(n)) * DEG,
  };
}

console.log('the drawn rover agrees with the ground under it');
{
  /* Driving north, straight up a twenty degree slope that rises to the north.
     The nose should be twenty degrees up and the vehicle should not be
     rolled at all. */
  const up = rig(ramp(20, 0), 0);
  settle(up);
  const a = attitude(up);
  check('climbing a twenty degree slope draws the nose twenty degrees up',
    Math.abs(a.pitch - 20) < 1.0, `${a.pitch.toFixed(2)}° drawn, physics says ${(up.rover.pitch * DEG).toFixed(2)}°`);
  check('and does not roll it',
    Math.abs(a.roll) < 0.5, `${a.roll.toFixed(2)}°`);

  /* The regression, stated as a number: the old code drew this at -20. */
  check('the nose is up the hill and not buried in it',
    a.pitch > 10, `${a.pitch.toFixed(2)}° — the inverted sign drew ${(-a.pitch).toFixed(2)}°`);
}
{
  /* Descending the same slope: heading south, ground still rising north, so
     the nose now points downhill. */
  const down = rig(ramp(20, 0), 180);
  settle(down);
  const a = attitude(down);
  check('driving down it draws the nose twenty degrees down',
    Math.abs(a.pitch + 20) < 1.0, `${a.pitch.toFixed(2)}°`);
}
{
  /* Across the slope, heading east, ground rising to the north — so the left
     side is uphill and the right side is the low one. */
  const across = rig(ramp(20, 0), 90);
  settle(across);
  const a = attitude(across);
  check('crossing it drops the downhill side by twenty degrees',
    Math.abs(a.roll + 20) < 1.0, `${a.roll.toFixed(2)}° drawn, physics says ${(across.rover.roll * DEG).toFixed(2)}°`);
  check('and leaves the nose level',
    Math.abs(a.pitch) < 0.5, `${a.pitch.toFixed(2)}°`);
  check('the low side is the downhill one',
    a.roll < -10, `${a.roll.toFixed(2)}° — the inverted sign lifted it to ${(-a.roll).toFixed(2)}°`);
}
{
  /* Flat ground: no lean either way, and the heading the model is drawn at is
     the heading the physics holds. */
  const flat = rig(ramp(0), 137);
  settle(flat);
  const a = attitude(flat);
  check('flat ground draws it flat',
    Math.abs(a.pitch) < 0.2 && Math.abs(a.roll) < 0.2,
    `pitch ${a.pitch.toFixed(3)}°, roll ${a.roll.toFixed(3)}°`);
  check('and the drawn heading is the heading it holds',
    Math.abs(((a.headingOf - 137 + 540) % 360) - 180) < 0.5,
    `${((a.headingOf + 360) % 360).toFixed(2)}° against 137°`);
}

console.log('\nand the wheels reach the ground it is standing on');
{
  /* The point of the whole thing. Put the four wheel positions into world
     space using the drawn transform and check each one lands within the
     suspension's travel of the real surface. On the old code the front pair
     ended up metres under the ground and the rear pair metres above it. */
  const v = rig(ramp(18, 0), 0);
  settle(v);
  v.place({ x: 0, y: 0, z: 0 }, 1 / 60);
  const r = v.rover;
  const m = new THREE.Matrix4().compose(
    v.model.group.position, v.model.group.quaternion, new THREE.Vector3(1, 1, 1));

  const half = { x: ROVER.track / 2, z: ROVER.wheelBase / 2 };
  let worst = 0, worstName = '';
  for (const [name, sx, sz] of [['front left', -1, -1], ['front right', 1, -1],
                                ['rear left', -1, 1], ['rear right', 1, 1]]) {
    /* Wheel centre in model space, then in render space. */
    const p = new THREE.Vector3(sx * half.x, ROVER.wheelRadius, sz * half.z).applyMatrix4(m);
    /* Render space is world space here — `place` was given a zero origin. The
       wheel's own latitude and longitude come back out of it by comparing
       against the rover's position along the two horizontal axes. */
    const b = enuBasis(r.lat, r.lon);
    const c = { x: 0, y: 0, z: 0 };
    llhToXyz(r.lat, r.lon, v.hf.heightAt(r.lat, r.lon), c);
    const d = new THREE.Vector3(p.x - c.x, p.y - c.y, p.z - c.z);
    const north = d.x * b.n.x + d.y * b.n.y + d.z * b.n.z;
    const east = d.x * b.e.x + d.y * b.e.y + d.z * b.e.z;
    const up = d.x * b.u.x + d.y * b.u.y + d.z * b.u.z;
    const at = offsetLatLon(r.lat, r.lon, Math.atan2(east, north) * DEG, Math.hypot(east, north));
    /* How far the bottom of this tyre is above the ground beneath it. */
    const gap = (v.hf.heightAt(r.lat, r.lon) + up - ROVER.wheelRadius) - v.hf.heightAt(at.lat, at.lon);
    if (Math.abs(gap) > Math.abs(worst)) { worst = gap; worstName = name; }
  }
  check('every wheel is within the suspension travel of the surface',
    Math.abs(worst) < ROVER.suspTravel + 0.15,
    `worst is the ${worstName} at ${worst.toFixed(3)} m, travel is ${ROVER.suspTravel} m`);
}

console.log(failures ? `\nvehicle: ${failures} FAILED` : '\nvehicle: all checks passed');
process.exit(failures ? 1 : 0);
