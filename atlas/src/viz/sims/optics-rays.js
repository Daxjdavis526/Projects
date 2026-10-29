// Ray optics on a bench. The physics is model/optics-rays.js (tested
// headlessly in test/optics-rays.test.mjs): Snell's law, the Fresnel
// reflectances, Sellmeier dispersion of real materials, exact tracing through
// flat and spherical surfaces, and paraxial imaging by thin lenses and
// spherical mirrors. Seven modes:
//
//   interface  a ray meeting a flat boundary between two media: reflected and
//              refracted rays with strengths from the Fresnel equations, the
//              critical angle and total internal reflection, Brewster's angle
//              (choose s or p light), optional wavefronts that pivot as their
//              leading edge slows, and an optional R(θ) graph
//   prism      white (or single-colour) light through a prism of real glass,
//              water or diamond: dispersion, deviation, total internal reflection
//   fibre      a ray launched into a step-index fibre: trapped by total internal
//              reflection inside the acceptance cone, leaking out beyond it
//   surface    looking at an object through one refracting surface — flat
//              (apparent depth) or curved (a fish bowl): a pencil of exact rays,
//              their backward extensions, and where the object appears
//   lens       a thin lens with a draggable object: principal rays, a fan of
//              rays, the image (real or virtual, size, orientation), a mask that
//              covers part of the lens; a star (object at infinity) instead
//   mirror     a concave, convex or plane mirror with a draggable object (or a star)
//   system     two thin lenses: a telescope (star at an angle) or a microscope
//
//   { type: 'optics-rays', params: {
//       mode: 'lens',
//       controls: true,            // or false, or a list of the control keys to show
//       readout: true, labels: true,
//       hide: [],                  // things not to draw or print (the answer to a problem): see each mode
//       // interface: n1 1, n2 1.33 (top and bottom indices), angle 40 (° from the normal), pol 'u' | 's' | 'p',
//       //            fresnel true (ray strengths from R and T), waves false (wavefronts; Play animates them),
//       //            graph false (R_s, R_p against angle beside the picture), polControl false;
//       //            hide: reflected refracted theta1 theta2 critical
//       // prism:     apex 60 (°), angle 50 (° from the first face's normal), mat 'crown' | 'flint' | 'denseflint' |
//       //            'water' | 'diamond' | 'silica', light 'white' | 'mono', lambda 589 (nm, for mono); hide: deviation
//       // fibre:     nCore 1.48, nClad 1.46, angle 10 (° launch angle in air); hide: acceptance
//       // surface:   n1 1.33 (the object's side), n2 1 (the eye's side), R Infinity (cm; < 0 bulges toward the eye),
//       //            dO 2 (m for flat, cm otherwise: the object's distance from the surface), look 0 (° view angle,
//       //            flat only), orient 'up' (eye above) | 'right', object 'coin' | 'fish'; hide: image
//       // lens:      f 10 (signed, cm), dO 25, hO 4, obj 'arrow' | 'star', tilt 3 (° for a star), mask 0 (the fraction
//       //            covered, from the top), rays 'principal' | 'fan' | 'both' | 'none', image true (false: rays stop
//       //            at the lens and no image is drawn), unit 'cm' | 'mm', view null ([x0, x1]), ap null (half-aperture),
//       //            drag true; hide: image di m F
//       // mirror:    f 10 (concave > 0, convex < 0, Infinity: plane), dO 30, hO 4, obj, tilt, image, unit, view, ap, drag
//       // system:    kind 'telescope' | 'microscope', f1, f2, sep (cm), tilt (°, telescope), dO, hO (microscope)
//   } }

import { Plot } from '../plot.js';
import * as O from '../model/optics-rays.js';
import { wavelengthRGB } from '../model/optics-waves.js';

const MODES = ['interface', 'prism', 'fibre', 'surface', 'lens', 'mirror', 'system'];
export const defaults = { mode: 'lens', controls: true, readout: true, labels: true, hide: [] };
const MODE_DEFAULTS = {
  interface: { n1: 1, n2: 1.33, angle: 40, pol: 'u', fresnel: true, waves: false, graph: false, polControl: false },
  prism: { apex: 60, angle: 50, mat: 'crown', light: 'white', lambda: 589 },
  fibre: { nCore: 1.48, nClad: 1.46, angle: 10 },
  surface: { n1: 1.33, n2: 1, R: Infinity, dO: 2, look: 0, orient: 'up', object: 'coin' },
  lens: { f: 10, dO: 25, hO: 4, obj: 'arrow', tilt: 3, mask: 0, rays: 'principal', image: true, unit: 'cm', view: null, ap: null, drag: true },
  mirror: { f: 10, dO: 30, hO: 4, obj: 'arrow', tilt: 3, rays: 'principal', image: true, unit: 'cm', view: null, ap: null, drag: true },
  system: { kind: 'telescope', f1: 36, f2: 9, sep: 45, tilt: 4, dO: 4.6, hO: 0.6 },
};
const SYSTEM_PRESETS = {
  telescope: { f1: 36, f2: 9, sep: 45, tilt: 4 },
  microscope: { f1: 4, f2: 6, sep: 30, dO: 4.8, hO: 0.6 },
};
const MIRROR_CAPTION = 'Ideal spherical mirror (paraxial): rays reflect so that all of them pass through (or seem to come from) the image point. Real wide mirrors blur slightly (spherical aberration). Lengths to scale.';
const PLANE_CAPTION = 'A plane mirror obeys the law of reflection exactly: every reflected ray seems to come from one point behind the mirror, as far behind it as the object is in front. Lengths to scale.';
const MATS = ['crown', 'flint', 'denseflint', 'water', 'diamond', 'silica'];
const MAT_LABEL = { crown: 'Crown glass', flint: 'Flint glass', denseflint: 'Dense flint', water: 'Water', diamond: 'Diamond', silica: 'Fused silica' };
const MEDIA = [[1, 'air'], [1.33, 'water'], [1.46, 'fused silica'], [1.5, 'glass'], [1.52, 'crown glass'], [1.62, 'flint glass'], [1.77, 'sapphire'], [2.42, 'diamond']];
const mediumName = (n) => (MEDIA.find(([v]) => Math.abs(v - n) < 0.004) || [0, ''])[1];
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
const deg = (r) => (r * 180) / Math.PI;
const rad = (d) => (d * Math.PI) / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Is the theme light? (Parsed from the background colour.) */
function lightTheme(pl) {
  const m = /^#([0-9a-f]{6})$/i.exec(pl.col.bg.trim());
  if (!m) { const r = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(pl.col.bg); return r ? (+r[1] + +r[2] + +r[3]) / 3 > 140 : false; }
  const v = parseInt(m[1], 16);
  return ((v >> 16) + ((v >> 8) & 255) + (v & 255)) / 3 > 140;
}
/** A display colour for a wavelength, darkened on a light background so yellow stays visible. */
function specColor(pl, l, a = 1) {
  const c = wavelengthRGB(l) || [200, 200, 200];
  return rgb(lightTheme(pl) ? c.map((v) => Math.round(v * 0.72)) : c, a);
}

// ─── drawing helpers ───────────────────────────────────────────────────────

/** A ray (polyline) with small arrowheads showing which way the light goes. */
function ray(pl, pts, o = {}) {
  pl.path(pts, { color: o.color || 'gold', width: o.width ?? 2, alpha: o.alpha ?? 1, dash: o.dash });
  if (o.heads === false) return;
  const g = pl.ctx;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    const ax = pl.X(a[0]), ay = pl.Y(a[1]), bx = pl.X(b[0]), by = pl.Y(b[1]);
    const L = Math.hypot(bx - ax, by - ay);
    if (L < 46 || (o.only && !o.only.includes(i))) continue;
    // keep the head inside the frame
    const f = o.at ?? 0.5;
    let mx = ax + (bx - ax) * f, my = ay + (by - ay) * f;
    if (mx < pl.L || mx > pl.R || my < pl.T || my > pl.B) {
      const cx = clamp((pl.L + pl.R) / 2, Math.min(ax, bx), Math.max(ax, bx)), t = Math.abs(bx - ax) > 1 ? (cx - ax) / (bx - ax) : 0.5;
      mx = ax + (bx - ax) * clamp(t, 0.2, 0.8); my = ay + (by - ay) * clamp(t, 0.2, 0.8);
      if (mx < pl.L || mx > pl.R || my < pl.T || my > pl.B) continue;
    }
    const ux = (bx - ax) / L, uy = (by - ay) / L, s = o.head ?? 6.5;
    g.save();
    g.globalAlpha = o.alpha ?? 1;
    g.fillStyle = pl.color(o.color || 'gold');
    g.beginPath();
    g.moveTo(mx + ux * s, my + uy * s);
    g.lineTo(mx - ux * s - uy * s * 0.75, my - uy * s + ux * s * 0.75);
    g.lineTo(mx - ux * s + uy * s * 0.75, my - uy * s - ux * s * 0.75);
    g.closePath(); g.fill();
    g.restore();
  }
}

/** An upright or inverted arrow (an object or image) from (x, 0) to (x, h). */
function arrowObj(pl, x, h, o = {}) {
  if (Math.abs(h) < 1e-9) { pl.point(x, 0, { color: o.color, r: 4 }); return; }
  const g = pl.ctx, px = pl.X(x), p0 = pl.Y(0), p1 = pl.Y(h), dir = Math.sign(p1 - p0);
  g.save();
  g.globalAlpha = o.alpha ?? 1;
  g.strokeStyle = pl.color(o.color || 'accent'); g.fillStyle = pl.color(o.color || 'accent');
  g.lineWidth = o.width ?? 3.2; g.lineCap = 'round';
  g.setLineDash(o.dash || []);
  g.beginPath(); g.moveTo(px, p0); g.lineTo(px, p1 - dir * 9); g.stroke();
  g.setLineDash([]);
  g.beginPath(); g.moveTo(px, p1); g.lineTo(px - 7, p1 - dir * 12); g.lineTo(px + 7, p1 - dir * 12); g.closePath();
  if (o.dash) { g.lineWidth = 1.8; g.stroke(); } else g.fill();
  g.restore();
}

