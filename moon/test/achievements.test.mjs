/* The log of where you have been.

   The brief asked for a list marking real places reached rather than tasks
   completed, and the difference is the whole test: every entry has to be
   earned against measured data — published landing coordinates, the IAU
   gazetteer, the terrain under your boots — rather than against a trigger
   volume the game put somewhere convenient. So this checks it with the real
   data/sites.json, at the real coordinates, and confirms that standing a
   hundred metres away does not count. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Achievements } from '../src/game/achievements.js';
import { offsetLatLon } from '../src/physics/frames.js';

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const sites = JSON.parse(await readFile(path.join(DATA, 'sites.json'), 'utf8'));

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const at = (lat, lon, extra = {}) => ({
  lat, lon, simMs: 1, elevation: -1900, slope: 2,
  walked: 0, driven: 0, homeRange: 0, ...extra,
});

console.log('real hardware, at its published coordinates');
{
  const a = new Achievements({ sites });
  const a11 = sites.sites.find(s => s.id === 'apollo11');
  const got = a.step(at(a11.lat, a11.lon));
  check('standing on Tranquility Base counts',
        got.some(e => e.id === 'site:apollo11'), got.map(e => e.id).join(','));
  check('and it counts once', a.step(at(a11.lat, a11.lon)).length === 0);

  /* Two hundred metres away is the next crater over, not the site. */
  const away = offsetLatLon(a11.lat, a11.lon, 90, 200);
  const b = new Achievements({ sites });
  check('two hundred metres away does not',
        !b.step(at(away.lat, away.lon)).some(e => e.id === 'site:apollo11'));
  /* Twenty metres away does: the published coordinates are good to a few
     metres at best and the hardware is visible from there. */
  const close = offsetLatLon(a11.lat, a11.lon, 90, 20);
  const c = new Achievements({ sites });
  check('but twenty metres does',
        c.step(at(close.lat, close.lon)).some(e => e.id === 'site:apollo11'));

  /* Every crewed and robotic site is reachable; landmarks are places, not
     landings, and are deliberately not in this list. */
  const d = new Achievements({ sites });
  let reached = 0;
  for (const s of sites.sites) {
    if (d.step(at(s.lat, s.lon)).some(e => e.id === 'site:' + s.id)) reached++;
  }
  /* Every landing, plus the two skylights, which are landmarks and are
     reachable on purpose. */
  const landings = sites.sites.filter(
    s => s.kind !== 'landmark' || /_pit$/.test(s.id)).length;
  check('every landing site and skylight in the file can be reached',
        reached === landings, `${reached} of ${landings}`);
  check('and landmarks are not landings',
        !d.has('site:tycho') && !d.has('site:south_pole'));

  /* Except the two skylights, which are the only known way into the lunar
     subsurface and are reached at their own radius. */
  const e = new Achievements({ sites });
  const pit = sites.sites.find(x => x.id === 'tranquillitatis_pit');
  check('standing on a lava-tube skylight counts',
        e.step(at(pit.lat, pit.lon)).some(x => x.id === 'site:tranquillitatis_pit'));
  const nearPit = offsetLatLon(pit.lat, pit.lon, 0, 120);
  const f = new Achievements({ sites });
  check('at its rim, not only at its published centre',
        f.step(at(nearPit.lat, nearPit.lon)).some(x => x.id === 'site:tranquillitatis_pit'));
  const farPit = offsetLatLon(pit.lat, pit.lon, 0, 400);
  const g2 = new Achievements({ sites });
  check('and four hundred metres away is not the pit',
        !g2.step(at(farPit.lat, farPit.lon)).some(x => x.id === 'site:tranquillitatis_pit'));
}

console.log('named ground, from the gazetteer');
{
  const a = new Achievements({ sites });
  const big = { inside: true, f: ['Tycho', 'Crater, craters', -43.31, -11.36, 85] };
  const tiny = { inside: true, f: ['Sabine C', 'Satellite Feature', 1.4, 20.1, 3] };
  const outside = { inside: false, f: ['Plato', 'Crater, craters', 51.6, -9.4, 101] };
  check('being inside a real crater counts',
        a.step(at(-43.31, -11.36, { nearestFeature: big })).some(e => e.title === 'Tycho'));
  check('a three kilometre satellite crater does not',
        !a.step(at(1.4, 20.1, { nearestFeature: tiny })).some(e => e.title === 'Sabine C'));
  check('and neither does being near one you are not in',
        !a.step(at(51, -9, { nearestFeature: outside })).some(e => e.title === 'Plato'));
}

