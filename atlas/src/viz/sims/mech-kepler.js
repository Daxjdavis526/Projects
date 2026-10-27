// Kepler orbits with real data — the ISS, GPS and geostationary satellites, a
// transfer orbit, the Moon, Earth, Mercury, Halley's comet and the star S2
// around the Milky Way's black hole — or Newton's cannon: a horizontal launch
// at any speed. Seen from above and drawn to scale: the central mass at a
// focus, the body moving at its true relative rate, its velocity arrow and
// radius line, and equal-time sectors that show Kepler's second law.
// Newtonian two-body motion with the central mass held fixed; the physics is
// model/mech-kepler.js (tested headlessly in test/mech-kepler.test.mjs).
//
//   { type: 'mech-kepler', params: {
//       presets: ['iss', 'gps', 'geo'],   // orbits to choose from (keys of PRESETS); one entry shows no choice
//       preset: 'iss',                    // the one shown first
//       launch: { body: 'earth', h: 400e3, v: 7.0, vRange: [4, 12], hSlider: false, view: 2.6, ghosts: [6, 7.67] },
//                                         // Newton's cannon instead: launch height h (m) and speed v (km/s),
//                                         // view = half-height of the picture in body radii, ghosts = speeds drawn faintly
//       sectors: 12,          // equal-time sectors over one period (0: none)
//       sweep: true,          // offer a toggle that shows or hides the sectors
//       velocity: true,       // the velocity arrow and the radius line
//       play: true,           // a Play/Pause button
//       autoplay: false,      // start moving at once (never under reduced motion)
//       time: true,           // presets: a slider for the time since periapsis, as a fraction of the period
//       t: 0.12,              // where the body is drawn first, as a fraction of a period after periapsis
//       orbitSeconds: 9,      // seconds of animation per orbit (Newton's cannon: per circular orbit)
//       readout: true,        // true, false, or a list of keys from READOUTS below
//       labels: true,         // apsis, focus and scale labels
//   } }

import { Plot } from '../plot.js';
import * as K from '../model/mech-kepler.js';

export const defaults = {
  presets: ['iss', 'gps', 'geo', 'moon'], preset: null, launch: null, sectors: 12, sweep: true, velocity: true,
  play: true, autoplay: false, time: true, t: 0.12, orbitSeconds: 9, readout: true, labels: true,
};

export const READOUTS = ['r', 'alt', 'v', 'T', 'a', 'e', 'rp', 'ra', 'vp', 'va', 'E', 'h', 'fate', 'vc', 'vesc'];
const DEFAULT_READOUT = { preset: ['r', 'v', 'T', 'e'], launch: ['fate', 'E'] };

export function validate(P) {
  const p = [];
  if (P.launch) {
    const L = P.launch;
    if (!K.BODIES[L.body]) p.push(`mech-kepler: unknown body “${L.body}” (use ${Object.keys(K.BODIES).join(', ')})`);
    if (!(L.h >= 0)) p.push('mech-kepler: launch.h (height above the surface, m) must be ≥ 0');
    const [lo, hi] = L.vRange || [];
    if (!(lo > 0 && hi > lo)) p.push('mech-kepler: launch.vRange must be [low, high] in km/s with 0 < low < high');
    else if (!(L.v >= lo && L.v <= hi)) p.push('mech-kepler: launch.v must lie in launch.vRange');
    if (L.view !== undefined && !(L.view > 1)) p.push('mech-kepler: launch.view (half-height in body radii) must exceed 1');
    for (const g of L.ghosts || []) if (!(g > 0)) p.push('mech-kepler: launch.ghosts must be positive speeds in km/s');
  } else {
    if (!Array.isArray(P.presets) || !P.presets.length) p.push('mech-kepler: presets must list at least one orbit');
    else for (const k of P.presets) if (!K.PRESETS[k]) p.push(`mech-kepler: unknown preset “${k}” (use ${Object.keys(K.PRESETS).join(', ')})`);
    if (P.preset !== null && P.preset !== undefined && !(P.presets || []).includes(P.preset)) p.push('mech-kepler: preset must be one of presets');
  }
  if (!(Number.isInteger(P.sectors) && P.sectors >= 0 && P.sectors <= 36)) p.push('mech-kepler: sectors must be a whole number from 0 to 36');
  if (!(P.t >= 0 && P.t <= 1)) p.push('mech-kepler: t (fraction of a period) must lie in [0, 1]');
  if (!(P.orbitSeconds > 0)) p.push('mech-kepler: orbitSeconds must be positive');
  if (Array.isArray(P.readout)) for (const r of P.readout) if (!READOUTS.includes(r)) p.push(`mech-kepler: unknown readout “${r}” (use ${READOUTS.join(', ')})`);
  return p;
}

