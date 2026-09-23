/* The life support model, checked without a browser.

   What matters here is not that a bar goes down. It is that four different
   consumables run out at four different rates, that which one binds depends on
   what you are doing, and that the warnings fire at the levels real flight
   rules use rather than wherever looks dramatic. */
import { Suit, MODE, co2PartialPressure } from '../src/physics/suit.js';
import { SUIT, TIME } from '../src/config.js';
import { readFileSync } from 'node:fs';

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

console.log('dust, which is a thermal problem before it is anything else');
{
  /* Gaier 2005: eleven per cent areal coverage doubles a radiator's solar
     absorptance. A dirty suit in sunlight has more heat to dump and the
     sublimator boils more water to dump it — and in shadow it costs nothing,
     because there is no sunlight to absorb. */
  const s = new Suit();
  check('a suit starts clean', s.dust === 0);

  for (let i = 0; i < 3 * 3600; i++) s.step(1, { onFoot: true, exertion: 0.5, sunlit: true });
  check('three hours on the regolith coats the lower suit',
        s.dust > 0.6 && s.dust <= 1, s.dust.toFixed(2));

  const dirty = new Suit(); dirty.dust = 1;
  const clean = new Suit();
  const wetDirty = dirty.rates(0.35, true).water, wetClean = clean.rates(0.35, true).water;
  check('a coated suit boils more feedwater in the sun',
        wetDirty > wetClean * 1.3 && wetDirty < wetClean * 1.5,
        `${wetClean.toFixed(3)} -> ${wetDirty.toFixed(3)} kg/h`);
  check('and exactly as much as a clean one in shadow',
        Math.abs(dirty.rates(0.35, false).water - clean.rates(0.35, false).water) < 1e-12);
  check('so a coated suit has a shorter day in the sun',
        dirty.endurance(0.35, true) < clean.endurance(0.35, true) * 0.995,
        `${(dirty.endurance(0.35, true) / 3600).toFixed(2)} h vs ` +
        `${(clean.endurance(0.35, true) / 3600).toFixed(2)} h`);
  check('but never a dangerously shorter one',
        dirty.endurance(0.35, true) > clean.endurance(0.35, true) * 0.7);

  const inside = new Suit();
  for (let i = 0; i < 3600; i++) inside.step(1, { onFoot: false, exertion: 0.5 });
  check('riding in the rover does not dirty anything', inside.dust === 0);

  const fell = new Suit();
  fell.step(1, { onFoot: true, fell: true });
  check('going over puts your knees in it', fell.dust > 0.1, fell.dust.toFixed(3));

  const washed = new Suit(); washed.dust = 0.9;
  washed.clean();
  check('the vestibule vacuum gets most of it off', washed.dust < 0.1,
        washed.dust.toFixed(3));
  check('and never below nothing', washed.dust >= 0);
  const spotless = new Suit(); spotless.dust = 0.5;
  spotless.recharge();
  check('a recharge does not clean anything, because a tank of oxygen would not',
        spotless.dust === 0.5);
  check('and it is carried in the snapshot', new Suit().snapshot().dust === 0);
}

/* ---------------------------------------------------------------------------
   The clock the suit runs on, which is the one that shipped wrong.

   For a while the game stepped life support by the time acceleration, so
   fast-forwarding the sky drained the tanks with it. At the 600x default that
   turned a nine-hour EVA into fifty-four seconds of play, and it reached real
   players before anyone noticed, because every test here feeds `step` its own
   dt and the model is blameless: the fault was entirely in the callers.

   So this checks two things the model alone cannot. That elapsed time is the
   only thing that empties a tank -- the same hour in one step or sixty must
   cost the same -- and that no caller has quietly started multiplying that
   hour by the time rate again. The second is a source check rather than a
   behavioural one, because the callers own three.js and will not import into
   node; a grep that fails the build is worth more here than elegance. */
console.log('the clock the suit runs on');
{
  const once = new Suit(); once.step(3600, { exertion: 0.35, sunlit: true });
  const often = new Suit(); eva(often, 1, { exertion: 0.35, sunlit: true });
  check('an hour is an hour however finely it is sliced',
    Math.abs(once.o2 - often.o2) < 1e-9 && Math.abs(once.power - often.power) < 1e-9,
    `${once.o2.toFixed(6)} vs ${often.o2.toFixed(6)} kg`);

  /* Comments talk about the bug on purpose, so they have to go before the
     code is searched or this would fail on its own explanation. */
  const code = (f) => readFileSync(new URL(f, import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const callers = ['../src/main.js', '../src/game/eva.js'];
  const scaled = [];
  for (const f of callers) {
    for (const line of code(f).split('\n')) {
      if (!/\b(suit\.step|needs\.step|rover\.consume)\s*\(/.test(line)) continue;
      if (/timeRate|timeScale/.test(line)) scaled.push(f + ': ' + line.trim());
    }
  }
  check('nothing scales life support by the time rate',
    scaled.length === 0, scaled.join(' | ') || 'all callers pass the frame dt');

  /* The default matters as well as the coupling: the two together are what
     decided how long the suit actually lasted. */
  check('the sky runs fast enough to watch and no faster',
    TIME.defaultRate >= 1 && TIME.defaultRate <= 600, TIME.defaultRate + 'x');
  const budget = new Suit().endurance(0.35);
  check('and a full EVA is hours of real time, not a minute of it',
    budget / 3600 > 1, (budget / 3600).toFixed(1) + ' h of wall clock');
}

console.log(failures ? `\nsuit: ${failures} FAILED` : '\nsuit: all checks passed');
process.exit(failures ? 1 : 0);
