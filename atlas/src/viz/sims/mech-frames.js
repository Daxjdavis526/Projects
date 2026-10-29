// Newton's first law and frames of reference. A train car 6 m long speeds
// up, cruises or brakes. A ball rests on its frictionless floor and a
// pendulum hangs from its ceiling. Seen from the ground — an inertial frame —
// nothing horizontal acts on the ball, so it keeps the velocity it had while
// the car moves on beneath it, until a wall reaches it and pushes it along.
// Seen from inside the car, the same ball accelerates with no force on it:
// the first law fails, so the car's frame is not inertial. In steady motion
// the two views agree that nothing happens — no experiment inside reveals the
// car's speed. Physics in model/mech-forces.js.
//
//   { type: 'mech-frames', params: {
//       motion: 'speed-up',     // 'speed-up' (from rest), 'steady' or 'brake' (from v0 to rest)
//       A: 2, v0: 4,            // the car's acceleration magnitude (m/s²) and starting speed (m/s)
//       view: 'ground',         // 'ground' or 'car'
//       time: 0, T: 2.5,        // the time cursor and the run's length (s)
//       sliders: true,          // the controls (motion, view, A, time, Play); false for a still picture
//   } }

import { Plot } from '../plot.js';
import * as MF from '../model/mech-forces.js';

