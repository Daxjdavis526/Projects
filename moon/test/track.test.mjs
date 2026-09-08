/* The record of where you have driven.

   One recorder for two things the brief asked for separately: the rover
   console's travelled path, and tracks that persist across sessions. The
   interesting property is not that it remembers — it is that it remembers
   cheaply, because a rover at eighteen kilometres an hour logging every frame
   makes four thousand points a minute and almost every one of them lies on a
   straight line between its neighbours. */
import { Track } from '../src/game/track.js';
import { surfaceDistance, offsetLatLon } from '../src/physics/frames.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* Drive a path, offering a point every metre, the way a frame loop would. */
function drive(t, from, headingOf, metres) {
  let p = { ...from };
  for (let m = 1; m <= metres; m++) {
    p = offsetLatLon(p.lat, p.lon, headingOf(m), 1);
    t.add(p.lat, p.lon);
  }
  return p;
}

console.log('a straight line is not a thousand points');
{
  const t = new Track();
  t.add(0.6, 23.4);
  drive(t, { lat: 0.6, lon: 23.4 }, () => 0, 1000);
  check('a kilometre straight ahead keeps under a hundred points',
        t.size < 100 && t.size > 40, t.size + ' points from 1000 offered');
  check('and the distance is still right',
        Math.abs(t.length - 1000) < 20, t.length.toFixed(0) + ' m');
  check('which is better than ninety per cent thrown away',
        t.size / 1000 < 0.1, (t.size / 10).toFixed(1) + ' %');
}

console.log('but a corner is');
{
  const straight = new Track();
  straight.add(0, 0);
  drive(straight, { lat: 0, lon: 0 }, () => 90, 400);

  const winding = new Track();
  winding.add(0, 0);
  /* A slalom: the same four hundred metres, turning all the way. */
  drive(winding, { lat: 0, lon: 0 }, (m) => 90 + 60 * Math.sin(m / 12), 400);
  check('the same distance through corners keeps far more of it',
        winding.size > straight.size * 3,
        `${straight.size} straight vs ${winding.size} winding`);
}

console.log('standing still records nothing');
{
  const t = new Track();
  t.add(0.6, 23.4);
  for (let i = 0; i < 5000; i++) t.add(0.6 + 1e-9 * Math.sin(i), 23.4);
  check('idling for five thousand frames adds no points', t.size === 1, t.size + ' points');
  check('and no distance', t.length === 0);
}

console.log('a long expedition stays a fixed size');
{
  const t = new Track();
  t.add(0, 0);
  /* Four hundred kilometres, which is a real traverse on this Moon. */
  let p = { lat: 0, lon: 0 };
  for (let m = 0; m < 400000; m += 6) {
    p = offsetLatLon(p.lat, p.lon, (m / 900) % 360, 6);
    t.add(p.lat, p.lon);
  }
  check('four hundred kilometres of driving stays bounded',
        t.size <= 6000, t.size + ' points');
  check('and still knows how far that was',
        t.length > 380000 && t.length < 420000, (t.length / 1000).toFixed(0) + ' km');
  /* Thinning keeps the ends: the newest points are the ones on screen. */
  const last = t.points[t.points.length - 1];
  check('the most recent point is where you actually are',
        surfaceDistance(last.lat, last.lon, p.lat, p.lon) < 20,
        surfaceDistance(last.lat, last.lon, p.lat, p.lon).toFixed(1) + ' m');
}

console.log('and it survives a save file');
{
  const t = new Track();
  t.add(0.6, 23.4);
  drive(t, { lat: 0.6, lon: 23.4 }, (m) => (m < 500 ? 0 : 90), 1000);
  const wire = JSON.parse(JSON.stringify(t.capture()));
  const back = new Track(wire);
  check('every point comes back', back.size === t.size, `${t.size} -> ${back.size}`);
  check('and the distance with it', Math.abs(back.length - Math.round(t.length)) < 1);
  check('to six decimal places, which is ten centimetres', (() => {
    for (let i = 0; i < t.size; i++) {
      if (surfaceDistance(t.points[i].lat, t.points[i].lon,
                          back.points[i].lat, back.points[i].lon) > 0.2) return false;
    }
    return true;
  })());
  check('a corrupt file is dropped rather than drawn',
        new Track({ p: [[1, 2], null, ['x', 3], [4]] }).size === 1);
  check('and no file at all is fine', new Track().size === 0 && new Track(null).size === 0);
}

console.log('the tail is what gets drawn');
{
  const t = new Track();
  for (let i = 0; i < 900; i++) t.add(i * 0.0005, 0);
  const tail = t.tail(100);
  check('the tail is the most recent points', tail.length === 100);
  check('oldest first, so a polyline joins up',
        tail[0].lat < tail[tail.length - 1].lat);
  check('and asking for more than there is gives what there is',
        t.tail(1e6).length === t.size);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
