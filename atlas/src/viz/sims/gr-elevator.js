// Einstein's elevator. A closed box 3 m wide in four situations — riding a
// rocket that accelerates at g far from any star, standing on Earth, falling
// freely near Earth, floating in deep space. Press Release: two balls are let
// go and a light pulse is fired across the box. The left panel is what
// someone inside sees; the right panel shows the same events from outside
// (from far away, or from the ground). Scenes that look identical on the left
// are the equivalence principle. "Show tides" puts four balls in the falling
// box: they drift into a stretched diamond because each falls toward Earth's
// centre — the one thing a small box cannot hide. Physics in
// model/gr-elevator.js (tested headlessly).

import { Plot } from '../plot.js';
import { SCENES, relativeAcceleration, boxAcceleration, lightDrop, tidalAcceleration, G_EARTH, R_EARTH } from '../model/gr-elevator.js';

export const defaults = { mode: 'rocket', tides: false };

const L = 3, HB = 3;                         // box width and height, m
const RB = 0.13;                             // ball radius, m
const PAIR = [[1.0, 1.8], [2.0, 1.8]];       // where the two balls are released, m (inside the box)
const RING = [[0.5, 1.5], [2.5, 1.5], [1.5, 2.5], [1.5, 0.5]];   // the tidal diamond, about the box centre
const LASER = 2.4, MUZZLE = 0.14;            // laser height and muzzle, m
const DROP_SHOWN = 0.6;                      // how far the slowed light falls across the box on screen, m
const T_HIT = Math.sqrt((2 * DROP_SHOWN) / G_EARTH);   // s
const V_LIGHT = (L - MUZZLE) / T_HIT;        // the slowed light, m/s
const T_END = 0.7;                           // physical seconds animated
const SLOW = 0.35;                           // playback rate
const TIDE_X = 4e5;                          // tidal exaggeration
const BALL_COLORS = ['accent', 'teal', 'violet', 'good'];