/** A simple eye, looking along direction (dx, dy) (world), drawn at (x, y). */
function eye(pl, x, y, dx, dy, o = {}) {
  const g = pl.ctx, cx = pl.X(x), cy = pl.Y(y), ang = Math.atan2(-dy, dx) + Math.PI, s = o.size ?? 13;
  g.save();
  g.translate(cx, cy); g.rotate(ang);
  g.strokeStyle = pl.color(o.color || 'ink2'); g.fillStyle = pl.color('panel'); g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * 0.85, s, 0); g.quadraticCurveTo(0, s * 0.85, -s, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = pl.color(o.color || 'ink2');
  g.beginPath(); g.arc(-s * 0.35, 0, s * 0.32, 0, Math.PI * 2); g.fill();
  g.restore();
}

/** A filled region given by world polygon points. */
const region = (pl, pts, color, alpha) => pl.path(pts, { fill: color, fillAlpha: alpha, stroke: false, close: true });

export async function mount(F, P0) {
  const mode = MODES.includes(P0.mode) ? P0.mode : 'lens';
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...(mode === 'system' ? SYSTEM_PRESETS[P0.kind || 'telescope'] : {}), ...P0 };
  const hide = new Set(P.hide || []);
  Object.assign(F.params, P);                     // parameters without a control keep their values
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const shown = (k) => P.controls === true || (Array.isArray(P.controls) && P.controls.includes(k));
  const slider = (o) => (shown(o.key) ? F.slider(o) : ((F.params[o.key] = o.value), null));
  const choice = (o) => (shown(o.key) ? F.choice(o) : ((F.params[o.key] = o.value), null));
  const toggle = (o) => (shown(o.key) ? F.toggle(o) : ((F.params[o.key] = o.value), null));
  const aspect = { interface: P.graph ? 'wide' : '', prism: '', fibre: 'wide', surface: '', lens: 'wide', mirror: 'wide', system: 'wide' }[mode];
  const { canvas } = F.canvas({ aspect, label: P.alt || {
    interface: 'A ray of light meeting the boundary between two media, with the reflected and refracted rays',
    prism: 'Light passing through a prism and spreading into colours',
    fibre: 'A ray of light launched into an optical fibre',
    surface: 'Looking at an object through a refracting surface: rays, their backward extensions and the image',
    lens: 'A thin lens, an object, the principal rays and the image',
    mirror: 'A curved mirror, an object, the principal rays and the image',
    system: 'Two lenses working together as an optical instrument',
  }[mode] });
  const ctx = canvas.getContext('2d');
  if (mode === 'fibre' || mode === 'system') canvas.parentElement.style.aspectRatio = '3 / 1';
  const S = { t: 0, running: false };
  let anim = null, lamCtl = null, fCtl = null;

  // ── controls ────────────────────────────────────────────────────────────
  if (mode === 'interface') {
    slider({ key: 'n1', label: 'Top medium $n_1$', min: 1, max: 2.5, step: 0.01, value: P.n1, explain: 'Refractive index where the light comes from: 1.00 air, 1.33 water, 1.50 glass, 2.42 diamond.' });
    slider({ key: 'n2', label: 'Bottom medium $n_2$', min: 1, max: 2.5, step: 0.01, value: P.n2, explain: 'Refractive index across the boundary. Light is slower where $n$ is larger: $v = c/n$.' });
    slider({ key: 'angle', label: 'Angle of incidence $\\theta_1$', min: 0, max: 89, step: 0.5, value: P.angle, unit: '^\\circ', explain: 'Measured from the normal (the dashed line perpendicular to the boundary). Or drag the start of the ray.' });
    if (P.polControl) choice({ key: 'pol', label: 'Light', options: [['u', 'Unpolarized'], ['s', 's'], ['p', 'p']], value: P.pol, explain: 'Which way the electric field oscillates: $s$ perpendicular to the page, $p$ in the plane of the page.' });
    else F.params.pol = P.pol;
    if (P.waves !== null) toggle({ key: 'waves', label: 'Show wavefronts', value: !!P.waves, explain: 'Crests of the wave, one wavelength apart; they bunch up where light is slower.' });
    else F.params.waves = false;
  } else if (mode === 'prism') {
    slider({ key: 'apex', label: 'Apex angle $A$', min: 30, max: 75, step: 1, value: P.apex, unit: '^\\circ', explain: 'The angle between the two faces the light passes through.' });
    slider({ key: 'angle', label: 'Angle of incidence $\\theta_1$', min: 0, max: 89, step: 0.5, value: P.angle, unit: '^\\circ', explain: 'Between the incoming beam and the first face’s normal.' });
    choice({ key: 'mat', label: 'Material', options: MATS.slice(0, 5).map((m) => [m, MAT_LABEL[m]]), value: P.mat, explain: 'Each has its own index, and its own spread of index across the colours (dispersion).' });
    choice({ key: 'light', label: 'Light', options: [['white', 'White'], ['mono', 'One colour']], value: P.light, explain: 'White light is every visible wavelength at once.' });
    lamCtl = slider({ key: 'lambda', label: 'Wavelength $\\lambda$', min: 380, max: 750, step: 1, value: P.lambda, unit: '\\mathrm{nm}', explain: 'The colour, as a wavelength in vacuum.' });
  } else if (mode === 'fibre') {
    slider({ key: 'angle', label: 'Launch angle $\\theta_0$', min: 0, max: 40, step: 0.5, value: P.angle, unit: '^\\circ', explain: 'Between the incoming ray and the fibre’s axis, in air.' });
    slider({ key: 'nCore', label: 'Core index $n_\\text{core}$', min: 1.4, max: 1.7, step: 0.005, value: P.nCore, explain: 'The glass the light travels in.' });
    slider({ key: 'nClad', label: 'Cladding index $n_\\text{clad}$', min: 1.3, max: 1.7, step: 0.005, value: P.nClad, explain: 'The glass around the core: slightly lower, so light skimming the boundary reflects totally.' });
  } else if (mode === 'surface') {
    const flat = !Number.isFinite(P.R);
    slider({ key: 'dO', label: flat ? 'Real depth $d$' : 'Object distance $d_o$', min: flat ? 0.5 : 2, max: flat ? 4 : 40, step: flat ? 0.05 : 0.5, value: P.dO, unit: flat ? '\\mathrm{m}' : '\\mathrm{cm}', explain: flat ? 'How far below the surface the object really is.' : 'How far inside the surface the object is.' });
    if (flat) slider({ key: 'look', label: 'Viewing angle', min: 0, max: 70, step: 1, value: P.look, unit: '^\\circ', explain: 'Between your line of sight and the vertical.' });
    else F.params.look = 0;
    slider({ key: 'n1', label: 'Object’s medium $n_1$', min: 1, max: 2.5, step: 0.01, value: P.n1, explain: '1.33 for water.' });
  } else if (mode === 'lens' || mode === 'mirror') {
    const kinds = mode === 'lens' ? [['conv', 'Converging'], ['div', 'Diverging']] : [['concave', 'Concave'], ['convex', 'Convex'], ['plane', 'Plane']];
    const kind0 = mode === 'lens' ? (P.f > 0 ? 'conv' : 'div') : (!Number.isFinite(P.f) ? 'plane' : P.f > 0 ? 'concave' : 'convex');
    choice({ key: 'kind', label: mode === 'lens' ? 'Lens' : 'Mirror', options: kinds, value: kind0, explain: mode === 'lens' ? 'Thicker in the middle (converging) or at the edges (diverging).' : 'Curved in toward the object (concave), out toward it (convex), or flat.' });
    const fabs = Number.isFinite(P.f) ? Math.abs(P.f) : 10;
    fCtl = slider({ key: 'fabs', label: 'Focal length $|f|$', min: 4, max: 20, step: 0.5, value: clamp(fabs, 4, 20), unit: `\\mathrm{${P.unit}}`, explain: mode === 'lens' ? 'Distance from the lens to each of its focal points F.' : 'Half the radius of curvature, $f = R/2$.' });
    F.params.f = P.f;
    if (P.obj === 'star') slider({ key: 'tilt', label: 'Star’s angle off axis', min: 0, max: 15, step: 0.5, value: P.tilt, unit: '^\\circ', explain: 'Light from a star arrives as parallel rays at this angle.' });
    else {
      slider({ key: 'dO', label: 'Object distance $d_o$', min: 1, max: 60, step: 0.5, value: P.dO, unit: `\\mathrm{${P.unit}}`, explain: 'From the object to the ' + (mode === 'lens' ? 'lens.' : 'mirror.') + ' Or drag the tip of the object.' });
      slider({ key: 'hO', label: 'Object height $h_o$', min: 1, max: 8, step: 0.5, value: P.hO, unit: `\\mathrm{${P.unit}}`, explain: 'How tall the object is.' });
    }
    if (mode === 'lens') slider({ key: 'mask', label: 'Lens covered', min: 0, max: 1, step: 0.05, value: P.mask, fmt: (v) => `${Math.round(v * 100)}\\%`, explain: 'Cover part of the lens with a card, from the top.' });
    else F.params.mask = 0;
    choice({ key: 'rays', label: 'Rays', options: [['principal', 'Principal'], ['fan', 'Fan'], ['both', 'Both']], value: P.rays === 'none' ? 'principal' : P.rays, explain: 'The three easy-to-draw rays, or a fan of many rays from the tip.' });
    if (P.rays === 'none') F.params.rays = 'none';
  } else if (mode === 'system') {
    slider({ key: 'f1', label: 'Objective focal length $f_o$', min: P.kind === 'telescope' ? 15 : 2, max: P.kind === 'telescope' ? 45 : 8, step: 0.5, value: P.f1, unit: '\\mathrm{cm}', explain: 'The lens facing the object.' });
    slider({ key: 'f2', label: 'Eyepiece focal length $f_e$', min: 3, max: 15, step: 0.5, value: P.f2, unit: '\\mathrm{cm}', explain: 'The lens you look through.' });
    if (P.kind === 'telescope') slider({ key: 'tilt', label: 'Star’s angle off axis $\\alpha$', min: 0.5, max: 6, step: 0.25, value: P.tilt, unit: '^\\circ', explain: 'Exaggerated: real stars are far closer together.' });
    else slider({ key: 'dO', label: 'Object distance $d_o$', min: P.f1 * 1.05, max: P.f1 * 2, step: 0.05, value: P.dO, unit: '\\mathrm{cm}', explain: 'Just outside the objective’s focal length.' });
  }
  if (mode === 'interface' && P.waves !== null && shown('waves') && P.controls !== false) {
    const btn = F.button({ label: 'Play', primary: true, onClick: () => {
      S.running = !S.running; btn.textContent = S.running ? 'Pause' : 'Play';
      if (S.running) { if (!F.params.waves) F.set('waves', true); anim.start(); }
    } });
    anim = F.animate((dt) => { if (!S.running) return; S.t += dt; draw(); }, { force: true });
    if (P.play && !reduced && P.waves) { S.running = true; btn.textContent = 'Pause'; }
  }

  F.onChange((k) => {
    if (k === 'kind' && mode === 'lens') F.params.f = (F.params.kind === 'conv' ? 1 : -1) * F.params.fabs;
    if (k === 'kind' && mode === 'mirror') { F.params.f = F.params.kind === 'plane' ? Infinity : (F.params.kind === 'concave' ? 1 : -1) * F.params.fabs; F.caption(F.params.kind === 'plane' ? PLANE_CAPTION : MIRROR_CAPTION); }
    if (k === 'fabs') F.params.f = mode === 'mirror' && F.params.kind === 'plane' ? Infinity : (mode === 'lens' ? (F.params.kind === 'conv' ? 1 : -1) : F.params.kind === 'concave' ? 1 : -1) * F.params.fabs;
    draw();
  });

  const main = new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: true, grid: false, axes: false });
  const side = new Plot(canvas, { x: [0, 90], y: [0, 1], grid: true, axes: true });

  // fixed views (so a dragged object stays under the pointer)
  const views = {};
  function lensView() {
    if (views.lens) return views.lens;
    if (P.view) return (views.lens = P.view);
    const f = P.f, af = Number.isFinite(f) ? Math.abs(f) : 10, mirror = mode === 'mirror';
    if (P.obj === 'star') {
      const span = Math.max(3.2 * af, 24);
      return (views.lens = mirror ? [-span * 0.8, span * 0.2] : [-span * 0.42, span * 0.58]);
    }
    const im = Number.isFinite(f) ? O.thinLens(f, P.dO) : { dI: -P.dO };
    const xs = [0, mirror ? -P.dO : -P.dO];
    if (Number.isFinite(f)) xs.push(mirror ? -2 * f : -f, mirror ? -f : f, mirror ? 0 : 1.6 * f);
    if (Number.isFinite(im.dI) && Math.abs(im.dI) < 6 * af + 2 * P.dO) xs.push(mirror ? -im.dI : im.dI);
    if (P.controls === true) xs.push(mirror ? -Math.min(60, Math.max(P.dO, 2.6 * af)) : -Math.min(60, Math.max(P.dO, 2.6 * af)));
    let x0 = Math.min(...xs), x1 = Math.max(...xs);
    const pad = 0.1 * (x1 - x0) + 2;
    x0 -= pad; x1 += pad;
    if (!mirror) x1 = Math.max(x1, 0.35 * (x1 - x0));
    else x1 = Math.max(x1, 0.12 * (x1 - x0));
    return (views.lens = [x0, x1]);
  }

  // ── the modes ───────────────────────────────────────────────────────────
  function frame(pl, pad) {
    pl.o.pad = pad;
    pl.resize(); pl.refreshTheme();
  }

  function draw() {
    main.resize(); main.refreshTheme();
    ctx.clearRect(0, 0, main.w, main.h);
    ({ interface: drawInterface, prism: drawPrism, fibre: drawFibre, surface: drawSurface, lens: drawLens, mirror: drawLens, system: drawSystem })[mode]();
  }

  // ── interface ───────────────────────────────────────────────────────────
  function drawInterface() {
    const { n1, n2, angle, pol } = F.params;
    const W = main.w, H = main.h, graph = !!P.graph && W > 360;
    const split = graph ? Math.round(W * 0.56) : W;
    frame(main, { l: 6, r: W - split + 6, t: 6, b: 6 });
    main.setView([-1.25, 1.25], [-1, 1]);
    const th1 = rad(angle), th2 = O.snell(n1, n2, th1), tir = Number.isNaN(th2);
    const fr = O.fresnel(n1, n2, th1), R = pol === 's' ? fr.Rs : pol === 'p' ? fr.Rp : fr.R;
    const lt = lightTheme(main);
    // the two media
    const X0 = main.vx0, X1 = main.vx1, Y0 = main.vy0, Y1 = main.vy1;
    const tint = (n) => Math.min(0.42, 0.05 + 0.22 * (n - 1));
    region(main, [[X0, 0], [X1, 0], [X1, Y1], [X0, Y1]], 'accent', tint(n1));
    region(main, [[X0, 0], [X1, 0], [X1, Y0], [X0, Y0]], 'accent', tint(n2));
    main.line(X0, 0, X1, 0, { color: 'ink3', width: 1.6 });
    if (P.labels) {
      const lab = (n) => `${mediumName(n) ? mediumName(n) + ', ' : ''}n = ${n.toFixed(2)}`;
      main.text(lab(n1), X0 + 0.06, Y1 - 0.08, { color: 'ink2', size: 12, weight: 600 });
      main.text(lab(n2), X0 + 0.06, Y0 + 0.08, { color: 'ink2', size: 12, weight: 600 });
    }
    // the normal
    main.line(0, -0.95, 0, 0.95, { color: 'ink3', width: 1.2, dash: [5, 5] });
    if (P.labels && !hide.has('normal-label')) main.text('normal', 0.03, 0.9, { color: 'ink3', size: 11 });
    const L = 1.3, inc = [-Math.sin(th1) * L, Math.cos(th1) * L];
    // the critical angle, faint, when there is one
    const crit = O.criticalAngle(n1, n2);
    if (!Number.isNaN(crit) && !hide.has('critical')) {
      main.line(0, 0, -Math.sin(crit) * 0.9, Math.cos(crit) * 0.9, { color: 'bad', width: 1.2, dash: [3, 4], alpha: 0.7 });
      // the label goes on the side of the dashed line away from the incident ray
      const beyond = th1 > crit;
      if (P.labels) main.text(`critical angle ${trim(deg(crit))}°`, -Math.sin(crit) * 0.78, Math.cos(crit) * 0.78, { color: 'bad', size: 11, align: beyond ? 'left' : 'right', dx: beyond ? 7 : -7, dy: beyond ? 6 : -4 });
    }
    // wavefronts in a beam about the incident and refracted rays
    if (F.params.waves && !tir && !hide.has('refracted')) {
      const lam1 = 0.13, lam2 = (lam1 * n1) / n2, w = 0.2;
      const d1 = [Math.sin(th1), -Math.cos(th1)], p1 = [Math.cos(th1), Math.sin(th1)];
      const d2 = [Math.sin(th2), -Math.cos(th2)], p2 = [Math.cos(th2), Math.sin(th2)];
      const w2 = (w * Math.cos(th2)) / Math.cos(th1);
      const off = ((S.t * 0.12) % lam1 + lam1) % lam1;
      region(main, [[inc[0] - p1[0] * w, inc[1] - p1[1] * w], [inc[0] + p1[0] * w, inc[1] + p1[1] * w], [w / Math.cos(th1), 0], [-w / Math.cos(th1), 0]], 'gold', 0.08);
      const far = 1.35;
      region(main, [[-w / Math.cos(th1), 0], [w / Math.cos(th1), 0], [d2[0] * far + p2[0] * w2, d2[1] * far + p2[1] * w2], [d2[0] * far - p2[0] * w2, d2[1] * far - p2[1] * w2]], 'gold', 0.08);
      for (let m = -14; m <= 14; m++) {
        const s = m * lam1 + off;                       // r·d1 = s on this wavefront (medium 1)
        // medium 1 part: points s·d1 + u·p1, |u| ≤ w, y ≥ 0
        const seg1 = [];
        for (const u of [-w, w]) seg1.push([s * d1[0] + u * p1[0], s * d1[1] + u * p1[1]]);
        const s2 = (s * n1) / n2;                       // r·d2 = s2 (medium 2)
        const seg2 = [];
        for (const v of [-w2, w2]) seg2.push([s2 * d2[0] + v * p2[0], s2 * d2[1] + v * p2[1]]);
        // clip each to its half
        const clip = (seg, up) => {
          const [a, b] = seg, ya = a[1], yb = b[1];
          const ok = (y) => (up ? y >= 0 : y <= 0);
          if (ok(ya) && ok(yb)) return seg;
          if (!ok(ya) && !ok(yb)) return null;
          const t = ya / (ya - yb), k = [a[0] + t * (b[0] - a[0]), 0];
          return ok(ya) ? [a, k] : [k, b];
        };
        const c1 = clip(seg1, true), c2 = clip(seg2, false);
        const fade = (pt) => (Math.hypot(pt[0], pt[1]) < 1.32 ? 1 : 0);
        if (c1 && fade(c1[0]) && fade(c1[1])) main.path(c1, { color: lt ? '#b07a00' : 'gold', width: 2, alpha: 0.9 });
        if (c2 && fade(c2[0]) && fade(c2[1])) main.path(c2, { color: lt ? '#b07a00' : 'gold', width: 2, alpha: 0.9 });
      }
    }
    // rays: strengths from the Fresnel equations (never fainter than a hint)
    const useF = P.fresnel !== false;
    const aR = useF ? 0.18 + 0.82 * Math.sqrt(R) : 0.9, aT = useF ? 0.18 + 0.82 * Math.sqrt(1 - R) : 0.9;
    ray(main, [inc, [0, 0]], { color: 'gold', width: 2.6 });
    if (!hide.has('reflected')) ray(main, [[0, 0], [Math.sin(th1) * L, Math.cos(th1) * L]], { color: 'gold', width: 1 + 1.8 * (useF ? R : 0.6), alpha: tir ? 1 : aR });
    if (!tir && !hide.has('refracted')) ray(main, [[0, 0], [Math.sin(th2) * L, -Math.cos(th2) * L]], { color: 'gold', width: 1 + 1.8 * (useF ? 1 - R : 0.6), alpha: aT });
    // angle arcs
    const arc = (a0, a1, r, color) => {
      const n = 24, pts = [];
      for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([r * Math.cos(a), r * Math.sin(a)]); }
      main.path(pts, { color, width: 1.6 });
    };
    if (angle > 0.5) {
      // labels sit beside the rays, at the outer ends of their arcs
      arc(Math.PI / 2, Math.PI / 2 + th1, 0.26, 'ink2');
      if (P.labels && !hide.has('theta1')) main.text(`θ₁ = ${trim(angle)}°`, -Math.sin(th1) * 0.36, Math.cos(th1) * 0.36, { color: 'ink', size: 12, align: 'right', dx: -10, dy: -2 });
      if (!hide.has('reflected')) { arc(Math.PI / 2 - th1, Math.PI / 2, 0.2, 'ink3'); if (P.labels && !hide.has('theta1')) main.text(`${trim(angle)}°`, Math.sin(th1) * 0.28, Math.cos(th1) * 0.28, { color: 'ink2', size: 11, dx: 9, dy: -2 }); }
      if (!tir && !hide.has('refracted')) {
        arc(-Math.PI / 2, -Math.PI / 2 + th2, 0.26, 'ink2');
        if (P.labels) main.text(hide.has('theta2') ? 'θ₂ = ?' : `θ₂ = ${trim(deg(th2))}°`, Math.sin(th2) * 0.36, -Math.cos(th2) * 0.36, { color: 'ink', size: 12, dx: 10, dy: 2 });
      }
    }
    if (tir && P.labels && !hide.has('refracted')) main.text('total internal reflection: no light crosses', 0.06, -0.3, { color: 'bad', size: 12, weight: 600 });
    // the start of the incident ray is a handle
    main.drawHandles();

    if (graph) {
      frame(side, { l: split + 40, r: 14, t: 26, b: 34 });
      side.o.xlabel = 'angle of incidence (°)'; side.o.ylabel = ''; side.o.xticks = 6;
      const thMax = Number.isNaN(crit) ? 90 : Math.min(90, deg(crit) + 0.0001);
      side.setView([0, 90], [0, 1.05]);
      side.grid(); side.axes();
      const Rf = (key) => (x) => (x > thMax ? 1 : O.fresnel(n1, n2, rad(x))[key]);
      side.fn(Rf('Rs'), { color: 'violet', width: 2.2 });
      side.fn(Rf('Rp'), { color: 'teal', width: 2.2 });
      side.fn(Rf('R'), { color: 'ink3', width: 1.4, dash: [5, 4] });
      side.line(angle, 0, angle, 1.05, { color: 'gold', width: 1.4, dash: [3, 3] });
      const b = deg(O.brewster(n1, n2));
      if (b < thMax && !hide.has('brewster')) { side.point(b, 0, { color: 'teal', r: 4.5 }); side.text(`Brewster ${trim(b)}°`, b, 0.06, { color: 'teal', size: 11, align: b > 60 ? 'right' : 'left', dx: b > 60 ? -6 : 6 }); }
      side.text('reflectance R', side.L + 4, side.T - 14, { screen: true, color: 'ink2', size: 11.5, weight: 600 });
      side.text('s', side.X(84), side.Y(Rf('Rs')(84)) - 10, { screen: true, color: 'violet', size: 12, weight: 700, align: 'right' });
      side.text('p', side.X(76), side.Y(Rf('Rp')(76)) + 12, { screen: true, color: 'teal', size: 12, weight: 700, align: 'right' });
    }
    if (P.readout !== false) {
      const rows = [];
      if (!hide.has('theta2')) rows.push(['refraction angle $\\theta_2$', tir ? '\\text{none (total reflection)}' : `${trim(deg(th2))}^\\circ`]);
      if (!Number.isNaN(crit) && !hide.has('critical')) rows.push(['critical angle $\\theta_c$', `${trim(deg(crit))}^\\circ`]);
      if (useF && !hide.has('R')) rows.push([`reflected${pol === 'u' ? '' : ` (${pol})`}`, 100 * R >= 0.1 ? `${trim(100 * R, 2)}\\%` : 100 * R >= 0.001 ? `${(100 * R).toFixed(3)}\\%` : '\\approx 0']);
      if (!hide.has('speed')) rows.push(['speed ratio $v_2/v_1 = n_1/n_2$', trim(n1 / n2)]);
      F.readout(rows);
    }
  }

  // ── prism ───────────────────────────────────────────────────────────────
  function drawPrism() {
    const { apex, angle, mat, light } = F.params;
    if (lamCtl) lamCtl.node.hidden = light !== 'mono';
    const W = main.w;
    frame(main, { l: 6, r: 6, t: 6, b: 6 });
    main.setView([-2.1, 2.5], [-1.15, 1.45]);
    const A = rad(apex), h = 1.15, verts = O.prismVerts(A, h);
    region(main, verts, 'accent', 0.2);
    main.path([...verts, verts[0]], { color: 'accent2', width: 1.8 });
    // the incoming beam hits the left face 55% of the way up
    const f = 0.55, p = [verts[0][0] * (1 - f) + verts[2][0] * f, verts[0][1] * (1 - f) + verts[2][1] * f];
    const inward = [Math.cos(A / 2), -Math.sin(A / 2)];
    const th1 = rad(angle), d = [inward[0] * Math.cos(th1) - inward[1] * Math.sin(th1), inward[0] * Math.sin(th1) + inward[1] * Math.cos(th1)];
    const o = [p[0] - 3.5 * d[0], p[1] - 3.5 * d[1]];
    const lams = light === 'white' ? Array.from({ length: 15 }, (_, i) => 400 + i * 21.43) : [F.params.lambda];
    // normal at the first face
    main.line(p[0] - inward[0] * 0.45, p[1] - inward[1] * 0.45, p[0] + inward[0] * 0.3, p[1] + inward[1] * 0.3, { color: 'ink3', width: 1.1, dash: [4, 4] });
    let tirAny = false;
    const exits = [];
    const lt = lightTheme(main);
    // the white beam coming in
    ray(main, [o, p], { color: light === 'white' ? (lt ? 'ink2' : 'ink') : specColor(main, F.params.lambda), width: 3 });
    for (const l of lams) {
      const n = O.indexOf(mat, l), sc = O.polygonScene(verts, n);
      const tr = O.trace(sc, o, d, { length: 8 });
      const col = specColor(main, l, light === 'white' ? 0.85 : 1);
      const legs = tr.legs.slice(1), last = legs[legs.length - 1];
      if (legs.length > 2) tirAny = true;
      // inside the glass the colours have barely separated: white light there, colours once out
      main.path(legs.slice(0, -1).map((L0) => L0.a).concat([last.a]), { color: light === 'white' ? (lt ? 'ink2' : 'ink') : col, width: light === 'white' ? 2.2 : 2.4, alpha: light === 'white' ? 0.5 : 1 });
      main.path([last.a, last.b], { color: col, width: light === 'white' ? 1.6 : 2.4 });
      exits.push({ l, n, dir: tr.end.dir });
    }
    if (P.labels) {
      main.text(MAT_LABEL[mat].toLowerCase(), 0, 0.22, { align: 'center', color: 'ink2', size: 11.5, weight: 600 });
      main.text(`A = ${apex}°`, 0, h - 0.3, { align: 'center', color: 'ink3', size: 11 });
      main.text(`θ₁ = ${trim(angle)}°`, p[0] - inward[0] * 0.5, p[1] - inward[1] * 0.5, { color: 'ink2', size: 11.5, align: 'right', dx: -4 });
      if (tirAny) main.text('totally reflected inside', 0.15, -0.12, { color: 'bad', size: 11.5, weight: 600 });
    }
    if (P.readout !== false) {
      const l0 = light === 'white' ? 589 : F.params.lambda, n0 = O.indexOf(mat, l0);
      const pr = O.prism(A, n0, th1);
      const rows = [[`index at ${trim(l0)} nm`, n0.toFixed(4)]];
      if (!hide.has('deviation')) rows.push([`deviation at ${trim(l0)} nm`, pr.tir ? '\\text{trapped}' : `${trim(deg(pr.delta))}^\\circ`]);
      if (light === 'white') {
        const pv = O.prism(A, O.indexOf(mat, 400), th1), pr7 = O.prism(A, O.indexOf(mat, 700), th1);
        if (!pv.tir && !pr7.tir && !hide.has('spread')) rows.push(['violet − red (400 vs 700 nm)', `${trim(deg(pv.delta - pr7.delta))}^\\circ`]);
        rows.push(['index violet / red', `${O.indexOf(mat, 400).toFixed(3)} / ${O.indexOf(mat, 700).toFixed(3)}`]);
      }
      if (!hide.has('deviation')) rows.push(['least possible deviation', `${trim(deg(O.minDeviation(A, n0)))}^\\circ`]);
      F.readout(rows);
    }
  }

  // ── fibre ───────────────────────────────────────────────────────────────
  function drawFibre() {
    const { nCore, nClad, angle } = F.params;
    frame(main, { l: 6, r: 6, t: 6, b: 6 });
    const a = 0.6, b = 1.05, J = 1.5, Lf = 30;
    main.setView([-3, 15], [-3, 3]);
    const lt = lightTheme(main);
    // jacket, cladding, core
    region(main, [[0, b], [Lf, b], [Lf, J], [0, J]], 'ink4', 0.35);
    region(main, [[0, -b], [Lf, -b], [Lf, -J], [0, -J]], 'ink4', 0.35);
    region(main, [[0, a], [Lf, a], [Lf, b], [0, b]], 'accent', 0.12);
    region(main, [[0, -a], [Lf, -a], [Lf, -b], [0, -b]], 'accent', 0.12);
    region(main, [[0, -a], [Lf, -a], [Lf, a], [0, a]], 'accent', 0.3);
    main.line(0, -J, 0, J, { color: 'ink3', width: 1.4 });
    // the acceptance cone (in air)
    const acc = O.fibreAcceptance(nCore, nClad);
    if (!hide.has('acceptance') && acc.NA > 0) {
      const t = Math.min(acc.thetaMax, rad(80)), Lc = 2.6;
      region(main, [[0, 0], [-Lc * Math.cos(t), Lc * Math.sin(t)], [-Lc * Math.cos(t), -Lc * Math.sin(t)]], 'good', 0.1);
      main.line(0, 0, -Lc * Math.cos(t), Lc * Math.sin(t), { color: 'good', width: 1, dash: [4, 4] });
      main.line(0, 0, -Lc * Math.cos(t), -Lc * Math.sin(t), { color: 'good', width: 1, dash: [4, 4] });
      if (P.labels) main.text(`accepted within ±${trim(deg(acc.thetaMax))}°`, -2.9, -2.45, { color: 'good', size: 11.5 });
    }
    // the ray: refract in at the end face, then bounce; partial reflections fade
    const th0 = rad(angle);
    const start = [-2.8, 2.8 * Math.tan(th0) * 0 + 0], dir0 = [Math.cos(th0), -Math.sin(th0)];
    const entry = [0, start[1] + (dir0[1] / dir0[0]) * (0 - start[0])];
    // aim so the ray enters near the axis
    const shift = -entry[1];
    const s0 = [start[0], start[1] + shift], e0 = [0, 0];
    ray(main, [s0, e0], { color: 'gold', width: 2.6 });
    const th1 = Math.asin(Math.sin(th0) / nCore);
    let p = e0, d = [Math.cos(th1), -Math.sin(th1)], power = 1;
    const crit = O.criticalAngle(nCore, nClad);
    let bounces = 0, leaked = false;
    while (power > 0.03 && p[0] < 15 && bounces < 60) {
      if (Math.abs(d[1]) < 1e-9) { ray(main, [p, [15, p[1]]], { color: 'gold', width: 2.4, alpha: power }); break; }
      const yb = d[1] > 0 ? a : -a, t = (yb - p[1]) / d[1], q = [p[0] + t * d[0], yb];
      ray(main, [p, q], { color: 'gold', width: 2.4, alpha: Math.max(0.15, power), heads: bounces < 2 });
      const inc = Math.acos(Math.abs(d[1]));            // angle of incidence on the boundary
      const fr = O.fresnel(nCore, nClad, inc);
      if (fr.tir) { d = [d[0], -d[1]]; }
      else {
        // the transmitted part crosses the cladding into the jacket, where it is absorbed
        const tc = O.snell(nCore, nClad, inc), dc = [Math.sin(tc), Math.sign(d[1]) * Math.cos(tc)];
        const yb2 = Math.sign(d[1]) * b, t2 = (yb2 - q[1]) / dc[1], q2 = [q[0] + t2 * dc[0], yb2];
        ray(main, [q, q2, [q2[0] + 0.35 * dc[0], q2[1] + 0.35 * dc[1]]], { color: 'bad', width: 1.8, alpha: Math.max(0.15, power * fr.T), heads: false });
        leaked = true;
        power *= fr.R;
        d = [d[0], -d[1]];
      }
      p = q; bounces++;
    }
    if (P.labels) {
      main.text('core', 14.6, a * 0.55, { color: 'ink2', size: 11.5, align: 'right', weight: 600 });
      main.text('cladding', 14.6, (a + b) / 2, { color: 'ink3', size: 11, align: 'right' });
      main.text('protective jacket', 14.6, (b + J) / 2, { color: 'ink3', size: 11, align: 'right' });
      main.text(`θ₀ = ${trim(angle)}°`, -2.8, 1.25 + Math.tan(th0) * 2.8, { color: 'ink2', size: 11.5 });
      if (leaked) main.text('light leaks out at every bounce', 3, -2.45, { color: 'bad', size: 11.5, weight: 600 });
      else main.text('total internal reflection at every bounce', 3, -2.45, { color: 'good', size: 11.5, weight: 600 });
    }
    if (P.readout !== false) {
      const inc = deg(Math.PI / 2 - th1);
      const rows = [['angle inside the core, to the axis', `${trim(deg(th1))}^\\circ`], ['angle of incidence on the cladding', `${trim(inc)}^\\circ`]];
      if (!Number.isNaN(crit)) rows.push(['critical angle', `${trim(deg(crit))}^\\circ`]);
      if (!hide.has('acceptance')) rows.push(['numerical aperture $\\sqrt{n_\\text{core}^2 - n_\\text{clad}^2}$', trim(acc.NA)]);
      F.readout(rows);
    }
  }

  // ── a single refracting surface ─────────────────────────────────────────
  function drawSurface() {
    const { n1, dO, look } = F.params, n2 = P.n2, R = P.R, flat = !Number.isFinite(R);
    const up = P.orient !== 'right';
    frame(main, { l: 6, r: 6, t: 6, b: 6 });
    // model coordinates: the surface's vertex at 0, the object at x = −dO, the eye toward +x;
    // 'up' turns the picture so that the eye is above
    const map = up ? ([x, y]) => [-y, x] : ([x, y]) => [x, y];
    const ap = flat ? 1e4 : Math.abs(R) * 0.98;
    const sc = O.surfaceScene(R, n1, n2, ap);
    // a narrow pencil of exact rays from the object toward the eye
    let hits;
    if (flat) {
      const alpha = Math.asin((n2 * Math.sin(rad(look))) / n1), c = dO * Math.tan(alpha), w = 0.05 * dO * Math.cos(alpha);
      hits = [c - w, c, c + w];
    } else { const w = Math.min(0.12 * Math.abs(R), 0.18 * dO); hits = [-w, 0, w]; }
    const outs = [];
    for (const yh of hits) {
      const tr = O.trace(sc, [-dO, 0], [dO + sc.xs(yh), yh], { maxHits: 1, length: 1 });
      if (tr.legs.length >= 2) outs.push({ q: tr.legs[1].a, dir: tr.end.dir });
    }
    if (outs.length < 3) return;
    // the eye, on the central ray; the pencil ends where it reaches the eye
    const c = outs[1], k = flat ? 0.9 * dO : 1.1 * Math.max(dO, Math.abs(R) * 0.7);
    const E = [c.q[0] + c.dir[0] * k, c.q[1] + c.dir[1] * k];
    for (const o of outs) {
      const t = ((E[0] - o.q[0]) * c.dir[0] + (E[1] - o.q[1]) * c.dir[1]) / (o.dir[0] * c.dir[0] + o.dir[1] * c.dir[1]);
      o.e = [o.q[0] + o.dir[0] * t, o.q[1] + o.dir[1] * t];
    }
    // where it appears: for a flat surface the limit of an infinitely thin pencil (exact);
    // for a curved one, where the outer rays' backward extensions cross
    let img = null;
    if (flat) { const a0 = O.apparentPoint(dO, n1, n2, rad(look)); img = [a0.y, a0.x]; }
    else {
      const A1 = outs[0], A2 = outs[2], den = A1.dir[0] * A2.dir[1] - A1.dir[1] * A2.dir[0];
      if (Math.abs(den) > 1e-12) { const wx = A2.q[0] - A1.q[0], wy = A2.q[1] - A1.q[1], t1 = (wx * A2.dir[1] - wy * A2.dir[0]) / den; img = [A1.q[0] + t1 * A1.dir[0], A1.q[1] + t1 * A1.dir[1]]; }
      else img = [-dO, 0];
    }
    // the view: everything in it, to scale
    const pts = [[-dO, 0], E, img, [0, 0], ...outs.map((o) => o.q)].map(map);
    if (!flat) pts.push(map([R - Math.abs(R), 0]), map([R + Math.abs(R), 0]), map([R, Math.abs(R)]), map([R, -Math.abs(R)]));
    let X0 = Math.min(...pts.map((q) => q[0])), X1 = Math.max(...pts.map((q) => q[0])), Y0 = Math.min(...pts.map((q) => q[1])), Y1 = Math.max(...pts.map((q) => q[1]));
    const padv = 0.14 * Math.max(X1 - X0, Y1 - Y0);
    main.setView([X0 - padv, X1 + padv], [Y0 - padv, Y1 + padv]);
    // media
    const tint = Math.min(0.42, 0.05 + 0.22 * (n1 - 1));
    if (flat) {
      const big = 50 * (dO + 1);
      region(main, (up ? [[-big, 0], [big, 0], [big, -big], [-big, -big]] : [[0, -big], [0, big], [-big, big], [-big, -big]]), 'accent', tint);
      main.line(...(up ? [-big, 0, big, 0] : [0, -big, 0, big]), { color: 'ink3', width: 1.6 });
      if (P.labels) {
        const wl = map([0, 0]);
        main.text(up ? 'water surface' : 'surface', up ? main.vx1 : wl[0], up ? 0 : main.vy1, { color: 'ink3', size: 11, align: up ? 'right' : 'left', dx: up ? -6 : 6, dy: up ? -9 : 12 });
      }
    } else {
      const ring = [];
      for (let i = 0; i <= 120; i++) { const t = (2 * Math.PI * i) / 120; ring.push(map([R + Math.abs(R) * Math.cos(t), Math.abs(R) * Math.sin(t)])); }
      region(main, ring, 'accent', tint);
      main.path(ring, { color: 'ink3', width: 1.6 });
    }
    // the rays, their backward extensions and the eye
    const obj = map([-dO, 0]);
    for (const o of outs) {
      main.path([obj, map(o.q)], { color: 'gold', width: 1.7 });
      ray(main, [map(o.q), map(o.e)], { color: 'gold', width: 1.7, at: 0.45 });
      if (img && !hide.has('image')) main.path([map(o.q), map(img)], { color: 'gold', width: 1.1, dash: [4, 4], alpha: 0.8 });
    }
    main.point(obj[0], obj[1], { color: 'warn', r: 6 });
    if (P.labels) main.text(P.object === 'fish' ? 'fish' : 'coin', obj[0], obj[1], { color: 'warn', size: 11.5, dx: 10, dy: 10, weight: 600 });
    if (img && !hide.has('image')) {
      const im = map(img);
      const rr = Math.abs(main.ix(main.X(0) + 7) - main.ix(main.X(0)));
      main.circle(im[0], im[1], rr, { color: 'warn', width: 1.8, dash: [3, 3] });
      if (P.labels) main.text('where it appears', im[0], im[1], { color: 'warn', size: 11.5, dx: -12, dy: -2, align: 'right', weight: 600 });
    }
    const Ew = map(E), Ed = map([-c.dir[0], -c.dir[1]]);
    const spread = Math.hypot(main.X(map(outs[0].e)[0]) - main.X(map(outs[2].e)[0]), main.Y(map(outs[0].e)[1]) - main.Y(map(outs[2].e)[1]));
    eye(main, Ew[0], Ew[1], Ed[0], Ed[1], { size: clamp(0.62 * spread, 11, 22) });
    if (P.readout !== false) {
      const unit = flat ? '\\mathrm{m}' : '\\mathrm{cm}';
      const par = O.surfaceImage(n1, n2, R, dO);
      const rows = [];
      if (!hide.has('image')) {
        if (flat) {
          rows.push(['apparent depth, looking straight down $d\\,n_2/n_1$', `${trim(O.apparentDepth(dO, n1, n2))}\\,${unit}`]);
          if (look > 0.5) rows.push(['apparent depth at this angle', `${trim(-img[0])}\\,${unit}`]);
        } else rows.push(['seems to be (paraxial)', `${trim(-par.dI)}\\,${unit}\\ \\text{inside}`], ['magnification', trim(par.m)]);
      }
      rows.push([flat ? 'real depth' : 'really', `${trim(dO)}\\,${unit}${flat ? '' : '\\ \\text{inside}'}`]);
      F.readout(rows);
    }
  }

  // ── thin lens and mirror ────────────────────────────────────────────────
  function drawLens() {
    const mirror = mode === 'mirror';
    const p = F.params, f = p.f, star = P.obj === 'star';
    const plane = mirror && !Number.isFinite(f);
    if (fCtl) fCtl.node.hidden = plane;
    const unit = P.unit;
    frame(main, { l: 6, r: 6, t: 8, b: 8 });
    const [x0, x1] = lensView();
    const hO = star ? 0 : p.hO, dO = star ? Infinity : p.dO;
    const af = Number.isFinite(f) ? Math.abs(f) : 10;
    const im = plane ? { dI: -dO, m: 1 } : O.thinLens(f, dO);
    const hI = star ? -f * Math.tan(rad(p.tilt)) : im.m * hO;
    const yHalf = Math.max(1.35 * Math.max(star ? af * Math.tan(rad(15)) : 8, Math.min(Math.abs(hI), 2.4 * Math.max(hO, 1))), 3);
    main.setView([x0, x1], [-yHalf, yHalf]);
    // the aperture: tall enough for the object and, where it fits, for the focal ray (which meets the element at the image's height)
    const ap = P.ap ?? Math.max(star ? 0.5 * af : 1.3 * Math.max(P.hO, 3), 0.35 * af, star || !Number.isFinite(hI) ? 0 : Math.min(1.12 * Math.abs(hI), 0.9 * yHalf));
    const X = (u) => (mirror ? -u : u);           // unfolded → real x for the outgoing side
    const lt = lightTheme(main);
    // axis
    main.line(main.vx0, 0, main.vx1, 0, { color: 'ink3', width: 1.1 });
    // behind the mirror
    if (mirror) region(main, [[0, main.vy0], [main.vx1, main.vy0], [main.vx1, main.vy1], [0, main.vy1]], 'ink4', 0.12);
    // the element
    const R = plane ? Infinity : 2 * f;
    const xs = (y) => (plane ? 0 : -(R - Math.sign(R) * Math.sqrt(Math.max(0, R * R - y * y))));
    if (mirror) {
      const pts = [];
      for (let i = 0; i <= 40; i++) { const y = -ap + (2 * ap * i) / 40; pts.push([xs(y), y]); }
      // hatching behind the reflecting surface
      for (let i = 0; i <= 16; i++) { const y = -ap + (2 * ap * i) / 16, x = xs(y); main.line(x, y, x + 0.035 * (x1 - x0), y + 0.02 * (x1 - x0), { color: 'ink3', width: 1 }); }
      main.path(pts, { color: 'ink', width: 3.2 });
    } else {
      const w = Math.max(0.012 * (x1 - x0), 0.35), pts = [];
      const conv = f > 0;
      for (let i = 0; i <= 30; i++) { const y = -ap + (2 * ap * i) / 30, u = y / ap; pts.push([(conv ? w * (1 - u * u) : w * (0.35 + 0.65 * u * u)) * 0.5 + (conv ? 0.06 : 0.05) * w, y]); }
      for (let i = 30; i >= 0; i--) { const y = -ap + (2 * ap * i) / 30, u = y / ap; pts.push([-((conv ? w * (1 - u * u) : w * (0.35 + 0.65 * u * u)) * 0.5 + (conv ? 0.06 : 0.05) * w), y]); }
      region(main, pts, 'accent', 0.22);
      main.path(pts.concat([pts[0]]), { color: 'accent2', width: 1.6 });
    }
    // focal points (and C for a mirror, 2F for a lens)
    if (Number.isFinite(f) && !hide.has('F')) {
      const marks = mirror ? [[-f, 'F'], [-2 * f, 'C']] : [[-f, 'F'], [f, 'F'], [-2 * f, '2F'], [2 * f, '2F']];
      for (const [x, lab] of marks) {
        if (x < main.vx0 || x > main.vx1) continue;
        const big = lab === 'F';
        main.point(x, 0, { color: big ? 'ink' : 'ink3', r: big ? 4 : 3 });
        if (P.labels) main.text(lab, x, 0, { color: big ? 'ink' : 'ink3', size: big ? 12.5 : 11, align: 'center', dy: 13, weight: big ? 700 : 500 });
      }
    }
    // the mask over the lens
    const maskTop = ap, maskBot = ap * (1 - 2 * p.mask);
    const masked = (y) => !mirror && p.mask > 0 && y <= maskTop + 1e-9 && y >= maskBot - 1e-9;
    const cardX = -Math.max(0.025 * (x1 - x0), 0.6);
    if (!mirror && p.mask > 0) {
      const w = Math.max(0.012 * (x1 - x0), 0.3);
      region(main, [[cardX - w, maskBot], [cardX, maskBot], [cardX, maskTop + 0.3], [cardX - w, maskTop + 0.3]], 'ink2', 0.9);
      if (P.labels) main.text('card', cardX - w, maskTop + 0.3, { color: 'ink2', size: 11, dx: -4, dy: -8, align: 'right' });
    }
    // rays from the object tip (or a star's parallel rays)
    const T = [-dO, hO];
    const imgReal = !plane && Number.isFinite(im.dI) && im.dI > 0 && !star;
    const rayCols = ['gold', 'teal', 'violet'];
    const showImage = P.image !== false;
    const out = (yl, sl, col, o = {}) => {
      // outgoing ray from the element at height yl with unfolded slope sl
      const start = mirror ? [xs(yl), yl] : [0, yl];
      if (!showImage) return;
      if (mirror) {
        // real-space: travelling left with real slope −sl, from the reflection point
        const xe = main.vx0, ye = yl - sl * (xe - start[0]) * -1;
        ray(main, [start, [xe, yl + sl * (start[0] - xe)]], { color: col, width: o.width ?? 2, alpha: o.alpha ?? 1, at: 0.35, heads: o.heads });
        void ye;
      } else {
        const xe = main.vx1;
        ray(main, [start, [xe, yl + sl * (xe - start[0])]], { color: col, width: o.width ?? 2, alpha: o.alpha ?? 1, at: 0.35, heads: o.heads });
      }
      // backward extension to a virtual image (or a virtual focal point)
      if (o.back) main.path([start, o.back], { color: col, width: 1.2, dash: [5, 4], alpha: 0.85 });
    };
    const inRay = (from, yl, col, o = {}) => {
      const hit = mirror ? [xs(yl), yl] : [0, yl];
      const blocked = masked(yl);
      // a blocked ray stops at the card
      const end = blocked ? [cardX - Math.max(0.012 * (x1 - x0), 0.3), from[1] + ((yl - from[1]) * (cardX - from[0])) / (0 - from[0])] : hit;
      ray(main, [from, end], { color: col, width: o.width ?? 2, alpha: o.alpha ?? 1, at: 0.45, heads: o.heads });
      if (blocked) return false;
      // a ray beyond the drawn element bends at its (extended) plane, as in textbook diagrams
      if (!mirror && Math.abs(yl) > ap) main.line(0, Math.sign(yl) * ap, 0, yl, { color: 'accent2', width: 1.2, dash: [3, 4] });
      return true;
    };
    const virtImg = [X(im.dI), hI];
    const rays = p.rays;
    if (star) {
      // parallel rays at the star's angle, across the aperture
      const a = rad(p.tilt), sl = -Math.tan(a);
      const n = rays === 'principal' ? 3 : 7;
      for (let i = 0; i < n; i++) {
        const yl = -ap * 0.85 + (1.7 * ap * i) / (n - 1);
        const xs0 = main.vx0, from = [xs0, yl - sl * (0 - xs0)];
        if (!inRay(from, yl, 'gold', { width: 1.8 })) continue;
        const so = sl - yl / f;
        if (Number.isFinite(f) && f > 0 && !mirror) out(yl, so, 'gold', { width: 1.8 });
        else if (Number.isFinite(f) && f > 0 && mirror) out(yl, so, 'gold', { width: 1.8 });
        else out(yl, so, 'gold', { width: 1.8, back: Number.isFinite(f) ? [X(f), sl * f] : null });
      }
      if (showImage && Number.isFinite(f) && !hide.has('image')) {
        const fx = X(f);
        main.line(fx, -yHalf * 0.9, fx, yHalf * 0.9, { color: 'good', width: 1.2, dash: [6, 5] });
        main.point(fx, hI, { color: 'good', r: 5 });
        if (P.labels) main.text(mirror ? 'focal plane' : 'focal plane: the detector goes here', fx, yHalf * 0.82, { color: 'good', size: 11, dx: 6, align: fx > 0.5 * (main.vx0 + main.vx1) ? 'right' : 'left' });
      }
    } else {
      arrowObj(main, -dO, hO, { color: 'accent' });
      if (P.labels) main.text('object', -dO, hO, { color: 'accent', size: 11.5, dy: hO > 0 ? -16 : 16, align: 'center', weight: 600 });
      if (rays === 'fan' || rays === 'both') {
        const n = 9;
        for (let i = 0; i < n; i++) {
          const yl = -ap * 0.94 + (1.88 * ap * i) / (n - 1);
          const ok = inRay(T, yl, 'gold', { width: 1.1, alpha: 0.55, heads: false });
          if (!ok) continue;
          const sIn = (yl - hO) / dO, so = plane ? sIn : sIn - yl / f;
          out(yl, so, 'gold', { width: 1.1, alpha: 0.55, heads: false, back: !imgReal && Number.isFinite(im.dI) ? virtualPoint() : null });
        }
      }
      if (rays === 'principal' || rays === 'both') {
        const list = [];
        if (plane) {
          list.push([1, 0, -hO / dO], [2, -0.55 * ap, (-0.55 * ap - hO) / dO]);
        } else {
          list.push([0, hO, 0]);                                  // parallel
          list.push([1, 0, -hO / dO]);                            // through the centre (or the vertex)
          if (Math.abs(dO - f) > 1e-6) list.push([2, hO - (hO / (dO - f)) * dO, -hO / (dO - f)]);   // through (or toward) F
          if (mirror && Math.abs(dO - 2 * f) > 1e-6 && f > 0 && false) list.push([2, 0, 0]);
        }
        for (const [k, yl, sIn] of list) {
          const col = rayCols[k];
          const ok = inRay(T, yl, col, { width: 2.2 });
          // the focal ray seems to come from F when F lies behind the object
          if (k === 2 && !mirror && f > 0 && dO < f) main.path([[-f, 0], T], { color: col, width: 1.2, dash: [5, 4], alpha: 0.8 });
          if (k === 2 && mirror && f > 0 && dO < f) main.path([[-f, 0], T], { color: col, width: 1.2, dash: [5, 4], alpha: 0.8 });
          // aimed at a focal point on the far side (diverging lens, convex mirror)
          if (k === 2 && f < 0 && showImage) main.path([mirror ? [xs(yl), yl] : [0, yl], mirror ? [-f, 0] : [-f, 0]], { color: col, width: 1.2, dash: [5, 4], alpha: 0.8 });
          if (!ok) continue;
          const so = plane ? sIn : sIn - yl / f;
          let back = null;
          if (!imgReal && Number.isFinite(im.dI)) back = virtualPoint();
          if (k === 0 && f < 0) back = [X(f), 0];
          out(yl, so, col, { width: 2.2, back });
        }
      }
      // the image
      if (showImage && !hide.has('image') && Number.isFinite(im.dI) && Math.abs(im.dI) < 1e4) {
        const bright = mirror ? 1 : Math.max(0, 1 - p.mask);
        const xI = X(im.dI);
        if (bright > 0.001) {
          arrowObj(main, xI, hI, { color: 'good', alpha: 0.25 + 0.75 * bright, dash: imgReal ? null : [6, 4] });
          if (P.labels) {
            const off = xI > main.vx1 - 0.08 * (main.vx1 - main.vx0) || xI < main.vx0 + 0.04 * (main.vx1 - main.vx0);
            if (!off) main.text(imgReal ? 'image (real)' : 'image (virtual)', xI, hI, { color: 'good', size: 11.5, dy: hI > 0 ? -16 : 16, align: 'center', weight: 600 });
          }
        }
        if ((xI > main.vx1 || xI < main.vx0) && P.labels) main.text(xI > main.vx1 ? 'image off the edge →' : '← image off the edge', xI > main.vx1 ? main.vx1 : main.vx0, -yHalf * 0.85, { color: 'good', size: 11.5, align: xI > main.vx1 ? 'right' : 'left', dx: xI > main.vx1 ? -6 : 6 });
      }
      if (showImage && !Number.isFinite(im.dI) && P.labels) main.text('rays leave parallel: the image is at infinity', 0, -yHalf * 0.85, { color: 'good', size: 11.5, align: 'center' });
    }
    main.drawHandles();

    function virtualPoint() { return [X(im.dI), hI]; }
    void virtImg; void lt;

    if (P.readout !== false) {
      const u = `\\,\\mathrm{${unit}}`, rows = [];
      if (star) {
        rows.push(['focal length $f$', `${trim(f)}${u}`]);
        if (!hide.has('image')) rows.push(['image height $f\\tan\\alpha$', `${trim(Math.abs(hI))}${u}`]);
      } else {
        rows.push(['$d_o$', `${trim(dO)}${u}`]);
        if (!plane && !hide.has('F')) rows.push(['$f$', `${trim(f)}${u}`]);
        if (showImage && !hide.has('di')) rows.push(['$d_i$', Number.isFinite(im.dI) ? `${trim(im.dI)}${u}` : '\\infty']);
        if (showImage && !hide.has('m')) rows.push(['$m = -d_i/d_o$', Number.isFinite(im.m) ? trim(im.m) : '\\infty']);
        if (showImage && !hide.has('image') && Number.isFinite(im.dI)) rows.push(['image', `\\text{${imgReal ? 'real' : 'virtual'}, ${im.m < 0 ? 'inverted' : 'upright'}, ${Math.abs(im.m) > 1.0005 ? 'larger' : Math.abs(im.m) < 0.9995 ? 'smaller' : 'same size'}}`]);
        if (!mirror && p.mask > 0 && showImage) rows.push(['image brightness', `${Math.round(100 * (1 - p.mask))}\\%\\ \\text{(still whole)}`]);
      }
      F.readout(rows);
    }
  }

  // ── two lenses ──────────────────────────────────────────────────────────
  function drawSystem() {
    const p = F.params, tele = p.kind === 'telescope';
    const f1 = p.f1, f2 = p.f2;
    // telescope: afocal (sep = f₁ + f₂); microscope: the intermediate image at the eyepiece's focal point
    const im1 = tele ? { dI: f1, m: 0 } : O.thinLens(f1, p.dO);
    const sep = tele ? f1 + f2 : im1.dI + f2;
    frame(main, { l: 6, r: 6, t: 8, b: 8 });
    const x0 = tele ? -0.18 * sep : -p.dO - 0.12 * sep, x1 = sep + Math.max(1.4 * Math.abs(f2), 0.28 * sep);
    const hI1 = tele ? f1 * Math.tan(rad(p.tilt)) : Math.abs(im1.m * p.hO);
    const ap1 = tele ? Math.max(2.4, 0.11 * sep) : Math.max(1.6, 1.15 * hI1, 1.2 * p.hO), ap2 = tele ? Math.max(1.5, 0.085 * sep) : Math.max(1.5, 1.2 * hI1);
    const yHalf = tele ? Math.max(ap1 * 1.8, f1 * Math.tan(rad(p.tilt)) * 1.6) : Math.max(ap1 * 2.2, Math.abs(im1.m * p.hO) * 1.5);
    main.setView([x0, x1], [-yHalf, yHalf]);
    main.line(main.vx0, 0, main.vx1, 0, { color: 'ink3', width: 1.1 });
    const lensShape = (x, ap, f) => {
      const w = Math.max(0.012 * (x1 - x0), 0.25), pts = [], conv = f > 0;
      const half = (u) => (conv ? 0.5 * (1 - u * u) + 0.05 : 0.5 * (0.35 + 0.65 * u * u) + 0.05) * w;
      for (let i = 0; i <= 24; i++) { const y = -ap + (2 * ap * i) / 24; pts.push([x + half(y / ap), y]); }
      for (let i = 24; i >= 0; i--) { const y = -ap + (2 * ap * i) / 24; pts.push([x - half(y / ap), y]); }
      region(main, pts, 'accent', 0.22);
      main.path(pts.concat([pts[0]]), { color: 'accent2', width: 1.6 });
    };
    lensShape(0, ap1, f1); lensShape(sep, ap2, f2);
    const els = [{ x: 0, f: f1 }, { x: sep, f: f2 }];
    const cols = ['gold', 'teal', 'violet'];
    let beta = 0;
    if (tele) {
      const a = rad(p.tilt), sl = -Math.tan(a);
      [-0.75, 0, 0.75].forEach((k, i) => {
        const yl = k * ap1, start = [main.vx0, yl - sl * (0 - main.vx0)];
        const r = O.paraxialTrace(els, start[0], start[1], sl);
        const end = [main.vx1, r.y + r.slope * (main.vx1 - r.x)];
        ray(main, [...r.pts, end], { color: cols[i], width: 2, at: 0.5 });
        beta = Math.atan(r.slope);
      });
      // the intermediate image of the star, at the focal point of both lenses (a Galilean
      // telescope's diverging eyepiece catches the light before it gets there)
      const yi = -f1 * Math.tan(a);
      if (f2 > 0) {
        main.point(f1, yi, { color: 'good', r: 4.5 });
        main.line(f1, -yHalf * 0.8, f1, yHalf * 0.8, { color: 'good', width: 1, dash: [5, 5], alpha: 0.7 });
      }
      if (P.labels) {
        if (f2 > 0) main.text('image of the star', f1, yi, { color: 'good', size: 11, dx: 6, dy: 14 });
        else main.text('no image forms inside: the view is upright', sep, -yHalf * 0.8, { color: 'good', size: 11, align: 'center' });
        main.text(`objective, fₒ = ${trim(f1)} cm`, 0, ap1, { color: 'accent2', size: 11, dy: -12, align: 'center' });
        main.text(`eyepiece, fₑ = ${trim(f2)} cm`, sep, ap2, { color: 'accent2', size: 11, dy: -12, align: 'center' });
      }
      eye(main, sep + 1.05 * Math.abs(f2), 0, -1, 0);
    } else {
      const h = p.hO, T = [-p.dO, h];
      arrowObj(main, -p.dO, h, { color: 'accent', width: 2.6 });
      const yI = im1.m * h;
      // three rays from the tip, through the whole system
      const slopes = [0, -h / p.dO, -h / (p.dO - f1)];
      slopes.forEach((s, i) => {
        const r = O.paraxialTrace(els, T[0], T[1], s);
        const end = [main.vx1, r.y + r.slope * (main.vx1 - r.x)];
        ray(main, [...r.pts, end], { color: cols[i], width: 2, at: 0.5 });
        beta = Math.atan(r.slope);
      });
      arrowObj(main, im1.dI, yI, { color: 'good', width: 2.6 });
      if (P.labels) {
        main.text('object', -p.dO, h, { color: 'accent', size: 11, dy: -12, align: 'center' });
        main.text('real image inside the tube', im1.dI, yI, { color: 'good', size: 11, dy: 14, align: 'center' });
        main.text(`objective ${trim(f1)} cm`, 0, ap1, { color: 'accent2', size: 11, dy: -12, align: 'center' });
        main.text(`eyepiece ${trim(f2)} cm`, sep, ap2, { color: 'accent2', size: 11, dy: -12, align: 'center' });
      }
      eye(main, sep + 1.05 * f2, 0, -1, 0);
    }
    if (P.readout !== false) {
      const rows = [];
      if (tele) {
        rows.push(['star’s angle $\\alpha$', `${trim(p.tilt)}^\\circ`]);
        if (!hide.has('M')) rows.push(['angle at the eye $\\beta$', `${trim(Math.abs(deg(beta)))}^\\circ`], ['magnification $f_o/f_e$', `${trim(f1 / f2)}\\times`]);
        rows.push(['tube length $f_o + f_e$', `${trim(sep)}\\,\\mathrm{cm}`]);
      } else {
        const mo = -im1.m, me = 25 / f2;
        if (!hide.has('M')) rows.push(['objective $|m_o|$', `${trim(mo)}\\times`], ['eyepiece $25\\,\\mathrm{cm}/f_e$', `${trim(me)}\\times`], ['overall', `${trim(mo * me)}\\times`]);
        rows.push(['lens separation', `${trim(sep)}\\,\\mathrm{cm}`]);
      }
      F.readout(rows);
    }
  }

  // ── handles ─────────────────────────────────────────────────────────────
  if (mode === 'interface' && shown('angle') && P.controls !== false) {
    main.handle(() => { const t = rad(F.params.angle); return [-Math.sin(t) * 0.92, Math.cos(t) * 0.92]; },
      (x, y) => { const a = deg(Math.atan2(-x, Math.max(1e-6, y))); F.set('angle', clamp(Math.round(a * 2) / 2, 0, 89)); }, { hollow: true });
  }
  if ((mode === 'lens' || mode === 'mirror') && P.obj !== 'star' && P.drag && shown('dO') && P.controls !== false) {
    main.handle(() => [-F.params.dO, F.params.hO], (x, y) => {
      F.set('dO', clamp(Math.round(-x * 2) / 2, 1, 60));
      F.set('hO', clamp(Math.round(y * 2) / 2, 1, 8));
    }, { hollow: true });
  }
  main.onDrag = () => draw();

  F.draw(draw);
  F.caption({
    interface: 'Rays are drawn with brightness set by the Fresnel equations (smooth, non-absorbing media). The refracted ray’s angle is exact; the wavefronts are drawn with a made-up wavelength, far longer than light’s 400–700 nm.',
    prism: 'Real dispersion from catalogue formulas for each material (Sellmeier fits), traced exactly; partial reflections at the faces (a few percent) are not drawn. The spread of colours is small: it really is only a degree or two for glass.',
    fibre: 'A step-index fibre in cross-section, enormously widened: real cores are 9–62.5 µm across and run for kilometres. Leaked light is absorbed in the jacket; the reflected part that stays in the core fades with each bounce.',
    surface: 'Rays traced exactly with Snell’s law; the dashed lines are where the bent rays seem to come from. A narrow bundle of rays reaches one eye; the image is where their backward extensions meet.',
    lens: 'Ideal thin lens (paraxial): every ray bends at the lens’s central plane, so all rays from one point meet at one image point. Rays beyond the lens’s drawn edge bend at its dashed, extended plane, as in textbook diagrams. Lengths to scale.',
    mirror: Number.isFinite(P.f) ? MIRROR_CAPTION : PLANE_CAPTION,
    system: 'Ideal thin lenses (paraxial). Angles are exaggerated to be visible; lengths are to scale.',
  }[mode]);
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const problems = [];
  const mode = P0.mode ?? 'lens';
  if (!MODES.includes(mode)) return [`optics-rays: mode must be one of ${MODES.join(', ')}`];
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...(mode === 'system' ? SYSTEM_PRESETS[P0.kind] || {} : {}), ...P0 };
  const num = (k, lo, hi) => { if (!(typeof P[k] === 'number' && P[k] >= lo && P[k] <= hi)) problems.push(`optics-rays: ${k} must lie in [${lo}, ${hi}] (got ${P[k]})`); };
  if (!(P.controls === true || P.controls === false || Array.isArray(P.controls))) problems.push('optics-rays: controls must be true, false or a list of keys');
  if (!Array.isArray(P.hide)) problems.push('optics-rays: hide must be a list');
  if (mode === 'interface') {
    num('n1', 1, 2.5); num('n2', 1, 2.5); num('angle', 0, 89);
    if (!['u', 's', 'p'].includes(P.pol)) problems.push('optics-rays: pol must be u, s or p');
  } else if (mode === 'prism') {
    num('apex', 30, 75); num('angle', 0, 89); num('lambda', 380, 750);
    if (!MATS.includes(P.mat)) problems.push(`optics-rays: mat must be one of ${MATS.join(', ')}`);
    if (!['white', 'mono'].includes(P.light)) problems.push('optics-rays: light must be white or mono');
  } else if (mode === 'fibre') {
    num('angle', 0, 40); num('nCore', 1.4, 1.7); num('nClad', 1.3, 1.7);
  } else if (mode === 'surface') {
    num('n1', 1, 2.5); num('n2', 1, 2.5);
    if (Number.isFinite(P.R)) { num('R', -40, 40); num('dO', 2, 40); if (Math.abs(P.R) < 2) problems.push('optics-rays: |R| must be at least 2'); }
    else { num('dO', 0.5, 4); num('look', 0, 70); if (P.R !== Infinity && P.R !== -Infinity) problems.push('optics-rays: R must be a number or Infinity'); }
    if (!['up', 'right'].includes(P.orient)) problems.push('optics-rays: orient must be up or right');
  } else if (mode === 'lens' || mode === 'mirror') {
    if (mode === 'lens') { if (!(Number.isFinite(P.f) && Math.abs(P.f) >= 2 && Math.abs(P.f) <= 60)) problems.push('optics-rays: lens f must have 2 ≤ |f| ≤ 60'); }
    else if (!(P.f === Infinity || (Number.isFinite(P.f) && Math.abs(P.f) >= 2 && Math.abs(P.f) <= 60))) problems.push('optics-rays: mirror f must be Infinity (plane) or 2 ≤ |f| ≤ 60');
    if (P.obj === 'star') num('tilt', 0, 15);
    else { num('dO', 0.5, 120); num('hO', 0.2, 20); }
    if (!['arrow', 'star'].includes(P.obj)) problems.push('optics-rays: obj must be arrow or star');
    if (mode === 'lens') num('mask', 0, 1);
    if (!['principal', 'fan', 'both', 'none'].includes(P.rays)) problems.push('optics-rays: rays must be principal, fan, both or none');
    if (P.view !== null && !(Array.isArray(P.view) && P.view.length === 2 && P.view[0] < 0 && P.view[1] > 0)) problems.push('optics-rays: view must be [x0 < 0, x1 > 0]');
    if (!['cm', 'mm', 'm'].includes(P.unit)) problems.push('optics-rays: unit must be cm, mm or m');
  } else if (mode === 'system') {
    if (!['telescope', 'microscope'].includes(P.kind)) problems.push('optics-rays: kind must be telescope or microscope');
    num('f1', 1, 60);
    if (!(typeof P.f2 === 'number' && Math.abs(P.f2) >= 1 && Math.abs(P.f2) <= 20 && (P.f2 > 0 || P.kind === 'telescope'))) problems.push('optics-rays: f2 must have 1 ≤ |f2| ≤ 20 (negative only for a Galilean telescope)');
    if (P.kind === 'telescope') num('tilt', 0.25, 8);
    else { num('dO', 1, 20); num('hO', 0.1, 3); if (!(P.dO > P.f1)) problems.push('optics-rays: a microscope’s object must lie outside the objective’s focal length'); }
  }
  for (const k of ['readout', 'labels']) if (typeof P[k] !== 'boolean') problems.push(`optics-rays: ${k} must be true or false`);
  return problems;
}
