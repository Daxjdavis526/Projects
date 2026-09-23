/* The vacuum, checked without a browser and without a speaker.

   This is the largest module in the project and it had no test, which for this
   one is a strange omission: its entire thesis is a claim about physics that a
   single wrong line can break, and a wrong line here is inaudible to every
   other kind of check. The claim is that there is no fluid at the lunar surface
   to carry a pressure wave, so nothing outdoors can be heard through the air —
   and the mix expresses that as one bus, `air`, whose gain must be zero
   whenever the ambient pressure is.

   `Sound` is DOM-free and three-free and takes a plain object per frame, so all
   it needs is somewhere to build its graph. The stub below is the smallest
   Web Audio that will hold one: nodes that remember what was set on them, and
   an AudioParam that records its last value. Nothing is rendered and nothing is
   heard; what is checked is the level the mix asks for. */
import { Sound } from '../src/audio/audio.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* --- the smallest Web Audio that will hold a graph ------------------------- */
class Param {
  constructor(v) { this.value = v; }
  setValueAtTime(v) { this.value = v; return this; }
  linearRampToValueAtTime(v) { this.value = v; return this; }
  exponentialRampToValueAtTime(v) { this.value = v; return this; }
  /* The mix reaches its target exponentially; for the purpose of asking what
     level it asked for, the target is the answer. */
  setTargetAtTime(v) { this.value = v; return this; }
  cancelScheduledValues() { return this; }
}
class Node {
  constructor(kind) {
    this.kind = kind;
    this.gain = new Param(kind === 'gain' ? 1 : 0);
    this.frequency = new Param(440);
    this.Q = new Param(1);
    this.threshold = new Param(-24); this.knee = new Param(30);
    this.ratio = new Param(12); this.attack = new Param(0.003); this.release = new Param(0.25);
    this.playbackRate = new Param(1);
    this.started = 0; this.stopped = 0;
  }
  connect(next) { return next; }
  disconnect() {}
  start() { this.started++; if (this.onended) setTimeout(() => this.onended(), 0); }
  stop() { this.stopped++; }
}
class Ctx {
  constructor() { this.currentTime = 0; this.state = 'running'; this.sampleRate = 48000;
                  this.destination = new Node('dest'); }
  createGain() { return new Node('gain'); }
  createOscillator() { return new Node('osc'); }
  createBiquadFilter() { return new Node('biquad'); }
  createBufferSource() { return new Node('src'); }
  createDynamicsCompressor() { return new Node('comp'); }
  createBuffer(ch, len, rate) {
    return { length: len, duration: len / rate, numberOfChannels: ch,
             getChannelData: () => new Float32Array(len) };
  }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
}

async function make(opts = {}) {
  const s = new Sound({ context: new Ctx(), ...opts });
  await s.start();
  if (!s.ok) throw new Error('the stub context was not enough to build the graph');
  return s;
}

/* Advance a whole number of frames, so anything that integrates gets to. */
const run = (s, snapshot, frames = 40, dt = 1 / 60) => {
  for (let i = 0; i < frames; i++) {
    s.ctx.currentTime += dt;
    s.update({ dt, ...snapshot });
  }
  return s;
};

const suited = { environment: 'suit', pressure: 0,
  player: { speed: 0, grounded: true, stepPhase: 0, stepsTaken: 0 },
  suit: { o2Fraction: 1, powerFraction: 1, co2Fraction: 0, waterFraction: 1,
          pressureKpa: 29.6, warnings: [] } };

console.log('the vacuum');
{
  const s = await make();
  run(s, suited);
  check('outdoors in a suit, the airborne bus is silent',
        s.n.air.gain.value === 0, String(s.n.air.gain.value));
  check('and the helmet is at full, because it is all you have',
        s.n.helmet.gain.value > 0.99, String(s.n.helmet.gain.value));

  /* Every environment the game can put you in, at vacuum pressure. */
  for (const env of ['suit', 'rover_open', 'rover_closed', 'ship', 'vacuum', 'nonsense']) {
    run(s, { ...suited, environment: env, pressure: 0 }, 10);
    check(`no airborne sound at zero pressure: ${env}`, s.n.air.gain.value === 0,
          String(s.n.air.gain.value));
  }

  /* And with no pressure field at all, which is the default a caller gets for
     forgetting: it must fall to vacuum, not to air. */
  run(s, { environment: 'suit', player: suited.player, suit: suited.suit }, 10);
  check('an absent pressure outdoors is vacuum, not air', s.n.air.gain.value === 0);
}

console.log('the free camera has nothing to hear with');
{
  const s = await make();
  run(s, { environment: 'vacuum', pressure: 1 });
  check('no cabin bed', s.n.cabinGain.gain.value === 0, String(s.n.cabinGain.gain.value));
  check('no helmet bed', s.n.helmet.gain.value === 0, String(s.n.helmet.gain.value));
  check('no headset', s.n.head.gain.value === 0, String(s.n.head.gain.value));
  check('and no air, whatever the pressure field says', s.n.air.gain.value === 0);
}

