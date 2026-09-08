/* The pad, checked without one.

   The claim worth testing is not that a stick moves you — it is that it moves
   you through exactly the same code the keyboard does. So this checks the two
   things the module converts the hardware into, held directions and a look
   delta, and the properties that make a stick a stick rather than four keys:
   an analogue value, a radial deadzone, and an edge for anything that toggles. */
import { Gamepads, PAD } from '../src/game/gamepad.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* A pad, as the browser reports one. */
function pad(axes = [0, 0, 0, 0], down = []) {
  return {
    index: 0, axes,
    buttons: Array.from({ length: 16 }, (_, i) => ({
      pressed: down.includes(i), value: down.includes(i) ? 1 : 0,
    })),
  };
}
const plug = (...pads) => Object.defineProperty(globalThis, 'navigator', {
  configurable: true, value: { getGamepads: () => pads },
});
const unplug = () => Object.defineProperty(globalThis, 'navigator', {
  configurable: true, value: {},
});

console.log('no pad is not an error');
{
  unplug();
  const g = new Gamepads();
  const r = g.read(1 / 60);
  check('nothing is connected', r.connected === false);
  check('and nothing is asked for',
        r.forward === 0 && r.strafe === 0 && r.lookYaw === 0 && r.held.size === 0);
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
  check('a browser with no gamepad API at all is fine',
        new Gamepads().read(1 / 60).connected === false);
}

console.log('a stick is analogue, which is the point of it');
{
  const g = new Gamepads();
  plug(pad([0, -1, 0, 0]));
  check('full deflection is full speed', Math.abs(g.read(1 / 60).forward - 1) < 1e-9);
  plug(pad([0, -0.5, 0, 0]));
  const half = g.read(1 / 60).forward;
  check('half deflection is not full speed', half > 0.3 && half < 0.55, half.toFixed(3));
  check('which a key cannot ask for', half !== 1);
  plug(pad([0, 1, 0, 0]));
  check('and back on the stick is backwards',
        Math.abs(g.read(1 / 60).forward + 1) < 1e-9);
}

console.log('the deadzone is radial, so a diagonal does not snap to an axis');
{
  const g = new Gamepads();
  plug(pad([0.1, -0.1, 0, 0]));       // inside the zone in both axes
  const idle = g.read(1 / 60);
  check('a resting stick asks for nothing',
        idle.forward === 0 && idle.strafe === 0,
        `${idle.forward} ${idle.strafe}`);
  /* Just past the zone: the output must start from zero rather than jumping
     to the zone's own width. */
  plug(pad([0, -0.17, 0, 0]));
  const nudge = g.read(1 / 60).forward;
  check('the first movement past it is small, not a step',
        nudge > 0 && nudge < 0.05, nudge.toFixed(4));
  /* A perfect diagonal stays a diagonal. */
  plug(pad([0.7071, -0.7071, 0, 0]));
  const d = g.read(1 / 60);
  check('and a diagonal comes out as one',
        Math.abs(d.forward - d.strafe) < 1e-9,
        `${d.forward.toFixed(3)} ${d.strafe.toFixed(3)}`);
}

console.log('looking is a rate, because a stick is not a mouse');
{
  const g = new Gamepads();
  plug(pad([0, 0, 1, 0]));
  const a = g.read(1 / 60).lookYaw, b = g.read(1 / 30).lookYaw;
  check('twice the time is twice the turn', Math.abs(b - 2 * a) < 1e-9,
        `${a.toFixed(2)}° then ${b.toFixed(2)}°`);
  check('a full second at full deflection is a half turn or so',
        Math.abs(g.read(1).lookYaw - 180) < 1e-9);
  plug(pad([0, 0, 0, -1]));
  check('up on the right stick looks up', g.read(1).lookPitch > 0);
}

console.log('buttons have an edge, which is what a toggle needs');
{
  const g = new Gamepads();
  plug(pad([0, 0, 0, 0], [PAD.view]));
  check('the first frame is a press',
        g.read(1 / 60).pressed.has('view'));
  check('the second is not', !g.read(1 / 60).pressed.has('view'));
  check('but it is still held', g.read(1 / 60).held.has('view'));
  plug(pad());
  g.read(1 / 60);
  plug(pad([0, 0, 0, 0], [PAD.view]));
  check('releasing and pressing again is a new press',
        g.read(1 / 60).pressed.has('view'));

  plug(pad([0, 0, 0, 0], [PAD.runL]));
  check('either trigger runs', g.read(1 / 60).run === true);
  plug(pad([0, 0, 0, 0], [PAD.runR]));
  check('and so does the other', g.read(1 / 60).run === true);
}

console.log('two pads do not add up to two');
{
  const g = new Gamepads();
  plug(pad([0, -1, 0, 0]), { ...pad([0, -1, 0, 0]), index: 1 });
  const r = g.read(1 / 60);
  check('both pushed forward is still full speed, not double',
        Math.abs(r.forward - 1) < 1e-9, r.forward.toFixed(3));
}

console.log('and a pad with fewer axes or buttons than expected');
{
  const g = new Gamepads();
  plug({ index: 0, axes: [0.5], buttons: [] });
  const r = g.read(1 / 60);
  check('is read for what it has', r.connected === true && r.strafe > 0.3);
  check('and asks for nothing it does not have',
        r.lookYaw === 0 && r.held.size === 0);
  plug({ index: 0 });
  check('even with no axes or buttons at all',
        new Gamepads().read(1 / 60).connected === true);
}

unplug();
console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