export function validate(P) {
  return SCENES[P.mode] ? [] : [`gr-elevator: unknown mode “${P.mode}” (use ${Object.keys(SCENES).join(', ')})`];
}

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'wide', label: 'A closed box seen from inside and from outside, with two dropped balls and a light pulse' });
  F.choice({ key: 'mode', label: 'Where is the box?', options: [['rocket', 'Rocket, deep space'], ['earth', 'On Earth'], ['falling', 'Falling'], ['space', 'Floating']], value: P.mode, explain: 'Compare the pairs: rocket with Earth, falling with floating. Watch the left panel.' });
  F.toggle({ key: 'tides', label: 'Show tides (falling box)', value: P.tides, explain: `Four balls in the falling box, each falling toward Earth's centre. Drift exaggerated ×${(TIDE_X).toLocaleString('en-US')} — as if Earth were that much smaller, with the same surface gravity.` });
  const S = { t: 0, running: false };
  F.button({ label: 'Release', primary: true, onClick: () => { S.t = 0; S.running = true; anim.start(); } });
  F.onChange(() => { S.running = false; S.t = 0; draw(); });

  const left = new Plot(canvas, { x: [-1.1, 4.1], y: [-3.0, 3.7], equal: true, grid: false, axes: false });
  const right = new Plot(canvas, { x: [-1.1, 4.1], y: [-3.0, 3.7], equal: true, grid: false, axes: false });

  const anim = F.animate((dt) => {
    if (!S.running) return;
    S.t = Math.min(T_END, S.t + dt * SLOW);
    if (S.t >= T_END) S.running = false;
    draw();
  }, { force: true });

  const tidal = () => F.params.tides && F.params.mode === 'falling';
  const balls = () => (tidal() ? RING : PAIR);

  // positions inside the box (x from the left wall, y from the floor)
  function ballIn([x0, y0], t) {
    const a = relativeAcceleration(F.params.mode);
    const tc = a < 0 ? Math.min(t, Math.sqrt((2 * (y0 - RB)) / -a)) : t;   // a ball stops on the floor
    let x = x0, y = y0 + 0.5 * a * tc * tc;
    if (tidal()) {
      const [ax, ay] = tidalAcceleration(x0 - L / 2, y0 - HB / 2);
      x += 0.5 * ax * TIDE_X * t * t;
      y += 0.5 * ay * TIDE_X * t * t;
    }
    return [x, y];
  }
  function lightIn(t) {
    const a = relativeAcceleration(F.params.mode), tt = Math.min(t, T_HIT);
    return [MUZZLE + V_LIGHT * tt, LASER + 0.5 * a * tt * tt];
  }
  // where the box's floor sits in each panel at time t
  const base = (outside, t) => {
    const mode = F.params.mode;
    if (!outside || mode === 'earth' || mode === 'space') return -1.5;
    if (mode === 'rocket') return -2.35 + 0.5 * boxAcceleration(mode) * t * t;
    return 0.45 + 0.5 * boxAcceleration(mode) * t * t;   // falling
  };

  function panel(pl, outside) {
    const mode = F.params.mode, t = S.t;
    const y0 = base(outside, t);
    const at = (p, s = t) => [p[0], p[1] + base(outside, s)];   // inside → panel coordinates at time s
    // the setting
    if (mode === 'rocket' || mode === 'space') stars(pl, outside ? 7 : 3);
    if (mode === 'earth') {
      pl.rect(-1.6, -3.4, 7.2, 1.9, { color: 'ink4', alpha: 0.18, stroke: false });
      for (let x = -1.4; x < 5; x += 0.35) pl.line(x, -1.5, x - 0.3, -1.85, { color: 'ink4', width: 1 });
      pl.line(-1.6, -1.5, 5.6, -1.5, { color: 'ink3', width: 2 });
      pl.text('ground', -0.9, -2.2, { color: 'ink3', size: 11 });
    }
    if (mode === 'rocket') rocket(pl, y0);
    if (mode === 'falling') {
      const cut = outside ? 0.45 + HB : y0 + HB;   // the cable was cut where the box hung at the start
      pl.line(L / 2, 3.8, L / 2, cut + 0.35, { color: 'ink3', width: 2 });
      pl.text('cable cut', L / 2 + 0.15, Math.min(3.45, cut + 0.55), { color: 'ink3', size: 11 });
    }
    // the box
    pl.rect(0, y0, L, HB, { color: 'ink4', alpha: 0.12, stroke: false });
    pl.path([[0, y0], [L, y0], [L, y0 + HB], [0, y0 + HB]], { close: true, color: 'ink2', width: 2.6 });
    pl.line(0.02, y0 + LASER, L - 0.02, y0 + LASER, { color: 'ink4', width: 1, dash: [3, 5] });   // laser level
    pl.rect(-0.02, y0 + LASER - 0.09, MUZZLE + 0.02, 0.18, { color: 'gold', alpha: 0.9, stroke: false });
    // predicted paths (dashed), then what has happened so far (solid)
    const N = 60, tEnd = T_END;
    const lightPath = (upto) => { const pts = []; for (let i = 0; i <= N; i++) { const s = (Math.min(upto, T_HIT) * i) / N; pts.push(at(lightIn(s), s)); } return pts; };
    pl.path(lightPath(T_HIT), { color: 'gold', width: 1.2, dash: [4, 5], alpha: 0.55 });
    if (t > 0) pl.path(lightPath(t), { color: 'gold', width: 3 });
    const pulse = at(lightIn(t));
    pl.point(pulse[0], pulse[1], { color: 'gold', r: t > 0 ? 5 : 3.5 });
    balls().forEach((b, k) => {
      const trail = []; for (let i = 0; i <= N; i++) { const s = (tEnd * i) / N; trail.push(at(ballIn(b, s), s)); }
      pl.path(trail, { color: BALL_COLORS[k], width: 1, dash: [3, 5], alpha: 0.6 });
      const [x, y] = at(ballIn(b, t));
      pl.circle(x, y, RB, { fill: BALL_COLORS[k], color: BALL_COLORS[k], width: 1 });
    });
    // arrows: what accelerates, in this panel
    const aBox = outside ? boxAcceleration(mode) : 0;
    const aBall = outside ? (SCENES[mode].field * G_EARTH) : relativeAcceleration(mode);
    if (aBox) pl.arrow(L + 0.45, y0 + HB / 2 - 0.55 * Math.sign(aBox), L + 0.45, y0 + HB / 2 + 0.55 * Math.sign(aBox), { color: 'good', width: 2.4, label: 'box: g', ldx: 6, ldy: aBox > 0 ? -2 : 4 });
    if (aBall && !tidal()) pl.arrow(-0.45, y0 + 1.9, -0.45, y0 + 1.9 - 0.95, { color: 'accent2', width: 2.4, label: 'balls: g', lalign: 'right', ldx: -6, ldy: 4 });
    if (tidal() && !outside) {
      for (const b of RING) {
        const [x, y] = ballIn(b, t), [ax, ay] = tidalAcceleration(b[0] - L / 2, b[1] - HB / 2);
        const k = 0.45 / (2 * G_EARTH / R_EARTH);   // arrow length per unit tidal acceleration
        pl.arrow(x, y0 + y, x + ax * k, y0 + y + ay * k, { color: 'bad', width: 2 });
      }
    }
    // panel title
    const title = outside ? (mode === 'rocket' || mode === 'space' ? 'Outside, from far away' : 'Outside, from the ground') : 'Inside the box';
    pl.text(title, pl.L + 4, pl.T + 10, { screen: true, color: 'ink2', size: 12, weight: 650 });
  }

  function rocket(pl, y0) {
    pl.path([[0.75, y0], [2.25, y0], [1.95, y0 - 0.45], [1.05, y0 - 0.45]], { close: true, color: 'ink3', width: 1.5, fill: 'ink4', fillAlpha: 0.5 });
    const flick = S.running ? 0.08 * Math.sin(S.t * 90) : 0;
    pl.path([[1.1, y0 - 0.45], [1.9, y0 - 0.45], [1.5, y0 - 1.25 - flick]], { close: true, color: 'warn', width: 1.5, fill: 'warn', fillAlpha: 0.55 });
    pl.path([[1.3, y0 - 0.45], [1.7, y0 - 0.45], [1.5, y0 - 0.9 - flick]], { close: true, color: 'bad', width: 1, fill: 'bad', fillAlpha: 0.5 });
  }

  function stars(pl, seed) {
    let s = seed * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 40; i++) pl.point(pl.vx0 + rnd() * (pl.vx1 - pl.vx0), pl.vy0 + rnd() * (pl.vy1 - pl.vy0), { color: 'ink4', r: 0.6 + rnd() * 1.1 });
  }

  function draw() {
    const W = canvas.clientWidth || 600, gap = 10;
    left.o.pad = { l: 6, r: W / 2 + gap / 2, t: 6, b: 6 };
    right.o.pad = { l: W / 2 + gap / 2, r: 6, t: 6, b: 6 };
    left.resize(); left.refreshTheme(); right.resize(); right.refreshTheme();
    const ctx = left.ctx;
    ctx.clearRect(0, 0, left.w, left.h);
    panel(left, false);
    // divider
    ctx.save(); ctx.strokeStyle = left.col.line2; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(left.w / 2 + 0.5, 8); ctx.lineTo(left.w / 2 + 0.5, left.h - 8); ctx.stroke(); ctx.restore();
    panel(right, true);
    const mode = F.params.mode, a = relativeAcceleration(mode);
    const twin = { rocket: 'standing on Earth', earth: 'a rocket accelerating at g', falling: 'floating in deep space', space: 'falling freely' }[mode];
    const rows = [
      ['dropped ball, relative to the floor', a ? `${G_EARTH.toFixed(2)}\\,\\mathrm{m/s^2}\\ \\text{down}` : '0\\ \\text{(it floats)}'],
      ['bathroom scale under a 70 kg person', a ? `${Math.round(70 * G_EARTH)}\\,\\mathrm{N}` : '0\\,\\mathrm{N}'],
      ['real light drop across the 3 m box', a ? sci(lightDrop(L)) + '\\,\\mathrm{m}' : '0'],
      ['inside, indistinguishable from', `\\text{${twin}}`],
    ];
    if (F.params.tides) {
      if (mode === 'falling') {
        const side = 0.5 * Math.abs(tidalAcceleration(1, 0)[0]) * T_END ** 2, up = 0.5 * tidalAcceleration(0, 1)[1] * T_END ** 2;
        rows.push(['real tidal drift in 0.7 s (balls 1 m from centre)', `${sci(side)}\\,\\mathrm{m}\\ \\text{in},\\ ${sci(up)}\\,\\mathrm{m}\\ \\text{out}`]);
      } else rows.push(['tides', mode === 'earth' ? '\\text{present, but the balls hit the floor first}' : '\\text{none: no mass nearby}']);
    }
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(`A box 3 m wide; gravity and the rocket’s acceleration are both 9.81 m/s². To make light’s fall visible, the pulse is slowed to about ${V_LIGHT.toFixed(0)} m/s: real light crosses in 10 ns and falls ${sci(lightDrop(L), 'plain')} m. Dashed lines show where everything will go. Tidal drifts are exaggerated ×${TIDE_X.toLocaleString('en-US')}.`);
  return { get: (k) => F.params[k] };
}

function sci(x, style = 'tex') {
  const [m, e] = x.toExponential(1).split('e');
  return style === 'tex' ? `${m}\\times10^{${parseInt(e, 10)}}` : `${m}×10${String(parseInt(e, 10)).replace(/-/, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`;
}
