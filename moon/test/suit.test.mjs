/* The life support model, checked without a browser.

   What matters here is not that a bar goes down. It is that four different
   consumables run out at four different rates, that which one binds depends on
   what you are doing, and that the warnings fire at the levels real flight
   rules use rather than wherever looks dramatic. */
import { Suit, MODE, co2PartialPressure } from '../src/physics/suit.js';
import { SUIT } from '../src/config.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const hours = (s) => s / 3600;
/* Run a whole EVA a minute at a time. */
const eva = (suit, h, state) => { for (let t = 0; t < h * 3600; t += 60) suit.step(60, state); return suit; };

console.log('endurance');
{
  const idle = new Suit();
  const work = new Suit(); work.step(1, { sunlit: true, exertion: 0.6 });
  const hard = new Suit();
  check('a fresh suit is good for the best part of a working day',
    hours(idle.endurance(0.35)) > 7 && hours(idle.endurance(0.35)) < 11,
    hours(idle.endurance(0.35)).toFixed(1) + ' h');
  check('working hard costs you hours, not minutes',
    hours(hard.endurance(1.0)) < hours(idle.endurance(0.2)) - 2,
    `${hours(hard.endurance(1.0)).toFixed(1)} h flat out vs ${hours(idle.endurance(0.2)).toFixed(1)} h idle`);

  const shadow = new Suit(); shadow.step(1, { sunlit: false, lights: true, exertion: 0.5 });
  const sun = new Suit(); sun.step(1, { sunlit: true, lights: false, exertion: 0.5 });
  check('lamps and a cold shadow cost real endurance',
    hours(shadow.endurance(0.5)) < hours(sun.endurance(0.5)) - 2,
    `${hours(shadow.endurance(0.5)).toFixed(1)} h in shadow vs ${hours(sun.endurance(0.5)).toFixed(1)} h in sun`);
  check('the heater is what costs it', shadow.limiting(0.5) === 'power', shadow.limiting(0.5));
}

console.log('which consumable binds');
{
  const seen = new Set();
  for (const e of [0.1, 0.35, 0.6, 0.9, 1.0]) {
    const s = new Suit(); s.step(1, { sunlit: true, exertion: e });
    seen.add(s.limiting(e));
  }
  check('the binding consumable is not always oxygen', seen.size >= 2,
    [...seen].join(', '));
  check('a real suit is often limited by cooling water or the battery',
    seen.has('water') || seen.has('power'), [...seen].join(', '));
}

console.log('carbon dioxide');
{
  check('a fresh scrubber holds CO2 near zero', co2PartialPressure(0) < 0.5);
  check('a spent scrubber passes the flight rule limit',
    co2PartialPressure(1) > SUIT.co2CriticalMmHg,
    co2PartialPressure(1).toFixed(1) + ' mmHg');
  const s = new Suit();
  eva(s, 6, { sunlit: true, exertion: 0.6 });
  check('six hours of work leaves CO2 measurable but survivable',
    s.co2mmHg > 1 && s.co2mmHg < SUIT.co2CriticalMmHg, s.co2mmHg.toFixed(1) + ' mmHg');
  check('and still conscious', !s.unconscious);
}

console.log('warnings');
{
  const s = new Suit();
  check('a fresh suit says nothing', s.checkWarnings().length === 0);
  eva(s, 7.5, { sunlit: true, exertion: 0.55 });
  const ids = s.warnings.map(w => w.id);
  check('a long EVA raises cautions before anything is critical',
    s.warnings.length > 0, ids.join(', ') || 'none');
  check('cautions name the consumable, so you know what to do',
    s.warnings.every(w => w.text && w.level && w.id));

  const c = new Suit();
  eva(c, 12, { sunlit: true, exertion: 0.8 });
  check('running right out is critical, not silent',
    c.warnings.some(w => w.level === 'critical'), c.warnings.map(w => w.id).join(', '));
}

console.log('running out');
{
  const s = new Suit();
  eva(s, 20, { sunlit: true, exertion: 0.8 });
  check('oxygen does eventually run out', s.o2 <= 0);
  check('the purge bottle runs out after it', s.o2Reserve <= 0);
  check('suit pressure then falls', s.pressure < SUIT.pressure * 0.5,
    s.pressure.toFixed(1) + ' kPa');
  check('and you lose consciousness rather than anything worse', s.unconscious);

  /* The purge bottle is a walk home, not another shift. */
  const p = new Suit();
  p.o2 = 0;
  let t = 0;
  while (p.o2Reserve > 0 && t < 4 * 3600) { p.step(30, { sunlit: true, exertion: 0.5 }); t += 30; }
  check('the purge bottle lasts about half an hour', t > 900 && t < 3600,
    (t / 60).toFixed(0) + ' minutes');
}

console.log('difficulty settings');
{
  const relaxed = new Suit({ mode: MODE.RELAXED });
  const real = new Suit({ mode: MODE.REALISTIC });
  check('relaxed mode stretches the day without removing the clock',
    relaxed.endurance(0.5) > real.endurance(0.5) * 2.5,
    `${hours(relaxed.endurance(0.5)).toFixed(0)} h vs ${hours(real.endurance(0.5)).toFixed(0)} h`);

  const un = new Suit({ mode: MODE.UNLIMITED });
  eva(un, 40, { sunlit: true, exertion: 1 });
  check('unlimited mode never runs anything down', un.o2 === SUIT.o2Capacity);
  check('and never warns about anything', un.checkWarnings().length === 0);
  check('its endurance reads as unlimited', un.endurance(1) === Infinity);
}

console.log('shelter');
{
  const s = new Suit();
  eva(s, 5, { sunlit: true, exertion: 0.6 });
  const before = s.o2;
  eva(s, 3, { inShelter: true });
  check('nothing is spent while inside', s.o2 === before);
  s.recharge();
  check('a recharge fills everything', s.o2Fraction === 1 && s.co2 === 0 &&
    s.powerFraction === 1 && s.waterFraction === 1);
  check('and resets the EVA clock', s.elapsed === 0);
}

console.log('snapshot');
{
  const s = new Suit();
  s.step(1, { sunlit: true, exertion: 0.4 });
  const snap = s.snapshot();
  for (const k of ['o2Fraction', 'co2mmHg', 'powerFraction', 'waterFraction',
                   'pressureKpa', 'enduranceSeconds', 'limiting', 'warnings'])
    check(`snapshot carries ${k}`, snap[k] !== undefined);
}

console.log(failures ? `\nsuit: ${failures} FAILED` : '\nsuit: all checks passed');
process.exit(failures ? 1 : 0);
