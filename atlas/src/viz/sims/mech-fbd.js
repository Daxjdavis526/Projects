// Free-body diagrams beside the situations they come from. A scene — a block
// on a floor or a slope, a mass hanging from ropes, a block and tackle, a
// person on a scale in an elevator, an Atwood machine, a block on a table tied
// to a hanging mass, two blocks pushed or pulled together, a car on a banked
// curve or over a hill, an aircraft in a level turn, or any body with forces
// given directly — is drawn on the left. On the right each body is isolated
// as a dot carrying every force that acts on it, all drawn to one common
// scale, with its acceleration beside it. The physics is
// model/mech-forces.js (tested headlessly). Static by default, as a
// problem's picture; give it sliders to make it explorable.
//
//   { type: 'mech-fbd', params: {
//       scene: 'floor',               // floor incline hang pulley elevator atwood table pair banked crest turn body
//       m: 10, F: 40, phi: 20, ...,   // the scene's own parameters, SI units and degrees (see SCENES below)
//       sliders: ['F', 'phi'],        // keys to make adjustable, or true for the scene's usual set;
//                                     //   an entry may be an object overriding { key, min, max, step, label, explain }
//       toggles: ['sum', 'values'],   // offer these switches: sum, values, components (incline)
//       show: 'both',                 // 'both': picture + diagrams; 'fbd': diagrams only; 'scene': forces drawn on the picture;
//                                     //   'picture': the situation alone, no forces (to ask which forces act)
//       quiet: false,                 // hide the one-line status over the picture
//       values: false,                // print each force's size
//       sum: false,                   // add the forces tip to tail and draw the net force ΣF
//       accel: true,                  // show each body's acceleration beside its diagram
//       components: false,            // incline: split the weight along and across the slope
//       hide: ['f'],                  // leave these forces off (to ask what is missing)
//       extra: [{ body: 0, label: 'force of motion', mag: 30, dir: 0, kind: 'applied' }],   // add a force (to ask what is wrong)
//       labels: { N: 'n' },           // relabel forces by key; ask: ['T'] prints "T = ?"
//       names: ['the crate'],         // titles over the diagrams
//       play: false,                  // atwood, table: Play runs the motion
//       readout: true,                // live numbers under the picture (on by default when there are sliders)
//   } }
//
// body scene: forces: [{ label, mag (N), dir (degrees from +x), kind }], icon: block ball puck rocket
// person car plane capsule skydiver drone probe, ground: true, wall: 'left' | 'right', v: [vx, vy] (a direction), a: [ax, ay],
// agent: { dir, kind: 'pole' | 'rope' } (a pole pushing, or a rope pulling, in direction dir).

import { Plot } from '../plot.js';
import * as MF from '../model/mech-forces.js';

const D2R = Math.PI / 180;
const G = MF.G;
const COLORS = { weight: 'ink2', normal: 'teal', friction: 'bad', tension: 'good', applied: 'accent', thrust: 'accent', contact: 'violet', drag: 'warn', lift: 'accent2' };
const SHOWS = ['both', 'fbd', 'scene', 'picture'];
const TOGGLES = ['sum', 'values', 'components'];
const ICONS = ['block', 'ball', 'puck', 'rocket', 'person', 'car', 'plane', 'capsule', 'skydiver', 'drone', 'probe', 'none'];

// ─── number formats ────────────────────────────────────────────────────────
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
/** A force for a canvas label: 4.9 N, 36.8 N, 1176 N, 11.8 kN, 7.6 MN. */
export function fmtN(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return `${trim(v / 1e6)} MN`;
  if (a >= 1e4) return `${trim(v / 1e3)} kN`;
  if (a >= 100) return `${Math.round(v)} N`;
  return `${trim(v)} N`;
}
const texNum = (v) => { const a = Math.abs(v); return a >= 100 && a < 1e4 ? String(Math.round(v)) : a >= 1e4 ? String(+(+v).toPrecision(3)).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : trim(v); };
const tN = (v) => (Math.abs(v) >= 1e6 ? `${trim(v / 1e6)}\\,\\mathrm{MN}` : Math.abs(v) >= 1e4 ? `${trim(v / 1e3)}\\,\\mathrm{kN}` : `${texNum(v)}\\,\\mathrm{N}`);
const tA = (v) => `${Math.abs(v) < 5e-4 ? '0' : trim(v)}\\,\\mathrm{m/s^2}`;
const tV = (v) => (Number.isFinite(v) ? `${trim(v)}\\,\\mathrm{m/s}` : '\\text{no limit}');
const massText = (m) => `${trim(m)} kg`;
const cbrt = Math.cbrt;

// ─── the scenes ────────────────────────────────────────────────────────────
// Each: defaults, controls (sliders and choices), solve, bounds, draw, readout, layout of its diagrams.

const S_M = (min = 1, max = 40, explain = 'Sets the weight $mg$.') => ({ key: 'm', label: 'Mass $m$', min, max, step: 0.5, unit: '\\mathrm{kg}', explain });
const S_MUS = { key: 'mus', label: 'Static coefficient $\\mu_s$', min: 0, max: 1.2, step: 0.01, unit: '', explain: 'Static friction can grow as large as $\\mu_s N$ to stop slipping — no larger.' };
const S_MUK = { key: 'muk', label: 'Kinetic coefficient $\\mu_k$', min: 0, max: 1, step: 0.01, unit: '', explain: 'While sliding, friction is $\\mu_k N$.' };