const G = MF.G, LEN = 6, HGT = 2.6, XB = 3;       // car length and height (m); the ball starts mid-car
export const defaults = { motion: 'speed-up', A: 2, v0: 4, view: 'ground', time: 0, T: 2.5, sliders: true };
const trim = (x, n = 3) => String(+(+x).toPrecision(n));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const { canvas, box } = F.canvas({ aspect: 'wide', label: 'A train car with a ball on its floor and a pendulum, seen from the ground or from inside the car' });
  const plot = new Plot(canvas, { x: [-1.5, 16.5], y: [-1.3, 4.7], equal: true, grid: false, axes: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  const live = !!P.sliders;
  if (live) {
    F.choice({ key: 'motion', label: 'The car', options: [['speed-up', 'Speeds up'], ['steady', 'Cruises'], ['brake', 'Brakes']], value: P.motion, explain: 'Speeds up from rest; cruises at a steady 4 m/s; or brakes from 4 m/s to a stop.' });
    F.choice({ key: 'view', label: 'Watch from', options: [['ground', 'The ground'], ['car', 'Inside the car']], value: P.view, explain: 'The ground is (very nearly) an inertial frame. The car is one only while it cruises.' });
    F.slider({ key: 'A', label: 'Acceleration size $A$', min: 0.5, max: 3, step: 0.1, value: P.A, unit: '\\mathrm{m/s^2}', explain: 'How hard the car speeds up or brakes.' });
    F.slider({ key: 'time', label: 'Time $t$', min: 0, max: P.T, step: 0.01, value: P.time, unit: '\\mathrm{s}', explain: 'Seconds since the car started to speed up (or brake).' });
  } else Object.assign(F.params, { motion: P.motion, view: P.view, A: P.A, time: P.time });
  const S = { running: false };
  let play = null;
  const anim = live ? F.animate((dt) => {
    if (!S.running) return;
    let t = F.params.time + dt * 0.8;
    if (t >= P.T) { t = P.T; S.running = false; play.textContent = 'Replay'; }
    F.set('time', t);
  }, { force: true }) : null;
  if (live) play = F.button({ label: 'Play', primary: true, onClick: () => {
    if (S.running) { S.running = false; play.textContent = 'Play'; return; }
    if (F.params.time >= P.T - 1e-9) F.set('time', 0);
    S.running = true; play.textContent = 'Pause'; anim.start();
  } });
  F.onChange((key) => { if (key === 'motion' || key === 'A') { S.running = false; if (play) play.textContent = 'Play'; F.set('time', 0); return; } draw(); });

  function draw() {
    const { motion, view, A } = F.params, t = F.params.time, v0 = P.v0;
    const car = MF.trainAt(motion, A, v0, t), ball = MF.ballAt(motion, A, v0, t, XB, LEN);
    const inCar = view === 'car';
    const shift = inCar ? car.x : 0;                // the camera rides with the car in the car view
    box.style.aspectRatio = (canvas.clientWidth || 600) >= 560 ? '3 / 1' : '';
    plot.clear();
    const X0 = plot.vx0, X1 = plot.vx1;
    // the ground, with posts every 2 m so motion relative to it shows
    plot.rect(X0, -1.3, X1 - X0, 0.7, { color: 'ink4', alpha: 0.18, stroke: false });
    plot.line(X0, -0.6, X1, -0.6, { color: 'ink3', width: 2 });
    for (let k = Math.floor((X0 + shift) / 2) * 2; k <= X1 + shift; k += 2) {
      const x = k - shift;
      plot.line(x, -0.6, x, -0.85, { color: 'ink4', width: 1.5 });
      if (k % 4 === 0) plot.text(`${k} m`, x, -1.05, { color: 'ink4', size: 10, align: 'center' });
    }
    // the car
    const cx = car.x - shift;
    plot.rect(cx, 0, LEN, HGT, { color: 'ink4', alpha: 0.14, stroke: false });
    plot.path([[cx, 0], [cx + LEN, 0], [cx + LEN, HGT], [cx, HGT]], { close: true, color: 'ink2', width: 2.4 });
    for (const w of [0.9, LEN - 0.9]) { plot.circle(cx + w, -0.3, 0.3, { fill: 'panel', color: 'ink2', width: 2 }); }
    // the pendulum: its steady tilt, trailing the acceleration
    const tilt = Math.atan(car.a / G), px = cx + LEN * 0.72, L = 1.4;
    const bx = px - L * Math.sin(tilt), by = HGT - L * Math.cos(tilt);
    plot.line(px, HGT, bx, by, { color: 'ink2', width: 1.6 });
    plot.circle(bx, by, 0.13, { fill: 'violet', color: 'violet', width: 1 });
    plot.line(px, HGT, px, HGT - L - 0.15, { color: 'ink4', width: 1, dash: [3, 4] });
    // the ball
    const ballX = Math.min(cx + LEN - 0.27, Math.max(cx + 0.27, ball.x - shift));   // drawn inside the walls
    plot.circle(ballX, 0.25, 0.25, { fill: 'accent', color: 'accent', width: 1 });
    // velocity arrows (in this view): the car's and the ball's
    const vCar = inCar ? 0 : car.v, vBall = inCar ? ball.v - car.v : ball.v, k = 0.55;
    arrowV(cx + LEN / 2, HGT + 0.42, vCar * k, 'good', `car: ${speed(vCar)}`, true);
    arrowV(ballX, 1.0, vBall * k, 'accent', `ball: ${speed(vBall)}`);
    // the view's label
    plot.text(inCar ? 'Seen from inside the car' : 'Seen from the ground', plot.L + 6, plot.T + 12, { screen: true, color: 'ink2', size: 12.5, weight: 650 });
    const aBall = inCar ? (ball.pushed ? 0 : -car.a) : ball.pushed ? car.a : 0;
    const shoved = ball.pushed && Math.abs(car.a) > 1e-9;          // a wall is pushing the ball right now
    const law = ball.pushed ? (!shoved ? 'The ball rests against a wall' : inCar ? 'The wall pushes the ball, yet it stays put: the first law fails here' : 'A wall pushes the ball, so it now moves with the car') : Math.abs(aBall) < 1e-9 ? 'No force on the ball, and it does not accelerate' : 'No force on the ball, yet it accelerates: not an inertial frame';
    const bad = (Math.abs(aBall) > 1e-9 && !ball.pushed) || (shoved && inCar);
    plot.text(law, plot.L + 6, plot.T + 30, { screen: true, color: bad ? 'warn' : 'good', size: 12, weight: 600 });
    if (live || P.readout) F.readout([
      ['$t$', `${trim(t)}\\,\\mathrm{s}`],
      ['horizontal force on the ball', shoved ? '\\text{a wall’s push}' : '0'],
      ['ball’s acceleration, this view', `${trim(aBall)}\\,\\mathrm{m/s^2}`],
      ['car’s acceleration, this view', `${trim(inCar ? 0 : car.a)}\\,\\mathrm{m/s^2}`],
      ['pendulum tilt', `${trim(Math.abs(tilt) * 180 / Math.PI)}^\\circ`],
    ]);
  }
  // a velocity arrow centred on x; its label above it, or beside its head (`beside`) where there is no room above
  function arrowV(x, y, dx, color, label, beside = false) {
    if (Math.abs(dx) < 0.05) { plot.text(label, x, y, { color, size: 11.5, weight: 650, align: 'center' }); return; }
    plot.arrow(x - dx / 2, y, x + dx / 2, y, { color, width: 2.4, head: 9 });
    if (beside) plot.text(label, x + dx / 2 + Math.sign(dx) * 0.15, y, { color, size: 11.5, weight: 650, align: dx > 0 ? 'left' : 'right' });
    else plot.text(label, x, y + 0.32, { color, size: 11.5, weight: 650, align: 'center' });
  }
  const speed = (v) => (Math.abs(v) < 0.005 ? 'at rest' : `${trim(Math.abs(v))} m/s ${v > 0 ? '→' : '←'}`);

  F.draw(draw);
  F.caption('The floor is frictionless, so nothing horizontal acts on the ball until a wall reaches it (a real ball would roll, which changes the numbers but not the idea). The pendulum is drawn at its steady tilt, $\\tan\\theta = a/g$; a real one would swing about it. Arrows show velocities in the chosen view; lengths in metres are to scale.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!['speed-up', 'steady', 'brake'].includes(P.motion)) problems.push('motion must be speed-up, steady or brake');
  if (!['ground', 'car'].includes(P.view)) problems.push('view must be ground or car');
  if (!(P.A > 0 && P.A <= 3)) problems.push('A must be in (0, 3] m/s² to keep the car in view');
  if (!(P.v0 >= 0 && P.v0 <= 5)) problems.push('v0 must be in [0, 5] m/s to keep the car in view');
  if (!(P.T > 0 && P.T <= 3)) problems.push('T must be in (0, 3] s');
  if (!(P.time >= 0 && P.time <= P.T)) problems.push('time must lie in [0, T]');
  return problems;
}
