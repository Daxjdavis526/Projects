/* The camera's own adaptation, which decides whether the Moon looks like a
   photograph or like a sheet of paper.

   Everything here is a ratio between two situations rather than an absolute
   number, because the absolute number is a matter of taste and the ratios are
   not: a mare is darker than a highland, a low Sun is darker than a high one,
   shadow takes longer to adapt to than light, and a headlamp two metres from
   the ground is brighter than a polar dawn. */
import { Exposure } from '../src/render/exposure.js';
import { EXPOSURE } from '../src/config.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

const noon = {
  sunElevation: 60, sunVisible: 1, albedo: 0.085, viewMu: 0.35, phaseDeg: 30,
  groundFraction: 0.6, earthIllum: 0.5, earthElevation: 40, slopeSpreadDeg: 4,
};
const snap = (s) => { const e = new Exposure(); e.snap(s); return e; };
const stops = (a, b) => Math.log2(a.exposure() / b.exposure());

console.log('what the camera meters');
{
  check('a sunlit plain is metered far below a black night',
    snap(noon).exposure() < snap({ ...noon, sunElevation: -20, sunVisible: 0,
      earthElevation: -30, earthIllum: 0 }).exposure() / 100);

  check('highland is about two thirds of a stop brighter than mare',
    Math.abs(stops(snap({ ...noon, albedo: 0.145 }), snap(noon)) + 0.77) < 0.25,
    stops(snap({ ...noon, albedo: 0.145 }), snap(noon)).toFixed(2) + ' stops');

  check('a low Sun opens the camera relative to a high one',
    snap({ ...noon, sunElevation: 5 }).exposure() > snap(noon).exposure());
}

console.log('rough ground is metered differently from smooth');
{
  /* The failure this exists to prevent: a saturated highland at a low Sun has
     slopes tipped a long way towards it, and metering that scene as though it
     were a plain blows every one of them out. */
  const low = { ...noon, sunElevation: 9, albedo: 0.145 };
  const flat = snap({ ...low, slopeSpreadDeg: 2 });
  const rough = snap({ ...low, slopeSpreadDeg: 25 });
  check('rough terrain is metered stopped down against flat terrain',
    rough.exposure() < flat.exposure(),
    `${stops(rough, flat).toFixed(2)} stops`);
  check('and the spread is clamped, so a vertical wall does not run away with it',
    Math.abs(stops(snap({ ...low, slopeSpreadDeg: 30 }),
                   snap({ ...low, slopeSpreadDeg: 89 }))) < 0.01);
}

console.log('the lamps count as light');
{
  const night = {
    sunElevation: -24, sunVisible: 0, albedo: 0.085, viewMu: 0.3, phaseDeg: 120,
    groundFraction: 0.7, earthIllum: 0.84, earthElevation: 70,
  };
  const dark = snap(night);
  const lit = snap({ ...night, lampLuminance: 0.2 });
  check('earthshine alone opens the camera to its limit',
    Math.log2(dark.exposure()) > 10, Math.log2(dark.exposure()).toFixed(1) + ' stops open');
  check('turning the lamps on closes it by ten stops or more',
    stops(dark, lit) > 10, stops(dark, lit).toFixed(1) + ' stops');
  check('and the ground the lamps light lands in the middle of the range',
    0.2 * lit.exposure() > 0.08 && 0.2 * lit.exposure() < 0.6,
    (0.2 * lit.exposure()).toFixed(2));
}

console.log('adaptation takes time, and not the same time both ways');
{
  const e = new Exposure();
  e.snap(noon);
  const start = e.ev;
  const dark = { ...noon, sunElevation: -20, sunVisible: 0, earthIllum: 0, earthElevation: -30 };
  e.update(dark, 1);
  const afterDark = e.ev - start;
  const f = new Exposure();
  f.snap(dark);
  const brightStart = f.ev;
  f.update(noon, 1);
  check('going into shadow adapts more slowly than coming out of it',
    Math.abs(afterDark) / Math.abs(f.ev - brightStart) < 0.5,
    `${Math.abs(afterDark).toFixed(2)} vs ${Math.abs(f.ev - brightStart).toFixed(2)} stops in a second`);
  check('the two time constants are the ones the eye has',
    EXPOSURE.tauDarken > EXPOSURE.tauBrighten * 4);

  check('adaptation reads 0 in sunlight and approaches 1 in the dark',
    snap(noon).adaptation() < 0.35 &&
    snap({ ...noon, sunElevation: -20, sunVisible: 0, earthIllum: 0,
           earthElevation: -30 }).adaptation() > 0.95);
}

console.log(failures ? `\n${failures} FAILED` : '\nexposure: all checks passed');
process.exit(failures);