const SCENES = {
  floor: {
    alt: 'A block on a level floor, pulled by a rope or pushed by a pole, and its free-body diagram',
    defaults: { m: 10, F: 30, phi: 0, mus: 0.5, muk: 0.3, moving: false },
    controls: [
      { key: 'F', label: 'Applied force $F$', min: 0, max: 150, step: 1, unit: '\\mathrm{N}', explain: 'The pull of the rope (or the push of the pole).' },
      { key: 'phi', label: 'Angle $\\varphi$', min: -45, max: 75, step: 1, unit: '^\\circ', explain: 'Positive: a rope pulling up and forward. Negative: a pole pushing down and forward.' },
      S_M(1, 40, 'Sets the weight $mg$ the floor must hold up.'), S_MUS, S_MUK,
    ],
    solve: (P) => MF.floor(P),
    bounds: () => [[-2.6, 2.6], [-0.4, 2.3]],
    draw(pl, P, sol) {
      ground(pl, -2.6, 2.6, 0);
      const w = 1.3, h = 0.95;
      block(pl, 0, h / 2, w, h, 0, massText(P.m), 'accent');
      if (P.F > 0) agentLine(pl, P.phi >= 0 ? [w / 2, h / 2] : [-w / 2, h * 0.72], P.phi, P.phi >= 0 ? 'rope' : 'pole');
      const st = sol.info.state;
      if (st === 'sliding') motion(pl, -0.45, h + 0.35, 0.9, 0, 'v');
      const status = { rest: 'At rest: no push, so no friction', static: 'At rest: static friction balances the applied force', sliding: sol.info.a > 1e-6 ? 'Sliding, speeding up' : sol.info.a < -1e-6 ? 'Sliding, slowing down' : 'Sliding at constant velocity', lifts: 'Lifted off the floor: N = 0' }[st];
      return { anchors: [[0, h / 2]], sizes: [[w / 2, h / 2]], status };
    },
    readout: (P, s) => [['normal force $N$', tN(s.info.N)], ['friction', `${tN(Math.abs(s.info.f))}${s.info.kinetic ? '\\ (\\mu_k N)' : ''}`], ['max static friction $\\mu_s N$', tN(s.info.fsMax)], ['acceleration', tA(s.info.a)]],
  },

  incline: {
    alt: 'A block on a slope, and its free-body diagram',
    defaults: { m: 5, theta: 25, mus: 0.5, muk: 0.35, F: 0, moving: 0 },
    controls: [
      { key: 'theta', label: 'Slope angle $\\theta$', min: 0, max: 60, step: 0.5, unit: '^\\circ', explain: 'Steeper slopes pull harder down the slope ($mg\\sin\\theta$) and press less into it ($mg\\cos\\theta$).' },
      S_M(1, 20), S_MUS, S_MUK,
      { key: 'F', label: 'Pull up the slope $F$', min: 0, max: 150, step: 1, unit: '\\mathrm{N}', explain: 'A rope pulling parallel to the slope.' },
    ],
    solve: (P) => MF.incline(P),
    bounds(P) { const g = inclineGeom(P.theta); return [[-g.b / 2 - 0.35, g.b / 2 + 0.55], [-0.4, g.h + 1.25]]; },
    draw(pl, P, sol) {
      const g = inclineGeom(P.theta);
      ground(pl, -g.b / 2 - 0.35, g.b / 2 + 0.55, 0);
      pl.path([[-g.b / 2, 0], [g.b / 2, 0], [g.b / 2, g.h]], { close: true, color: 'ink3', width: 1.6, fill: 'ink4', fillAlpha: 0.28 });
      angleArc(pl, [-g.b / 2, 0], 0, P.theta, 0.75, `${trim(P.theta)}°`);
      const q = g.at(0.5), bw = 1.15, bh = 0.85;
      const c = [q[0] + g.n[0] * bh / 2, q[1] + g.n[1] * bh / 2];
      block(pl, c[0], c[1], bw, bh, P.theta, massText(P.m), 'accent');
      if (P.F > 0) {
        const s = [c[0] + g.u[0] * bw / 2, c[1] + g.u[1] * bw / 2];
        agentLine(pl, s, P.theta, 'rope', 1.35);
      }
      const st = sol.info.state;
      if (st !== 'static') { const s0 = [c[0] - g.u[0] * 0.45 + g.n[0] * (bh / 2 + 0.32), c[1] - g.u[1] * 0.45 + g.n[1] * (bh / 2 + 0.32)]; const d = st === 'up' ? 1 : -1; motion(pl, s0[0] - (d < 0 ? -0.9 * g.u[0] : 0), s0[1] - (d < 0 ? -0.9 * g.u[1] : 0), d * 0.9 * g.u[0], d * 0.9 * g.u[1], 'v'); }
      const status = st === 'static' ? (Math.abs(sol.info.f) < 1e-9 ? 'At rest: nothing to resist' : 'At rest: static friction holds it') : `Sliding ${st} the slope${Math.abs(sol.info.a) < 1e-6 ? ' at constant velocity' : (sol.info.a > 0) === (st === 'up') ? ', speeding up' : ', slowing down'}`;
      return { anchors: [c], sizes: [[0.45, 0.45]], status };
    },
    readout: (P, s) => [['$mg\\sin\\theta$ (down the slope)', tN(s.info.Wpar)], ['normal force $N = mg\\cos\\theta$', tN(s.info.N)], ['friction', `${tN(Math.abs(s.info.f))}${s.info.kinetic ? '\\ (\\mu_k N)' : ''}`], ['acceleration along the slope', tA(s.info.a)]],
  },

  hang: {
    alt: 'A mass hanging from two ropes, and its free-body diagram',
    defaults: { m: 10, th1: 40, th2: 40, a: 0, ropes: 2 },
    controls: [
      { key: 'th1', label: 'Rope 1 angle $\\theta_1$', min: 3, max: 90, step: 1, unit: '^\\circ', explain: 'Measured up from the horizontal. Flatter ropes must pull harder.' },
      { key: 'th2', label: 'Rope 2 angle $\\theta_2$', min: 0, max: 90, step: 1, unit: '^\\circ', explain: 'Measured up from the horizontal; 0° is a sideways pull.' },
      S_M(1, 50),
      { key: 'a', label: 'Acceleration $a$ (up +)', min: -5, max: 5, step: 0.1, unit: '\\mathrm{m/s^2}', explain: 'Zero when hanging still or moving at constant velocity.' },
    ],
    solve: (P) => MF.hang(P),
    bounds: () => [[-3.4, 3.4], [-0.25, 3.35]],
    draw(pl, P, sol) {
      const hook = [0, 1.42], top = 3.1, side = 3.2;
      const ends = P.ropes === 1 ? [[0, top]] : [ropeEnd(hook, 180 - P.th1, top, side), ropeEnd(hook, P.th2, top, side)];
      const onCeil = ends.filter((e) => Math.abs(e[1] - top) < 1e-9).map((e) => e[0]);
      if (onCeil.length) ceiling(pl, Math.min(...onCeil, -0.6) - 0.5, Math.max(...onCeil, 0.6) + 0.5, top);
      for (const e of ends) if (Math.abs(e[1] - top) > 1e-9) wall(pl, e[0], e[1] - 0.7, e[1] + 0.7, e[0] < 0 ? -1 : 1);
      for (const e of ends) pl.line(hook[0], hook[1], e[0], e[1], { color: 'ink2', width: 2.2 });
      block(pl, 0, 0.78, 1.0, 0.84, 0, massText(P.m), 'accent');
      pl.circle(hook[0], hook[1] - 0.1, 0.1, { color: 'ink2', width: 2 });
      if (P.ropes !== 1) {
        pl.line(hook[0] - 1.05, hook[1], hook[0] + 1.05, hook[1], { color: 'ink4', width: 1.2, dash: [4, 4] });
        if (P.th1 < 89.5) angleArc(pl, hook, 180 - P.th1, 180, 0.62, `θ₁ = ${trim(P.th1)}°`, 'left');
        if (P.th2 > 0.5 && P.th2 < 89.5) angleArc(pl, hook, 0, P.th2, 0.62, `θ₂ = ${trim(P.th2)}°`);
      }
      if (Math.abs(P.a) > 1e-9) motion(pl, 1.05, 0.78 - 0.4 * Math.sign(P.a), 0, 0.8 * Math.sign(P.a), 'a', 'gold');
      return { anchors: [[0, 0.78]], sizes: [[0.5, 0.42]], status: Math.abs(P.a) > 1e-9 ? `Accelerating ${P.a > 0 ? 'up' : 'down'} at ${trim(Math.abs(P.a))} m/s²` : 'Hanging still' };
    },
    readout: (P, s) => (P.ropes === 1 ? [['tension $T$', tN(s.info.T)], ['weight $mg$', tN(P.m * G)]] : [['tension $T_1$', tN(s.info.T1)], ['tension $T_2$', tN(s.info.T2)], ['weight $mg$', tN(P.m * G)], ['$T_1 / mg$', trim(s.info.T1 / (P.m * G))]]),
  },

  pulley: {
    alt: 'A load lifted by a rope and pulleys, and its free-body diagram',
    defaults: { m: 40, n: 2, a: 0 },
    controls: [
      { key: 'n', type: 'choice', label: 'Rope segments holding the load', options: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], explain: 'Each segment pulls up with the same tension $T$.' },
      S_M(5, 100),
      { key: 'a', label: 'Acceleration $a$ (up +)', min: -3, max: 3, step: 0.1, unit: '\\mathrm{m/s^2}', explain: 'Zero for a load held still or raised at constant speed.' },
    ],
    solve: (P) => MF.pulley(P),
    bounds: () => [[-2.3, 2.3], [-0.2, 3.55]],
    draw(pl, P) {
      const top = 3.3, n = P.n;
      ceiling(pl, -1.6, 1.8, top);
      const load = (cx) => block(pl, cx, 0.62, 1.1, 0.84, 0, massText(P.m), 'accent');
      let lc;
      if (n === 1) {
        wheel(pl, 0, 2.7, 0.3); pl.line(0, top, 0, 2.7, { color: 'ink3', width: 2 });
        lc = [-0.3, 0.62]; load(-0.3);
        rope(pl, [[-0.3, 1.04], [-0.3, 2.7], ...arcPts(0, 2.7, 0.3, 180, 0), [0.3, 2.7], [0.3, 1.25]]);
        hand(pl, 0.3, 1.25, -90);
      } else if (n === 2) {
        lc = [0, 0.62]; load(0);
        wheel(pl, 0, 1.5, 0.3); pl.line(0, 1.04, 0, 1.5, { color: 'ink3', width: 2 });
        wheel(pl, 0.6, 2.7, 0.3); pl.line(0.6, top, 0.6, 2.7, { color: 'ink3', width: 2 });
        rope(pl, [[-0.3, top], [-0.3, 1.5], ...arcPts(0, 1.5, 0.3, 180, 360), [0.3, 1.5], [0.3, 2.7], ...arcPts(0.6, 2.7, 0.3, 180, 0), [0.9, 2.7], [0.9, 1.3]]);
        hand(pl, 0.9, 1.3, -90);
      } else {
        lc = [0, 0.62]; load(0);
        pl.line(0, top, 0, 2.9, { color: 'ink3', width: 2 }); pl.line(0, 1.04, 0, 1.36, { color: 'ink3', width: 2 });
        pl.rect(-0.62, 2.55, 1.24, 0.35, { color: 'ink3', alpha: 0.35, width: 1.5 });
        pl.rect(-0.62, 1.36, 1.24, 0.35, { color: 'ink3', alpha: 0.35, width: 1.5 });
        for (let k = 0; k < n; k++) { const x = -0.45 + (0.9 * k) / (n - 1); pl.line(x, 1.71, x, 2.55, { color: 'ink2', width: 2 }); }
        rope(pl, [[0.62, 2.72], [0.95, 2.72], [0.95, 1.3]]);
        hand(pl, 0.95, 1.3, -90);
        pl.text('pulleys in each block drawn as one', -2.2, 0.05, { color: 'ink3', size: 10.5 });
      }
      if (Math.abs(P.a) > 1e-9) motion(pl, -1.35, 0.62 - 0.4 * Math.sign(P.a), 0, 0.8 * Math.sign(P.a), 'a', 'gold');
      return { anchors: [lc], status: `${n} rope segment${n > 1 ? 's' : ''} hold${n > 1 ? '' : 's'} the load` };
    },
    readout: (P, s) => [['tension $T$ (your pull)', tN(s.info.T)], ['weight $mg$', tN(P.m * G)], ['$T / mg$', trim(s.info.T / (P.m * G))]],
  },

  elevator: {
    alt: 'A person standing on a bathroom scale in an elevator, and their free-body diagram',
    defaults: { m: 70, a: 0, v: 0 },
    controls: [
      { key: 'a', label: 'Elevator acceleration $a$ (up +)', min: -9.8, max: 6, step: 0.1, unit: '\\mathrm{m/s^2}', explain: 'Speeding up going up, or slowing down going down: $a > 0$. At $-9.8$ the cable has snapped.' },
      S_M(30, 120, 'The person’s mass; their weight $mg$ never changes.'),
    ],
    solve: (P) => MF.elevator(P),
    bounds: () => [[-2.4, 3.0], [-0.3, 4.25]],
    draw(pl, P, sol) {
      pl.rect(-1.4, 0, 2.8, 3.2, { color: 'ink4', alpha: 0.12, stroke: false });
      pl.path([[-1.4, 0], [1.4, 0], [1.4, 3.2], [-1.4, 3.2]], { close: true, color: 'ink2', width: 2.4 });
      pl.line(0, 3.2, 0, 4.25, { color: 'ink2', width: 2 });
      pl.rect(-0.5, 0, 1.0, 0.17, { color: 'ink3', alpha: 0.8, width: 1 });
      person(pl, 0, 0.17, 'accent');
      pl.text(`scale: ${trim(sol.info.reading)} kg`, -1.3, 3.0, { color: 'ink2', size: 11.5 });
      const a = sol.bodies[0].a[1];
      if (Math.abs(a) > 1e-6) motion(pl, 2.0, 1.6 - 0.45 * Math.sign(a), 0, Math.sign(a) * Math.min(1.5, 0.45 + Math.abs(a) / 8), 'a', 'gold');
      else pl.text('a = 0', 1.7, 1.6, { color: 'gold', size: 12, weight: 650 });
      if (P.v) motion(pl, 2.6, 1.6 - 0.4 * Math.sign(P.v), 0, 0.8 * Math.sign(P.v), 'v');
      const st = sol.info.floats ? 'Free fall: the scale reads zero' : Math.abs(a) < 1e-6 ? 'No acceleration: the scale reads mg' : a > 0 ? 'Accelerating up: the scale reads more than mg' : 'Accelerating down: the scale reads less than mg';
      return { anchors: [[0, 1.15]], status: st };
    },
    readout: (P, s) => [['weight $mg$', tN(P.m * G)], ['scale reading $N$', tN(s.info.N)], ['apparent weight', `${trim(s.info.gs)}\\,g`], ['scale (in kg)', `${trim(s.info.reading)}\\,\\mathrm{kg}`]],
  },

  atwood: {
    alt: 'Two masses hanging over a pulley (an Atwood machine), and their free-body diagrams',
    defaults: { m1: 3, m2: 5 },
    controls: [
      { key: 'm1', label: 'Left mass $m_1$', min: 0.5, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: 'Hangs on the left.' },
      { key: 'm2', label: 'Right mass $m_2$', min: 0.5, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: 'Hangs on the right.' },
    ],
    solve: (P) => MF.atwood(P),
    layout: 'cols',
    bounds: () => [[-2.0, 2.0], [-0.25, 4.25]],
    draw(pl, P, sol, S) {
      const top = 4.0, cy = 3.3, r = 0.6;
      ceiling(pl, -1.0, 1.0, top);
      pl.line(0, top, 0, cy, { color: 'ink3', width: 2 });
      ground(pl, -2.0, 2.0, 0);
      const mx = Math.max(P.m1, P.m2), s1 = 0.42 + 0.42 * cbrt(P.m1 / mx), s2 = 0.42 + 0.42 * cbrt(P.m2 / mx);
      const d = S.shift || 0;
      const y1 = 1.95 + 0.3 + d, y2 = 1.95 - 0.3 - d;
      rope(pl, [[-r, y1 + s1 / 2], [-r, cy], ...arcPts(0, cy, r, 180, 0), [r, cy], [r, y2 + s2 / 2]]);
      wheel(pl, 0, cy, r);
      block(pl, -r, y1, s1, s1, 0, massText(P.m1), 'accent');
      block(pl, r, y2, s2, s2, 0, massText(P.m2), 'violet');
      const a = sol.info.a;
      if (Math.abs(a) > 1e-9) {
        const L = Math.min(0.9, 0.35 + Math.abs(a) / 8);
        motion(pl, -r - s1 / 2 - 0.32, y1 - (L / 2) * Math.sign(a), 0, L * Math.sign(a), 'a', 'gold', 'right');
        motion(pl, r + s2 / 2 + 0.32, y2 + (L / 2) * Math.sign(a), 0, -L * Math.sign(a), 'a', 'gold');
      }
      return { anchors: [[-r, y1], [r, y2]], status: Math.abs(a) < 1e-9 ? 'Balanced: no acceleration' : `${a > 0 ? 'Right' : 'Left'} side goes down` };
    },
    limits(P, s, d) { const mx = Math.max(P.m1, P.m2), s1 = 0.42 + 0.42 * cbrt(P.m1 / mx), s2 = 0.42 + 0.42 * cbrt(P.m2 / mx); const y1 = 2.25 + d, y2 = 1.65 - d; return y1 + s1 / 2 < 2.6 && y2 + s2 / 2 < 2.6 && y1 - s1 / 2 > 0.04 && y2 - s2 / 2 > 0.04; },
    readout: (P, s) => [['acceleration $a$', tA(Math.abs(s.info.a))], ['tension $T$', tN(s.info.T)], ['$m_1 g$', tN(P.m1 * G)], ['$m_2 g$', tN(P.m2 * G)]],
  },

  table: {
    alt: 'A block on a table (or a slope) tied over a pulley to a hanging mass, and their free-body diagrams',
    defaults: { m1: 4, m2: 2, mus: 0, muk: 0, theta: 0, moving: false },
    controls: [
      { key: 'm1', label: 'Block on the surface $m_1$', min: 0.5, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: 'Slides on the table or slope.' },
      { key: 'm2', label: 'Hanging mass $m_2$', min: 0.1, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: 'Its weight drives the system.' },
      S_MUS, S_MUK,
      { key: 'theta', label: 'Surface angle $\\theta$', min: 0, max: 60, step: 0.5, unit: '^\\circ', explain: '0° is a level table; otherwise a slope rising toward the pulley.' },
    ],
    solve: (P) => MF.table(P),
    layout: 'cols',
    bounds(P) { const g = tableGeom(P); return [[g.P0[0] - 0.3, g.C[0] + g.r + 0.95], [-0.25, Math.max(g.P1[1], g.C[1] + g.r) + 0.75]]; },
    draw(pl, P, sol, S) {
      const g = tableGeom(P), d = S.shift || 0;
      ground(pl, g.P0[0] - 0.3, g.C[0] + g.r + 0.95, 0);
      pl.path([[g.P0[0], 0], g.P0, g.P1, [g.P1[0], 0]], { close: true, color: 'ink3', width: 1.6, fill: 'ink4', fillAlpha: 0.28 });
      if (P.theta > 0) { pl.line(g.P0[0], g.P0[1], g.P0[0] + 1.0, g.P0[1], { color: 'ink4', width: 1.2, dash: [4, 4] }); angleArc(pl, g.P0, 0, P.theta, 0.7, `${trim(P.theta)}°`); }
      pl.line(g.P1[0], g.P1[1], g.C[0], g.C[1], { color: 'ink3', width: 2 });
      const s1 = g.s1 + d, c1 = [g.P0[0] + g.u[0] * s1 + g.n[0] * g.h1 / 2, g.P0[1] + g.u[1] * s1 + g.n[1] * g.h1 / 2];
      const front = [c1[0] + g.u[0] * g.w1 / 2, c1[1] + g.u[1] * g.w1 / 2];
      const y2 = g.y2 - d, top2 = y2 + g.h2 / 2;
      rope(pl, [front, g.T1, ...arcPts(g.C[0], g.C[1], g.r, 90 + P.theta, 0), [g.C[0] + g.r, g.C[1]], [g.C[0] + g.r, top2]]);
      wheel(pl, g.C[0], g.C[1], g.r);
      block(pl, c1[0], c1[1], g.w1, g.h1, P.theta, massText(P.m1), 'accent');
      block(pl, g.C[0] + g.r, y2, g.w2, g.h2, 0, massText(P.m2), 'violet');
      const a = sol.info.a;
      if (Math.abs(a) > 1e-9) motion(pl, g.C[0] + g.r + g.w2 / 2 + 0.3, y2 + 0.35 * Math.sign(a), 0, -0.7 * Math.sign(a), 'a', 'gold');
      const st = sol.info.state === 'static' ? (Math.abs(sol.info.f) < 1e-9 ? 'Balanced' : 'Held by static friction') : Math.abs(a) < 1e-9 ? 'Sliding at constant velocity' : a > 0 ? 'The hanging mass descends' : 'The hanging mass rises';
      return { anchors: [c1, [g.C[0] + g.r, y2]], status: st };
    },
    limits(P, s, d) { const g = tableGeom(P); return g.s1 + d - g.w1 / 2 > 0.05 && g.s1 + d + g.w1 / 2 < g.Ls - 0.05 && g.y2 - d - g.h2 / 2 > 0.04 && g.y2 - d + g.h2 / 2 < g.C[1] - g.r - 0.1; },
    readout: (P, s) => [['acceleration $a$', tA(Math.abs(s.info.a))], ['tension $T$', tN(s.info.T)], ['friction on $m_1$', `${tN(Math.abs(s.info.f))}${s.info.kinetic && P.muk > 0 ? '\\ (\\mu_k N)' : ''}`], ['$m_2 g$', tN(P.m2 * G)]],
  },

  pair: {
    alt: 'Two blocks pushed (or pulled) together across a floor, and the free-body diagram of each',
    defaults: { m1: 4, m2: 2, F: 18, muk: 0, link: 'push' },
    controls: [
      { key: 'F', label: 'Applied force $F$', min: 0, max: 60, step: 0.5, unit: '\\mathrm{N}', explain: 'Pushes the rear block (or pulls the front one).' },
      { key: 'm1', label: 'Rear block $m_1$', min: 0.5, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: 'The block the hand acts on when pushing.' },
      { key: 'm2', label: 'Front block $m_2$', min: 0.5, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: 'Pushed along only by the rear block.' },
      { key: 'link', type: 'choice', label: 'Arrangement', options: [['push', 'Push'], ['pull', 'Pull']], explain: 'Push the rear block, or pull the front one with a rope.' },
    ],
    solve: (P) => MF.pair(P),
    layout: 'rows',
    bounds: () => [[-3.4, 3.4], [-0.45, 1.95]],
    draw(pl, P, sol) {
      ground(pl, -3.4, 3.4, 0);
      const mx = Math.max(P.m1, P.m2), w1 = 0.62 + 0.5 * cbrt(P.m1 / mx), w2 = 0.62 + 0.5 * cbrt(P.m2 / mx), h1 = w1 * 0.82, h2 = w2 * 0.82;
      let x1, x2;
      if (P.link === 'push') {
        x1 = -1.5 + w1 / 2; x2 = -1.5 + w1 + w2 / 2;
        if (P.F > 0) agentLine(pl, [-1.5, h1 / 2], 0, 'pole', 1.6);
      } else {
        x1 = -2.5 + w1 / 2; x2 = -2.5 + w1 + 0.75 + w2 / 2;
        pl.line(-2.5 + w1, h1 / 2, x2 - w2 / 2, Math.min(h1, h2) / 2, { color: 'ink2', width: 2 });
        if (P.F > 0) agentLine(pl, [x2 + w2 / 2, h2 / 2], 0, 'rope', 1.4);
      }
      block(pl, x1, h1 / 2, w1, h1, 0, massText(P.m1), 'accent');
      block(pl, x2, h2 / 2, w2, h2, 0, massText(P.m2), 'violet');
      if (Math.abs(sol.info.a) > 1e-9 || P.muk > 0) motion(pl, (x1 + x2) / 2 - 0.45, Math.max(h1, h2) + 0.38, 0.9, 0, 'v');
      return { anchors: [[x1, h1 / 2], [x2, h2 / 2]], status: P.link === 'push' ? 'The rear block pushes the front one' : 'A rope links the blocks' };
    },
    readout: (P, s) => [['acceleration $a$', tA(s.info.a)], P.link === 'push' ? ['contact force $P$', tN(s.info.P)] : ['rope tension $T$', tN(s.info.T)], ['applied force $F$', tN(P.F)]],
  },

  banked: {
    alt: 'A car on a banked curve seen from behind, and its free-body diagram',
    defaults: { m: 1200, v: 20, R: 80, theta: 15, mus: 0.5 },
    controls: [
      { key: 'v', label: 'Speed $v$', min: 0, max: 45, step: 0.5, unit: '\\mathrm{m/s}', explain: 'The car needs a net inward force $mv^2/R$.' },
      { key: 'theta', label: 'Bank angle $\\theta$', min: 0, max: 45, step: 0.5, unit: '^\\circ', explain: 'Tilting the road lets the normal force point partly toward the centre.' },
      { key: 'R', label: 'Radius $R$', min: 20, max: 300, step: 1, unit: '\\mathrm{m}', explain: 'Radius of the curve.' },
      { ...S_MUS, max: 1.0, explain: 'Tyre grip: friction along the road can be at most $\\mu_s N$.' },
      { key: 'm', label: 'Mass $m$', min: 800, max: 2500, step: 10, unit: '\\mathrm{kg}', explain: 'Every force scales with $m$, so the speeds that work do not depend on it.' },
    ],
    solve: (P) => MF.banked(P),
    bounds: () => [[-3.3, 3.3], [-2.0, 2.45]],
    draw(pl, P, sol) {
      const th = P.theta, u = [Math.cos(th * D2R), Math.sin(th * D2R)], n = [-u[1], u[0]];
      const A = [-2.9 * u[0], -2.9 * u[1]], B = [2.9 * u[0], 2.9 * u[1]], low = Math.min(A[1], B[1]) - 0.55;
      pl.path([A, B, [B[0], low], [A[0], low]], { close: true, color: 'ink3', width: 1.6, fill: 'ink4', fillAlpha: 0.28 });
      pl.line(A[0], A[1], A[0] + 1.3, A[1], { color: 'ink4', width: 1.2, dash: [4, 4] });
      if (th > 0) angleArc(pl, A, 0, th, 0.95, `${trim(th)}°`);
      carRear(pl, [0, 0], th);
      const cm = [0.62 * n[0], 0.62 * n[1]];
      pl.line(cm[0] - 0.95, cm[1], -3.15, cm[1], { color: 'gold', width: 1.3, dash: [5, 5] });
      pl.arrow(-2.4, cm[1], -3.2, cm[1], { color: 'gold', width: 1.6, head: 8 });
      pl.text('to the centre of the curve', -3.2, cm[1] + 0.32, { color: 'gold', size: 11 });
      const i = sol.info, st = !i.holds ? (i.slides > 0 ? 'Too fast: the car slides up and out' : 'Too slow: the car slides down and in') : Math.abs(i.f) < 1e-6 * P.m ? 'At the design speed: no friction needed' : i.f > 0 ? 'Friction points up the slope' : 'Friction points down the slope';
      return { anchors: [cm], status: st };
    },
    readout: (P, s) => [['needed $mv^2/R$', tN((P.m * P.v * P.v) / P.R)], ['normal force $N$', tN(s.info.N)], ['friction needed', `${tN(Math.abs(s.info.need))}${s.info.holds ? '' : '\\ (\\text{more than }\\mu_s N)'}`], ['no-friction speed', tV(s.info.v0)], ['speeds that hold', `${trim(s.info.vmin)}\\text{–}${Number.isFinite(s.info.vmax) ? trim(s.info.vmax) : '\\infty'}\\,\\mathrm{m/s}`]],
  },

  crest: {
    alt: 'A car on a curved road or in a loop, and its free-body diagram',
    defaults: { m: 1000, v: 12, R: 20, where: 'hill' },
    controls: [
      { key: 'v', label: 'Speed $v$', min: 0, max: 30, step: 0.5, unit: '\\mathrm{m/s}', explain: 'Faster means a bigger inward force $mv^2/R$ is needed.' },
      { key: 'R', label: 'Radius $R$', min: 5, max: 60, step: 0.5, unit: '\\mathrm{m}', explain: 'Radius of the curve of the road or loop.' },
      { key: 'where', type: 'choice', label: 'Where', options: [['hill', 'Hill top'], ['dip', 'Dip'], ['loop-top', 'Loop top'], ['loop-bottom', 'Loop bottom']], explain: 'The centre of the circle is below the car on a hill top or at a loop’s top, above it in a dip or at a loop’s bottom.' },
    ],
    solve: (P) => MF.crest(P),
    bounds: (P) => (P.where === 'hill' ? [[-3.2, 3.2], [-3.1, 1.5]] : P.where === 'dip' ? [[-3.2, 3.2], [-0.7, 3.1]] : [[-3.3, 3.3], [-3.0, 3.0]]),
    draw(pl, P, sol) {
      const Rv = 2.6, w = P.where;
      let c, carAt, flip = false;
      if (w === 'hill') {
        c = [0, -Rv]; carAt = [0, 0];
        pl.path([...arcPts(0, -Rv, Rv, 140, 40), [3.2, -3.1], [-3.2, -3.1]], { close: true, color: 'ink3', width: 1.6, fill: 'ink4', fillAlpha: 0.28 });
      } else if (w === 'dip') {
        c = [0, Rv]; carAt = [0, 0];
        pl.path([...arcPts(0, Rv, Rv, 220, 320), [3.2, -0.7], [-3.2, -0.7]], { close: true, color: 'ink3', width: 1.6, fill: 'ink4', fillAlpha: 0.28 });
      } else {
        c = [0, 0];
        pl.circle(0, 0, Rv, { color: 'ink3', width: 5 });
        carAt = w === 'loop-top' ? [0, Rv] : [0, -Rv]; flip = w === 'loop-top';
      }
      pl.point(c[0], c[1], { color: 'ink3', r: 3.5 });
      pl.text('centre', c[0] + 0.15, c[1] + (w === 'dip' ? 0.25 : -0.25), { color: 'ink3', size: 11 });
      pl.line(c[0], c[1], carAt[0] + (w === 'hill' || w === 'dip' ? 0 : 0), carAt[1], { color: 'ink4', width: 1.2, dash: [4, 4] });
      const cm = carSide(pl, carAt, flip);
      motion(pl, cm[0] - 0.4, cm[1] + (flip ? -0.75 : 0.75), flip ? -0.8 : 0.8, 0, 'v');
      const i = sol.info, st = i.N === 0 ? (w === 'hill' ? 'Faster than √(gR): the car leaves the road' : 'Slower than √(gR): the car falls from the track') : `The ${w.startsWith('loop') ? 'track' : 'road'} pushes with N = ${trim(i.apparent)} mg`;
      return { anchors: [cm], status: st };
    },
    readout: (P, s) => [['weight $mg$', tN(P.m * G)], ['normal force $N$', tN(s.info.N)], ['needed $mv^2/R$', tN((P.m * P.v * P.v) / P.R)], ['$\\sqrt{gR}$', tV(s.info.vcrit)]],
  },

  turn: {
    alt: 'An aircraft banked in a level turn seen from behind, and its free-body diagram',
    defaults: { m: 70000, v: 120, phi: 25 },
    controls: [
      { key: 'phi', label: 'Bank angle $\\varphi$', min: 5, max: 70, step: 0.5, unit: '^\\circ', explain: 'The lift tilts with the wings; its sideways part turns the aircraft.' },
      { key: 'v', label: 'Airspeed $v$', min: 50, max: 250, step: 1, unit: '\\mathrm{m/s}', explain: 'Faster turns need a bigger radius at the same bank.' },
    ],
    solve: (P) => MF.turn(P),
    bounds: () => [[-3.4, 3.4], [-1.7, 2.3]],
    draw(pl, P) {
      pl.line(-3.3, 0, 3.3, 0, { color: 'ink4', width: 1.2, dash: [4, 4] });
      pl.line(0, -1.5, 0, 2.1, { color: 'ink4', width: 1.2, dash: [4, 4] });
      planeRear(pl, P.phi);
      angleArc(pl, [0, 0], 90, 90 + P.phi, 1.5, `${trim(P.phi)}°`, 'left');
      pl.arrow(-2.3, -1.15, -3.25, -1.15, { color: 'gold', width: 1.6, head: 8 });
      pl.text('to the centre of the turn', -3.25, -1.45, { color: 'gold', size: 11 });
      return { anchors: [[0, 0]], status: 'Level turn: height stays constant' };
    },
    readout: (P, s) => [['lift $L$', tN(s.info.L)], ['weight $mg$', tN(P.m * G)], ['load factor $L/mg$', trim(s.info.n)], ['turn radius', `${texNum(s.info.R)}\\,\\mathrm{m}`]],
  },

  body: {
    alt: 'A body with the forces acting on it',
    defaults: { forces: [], icon: 'block', ground: false, wall: false },
    controls: [],
    solve: (P) => MF.body(P),
    bounds: () => [[-3, 3], [-1.7, 1.7]],
    draw(pl, P) {
      const ext = icon(pl, P.icon, P);
      if (P.ground) ground(pl, -2.6, 2.6, -ext[1]);
      if (P.wall) wall(pl, P.wall === 'left' ? -ext[0] : ext[0], -1.2, 1.2, P.wall === 'left' ? -1 : 1);
      if (P.agent) { const d = [Math.cos(P.agent.dir * D2R), Math.sin(P.agent.dir * D2R)], e = Math.min(Math.abs(d[0]) > 1e-9 ? ext[0] / Math.abs(d[0]) : Infinity, Math.abs(d[1]) > 1e-9 ? ext[1] / Math.abs(d[1]) : Infinity); const pull = P.agent.kind === 'rope'; agentLine(pl, [(pull ? 1 : -1) * d[0] * e, (pull ? 1 : -1) * d[1] * e], P.agent.dir, pull ? 'rope' : 'pole', 1.3); }
      if (P.v) { const L = Math.hypot(...P.v) || 1, d = [P.v[0] / L, P.v[1] / L], mid = ext[0] > 1.2 ? [0, ext[1] + 0.25 + 0.45 * Math.abs(d[1])] : [ext[0] + 0.5 + 0.45 * Math.abs(d[0]), 0]; motion(pl, mid[0] - 0.45 * d[0], mid[1] - 0.45 * d[1], 0.9 * d[0], 0.9 * d[1], 'v'); }
      return { anchors: [[0, 0]], sizes: [ext], status: P.status || '' };
    },
    readout: () => [],
  },
};

