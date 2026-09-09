/* The landing, flown in Node.

   The header claims the descent is flown against gravity rather than animated,
   and until now that was not true: the vertical rate was rate-limited straight
   onto its commanded value and gravity appeared nowhere in the integration, so
   the ship came down the way a lift does. It is a trajectory now, and these are
   the properties that make it one — plus the ones that make it a landing rather
   than a crash, which have to hold from every site the game can start at.

   Also here because nothing else checks it: a descent that does not converge
   leaves the player nowhere, and the ship's position decides where the whole
   rest of the game happens. */
import { Descent } from '../src/game/descent.js';
import { GM_MOON, R_MOON } from '../src/config.js';
import { surfaceDistance } from '../src/physics/frames.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const flat = (h = -1900) => ({ heightAt: () => h });
/* Ground with real relief in it, so the profile has to cope with the site
   being higher or lower than the ground it flew over. */
const sloped = (h, perDeg) => ({ heightAt: (lat) => h + lat * perDeg });

function fly(opts = {}) {
  let landed = null;
  const d = new Descent({
    heightfield: opts.hf || flat(),
    target: opts.target || { lat: 0.67415, lon: 23.47314 },
    onDone: (r) => { landed = r; },
  });
  const trace = [];
  const dt = opts.dt ?? 1 / 60;
  for (let n = 0; n < 60 * 600 && !d.done; n++) {
    d.step(dt);
    if (n % 30 === 0) trace.push(d.status());
  }
  return { d, landed, trace, seconds: d.t };
}

console.log('it lands, from every site the game offers');
{
  const sites = [
    ['Tranquility Base', 0.67415, 23.47314],
    ['Tycho floor', -43.1120, -11.36192],
    ['the south pole', -89.9, 0],
    ['the far side', 0, 180],
    ['the longitude seam', 12.0, 179.98],
    ['the north pole', 89.6, 45],
  ];
  for (const [name, lat, lon] of sites) {
    const { d, landed, seconds } = fly({ target: { lat, lon } });
    const miss = landed ? surfaceDistance(landed.lat, landed.lon, lat, lon) : Infinity;
    check(`${name}: touches down where it was aimed`,
          !!landed && miss < 6 && seconds < 400,
          landed ? `${miss.toFixed(1)} m out after ${seconds.toFixed(0)} s` : 'never landed');
  }
}

console.log('and it is a descent rather than a lift');
{
  const { d, trace } = fly();
  /* The engine is a real limit: it can push up by (T/W - 1) gravities and it
     can never pull down, so the throttle stays inside its envelope the whole
     way and the ship is always at least in free fall. */
  const worstThrust = trace.reduce((m, s) => Math.max(m, s.thrust), 0);
  check('the throttle never exceeds what the engine has',
        worstThrust <= 2.9 + 1e-9, worstThrust.toFixed(2) + ' of hover thrust');
  check('and never goes negative, because an engine cannot pull',
        trace.every(s => s.thrust >= -1e-9));

  /* With the engine at its floor the ship falls at g and no faster; with it at
     its ceiling the rate can be reduced by at most (T/W - 1) g. Sampling the
     rate of change of vDown across the whole flight is the direct test that
     gravity is in the loop at all. */
  const g = GM_MOON / (R_MOON * R_MOON);
  let worstUp = 0, worstDown = 0;
  const d2 = new Descent({ heightfield: flat(), target: { lat: 0.67415, lon: 23.47314 },
                           onDone: () => {} });
  const dt = 1 / 60;
  for (let n = 0; n < 60 * 600 && !d2.done; n++) {
    const before = d2.vDown, agl = d2.alt - d2.hf.heightAt(d2.lat, d2.lon);
    d2.step(dt);
    if (agl < 14) continue;             // the by-eye clamp for the last few metres
    const a = (d2.vDown - before) / dt;
    worstUp = Math.max(worstUp, -a);
    worstDown = Math.max(worstDown, a);
  }
  check('nothing decelerates harder than the engine can',
        worstUp <= (2.9 - 1) * g * 1.02, `${worstUp.toFixed(3)} against ${((2.9 - 1) * g).toFixed(3)} m/s²`);
  check('and nothing accelerates downward faster than gravity',
        worstDown <= g * 1.02, `${worstDown.toFixed(3)} against g = ${g.toFixed(3)} m/s²`);
}