// ─── number formats (TeX) ──────────────────────────────────────────────────
function num(x, n = 3) {
  if (!Number.isFinite(x)) return '\\text{—}';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e6 || a < 1e-3) {
    const [m, e] = x.toExponential(n - 1).split('e');
    return `${m}\\times10^{${parseInt(e, 10)}}`;
  }
  const digits = Math.max(0, n - 1 - Math.floor(Math.log10(a)));
  const s = (+x.toPrecision(n)).toFixed(digits);
  return a >= 1e4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}') : s;
}
const km = (m) => `${num(m / 1e3, Math.abs(m) >= 1e7 ? 3 : 4)}\\,\\mathrm{km}`;
const au = (m) => `${num(m / K.AU, 3)}\\,\\mathrm{AU}`;
const dist = (m, unit) => (unit === 'km' ? km(m) : au(m));
const kms = (v) => `${num(v / 1e3, 3)}\\,\\mathrm{km/s}`;
function duration(s) {
  if (s < 2 * 3600) return `${num(s / 60, 3)}\\,\\mathrm{min}`;
  if (s < 2 * K.DAY) return `${num(s / 3600, 3)}\\,\\mathrm{h}`;
  if (s < 2 * K.YEAR) return `${num(s / K.DAY, 3)}\\,\\mathrm{days}`;
  return `${num(s / K.YEAR, 3)}\\,\\mathrm{yr}`;
}