// geometry shared by a scene's drawing and its animation limits
function inclineGeom(theta) {
  const L = 5.2, th = theta * D2R, b = L * Math.cos(th), h = L * Math.sin(th);
  const u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
  return { L, b, h, u, n, at: (q) => [-b / 2 + q * L * u[0], q * L * u[1]] };
}
function tableGeom(P) {
  const th = P.theta * D2R, u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
  const Ls = 4.2, mx = Math.max(P.m1, P.m2);
  const w1 = 0.55 + 0.42 * cbrt(P.m1 / mx), h1 = w1 * 0.8, w2 = 0.45 + 0.4 * cbrt(P.m2 / mx), h2 = w2 * 0.85;
  const y0 = P.theta === 0 ? 2.2 : Math.max(0.55, 2.3 - Ls * Math.sin(th));
  const P0 = [-3, y0], P1 = [P0[0] + Ls * u[0], P0[1] + Ls * u[1]];
  const r = 0.27, hr = h1 / 2;
  const C = [P1[0] + (hr - r) * n[0] + r * u[0], P1[1] + (hr - r) * n[1] + r * u[1]];
  const T1 = [C[0] + r * n[0], C[1] + r * n[1]];
  return { u, n, Ls, w1, h1, w2, h2, P0, P1, r, C, T1, s1: 1.0, y2: Math.max(h2 / 2 + 0.25, C[1] - 1.5) };
}

