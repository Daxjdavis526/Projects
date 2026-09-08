/* The temperature model, against what Diviner actually published.

   The vendored maps are measurements; what happens between noon and midnight is
   derived, and this is where that derivation is held to the published curves. */
import { temperatureFrom } from '../src/data/temperature.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* Mare Tranquillitatis, read out of the vendored Diviner rasters. */
const tranquility = { max: 395.6, min: 95.2, noon: 392, midnight: 110 };
/* Shackleton's rim, which never gets a high Sun. */
const polar = { max: 136, min: 45, noon: 130, midnight: 60 };

console.log('daylight');
{
  const noon = temperatureFrom(tranquility, 90, 0);
  check('the equatorial noon is near 390 K, as Diviner measures it',
    Math.abs(noon - tranquility.max) < 1, noon.toFixed(0) + ' K');
  check('which is hot enough to boil water twice over', noon - 273.15 > 110,
    (noon - 273.15).toFixed(0) + ' C');

  const morning = temperatureFrom(tranquility, 30, 0);
  check('a thirty degree Sun is already most of the way to noon',
    morning > 300 && morning < 380, morning.toFixed(0) + ' K');
  const low = temperatureFrom(tranquility, 5, 0);
  check('but a Sun on the horizon is not', low < 280, low.toFixed(0) + ' K');
  check('the fourth-root law makes the terminator sharp',
    temperatureFrom(tranquility, 45, 0) - temperatureFrom(tranquility, 15, 0) <
    temperatureFrom(tranquility, 15, 0) - temperatureFrom(tranquility, 1, 0),
    'the last few degrees of elevation cost the most');
}

console.log('night');
{
  const dusk = temperatureFrom(tranquility, -0.5, 0.001);
  const mid = temperatureFrom(tranquility, -10, 0.5);
  const dawn = temperatureFrom(tranquility, -0.5, 0.999);
  check('dusk is about thirty kelvin warmer than dawn',
    dusk - dawn > 25 && dusk - dawn < 60, `${dusk.toFixed(0)} K to ${dawn.toFixed(0)} K`);
  check('local midnight matches the Diviner midnight map',
    Math.abs(mid - tranquility.midnight) < 1, mid.toFixed(0) + ' K');
  check('the pre-dawn minimum is around 95 K',
    Math.abs(dawn - tranquility.min) < 1, dawn.toFixed(0) + ' K');
  check('cooling is fast at first and slow later',
    dusk - temperatureFrom(tranquility, -5, 0.1) >
    temperatureFrom(tranquility, -5, 0.3) - temperatureFrom(tranquility, -5, 0.5),
    'the first tenth of the night sheds more than the third to the fifth');
  check('the night never goes below the measured minimum',
    Math.min(...[0, 0.25, 0.5, 0.75, 1].map(f => temperatureFrom(tranquility, -5, f))) >=
    tranquility.min - 0.01);
}

console.log('the poles');
{
  const rim = temperatureFrom(polar, 1.5, 0);
  check('a polar rim in grazing sunlight stays cold',
    rim < 150, rim.toFixed(0) + ' K');
  const shadow = temperatureFrom(polar, -5, 0.5);
  check('and a shadowed floor is colder than Pluto',
    shadow < 70, shadow.toFixed(0) + ' K');
  check('the whole polar range fits inside a hundred kelvin',
    polar.max - polar.min < 100);
}

console.log('range');
{
  let lo = Infinity, hi = -Infinity;
  for (const el of [-30, -1, 0.5, 5, 20, 45, 90]) {
    for (const f of [0, 0.3, 0.7, 1]) {
      const t = temperatureFrom(tranquility, el, f);
      lo = Math.min(lo, t); hi = Math.max(hi, t);
      if (!Number.isFinite(t)) failures++;
    }
  }
  check('every combination gives a finite temperature in the measured range',
    lo >= tranquility.min - 0.01 && hi <= tranquility.max + 0.01,
    `${lo.toFixed(0)} .. ${hi.toFixed(0)} K`);
  check('and that range is about three hundred kelvin wide', hi - lo > 250,
    (hi - lo).toFixed(0) + ' K');
}

console.log(failures ? `\ntemperature: ${failures} FAILED` : '\ntemperature: all checks passed');
process.exit(failures ? 1 : 0);