export async function mount(F, P) {
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || (P.launch ? 'Newton’s cannon: a body launched sideways at different speeds, seen from above' : 'An orbit seen from above, drawn to scale, with equal-time sectors') });
  const launchMode = !!P.launch;
  const L = P.launch || {};

  // ─── controls ────────────────────────────────────────────────────────────
  if (launchMode) {
    F.slider({ key: 'v', label: 'Launch speed $v_0$', min: L.vRange[0], max: L.vRange[1], step: 0.01, value: L.v, unit: '\\mathrm{km/s}', explain: 'Fired sideways — parallel to the ground — from the marked point.' });
    if (L.hSlider) F.slider({ key: 'hkm', label: 'Launch height $h$', min: 0, max: 2000, step: 10, value: L.h / 1e3, unit: '\\mathrm{km}', explain: 'Above the surface. The launch speed needed for each kind of path falls with height.' });
    else F.params.hkm = L.h / 1e3;
  } else {
    if (P.presets.length > 1) F.choice({ key: 'preset', label: 'Orbit', options: P.presets.map((k) => [k, K.PRESETS[k].label]), value: P.preset ?? P.presets[0], explain: 'Real orbits, each drawn to its own scale.' });
    else F.params.preset = P.presets[0];
    if (P.time && !F.compact) F.slider({ key: 'tf', label: 'Time since the closest point, $t/T$', min: 0, max: 1, step: 0.005, value: P.t, unit: '', explain: 'As a fraction of the period $T$. Play moves it on at the true relative rate.' });
    else F.params.tf = P.t;
  }
  if (P.sweep && P.sectors > 0) F.toggle({ key: 'sweep', label: `Equal-time sectors (${P.sectors} per orbit)`, value: true, explain: 'Each sector is swept by the radius line in the same time. Kepler’s second law: their areas are equal.' });
  else F.params.sweep = P.sectors > 0;

  const S = { running: !!P.autoplay && !reduced, tl: 0, pause: 0 };
  let playBtn = null;
  if (P.play) {
    playBtn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => {
      S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play';
      if (S.running) anim.start();
    } });
  }

  let O = null;            // the current orbit and how to draw it
  const build = () => { O = launchMode ? buildLaunch(L, +F.params.v, +F.params.hkm) : buildPreset(F.params.preset); };
  build();
  F.onChange((key) => { if (key === 'preset' || key === 'v' || key === 'hkm') { build(); S.tl = 0; S.pause = 0; } draw(); });

  const anim = F.animate((dt) => {
    if (!S.running) return;
    if (launchMode) {
      if (S.pause > 0) { S.pause -= dt; if (S.pause <= 0) S.tl = 0; draw(); return; }
      S.tl += (dt / P.orbitSeconds) * O.unitT;
      if (S.tl >= O.duration) { S.tl = O.duration; if (!O.loops) S.pause = 1.2; else S.tl = 0; }
      draw();
    } else {
      F.set('tf', (F.params.tf + dt / P.orbitSeconds) % 1);
    }
  }, { force: true });

  const pl = new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: true, grid: false, axes: false, pad: { l: 30, r: 30, t: 24, b: 22 } });

  // the world position of a point given in the orbit's own frame
  const place = (x, y) => world(O, [x, y]);

  function draw() {
    const body = K.BODIES[O.body];
    pl.setView(O.view.x, O.view.y);
    pl.clear();
    const px = (pl.R - pl.L) / (pl.vx1 - pl.vx0);           // pixels per metre
    const t = launchMode ? O.launchT + S.tl : F.params.tf * O.T;
    const st = K.stateAt(O, t);
    const [sx, sy] = place(st.x, st.y);

    // equal-time sectors (closed orbits that do not hit the ground)
    if (F.params.sweep && P.sectors > 0 && O.kind === 'ellipse' && !O.impact) {
      const n = P.sectors, cur = Math.floor((((t % O.T) + O.T) % O.T) / (O.T / n));
      for (let k = 0; k < n; k++) {
        const pts = [[0, 0]];
        for (let j = 0; j <= 24; j++) { const s = K.stateAt(O, ((k + j / 24) * O.T) / n); pts.push(place(s.x, s.y)); }
        pl.path(pts, { close: true, fill: k % 2 ? 'violet' : 'accent', fillAlpha: k === cur && !launchMode ? 0.36 : 0.15, stroke: false });
      }
    }
    // faint paths for other launch speeds
    for (const g of O.ghosts || []) pl.path(g, { color: 'ink3', width: 1.2, alpha: 0.75 });   // world coordinates
    // the orbit (and, for a fall, the rest of its ellipse through the body, dashed)
    if (O.hidden) pl.path(O.hidden, { color: 'ink4', width: 1, dash: [4, 5] });
    pl.path(O.path, { color: 'accent', width: 2 });

    // the central body, to scale where it is big enough to see
    const Rpx = body.R * px;
    if (Rpx >= 3) pl.circle(0, 0, body.R, { fill: body.color, alpha: 0.42, color: body.color, width: 1.6 });
    else pl.point(0, 0, { color: body.hole ? 'ink2' : body.color, r: 4, ring: body.hole ? 'ink' : null });
    if (P.labels) {
      const big = Rpx >= 3;
      // a small body's label goes above it — or to its right, when the empty focus label would sit beside it
      const crowded = !big && !launchMode && O.e >= 0.1 && 2 * O.a * O.e * px < 150;
      pl.text(`${body.name.replace(/^the /, '').replace(/^\w/, (c) => c.toUpperCase())}${big ? '' : ' (not to scale)'}`, 0, 0, { dx: crowded ? 7 : 0, dy: big ? 0 : -13, align: crowded ? 'left' : 'center', color: 'ink2', size: 11.5 });
    }

    if (!launchMode && P.labels && O.e >= 0.02) {
      const [qx, qy] = place(O.rp, 0), [Qx, Qy] = place(-O.ra, 0);
      pl.point(qx, qy, { color: 'ink3', r: 2.5 }); pl.point(Qx, Qy, { color: 'ink3', r: 2.5 });
      pl.text(body.peri, qx, qy, { dx: 4, dy: 15, align: 'right', color: 'ink3', size: 11 });
      pl.text(body.apo, Qx, Qy, { dx: -4, dy: 15, color: 'ink3', size: 11 });
      if (O.e >= 0.1) {
        const [fx, fy] = place(-2 * O.a * O.e, 0), d = 4 / px;
        pl.line(fx - d, fy - d, fx + d, fy + d, { color: 'ink3', width: 1.4 });
        pl.line(fx - d, fy + d, fx + d, fy - d, { color: 'ink3', width: 1.4 });
        pl.text('empty focus', fx, fy, { dy: -11, align: 'center', color: 'ink3', size: 10.5 });
      }
    }
    if (launchMode && P.labels) {
      const [lx, ly] = O.launchXY;
      pl.point(lx, ly, { color: 'ink2', r: 3 });
      pl.text('launch', lx, ly, { dx: -8, dy: -10, align: 'right', color: 'ink2', size: 11 });
      if (O.impact) pl.point(O.impact[0], O.impact[1], { color: 'bad', r: 3.5 });
    }

    // the moving body, its radius line and its velocity
    const done = launchMode && O.impact && S.tl >= O.duration;
    if (P.velocity) {
      pl.line(0, 0, sx, sy, { color: 'ink3', width: 1, dash: [3, 4] });
      if (!done) {
        const [vx, vy] = place(st.vx, st.vy), k = O.vScale;
        pl.arrow(sx, sy, sx + vx * k, sy + vy * k, { color: 'gold', width: 2.2, label: 'v' });
      }
    }
    const Rsat = O.Rsat ? O.Rsat * px : 0;
    if (Rsat >= 2) pl.circle(sx, sy, O.Rsat, { fill: 'ink2', alpha: 0.9, color: 'ink2', width: 1 });
    else pl.point(sx, sy, { color: 'ink', r: 4.5, ring: 'gold' });

    // title and scale bar
    if (P.labels) {
      pl.text(O.title, 10, 13, { screen: true, color: 'ink2', size: 12, weight: 600 });
      scaleBar(px, body.unit);
    }
    readout(st, t);
  }

  function scaleBar(px, unit) {
    const u = unit === 'km' ? 1e3 : K.AU;
    const target = 110 / px / u;                             // about 110 px, in display units
    const mag = 10 ** Math.floor(Math.log10(target));
    const len = [1, 2, 5, 10].map((m) => m * mag).reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best));
    const w = len * u * px, x0 = 12, y0 = pl.h - 10;
    const g = pl.ctx;
    g.save(); g.strokeStyle = pl.color('ink3'); g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x0, y0 - 4); g.lineTo(x0, y0); g.lineTo(x0 + w, y0); g.lineTo(x0 + w, y0 - 4); g.stroke(); g.restore();
    pl.text(`${len >= 1e4 ? len.toLocaleString('en-US') : +len.toPrecision(3)} ${unit}`, x0 + w / 2, y0 - 10, { screen: true, align: 'center', color: 'ink3', size: 11 });
  }

  function readout(st, t) {
    if (P.readout === false) { F.readout([]); return; }
    const body = K.BODIES[O.body], keys = Array.isArray(P.readout) ? P.readout : DEFAULT_READOUT[launchMode ? 'launch' : 'preset'];
    const rows = [];
    for (const k of keys) {
      if (k === 'r') rows.push(['distance $r$', dist(st.r, body.unit)]);
      if (k === 'alt') rows.push(['height above the surface', km(st.r - body.R)]);
      if (k === 'v') rows.push(['speed $v$', kms(st.v)]);
      if (k === 'T' && O.T && !O.impact) rows.push(['period $T$', duration(O.T)]);
      if (k === 'a' && O.kind === 'ellipse') rows.push(['semi-major axis $a$', dist(O.a, body.unit)]);
      if (k === 'e') rows.push(['eccentricity $e$', O.e < 5e-4 ? '0' : num(O.e, 3)]);
      if (k === 'rp') rows.push([`closest, $r_p$`, dist(O.rp, body.unit)]);
      if (k === 'ra' && O.ra) rows.push([`farthest, $r_a$`, dist(O.ra, body.unit)]);
      if (k === 'vp') rows.push(['speed at $r_p$', kms(K.stateAt(O, 0).v)]);
      if (k === 'va' && O.kind === 'ellipse') rows.push(['speed at $r_a$', kms(K.stateAt(O, O.T / 2).v)]);
      if (k === 'E') rows.push(['energy per kg, $\\tfrac12v^2 - GM/r$', `${num(O.energy / 1e6, 3)}\\,\\mathrm{MJ/kg}`]);
      if (k === 'h') rows.push(['$|\\vec r\\times\\vec v|$ (angular momentum per kg)', `${num(Math.abs(st.x * st.vy - st.y * st.vx), 3)}\\,\\mathrm{m^2/s}`]);
      if (k === 'vc') rows.push(['circular speed here', kms(K.vCircular(O.GM, O.r0 ?? st.r))]);
      if (k === 'vesc') rows.push(['escape speed here', kms(K.vEscape(O.GM, O.r0 ?? st.r))]);
      if (k === 'fate') rows.push(['fate', `\\text{${O.fate}}`]);
    }
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(launchMode
    ? 'Seen from above and drawn to scale; Newtonian gravity of a perfectly round body, no air and no spin. Fired sideways, every path is part of a conic with the planet’s centre at a focus — the dashed part is the ellipse a fall would follow if all the mass sat at the centre.'
    : 'Seen from above and drawn to scale, unless marked. Newtonian two-body motion with the central mass held fixed; other bodies’ pulls (and, for S2, relativity’s small corrections) are left out.');
}