// ─── drawing helpers (world coordinates) ──────────────────────────────────
function ground(pl, x0, x1, y) {
  pl.line(x0, y, x1, y, { color: 'ink3', width: 2 });
  const step = (pl.vx1 - pl.vx0) / 40;
  for (let x = x0 + step; x < x1; x += step) pl.line(x, y, x - step * 0.8, y - step * 0.8, { color: 'ink4', width: 1 });
}
function ceiling(pl, x0, x1, y) {
  pl.line(x0, y, x1, y, { color: 'ink3', width: 2 });
  const step = (pl.vx1 - pl.vx0) / 40;
  for (let x = x0 + step; x < x1; x += step) pl.line(x, y, x - step * 0.8, y + step * 0.8, { color: 'ink4', width: 1 });
}
function wall(pl, x, y0, y1, side) {
  pl.line(x, y0, x, y1, { color: 'ink3', width: 2 });
  const step = (pl.vx1 - pl.vx0) / 40;
  for (let y = y0 + step; y < y1; y += step) pl.line(x, y, x + side * step * 0.8, y - step * 0.8, { color: 'ink4', width: 1 });
}
function block(pl, cx, cy, w, h, deg, label, color) {
  const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R);
  const P = (a, b) => [cx + a * c - b * s, cy + a * s + b * c];
  pl.path([P(-w / 2, -h / 2), P(w / 2, -h / 2), P(w / 2, h / 2), P(-w / 2, h / 2)], { close: true, color, width: 1.5, fill: color, fillAlpha: 0.85 });
  if (label) pl.text(label, cx, cy, { color: '#fff', size: 11.5, weight: 650, align: 'center', halo: false });
}
function wheel(pl, x, y, r) {
  pl.circle(x, y, r, { fill: 'panel', color: 'ink2', width: 2 });
  pl.point(x, y, { color: 'ink2', r: 2.5 });
}
function rope(pl, pts) { pl.path(pts, { color: 'ink2', width: 2 }); }
function arcPts(cx, cy, r, d0, d1, n = 24) {
  const out = [];
  for (let k = 0; k <= n; k++) { const d = (d0 + ((d1 - d0) * k) / n) * D2R; out.push([cx + r * Math.cos(d), cy + r * Math.sin(d)]); }
  return out;
}
function angleArc(pl, [x, y], d0, d1, r, label, side) {
  pl.path(arcPts(x, y, r, d0, d1), { color: 'gold', width: 1.6 });
  if (!label) return;
  const m = ((d0 + d1) / 2) * D2R, lr = r + 0.18;
  pl.text(label, x + lr * Math.cos(m), y + lr * Math.sin(m), { color: 'gold', size: 11.5, weight: 600, align: side === 'left' ? 'right' : 'left' });
}
// the end of a rope leaving `from` at `deg`: on the ceiling at y = top, or on a side wall at x = ±side
function ropeEnd(from, deg, top, side) {
  const d = [Math.cos(deg * D2R), Math.sin(deg * D2R)];
  if (d[1] > 1e-6) { const t = (top - from[1]) / d[1], x = from[0] + t * d[0]; if (Math.abs(x) <= side) return [x, top]; }
  const t = (side - Math.sign(d[0]) * from[0]) / Math.abs(d[0]);
  return [from[0] + t * d[0], from[1] + t * d[1]];
}
// a rope pulling (or a pole pushing) at `deg`: drawn from the attachment point out to a hand
function agentLine(pl, at, deg, kind, len = 1.7) {
  const d = [Math.cos(deg * D2R), Math.sin(deg * D2R)];
  if (kind === 'rope') {
    const e = [at[0] + len * d[0], at[1] + len * d[1]];
    pl.line(at[0], at[1], e[0], e[1], { color: 'ink2', width: 2 });
    pl.circle(e[0], e[1], 0.1, { fill: 'ink2', color: 'ink2', width: 1 });
  } else {
    const s = [at[0] - len * d[0], at[1] - len * d[1]];
    pl.line(s[0], s[1], at[0], at[1], { color: 'ink3', width: 6 });
    pl.circle(s[0], s[1], 0.12, { fill: 'ink3', color: 'ink3', width: 1 });
  }
}
function hand(pl, x, y, deg) {
  pl.circle(x, y, 0.1, { fill: 'ink2', color: 'ink2', width: 1 });
  motion(pl, x + 0.28, y, 0.6 * Math.cos(deg * D2R), 0.6 * Math.sin(deg * D2R), 'pull', 'ink3');
}
// a thin arrow in the picture for a velocity or an acceleration (not a force)
function motion(pl, x, y, dx, dy, label, color = 'good', align) {
  pl.arrow(x, y, x + dx, y + dy, { color, width: 2, head: 8, dash: color === 'gold' ? [5, 4] : [] });
  const L = Math.hypot(dx, dy) || 1;
  const vertical = Math.abs(dy) > Math.abs(dx);
  pl.text(label, x + dx + (vertical ? (align === 'right' ? -0.12 : 0.12) : (dx / L) * 0.1), y + dy + (vertical ? 0 : 0.18), { color, size: 12, weight: 650, align: vertical ? (align === 'right' ? 'right' : 'left') : dx > 0 ? 'left' : 'right' });
}
function person(pl, x, y0, color) {
  const g = (pts, w = 4.5) => pl.path(pts.map(([a, b]) => [x + a, y0 + b]), { color, width: w });
  g([[-0.2, 0], [0, 0.8], [0.2, 0]]);
  g([[0, 0.8], [0, 1.62]]);
  g([[-0.36, 1.05], [0, 1.45], [0.36, 1.05]], 3.5);
  pl.circle(x, y0 + 1.86, 0.2, { fill: color, color, width: 1 });
}
function carRear(pl, at, deg) {
  const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R);
  const P = (a, b) => [at[0] + a * c - b * s, at[1] + a * s + b * c];
  for (const a of [-0.68, 0.68]) pl.path([P(a - 0.17, 0), P(a + 0.17, 0), P(a + 0.17, 0.36), P(a - 0.17, 0.36)], { close: true, color: 'ink2', width: 1, fill: 'ink2', fillAlpha: 1 });
  pl.path([P(-0.95, 0.2), P(0.95, 0.2), P(0.95, 0.78), P(-0.95, 0.78)], { close: true, color: 'accent', width: 1.5, fill: 'accent', fillAlpha: 0.85 });
  pl.path([P(-0.68, 0.78), P(0.68, 0.78), P(0.5, 1.22), P(-0.5, 1.22)], { close: true, color: 'accent', width: 1.5, fill: 'accent', fillAlpha: 0.55 });
  for (const a of [-0.75, 0.75]) pl.circle(...P(a, 0.5), 0.09, { fill: 'bad', color: 'bad', width: 1 });
}
function carSide(pl, at, flip) {
  const k = flip ? -1 : 1, P = (a, b) => [at[0] + k * a, at[1] + k * b];
  pl.path([P(-1.0, 0.2), P(1.0, 0.2), P(1.0, 0.62), P(-1.0, 0.62)], { close: true, color: 'accent', width: 1.5, fill: 'accent', fillAlpha: 0.85 });
  pl.path([P(-0.55, 0.62), P(0.45, 0.62), P(0.25, 0.98), P(-0.4, 0.98)], { close: true, color: 'accent', width: 1.5, fill: 'accent', fillAlpha: 0.55 });
  for (const a of [-0.6, 0.6]) pl.circle(...P(a, 0.19), 0.19, { fill: 'ink2', color: 'ink2', width: 1 });
  return P(0, 0.5);
}
function planeRear(pl, deg) {
  const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R);
  const P = (a, b) => [a * c - b * s, a * s + b * c];
  pl.path([P(-2.3, -0.06), P(2.3, -0.06), P(2.3, 0.06), P(-2.3, 0.06)], { close: true, color: 'accent', width: 1.5, fill: 'accent', fillAlpha: 0.85 });
  pl.path([P(-0.75, 0.42), P(0.75, 0.42), P(0.75, 0.5), P(-0.75, 0.5)], { close: true, color: 'accent', width: 1.2, fill: 'accent', fillAlpha: 0.7 });
  pl.path([P(-0.05, 0.3), P(0.05, 0.3), P(0.05, 1.15), P(-0.05, 1.15)], { close: true, color: 'accent', width: 1.2, fill: 'accent', fillAlpha: 0.85 });
  pl.circle(0, 0, 0.32, { fill: 'accent', color: 'accent', width: 1.2 });
  for (const a of [-0.95, 0.95]) pl.circle(...P(a, -0.22), 0.14, { fill: 'ink2', color: 'ink2', width: 1 });
}