console.log('inside, where there is air');
{
  const s = await make();
  run(s, { environment: 'ship', pressure: 1,
           ship: { interiorLevel: 1, airlock: 1 }, suit: suited.suit });
  check('the airborne bus is open', s.n.air.gain.value > 0.9, String(s.n.air.gain.value));
  check('the cabin bed plays', s.n.cabinGain.gain.value > 0);
  check('and the helmet drops right back', s.n.helmet.gain.value < 0.2,
        String(s.n.helmet.gain.value));
}

console.log('an airlock is a crossfade, not a cut');
{
  const s = await make();
  const levels = [];
  for (const pressure of [1, 0.8, 0.6, 0.4, 0.2, 0]) {
    run(s, { environment: 'ship', pressure, ship: { interiorLevel: 1, airlock: pressure },
             suit: suited.suit }, 6);
    levels.push({ pressure, air: s.n.air.gain.value, helmet: s.n.helmet.gain.value });
  }
  check('the air falls monotonically as the cabin empties',
        levels.every((l, i) => i === 0 || l.air <= levels[i - 1].air + 1e-9),
        levels.map(l => l.air.toFixed(3)).join(' '));
  check('and the helmet rises to meet it',
        levels.every((l, i) => i === 0 || l.helmet >= levels[i - 1].helmet - 1e-9),
        levels.map(l => l.helmet.toFixed(3)).join(' '));
  check('ending in vacuum with the suit carrying everything',
        levels[levels.length - 1].air === 0 && levels[levels.length - 1].helmet > 0.99);
}

console.log('cautions announce themselves once each');
{
  const s = await make({ autoCaution: true });
  const fired = [];
  const realAlarm = s.alarm.bind(s);
  s.alarm = (kind) => { fired.push(kind); return realAlarm(kind); };

  run(s, suited, 5);
  check('nothing sounds when nothing is wrong', fired.length === 0, fired.join(','));

  const warn = (...ids) => ({ ...suited,
    suit: { ...suited.suit, warnings: ids.map(id => ({ level: 'caution', id, text: id })) } });

  run(s, warn('o2'), 5);
  check('an oxygen caution sounds its own pattern', fired.join(',') === 'o2', fired.join(','));
  run(s, warn('o2'), 30);
  check('and does not repeat while it stands', fired.join(',') === 'o2', fired.join(','));
  run(s, warn('o2', 'thermal'), 5);
  check('a second, different condition sounds its own',
        fired.join(',') === 'o2,thermal', fired.join(','));
  run(s, warn('thermal'), 5);
  check('clearing one does not re-announce the other',
        fired.join(',') === 'o2,thermal', fired.join(','));
  run(s, warn('thermal', 'o2'), 5);
  check('a condition that clears and returns sounds again',
        fired.join(',') === 'o2,thermal,o2', fired.join(','));

  /* Six caution patterns and four interface patterns exist so that you know
     which one it is without looking, which is only true if they actually
     differ. Record what each one asks the tone generator for. */
  const shapes = new Map();
  const realTone = s._tone.bind(s);
  s._tone = (dest, type, f0, f1, at, dur, peak, attack) => {
    shapes.get(shapes.pending).push(`${type}:${f0}-${f1}@${dur.toFixed(3)}`);
    return realTone(dest, type, f0, f1, at, dur, peak, attack);
  };
  for (const k of ['o2', 'co2', 'power', 'thermal', 'pressure', 'impact']) {
    shapes.pending = k; shapes.set(k, []);
    s.lastAlarmAt = Object.create(null);        // past the anti-repeat window
    s.alarm(k);
  }
  for (const k of ['select', 'confirm', 'deny', 'comms']) {
    shapes.pending = k; shapes.set(k, []);
    s.beep(k);
  }
  check('every alarm makes a sound at all',
        ['o2', 'co2', 'power', 'thermal', 'pressure', 'impact']
          .every(k => shapes.get(k).length > 0),
        [...shapes].map(([k, v]) => `${k}:${v.length}`).join(' '));
  check('and all ten patterns are distinguishable from each other',
        new Set([...shapes.values()].map(v => v.join('|'))).size === 10,
        [...shapes].map(([k, v]) => `${k}=${v.join('|')}`).join('\n    '));
}

console.log('and none of it can take the frame down');
{
  const s = await make();
  s.update({ dt: 1 / 60, environment: 'suit', player: null, suit: null, rover: null });
  s.update(null);
  s.update({ dt: NaN, environment: 42, pressure: 'yes', suit: { warnings: 'no' } });
  check('rubbish in a snapshot is survived', true);
  check('and the vacuum still holds afterwards', s.n.air.gain.value === 0);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