// ─── the two kinds of picture ──────────────────────────────────────────────
// Every stored path is in world coordinates; `cw`, `sw` and `s` turn the
// orbit's own frame (periapsis on +x, motion anticlockwise) into the world's.
const world = (o, [x, y]) => [o.cw * x - o.sw * o.s * y, o.sw * x + o.cw * o.s * y];

function buildPreset(key) {
  const o = K.presetOrbit(key), body = K.BODIES[o.body];
  Object.assign(o, { cw: 1, sw: 0, s: 1 });
  o.path = [];
  for (let i = 0; i <= 720; i++) { const nu = (2 * Math.PI * i) / 720, r = K.radiusAt(o, nu); o.path.push([r * Math.cos(nu), r * Math.sin(nu)]); }
  const b = o.a * Math.sqrt(1 - o.e * o.e), cx = -o.a * o.e;
  const mx = 0.1 * o.a, R = body.R;
  o.view = { x: [Math.min(cx - o.a, -R) - mx, Math.max(cx + o.a, R) + mx], y: [-Math.max(b, R) - mx, Math.max(b, R) + mx] };
  o.vScale = (0.3 * Math.min(o.a, b + 0.4 * o.a)) / K.stateAt(o, 0).v;
  o.title = `${o.name[0].toUpperCase()}${o.name.slice(1)} around ${body.name}`;
  return o;
}