// icons for the generic body scene, centred on the origin; returns the half-extent [w/2, h/2]
function icon(pl, kind, P) {
  const fill = (pts, color = 'accent', alpha = 0.85) => pl.path(pts, { close: true, color, width: 1.4, fill: color, fillAlpha: alpha });
  switch (kind) {
    case 'ball': pl.circle(0, 0, 0.5, { fill: 'accent', color: 'accent', width: 1.4 }); if (P.m) pl.text(massText(P.m), 0, 0, { color: '#fff', size: 11, weight: 650, align: 'center', halo: false }); return [0.5, 0.5];
    case 'puck': fill([[-0.65, -0.14], [0.65, -0.14], [0.65, 0.14], [-0.65, 0.14]], 'ink2', 1); return [0.65, 0.14];
    case 'rocket':
      if (P.flame) fill([[-0.16, -0.95], [0.16, -0.95], [0, -1.6]], 'warn', 0.9);
      fill([[-0.24, -0.95], [0.24, -0.95], [0.24, 0.55], [-0.24, 0.55]]);
      fill([[-0.24, 0.55], [0.24, 0.55], [0, 1.1]]);
      fill([[-0.24, -0.95], [-0.5, -1.1], [-0.24, -0.45]], 'accent', 0.6); fill([[0.24, -0.95], [0.5, -1.1], [0.24, -0.45]], 'accent', 0.6);
      return [0.3, 1.0];
    case 'person': person(pl, 0, -1.05, 'accent'); return [0.4, 1.05];
    case 'car': { carSide(pl, [0, -0.55], false); return [1.0, 0.55]; }
    case 'plane':
      fill([[-1.5, -0.12], [1.2, -0.12], [1.55, 0.02], [1.2, 0.16], [-1.5, 0.16]]);
      fill([[-0.25, 0.0], [0.35, 0.0], [-0.05, -0.55], [-0.4, -0.55]], 'accent', 0.6);
      fill([[-1.5, 0.16], [-1.15, 0.16], [-1.42, 0.62], [-1.62, 0.62]], 'accent', 0.7);
      return [1.55, 0.6];
    case 'capsule':
      if (P.chute) {
        pl.path(arcPts(0, 0.95, 1.05, 10, 170), { color: 'warn', width: 2.4 });
        pl.path([[-1.03, 1.13], ...arcPts(0, 0.95, 1.05, 170, 10), [1.03, 1.13]], { close: true, color: 'warn', width: 1, fill: 'warn', fillAlpha: 0.3 });
        for (const x of [-1.0, -0.4, 0.4, 1.0]) pl.line(x, 1.1 + (Math.abs(x) < 0.5 ? 0.85 : 0), 0, 0.45, { color: 'ink3', width: 1 });
      }
      fill([[-0.75, -0.45], [0.75, -0.45], [0.22, 0.42], [-0.22, 0.42]]);
      fill([[-0.8, -0.55], [0.8, -0.55], [0.75, -0.45], [-0.75, -0.45]], 'ink2', 1);
      return [0.8, 0.55];
    case 'skydiver': {
      const c = 'accent';
      pl.path([[-0.75, 0.05], [0.5, 0.05]], { color: c, width: 9 });
      pl.circle(0.75, 0.08, 0.2, { fill: c, color: c, width: 1 });
      pl.path([[0.35, 0.05], [0.55, 0.45], [0.9, 0.55]], { color: c, width: 4 });
      pl.path([[0.35, 0.05], [0.2, 0.45], [-0.05, 0.6]], { color: c, width: 4 });
      pl.path([[-0.7, 0.05], [-1.05, 0.35], [-1.3, 0.3]], { color: c, width: 4 });
      pl.path([[-0.7, 0.05], [-0.95, -0.2], [-1.25, -0.1]], { color: c, width: 4 });
      return [1.1, 0.5];
    }
    case 'drone':
      fill([[-0.45, -0.15], [0.45, -0.15], [0.45, 0.15], [-0.45, 0.15]]);
      pl.line(-1.0, 0.1, 1.0, 0.1, { color: 'ink2', width: 3 });
      for (const x of [-1.0, 1.0]) { pl.line(x, 0.1, x, 0.32, { color: 'ink2', width: 3 }); pl.line(x - 0.42, 0.34, x + 0.42, 0.34, { color: 'ink3', width: 3 }); }
      return [1.1, 0.35];
    case 'probe':
      fill([[-0.35, -0.35], [0.35, -0.35], [0.35, 0.35], [-0.35, 0.35]]);
      for (const k of [-1, 1]) { pl.line(0.35 * k, 0, 0.6 * k, 0, { color: 'ink2', width: 2 }); fill([[0.6 * k, -0.28], [1.5 * k, -0.28], [1.5 * k, 0.28], [0.6 * k, 0.28]], 'violet', 0.7); }
      pl.path(arcPts(0, 0.75, 0.3, 200, 340), { color: 'ink2', width: 2 });
      return [1.5, 0.75];
    case 'none': pl.point(0, 0, { color: 'ink', r: 5 }); return [0.2, 0.2];
    default: block(pl, 0, 0, 1.2, 0.9, 0, P.m ? massText(P.m) : '', 'accent'); return [0.6, 0.45];
  }
}

