/* The featured sites, checked without a browser.

   The cards are built by joining `src/data/featured.js` to `data/sites.json`
   with `.find()`, and a `.find()` that misses returns undefined and gets
   quietly filtered out — so a single mistyped id removes a whole landing site
   from the game and nothing anywhere says so. That is the main thing here.

   The rest is about what the list is FOR. The complaint that produced it was
   "I usually get flat nothingness unless I guess properly", and four of the
   eight sites the picker used to offer were deliberately flat or deliberately
   not about topography at all. A list that drifts back towards that is a
   regression, so the mare sites are named and excluded on purpose. */
import { FEATURED, FEATURED_IDS, featuredSpan } from '../src/data/featured.js';
import { spanLabel } from '../src/ui/preview.js';
import { readFileSync } from 'node:fs';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const sites = JSON.parse(readFileSync(new URL('../data/sites.json', import.meta.url), 'utf8'));
const byId = new Map(sites.sites.map(s => [s.id, s]));

console.log('every featured site is a real one');
{
  const missing = FEATURED_IDS.filter(id => !byId.has(id));
  check('no featured id is absent from the catalogue',
    missing.length === 0, missing.join(', ') || `all ${FEATURED_IDS.length} resolve`);

  const dupes = FEATURED_IDS.filter((id, i) => FEATURED_IDS.indexOf(id) !== i);
  check('and none of them is listed twice', dupes.length === 0, dupes.join(', ') || 'none');

  /* The picker reads `sites.presets`; `?site=` and the per-site `preset` flag
     read the same file. All three have to agree or the gallery and the URL
     offer different places. */
  check('the catalogue\'s presets are exactly the featured list',
    JSON.stringify(sites.presets) === JSON.stringify(FEATURED_IDS),
    `${sites.presets.length} presets against ${FEATURED_IDS.length} featured`);
  const flagged = sites.sites.filter(s => s.preset).map(s => s.id).sort();
  check('and the per-site flag agrees with it',
    JSON.stringify(flagged) === JSON.stringify([...FEATURED_IDS].sort()),
    `${flagged.length} flagged`);
}

console.log('and it is a list of somewhere worth going');
{
  for (const f of FEATURED) {
    const s = byId.get(f.id);
    if (!s) continue;
    check(`${s.name} says what you get`,
      typeof f.why === 'string' && f.why.length > 30 && f.why.length < 200,
      `${f.why.length} characters`);
  }

  const spans = FEATURED.map(f => f.span);
  check('every span is a plausible width to draw',
    spans.every(v => v >= 50 && v <= 3000), `${Math.min(...spans)} to ${Math.max(...spans)} km`);
  check('and the basins are drawn wider than the craters',
    featuredSpan('spa') > featuredSpan('tycho') && featuredSpan('orientale') > featuredSpan('copernicus'),
    `SPA ${featuredSpan('spa')}, Tycho ${featuredSpan('tycho')} km`);
  check('an unknown id still gets a usable default', featuredSpan('nowhere') > 0,
    featuredSpan('nowhere') + ' km');

  check('thousands of kilometres are labelled as thousands',
    spanLabel(2400).includes('thousand') && !spanLabel(200).includes('thousand'),
    `${spanLabel(2400)} / ${spanLabel(200)}`);

  /* The ones that were offered before and should not be again: each of these
     is in the catalogue, each is a real place, and each is deliberately not
     about relief. `imbrium`'s own blurb calls it "flat, dark and vast". */
  const flat = ['imbrium', 'reinergamma', 'farside_highlands', 'south_pole'];
  const back = flat.filter(id => FEATURED_IDS.includes(id));
  check('and the deliberately flat ones have not crept back in',
    back.length === 0, back.join(', ') || flat.join(', ') + ' all absent');

  /* At least a decent share should be things with real vertical relief in
     them, which is the entire point of the change. */
  const relief = ['tycho', 'copernicus', 'aristarchus', 'schroteri', 'hadley',
                  'mons_huygens', 'apollo17', 'orientale', 'tsiolkovskiy', 'spa',
                  'shackleton_rim'];
  const got = relief.filter(id => FEATURED_IDS.includes(id));
  check('most of the list is somewhere with relief',
    got.length >= 9 && got.length / FEATURED_IDS.length > 0.6,
    `${got.length} of ${FEATURED_IDS.length}`);
}

console.log(failures ? `\nfeatured: ${failures} FAILED` : '\nfeatured: all checks passed');
process.exit(failures ? 1 : 0);
