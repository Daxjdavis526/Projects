/* The rule that keeps the ship off other people's spacecraft, and the rule
   that decides whether the Earth is gone for good or merely under the horizon.

   Both exist because the game got them wrong in a screenshot: it landed the
   fictional lander on top of Eagle, and it told the player standing at the
   south pole that they were on the far side. */
import { readFileSync } from 'node:fs';
import { clearLanding, violated, keepOutRadius, standClearOf } from '../src/game/keepout.js';
import { surfaceDistance } from '../src/physics/frames.js';
import { ephemerisAt, skyAt, jdFromUnixMs } from '../src/physics/ephemeris.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const sites = JSON.parse(readFileSync(new URL('../data/sites.json', import.meta.url))).sites;
const byId = (id) => sites.find(s => s.id === id);
const a11 = byId('apollo11');
const a17 = byId('apollo17');

console.log('landing keep-out');
{
  const r = clearLanding(sites, a11.lat, a11.lon);
  check('asking to land on Tranquility Base does not land you on it',
    r.site && r.site.id === 'apollo11' && r.moved > 2000,
    `moved ${r.moved.toFixed(0)} m`);
  check('and puts you outside the keep-out rather than on its edge',
    surfaceDistance(r.lat, r.lon, a11.lat, a11.lon) > keepOutRadius(a11),
    `${surfaceDistance(r.lat, r.lon, a11.lat, a11.lon).toFixed(0)} m from the descent stage`);
  check('the cleared point is itself legal',
    violated(sites, r.lat, r.lon) === null);

  /* Direction is preserved, so picking a spot north-east of the site leaves you
     north-east of it rather than teleporting you somewhere arbitrary. */
  const ne = clearLanding(sites, a11.lat + 0.015, a11.lon + 0.015);
  check('the bearing you asked from is the bearing you get',
    ne.bearing > 20 && ne.bearing < 70, `${ne.bearing.toFixed(0)}°`);

  /* Apollo 11 with no bearing to preserve goes west, onto the mare the LM came
     in over, and away from the EASEP packages south and Little West east. */
  check('landing exactly on the site defaults to the open ground west of it',
    Math.abs(clearLanding(sites, a11.lat, a11.lon).bearing - 270) < 1);

  check('Apollo 17 is protected as widely as Apollo 11',
    keepOutRadius(a17) === 2000);
  check('the other crewed sites get five hundred metres',
    keepOutRadius(byId('apollo12')) === 500 && keepOutRadius(byId('apollo15')) === 500);
  check('robotic landers get two hundred',
    keepOutRadius(byId('chandrayaan3')) === 200 ||
    keepOutRadius(sites.find(s => s.kind === 'robotic')) === 200);
  check('landmarks are scenery and are not protected',
    keepOutRadius(sites.find(s => s.kind === 'landmark')) === 0);
}

console.log('standing at a site, not inside it');
{
  const st = standClearOf(sites, a11.lat, a11.lon);
  const d = surfaceDistance(st.lat, st.lon, a11.lat, a11.lon);
  check('spawning on the published coordinates puts you outside the hardware',
    st.site && d > 30 && d < 60, `${d.toFixed(0)} m from the descent stage`);
  check('and facing it', Math.abs(((st.yaw - 90) % 360 + 360) % 360) < 1,
    `yaw ${st.yaw.toFixed(0)}°`);
  const far = standClearOf(sites, a11.lat + 0.01, a11.lon);
  check('a spawn already clear of the hardware is not moved',
    far.site === null && far.lat === a11.lat + 0.01);
}

console.log('open ground is left alone');
{
  /* Somewhere in Mare Fecunditatis with nothing on it. */
  const r = clearLanding(sites, -5, 52);
  check('a landing far from any hardware is not moved',
    r.moved === 0 && r.site === null && r.lat === -5 && r.lon === 52);

  /* Every site in the file has to be reachable: clearing must never drop you
     inside a different site's keep-out. */
  let bad = 0;
  for (const s of sites) {
    const c = clearLanding(sites, s.lat, s.lon);
    if (violated(sites, c.lat, c.lon)) bad++;
  }
  check('clearing any site in the database lands you legally', bad === 0,
    `${sites.length} sites checked`);
}

console.log('far side versus under the horizon');
{
  const eph = ephemerisAt(jdFromUnixMs(Date.UTC(2026, 8, 14)));
  const shackleton = skyAt(eph, -89.67, 129.78);
  const lipskiy = skyAt(eph, -0.0421, 179.6183);
  const tranquility = skyAt(eph, 0.67415, 23.47314);

  check('Shackleton is not the far side, whatever the Earth is doing today',
    shackleton.farSide === false);
  check('the antipode of the sub-Earth point is',
    lipskiy.farSide === true);
  check('and Tranquility Base is not',
    tranquility.farSide === false && tranquility.earthVisible);

  /* The boundary is a hundred degrees from the mean sub-Earth point: ninety for
     the limb plus about ten of optical libration. */
  check('the boundary sits past the nominal limb, not on it',
    skyAt(eph, 0, 95).farSide === false && skyAt(eph, 0, 105).farSide === true);
}

console.log(failures ? `\n${failures} FAILED` : '\nkeep-out: all checks passed');
process.exit(failures);