console.log('what the ground says');
{
  const a = new Achievements({ sites });
  a.step(at(0, 0, { elevation: -1900, slope: 2 }));
  a.step(at(-43.3, -11.4, { elevation: -3465, slope: 28 }));
  a.step(at(26.1, 3.6, { elevation: 3800, slope: 9 }));
  check('the deepest place is kept, with where it was',
        a.extremes.deepest.value === -3465 && Math.abs(a.extremes.deepest.lat + 43.3) < 1e-9);
  check('and the highest', a.extremes.highest.value === 3800);
  check('and the steepest', a.extremes.steepest.value === 28);
  a.step(at(0, 0, { elevation: -1000, slope: 1, homeRange: 41000 }));
  a.step(at(0, 0, { elevation: -1000, slope: 1, homeRange: 12000 }));
  check('the furthest from the ship is a record, not the latest reading',
        a.extremes.furthest.value === 41000);
}

console.log('distance, against what people have actually done');
{
  const a = new Achievements({ sites });
  const got = a.step(at(0, 0, { walked: 8000, driven: 36000 }));
  const titles = got.map(e => e.title);
  check('walking further than an Apollo crew did in a day is named',
        titles.some(t => /Apollo crew/.test(t)), titles.join(' | '));
  check('and so is driving further than Apollo 17, which is the record',
        titles.some(t => /Apollo 17/.test(t)));
  check('a kilometre on foot came with it', a.has('walked:1000'));
  check('and nothing repeats', a.step(at(0, 0, { walked: 8000, driven: 36000 })).length === 0);
  check('a hundred kilometres is still ahead of you', !a.has('driven:100000'));
}

console.log('two places that are their own achievement');
{
  const a = new Achievements({ sites });
  check('a pole', a.step(at(-89.5, 0)).some(e => e.id === 'pole'));
  check('the far side', a.step(at(0, 180)).some(e => e.id === 'farside'));
  const b = new Achievements({ sites });
  check('and the near side is not the far side',
        !b.step(at(0, 23)).some(e => e.id === 'farside'));
  check('nor is the limb, where the Earth still librates into view',
        !b.step(at(0, 95)).some(e => e.id === 'farside'));
}

console.log('and none of it blocks anything');
{
  const a = new Achievements({ sites });
  check('an empty log is a valid state', a.size === 0 && a.list().length === 0);
  check('nothing is required to reach anything else',
        a.step(at(0, 180)).length === 1);
  check('rubbish in does not throw', (() => {
    a.step({});
    a.step({ lat: NaN, lon: 0 });
    a.step(at(0, 0, { nearestFeature: null, walked: NaN }));
    return true;
  })());
  /* The one place with rock overhead. */
  {
    const a = new Achievements({ sites });
    const pit = sites.sites.find(s => s.id === 'tranquillitatis_pit');
    const above = a.step(at(pit.lat, pit.lon));
    check('reaching the pit is one thing',
      above.some(e => e.id === 'site:tranquillitatis_pit') &&
      !above.some(e => e.id.startsWith('cave:')));
    const below = a.step(at(pit.lat, pit.lon, { inCave: true }));
    check('and being inside the cave under it is another',
      below.some(e => e.id === 'cave:tranquillitatis'),
      below.map(e => e.title).join(', '));
    check('awarded once, not once a frame',
      a.step(at(pit.lat, pit.lon, { inCave: true })).length === 0);
    check('and never from standing on top of it',
      new Achievements({ sites }).step(at(pit.lat, pit.lon))
        .every(e => !e.id.startsWith('cave:')));
  }
  check('a corrupt save loads as empty',
        new Achievements({ sites }).load({ earned: [null, 5, {}] }).size === 0);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