console.log('the profile has the shape Apollo flew');
{
  const { trace } = fly();
  const atRange = (km) => trace.reduce((best, s) =>
    (Math.abs(s.range - km * 1000) < Math.abs(best.range - km * 1000) ? s : best), trace[0]);
  const high = atRange(2.5), low = atRange(0.4), final = trace[trace.length - 1];
  check('high gate is fast and high', high.speed > 120 && high.agl > 800,
        `${high.speed.toFixed(0)} m/s at ${high.agl.toFixed(0)} m`);
  check('low gate has washed most of it off', low.speed < 60 && low.agl < 400,
        `${low.speed.toFixed(0)} m/s at ${low.agl.toFixed(0)} m`);
  check('and the last metres are flown at walking pace',
        final.vDown <= 1.3 && final.speed < 5,
        `${final.vDown.toFixed(2)} m/s down, ${final.speed.toFixed(1)} m/s across`);
  /* Height above the datum, not above the ground: over real relief the ground
     rises and falls underneath and the height above it does too. */
  const alts = [];
  {
    const d3 = new Descent({ heightfield: flat(), target: { lat: 0.67415, lon: 23.47314 },
                             onDone: () => {} });
    for (let n = 0; n < 60 * 600 && !d3.done; n++) { d3.step(1 / 60); alts.push(d3.alt); }
  }
  check('and it never climbs',
        alts.every((a, i) => i === 0 || a <= alts[i - 1] + 1e-9),
        (() => { const i = alts.findIndex((a, k) => k > 0 && a > alts[k - 1] + 1e-9);
                 return i < 0 ? 'monotonic' : `climbed at step ${i}`; })());
}

console.log('the dust behaves the way Apollo 11 described it');
{
  const { d, trace } = fly();
  const first = trace.find(s => s.dust > 0.02);
  check('nothing lifts until about forty metres',
        first && first.agl < 50 && first.agl > 20, first ? first.agl.toFixed(0) + ' m' : 'never');
  const peak = trace.reduce((m, s) => Math.max(m, s.dust), 0);
  check('and on the way down the plume reaches full strength',
        peak > 0.9, peak.toFixed(2));
  check('then stops the moment the engine does', d.dust === 0, String(d.dust));
}

console.log('and it copes with ground that is not flat');
{
  /* A site 900 m above the ground it approaches over, and one 900 m below. */
  /* The approach runs 3.1 km, which is about a tenth of a degree, so 9000 m per
     degree is roughly 900 m of rise or fall across it — steep country, and less
     than the relief the game will actually fly into at Tycho. */
  for (const [name, perDeg] of [['uphill', 9000], ['downhill', -9000]]) {
    const target = { lat: 0.67415, lon: 23.47314 };
    const { landed, d } = fly({ hf: sloped(-2000, perDeg), target });
    const miss = landed ? surfaceDistance(landed.lat, landed.lon, target.lat, target.lon) : Infinity;
    check(`${name} into the site, it still arrives`, !!landed && miss < 8,
          landed ? miss.toFixed(1) + ' m out' : 'never landed');
    check(`${name}, it ends on the ground and not in it`,
          Math.abs(d.alt - d.hf.heightAt(d.lat, d.lon)) < 0.1,
          (d.alt - d.hf.heightAt(d.lat, d.lon)).toFixed(3) + ' m');
  }
}

console.log('and skipping it is a landing, not a teleport to nowhere');
{
  const target = { lat: -43.1120, lon: -11.36192 };
  let landed = null;
  const d = new Descent({ heightfield: flat(-4200), target, onDone: (r) => { landed = r; } });
  d.step(1 / 60);
  d.skip();
  check('it ends at the site', landed &&
        surfaceDistance(landed.lat, landed.lon, target.lat, target.lon) < 0.01);
  check('on the ground', Math.abs(d.alt + 4200) < 1e-6, d.alt.toFixed(3) + ' m');
  check('and once only', (() => { let n = 0; const e = new Descent({
    heightfield: flat(), target, onDone: () => { n++; } });
    e.skip(); e.skip(); e.step(1); return n === 1; })());
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