/** Launched from the top of the picture toward the right (clockwise); the launch point is the periapsis when k ≥ 1, else the apoapsis. */
function orient(o) {
  const w = o.k >= 1 ? Math.PI / 2 : (3 * Math.PI) / 2;
  return Object.assign(o, { cw: Math.cos(w), sw: Math.sin(w), s: -1 });
}

function buildLaunch(L, vKms, hKm) {
  const body = K.BODIES[L.body], R = body.R, r0 = R + hKm * 1e3, v0 = vKms * 1e3;
  const o = orient(K.launchOrbit(body.GM, r0, v0));
  o.body = L.body;
  const H = (L.view ?? 2.6) * R;
  o.view = { x: [-2 * H, 2 * H], y: [-H, H] };
  o.launchXY = [0, r0];
  o.unitT = K.period(body.GM, r0);                          // the clock: one circular orbit at the launch height
  o.vScale = (0.35 * H) / Math.max(v0, K.vCircular(body.GM, r0));
  o.ghosts = (L.ghosts || []).map((g) => launchPath(orient(K.launchOrbit(body.GM, r0, g * 1e3)), R, 4 * H).path);
  Object.assign(o, launchPath(o, R, 4 * H));
  o.title = `Launched sideways from ${hKm >= 1 ? `${Math.round(hKm).toLocaleString('en-US')} km up` : 'the surface'}`;
  const range = o.impact ? R * (o.impactNu - o.launchNu) : 0;
  o.fate = o.impact ? `falls back, ${Math.round(range / 1e3).toLocaleString('en-US')} km downrange`
    : o.kind === 'ellipse' ? (o.e < 0.003 ? 'circular orbit' : 'elliptical orbit')
      : o.kind === 'parabola' ? 'escapes (parabola)' : 'escapes (hyperbola)';
  return o;
}

/** The path from the launch, in world coordinates: to the ground, round once, or out of the picture (radius rOut). */
function launchPath(o, R, rOut) {
  const out = { path: [], hidden: null, impact: null, loops: false };
  const nuHit = K.impactNu(o, R);
  const pt = (nu) => { const r = K.radiusAt(o, nu); return world(o, [r * Math.cos(nu), r * Math.sin(nu)]); };
  if (nuHit !== null) {
    for (let i = 0; i <= 300; i++) out.path.push(pt(o.launchNu + ((nuHit - o.launchNu) * i) / 300));
    out.hidden = [];
    for (let i = 0; i <= 300; i++) out.hidden.push(pt(nuHit + ((o.launchNu + 2 * Math.PI - nuHit) * i) / 300));
    out.impact = pt(nuHit); out.impactNu = nuHit;
    out.duration = K.timeAt(o, nuHit) - o.launchT;
  } else if (o.kind === 'ellipse') {
    for (let i = 0; i <= 720; i++) out.path.push(pt(o.launchNu + (2 * Math.PI * i) / 720));
    out.duration = o.T; out.loops = true;
  } else {
    const c = (o.p / rOut - 1) / o.e, nuEnd = Math.acos(Math.max(-1, Math.min(1, c)));
    for (let i = 0; i <= 400; i++) out.path.push(pt((nuEnd * i) / 400));
    out.duration = K.timeAt(o, nuEnd);
  }
  return out;
}