// ─── the free-body diagrams (screen pixels) ───────────────────────────────
function arrowPx(ctx, x0, y0, x1, y1, color, { width = 2.6, dash = [], head = 10 } = {}) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 1) return;
  const ux = (x1 - x0) / len, uy = (y1 - y0) / len, hd = Math.min(head, len * 0.45);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hd - uy * hd * 0.48, y1 - uy * hd + ux * hd * 0.48); ctx.lineTo(x1 - ux * hd + uy * hd * 0.48, y1 - uy * hd - ux * hd * 0.48); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function labelPx(ctx, text, x, y, ux, uy, color, bg, size = 12.5) {
  ctx.save();
  ctx.font = `650 ${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = ux > 0.35 ? 'left' : ux < -0.35 ? 'right' : 'center';
  ctx.textBaseline = uy > 0.35 ? 'top' : uy < -0.35 ? 'bottom' : 'middle';
  const px = x + ux * 7, py = y + uy * 7;
  ctx.lineWidth = 3.5; ctx.strokeStyle = bg; ctx.globalAlpha = 0.9; ctx.strokeText(text, px, py); ctx.globalAlpha = 1;
  ctx.fillStyle = color; ctx.fillText(text, px, py);
  ctx.restore();
}

// the direction of a force in [0, 360) degrees, and the box around a tip-to-tail chain (force units, y up)
const ang360 = (f) => ((Math.atan2(f.fy, f.fx) / D2R) + 360) % 360;
// tip-to-tail order: by direction, starting just after −ΣF, so the forces and ΣF make a convex polygon
function chainOrder(forces) {
  const net = forces.reduce((q, f) => [q[0] + f.fx, q[1] + f.fy], [0, 0]);
  const big = Math.max(1e-12, ...forces.map((f) => Math.hypot(f.fx, f.fy)));
  const start = Math.hypot(...net) > 1e-6 * big ? ((Math.atan2(-net[1], -net[0]) / D2R) + 360) % 360 : 0;
  const key = (f) => (ang360(f) - start + 360) % 360;
  return [...forces].sort((f1, f2) => key(f1) - key(f2));
}
function chainBox(chain) {
  let sx = 0, sy = 0, lo = [0, 0], hi = [0, 0];
  for (const f of chain) { sx += f.fx; sy += f.fy; lo = [Math.min(lo[0], sx), Math.min(lo[1], sy)]; hi = [Math.max(hi[0], sx), Math.max(hi[1], sy)]; }
  return [lo, hi];
}

// a label beyond an arrow's tip; if it would leave the panel [bx0, bx1], beside the tip instead (above it, or below a downward arrow)
function placeLabel(ctx, text, x, y, ux, uy, color, bg, [bx0, bx1], size = 12.5) {
  ctx.save(); ctx.font = `650 ${size}px Inter, system-ui, sans-serif`; const tw = ctx.measureText(text).width; ctx.restore();
  const px = x + ux * 7, left = ux > 0.35 ? px : ux < -0.35 ? px - tw : px - tw / 2;
  if (left >= bx0 + 2 && left + tw <= bx1 - 2) { labelPx(ctx, text, x, y, ux, uy, color, bg, size); return; }
  const down = uy > 0.35 || (uy > -0.35 && ux < 0);     // sideways arrows: leftward labels below, rightward above
  const cx = Math.min(bx1 - 3 - tw / 2, Math.max(bx0 + 3 + tw / 2, x - ux * 6));
  labelPx(ctx, text, cx, y + (down ? 6 : -6), 0, down ? 1 : -1, color, bg, size);
}

// ─── mount ─────────────────────────────────────────────────────────────────
export const defaults = { scene: 'floor', show: 'both', values: false, sum: false, accel: true, components: false };

export function mount(F, P0) {
  const scene = SCENES[P0.scene] || SCENES.floor;
  const P = { ...scene.defaults, ...P0 };
  const compact = F.compact;
  const { canvas, box } = F.canvas({ aspect: P.aspect ?? (compact || P.show !== 'both' ? 'wide' : ''), label: P.alt || scene.alt });
  const ctx = canvas.getContext('2d');
  const plot = new Plot(canvas, { x: [0, 1], y: [0, 1], equal: true, grid: false, axes: false });

  // controls
  const keys = [];
  const wanted = P.sliders === true ? scene.controls.map((c) => c.key) : (P.sliders || []).map((s) => (typeof s === 'string' ? s : s.key));
  for (const key of wanted) {
    const base = scene.controls.find((c) => c.key === key) || {};
    const over = (P.sliders || []).find?.((s) => typeof s === 'object' && s.key === key) || {};
    const c = { ...base, ...over, key };
    if (c.type === 'choice') F.choice({ key, label: c.label, options: c.options, value: P[key], explain: c.explain });
    else F.slider({ key, label: c.label, min: Math.min(c.min, P[key]), max: Math.max(c.max, P[key]), step: c.step, value: P[key], unit: c.unit, explain: c.explain });
    keys.push(key);
  }
  for (const t of P.toggles || []) {
    const spec = { sum: ['Add the forces tip to tail', 'Each force starts where the last one ended; the gold arrow from the dot to the end is the net force $\\Sigma\\vec F$.'], values: ['Show sizes', 'Print each force in newtons.'], components: ['Split the weight', 'Weight resolved along the slope ($mg\\sin\\theta$) and into it ($mg\\cos\\theta$).'] }[t];
    if (spec) F.toggle({ key: t, label: spec[0], value: !!P[t], explain: spec[1] });
  }
  const S = { shift: 0, t: 0, running: false };
  let playBtn = null;
  const canPlay = P.play && scene.limits;
  const anim = canPlay ? F.animate((dt) => {
    if (!S.running) return;
    const a = solve().info.a;
    const t = S.t + dt * 0.8, d = 0.5 * a * t * t * 0.25;            // the picture moves at a quarter scale
    if (!scene.limits(cur(), null, d)) { S.running = false; if (playBtn) playBtn.textContent = 'Replay'; draw(); return; }
    S.t = t; S.shift = d; draw();
  }, { force: true }) : null;
  if (canPlay) {
    playBtn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; playBtn.textContent = 'Play'; return; }
      if (playBtn.textContent === 'Replay') { S.t = 0; S.shift = 0; }
      S.running = true; playBtn.textContent = 'Pause'; anim.start();
    } });
    F.button({ label: 'Reset', onClick: () => { S.running = false; S.t = 0; S.shift = 0; playBtn.textContent = 'Play'; draw(); } });
  }
  F.onChange((key) => { if (keys.includes(key)) { S.t = 0; S.shift = 0; S.running = false; if (playBtn) playBtn.textContent = 'Play'; } draw(); });

  const cur = () => { const p = { ...P }; for (const k of [...keys, ...TOGGLES]) if (F.params[k] !== undefined) p[k] = F.params[k]; return p; };
  const solve = () => scene.solve(cur());
  const showReadout = P.readout ?? (keys.length > 0);

  function bodiesFor(p, sol) {
    const hide = new Set(p.hide || []), ask = new Set(p.ask || []);
    const out = sol.bodies.map((b) => ({ ...b, forces: b.forces.filter((f) => !hide.has(f.key)).map((f) => ({ ...f, label: p.labels?.[f.key] ?? f.label, ask: ask.has(f.key) })) }));
    for (const e of p.extra || []) {
      const b = out[e.body || 0];
      if (b) b.forces.push({ ...MF.force(e.key || 'extra', e.kind || 'applied', e.label || '?', ...MF.polar(e.mag, e.dir)), extra: true });
    }
    return out;
  }

  function draw() {
    const p = cur(), sol = scene.solve(p), bodies = bodiesFor(p, sol);
    const W = canvas.clientWidth || 600;
    const show = SHOWS.includes(p.show) ? p.show : 'both';
    const stacked = show === 'both' && W < 560;
    box.style.aspectRatio = stacked ? '4 / 5' : '';
    plot.resize(); plot.refreshTheme();
    const H = plot.h, col = plot.col;
    ctx.clearRect(0, 0, W, H);
    // panels
    let sceneRect = null, fbdRect = null;
    if (show === 'scene' || show === 'picture') sceneRect = [0, 0, W, H];
    else if (show === 'fbd') fbdRect = [0, 0, W, H];
    else if (stacked) { sceneRect = [0, 0, W, H * 0.5]; fbdRect = [0, H * 0.5, W, H * 0.5]; }
    else { const f = bodies.length > 1 && scene.layout !== 'rows' ? 0.46 : 0.56; sceneRect = [0, 0, W * f, H]; fbdRect = [W * f, 0, W * (1 - f), H]; }
    let drawn = null;
    if (sceneRect) {
      const [x, y, w, h] = sceneRect;
      plot.o.pad = { l: x + 8, r: W - (x + w) + 8, t: y + 26, b: H - (y + h) + 8 };
      const [bx, by] = scene.bounds(p);
      plot.setView(bx, by);
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      drawn = scene.draw(plot, p, sol, S);
      if (show === 'scene') {
        ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = col.bg; ctx.fillRect(x, y, w, h); ctx.restore();
        forcesOnScene(drawn.anchors, drawn.sizes, bodies, p);
      }
      ctx.restore();
      if (drawn.status && !p.quiet) plot.text(drawn.status, x + 10, y + 13, { screen: true, color: 'ink2', size: 12, weight: 600 });
    }
    if (fbdRect) {
      if (sceneRect) {
        ctx.save(); ctx.strokeStyle = col.line2; ctx.setLineDash([4, 6]); ctx.lineWidth = 1; ctx.beginPath();
        if (stacked) { ctx.moveTo(8, fbdRect[1] + 0.5); ctx.lineTo(W - 8, fbdRect[1] + 0.5); } else { ctx.moveTo(fbdRect[0] + 0.5, 8); ctx.lineTo(fbdRect[0] + 0.5, H - 8); }
        ctx.stroke(); ctx.restore();
      }
      diagrams(fbdRect, bodies, p);
    }
    if (showReadout && scene.readout) F.readout(scene.readout(p, sol));
  }

  // one shared scale for every diagram, so equal forces look equal
  function diagrams([x, y, w, h], bodies, p) {
    const n = bodies.length, cols = scene.layout === 'rows' ? 1 : n, rows = scene.layout === 'rows' ? n : 1;
    const cw = w / cols, ch = h / rows;
    const head = headRows(bodies, cw, p), areaH = ch - head - 6;
    let k;
    if (p.sum) {
      // fit each tip-to-tail polygon (and its dot) inside its panel
      k = Math.min(...bodies.map((b) => { const [lo, hi] = chainBox(chainOrder(b.forces)); return Math.min((cw * 0.7) / Math.max(1e-9, hi[0] - lo[0]), ((areaH - 34) * 0.9) / Math.max(1e-9, hi[1] - lo[1])); }));
    } else {
      const fmax = Math.max(1e-9, ...bodies.flatMap((b) => b.forces.map((f) => Math.hypot(f.fx, f.fy))));
      k = Math.min(cw * 0.36, areaH / 2 - 22) / fmax;
    }
    bodies.forEach((b, i) => {
      const cx = x + (i % cols) * cw, cy = y + Math.floor(i / cols) * ch;
      oneDiagram(b, [cx, cy, cw, ch], k, p, i, head);
    });
  }

  // the header of a diagram: its title, then its acceleration — beside the title if it fits, else on a second row
  const named = (l) => (/^[a-z]+$/.test(l) ? `the ${l}` : l);
  const titleOf = (b, p, i) => p.names?.[i] ?? `Forces on ${named(b.label)}`;
  const accText = (b) => { const am = b.a ? Math.hypot(b.a[0], b.a[1]) : 0; return am > 1e-6 ? `a = ${trim(am)} m/s²` : 'a = 0'; };
  function textW(t, size = 12) { ctx.save(); ctx.font = `650 ${size}px Inter, system-ui, sans-serif`; const w = ctx.measureText(t).width; ctx.restore(); return w; }
  function headRows(bodies, w, p) {
    const two = p.accel !== false && bodies.some((b, i) => b.a && textW(titleOf(b, p, i)) + textW(accText(b), 11.5) + 62 > w);
    return two ? 50 : 30;
  }

  function oneDiagram(b, [x, y, w, h], k, p, i, head) {
    const col = plot.col, bg = col.bg;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const title = titleOf(b, p, i);
    plot.text(title, x + 12, y + 14, { screen: true, color: 'ink2', size: 12, weight: 650 });
    if (p.accel !== false && b.a) {
      const am = Math.hypot(b.a[0], b.a[1]), at = accText(b), gold = plot.color('gold');
      const ax = head > 30 ? x + 12 : x + 12 + textW(title) + 18, ay = head > 30 ? y + 34 : y + 14;
      plot.text(at, ax, ay, { screen: true, color: 'gold', size: 11.5, weight: 650 });
      if (am > 1e-6) {
        const ux = b.a[0] / am, uy = -b.a[1] / am, cx0 = ax + textW(at, 11.5) + 16;
        arrowPx(ctx, cx0 - ux * 9, ay - uy * 9, cx0 + ux * 9, ay + uy * 9, gold, { width: 2.2, dash: [3, 2], head: 7 });
      }
    }
    const chain = chainOrder(b.forces);
    // where the dot goes: the middle of the area under the header, or so the tip-to-tail polygon is centred
    let ox = x + w / 2, oy = y + head + (h - head - 6) / 2;
    if (p.sum) {
      const [lo, hi] = chainBox(chain);
      ox -= ((lo[0] + hi[0]) / 2) * k; oy += ((lo[1] + hi[1]) / 2) * k;
    }
    const marks = [[ox, oy]];
    if (p.sum) {
      // the polygon's corners, to put each label on the outside of its edge
      const corners = [[ox, oy]];
      for (const f of chain) { const [lx, ly] = corners[corners.length - 1]; corners.push([lx + f.fx * k, ly - f.fy * k]); }
      const cx0 = corners.reduce((s1, q) => s1 + q[0], 0) / corners.length, cy0 = corners.reduce((s1, q) => s1 + q[1], 0) / corners.length;
      let px = ox, py = oy;
      for (const f of chain) {
        const mag = Math.hypot(f.fx, f.fy), ux = f.fx / mag, uy = -f.fy / mag, L = Math.max(mag * k, 10);
        const qx = px + ux * L, qy = py + uy * L, color = plot.color(COLORS[f.kind] || 'accent');
        arrowPx(ctx, px, py, qx, qy, color, { width: 2.4, dash: f.extra ? [5, 4] : [] });
        const mx = (px + qx) / 2, my = (py + qy) / 2, side = (mx - cx0) * uy + (my - cy0) * -ux >= 0 ? 1 : -1;
        labelPx(ctx, labelText(f, p), mx + side * uy * 4, my - side * ux * 4, side * uy, -side * ux, color, bg, 11.5);
        marks.push([qx, qy], [mx, my]);
        px = qx; py = qy;
      }
      const net = MF.netForce(b), nm = Math.hypot(...net);
      if (nm * k > 6) {
        arrowPx(ctx, ox, oy, px, py, plot.color('gold'), { width: 3.4, head: 12 });
        const L = Math.hypot(px - ox, py - oy);
        labelPx(ctx, `ΣF${p.values ? ' = ' + fmtN(nm) : ''}`, (ox + px) / 2, (oy + py) / 2, -(py - oy) / L, (px - ox) / L, plot.color('gold'), bg);
      } else plot.text('ΣF = 0: the arrows close into a loop', x + w / 2, y + h - 14, { screen: true, color: 'gold', size: 12, weight: 650, align: 'center' });
    } else {
      // forces along the same line sit side by side; equal-labelled ones share one label (T ×2)
      const groups = [];
      for (const f of b.forces) {
        const a = Math.atan2(f.fy, f.fx), g = groups.find((q) => Math.abs(Math.atan2(Math.sin(q.a - a), Math.cos(q.a - a))) < 0.06);
        if (g) g.items.push(f); else groups.push({ a, items: [f] });
      }
      for (const g of groups) {
        const n = g.items.length, same = g.items.every((f) => f.label === g.items[0].label), gap = same ? 8 : 18;
        g.items.forEach((f, j) => {
          const mag = Math.hypot(f.fx, f.fy), ux = f.fx / mag, uy = -f.fy / mag;
          const off = (j - (n - 1) / 2) * gap, sx = ox - uy * off, sy = oy + ux * off;
          const L = Math.max(mag * k, 14), tx = sx + ux * L, ty = sy + uy * L;
          const color = plot.color(COLORS[f.kind] || 'accent');
          arrowPx(ctx, sx, sy, tx, ty, color, { dash: f.extra ? [6, 4] : [] });
          marks.push([tx, ty]);
          if (same && j < n - 1) return;
          const text = same && n > 1 ? `${labelText(f, p)} (×${n})` : labelText(f, p);
          if (same || n === 1) placeLabel(ctx, text, tx, ty, ux, uy, color, bg, [x, x + w]);
          else { const sgn = Math.sign(off) || 1; labelPx(ctx, text, tx - ux * 6, ty - uy * 6, -uy * sgn, ux * sgn, color, bg); }
        });
      }
    }
    // the body: a dot
    ctx.save(); ctx.fillStyle = col.ink; ctx.beginPath(); ctx.arc(ox, oy, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // incline: the weight split along and across the slope
    if (p.components && scene === SCENES.incline && !p.sum) {
      const th = p.theta * D2R, W = b.m * G, u = [Math.cos(th), Math.sin(th)], nn = [-Math.sin(th), Math.cos(th)];
      const reachPx = Math.max(w, h);
      ctx.save(); ctx.strokeStyle = col.line3; ctx.setLineDash([3, 5]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ox - u[0] * reachPx, oy + u[1] * reachPx); ctx.lineTo(ox + u[0] * reachPx, oy - u[1] * reachPx);
      ctx.moveTo(ox - nn[0] * reachPx, oy + nn[1] * reachPx); ctx.lineTo(ox + nn[0] * reachPx, oy - nn[1] * reachPx); ctx.stroke(); ctx.restore();
      const par = W * Math.sin(th) * k, perp = W * Math.cos(th) * k, wc = plot.color('ink3');
      if (par > 3) { arrowPx(ctx, ox, oy, ox - u[0] * par, oy + u[1] * par, wc, { width: 2, dash: [5, 4] }); placeLabel(ctx, `mg sin θ${p.values ? ' = ' + fmtN(W * Math.sin(th)) : ''}`, ox - u[0] * par, oy + u[1] * par, -u[0], u[1], wc, bg, [x, x + w], 11.5); marks.push([ox - u[0] * par, oy + u[1] * par]); }
      if (perp > 3) { arrowPx(ctx, ox, oy, ox - nn[0] * perp, oy + nn[1] * perp, wc, { width: 2, dash: [5, 4] }); placeLabel(ctx, `mg cos θ${p.values ? ' = ' + fmtN(W * Math.cos(th)) : ''}`, ox - nn[0] * perp, oy + nn[1] * perp, -nn[0], nn[1], wc, bg, [x, x + w], 11.5); marks.push([ox - nn[0] * perp, oy + nn[1] * perp]); }
    }
    ctx.restore();
  }

  function labelText(f, p) {
    if (f.ask) return `${f.label} = ?`;
    return p.values && !f.extra ? `${f.label} = ${fmtN(Math.hypot(f.fx, f.fy))}` : f.label;
  }

  // show: 'scene' — the forces drawn on the picture itself, from each body's centre
  function forcesOnScene(anchors, sizes, bodies, p) {
    const fmax = Math.max(1e-9, ...bodies.flatMap((b) => b.forces.map((f) => Math.hypot(f.fx, f.fy))));
    const span = Math.min(plot.vx1 - plot.vx0, plot.vy1 - plot.vy0);
    const k = (0.3 * span) / fmax;
    bodies.forEach((b, i) => {
      const [ax, ay] = anchors[i] || anchors[0], [hx, hy] = sizes?.[i] || [0, 0];
      for (const f of b.forces) {
        const mag = Math.hypot(f.fx, f.fy), L = Math.max(mag * k, 0.1 * span);
        const ux = f.fx / mag, uy = f.fy / mag;
        const e = Math.min(Math.abs(ux) > 1e-9 ? hx / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-9 ? hy / Math.abs(uy) : Infinity);
        const sx = ax + ux * (Number.isFinite(e) ? e : 0), sy = ay + uy * (Number.isFinite(e) ? e : 0);
        const color = COLORS[f.kind] || 'accent';
        plot.arrow(sx, sy, sx + ux * L, sy + uy * L, { color, width: 2.6, head: 10, dash: f.extra ? [6, 4] : [] });
        labelPx(ctx, labelText(f, p), plot.X(sx + ux * L), plot.Y(sy + uy * L), ux, -uy, plot.color(color), plot.col.bg);
      }
    });
  }

  F.draw(draw);
  F.caption(defaultCaption(P));
  return { get: (k) => F.params[k] };
}

function defaultCaption(P) {
  const ideal = ['hang', 'pulley', 'atwood', 'table', 'pair'].includes(P.scene) ? ' Ropes and pulleys are ideal: massless, and the pulleys frictionless.' : '';
  if (P.show === 'picture') return 'The situation only — the forces are for you to find.';
  if (P.show === 'scene') return `Forces drawn to scale, starting at the edge of each object (not where each one acts); the gold dashed arrows are accelerations, not forces.${ideal}`;
  return `Each body is shown as a dot with every force on it, to one common scale; the gold dashed arrow is its acceleration, not a force. $g = 9.8\\ \\text{m/s}^2$.${ideal}`;
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const problems = [];
  const scene = SCENES[P0.scene];
  if (!scene) return [`unknown scene “${P0.scene}” (use ${Object.keys(SCENES).join(', ')})`];
  const P = { ...scene.defaults, ...P0 };
  if (P.show && !SHOWS.includes(P.show)) problems.push(`show must be one of ${SHOWS.join(', ')}`);
  for (const t of P.toggles || []) if (!TOGGLES.includes(t)) problems.push(`unknown toggle “${t}”`);
  const known = scene.controls.map((c) => c.key);
  const wanted = P.sliders === true ? known : (P.sliders || []).map((s) => (typeof s === 'string' ? s : s.key));
  for (const k of wanted) if (!known.includes(k)) problems.push(`scene ${P.scene} has no control “${k}” (it has ${known.join(', ') || 'none'})`);
  for (const k of ['m', 'm1', 'm2', 'R']) if (P[k] !== undefined && !(P[k] > 0)) problems.push(`${k} must be positive`);
  for (const k of ['F', 'mus', 'muk', 'v']) if (P[k] !== undefined && typeof P[k] === 'number' && P[k] < 0 && !(k === 'v' && P.scene === 'elevator')) problems.push(`${k} must not be negative`);
  if (P.mus > 0 && P.muk > P.mus) problems.push('μk should not exceed μs');
  if (P.scene === 'incline' && !(P.theta >= 0 && P.theta < 90)) problems.push('incline theta must be in [0, 90)');
  if (P.scene === 'table' && !(P.theta >= 0 && P.theta <= 60)) problems.push('table theta must be in [0, 60]');
  if (P.scene === 'hang' && P.ropes !== 1 && !(P.th1 > 0 && P.th1 <= 90 && P.th2 >= 0 && P.th2 <= 90)) problems.push('hang angles: 0 < th1 ≤ 90, 0 ≤ th2 ≤ 90');
  if (P.scene === 'pulley' && ![1, 2, 3, 4].includes(P.n)) problems.push('pulley n must be 1–4');
  if (P.scene === 'crest' && !['hill', 'dip', 'loop-top', 'loop-bottom'].includes(P.where)) problems.push('crest where must be hill, dip, loop-top or loop-bottom');
  if (P.scene === 'turn' && !(P.phi > 0 && P.phi < 80)) problems.push('turn phi must be in (0, 80)');
  if (P.scene === 'pair' && !['push', 'pull'].includes(P.link)) problems.push('pair link must be push or pull');
  if (P.scene === 'body') {
    if (!ICONS.includes(P.icon)) problems.push(`unknown icon “${P.icon}” (use ${ICONS.join(', ')})`);
    if (!Array.isArray(P.forces) || (!P.forces.length && P.show !== 'picture')) problems.push('body needs forces: [{ label, mag, dir }]');
    if (P.agent && !(Number.isFinite(P.agent.dir) && ['pole', 'rope'].includes(P.agent.kind))) problems.push('body agent needs { dir (degrees), kind: pole | rope }');
    for (const f of P.forces || []) if (!(f.mag >= 0) || !Number.isFinite(f.dir) || (f.kind && !COLORS[f.kind])) problems.push(`body force ${f.label}: needs mag ≥ 0, a dir in degrees and a known kind`);
  }
  for (const e of P.extra || []) if (!(e.mag > 0) || !Number.isFinite(e.dir)) problems.push('extra forces need mag > 0 and dir');
  if (problems.length) return problems;
  try {
    const sol = scene.solve(P);
    const nums = sol.bodies.flatMap((b) => b.forces.flatMap((f) => [f.fx, f.fy]));
    if (!nums.every(Number.isFinite)) problems.push('the forces are not finite for these parameters');
  } catch (e) { problems.push(`solve: ${e.message}`); }
  return problems;
}
