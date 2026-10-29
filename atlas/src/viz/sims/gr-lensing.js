// Gravitational lensing by a point mass. Right: your sky, ray-traced — every
// pixel is followed back through the lens equation β = θ − θ_E²θ/|θ|² to the
// source plane, where a small galaxy and a scatter of faint background stars
// sit. Drag the galaxy (or use the slider) behind the lens and its two images
// merge into an Einstein ring. Left: a side view of the two light paths, with
// every angle hugely exaggerated. Physics in model/gr-lensing.js (tested).
// readout: false hides the numbers (a question's picture must not print its answer).

import { Plot } from '../plot.js';
import { images, magnifications, lensMap, einsteinRadius, M_SUN, PC, RAD_TO_ARCSEC } from '../model/gr-lensing.js';

export const defaults = { beta: 0.35, size: 0.16, system: 'star' };
const FIELD = 2.6;                 // half-width of the sky view, in Einstein radii
const SYSTEMS = {
  star: { label: 'a star lens', M: 0.5 * M_SUN, DL: 4e3 * PC, DS: 8e3 * PC },
  galaxy: { label: 'a galaxy lens', M: 1e12 * M_SUN, DL: 1e9 * PC, DS: 2e9 * PC },
};
// faint background stars in the source plane: fixed pseudo-random positions and brightnesses
const STARS = (() => {
  let s = 12345;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 60 }, () => [(r() * 2 - 1) * 3.4, (r() * 2 - 1) * 3.4, 0.45 + 0.55 * r()]);
})();

export function validate(P) {
  const p = [];
  if (!SYSTEMS[P.system]) p.push(`gr-lensing: unknown system “${P.system}”`);
  if (!(P.beta >= 0 && P.beta <= 2)) p.push('gr-lensing: beta must lie in [0, 2]');
  if (!(P.size >= 0.04 && P.size <= 0.6)) p.push('gr-lensing: size must lie in [0.04, 0.6]');
  if (P.readout !== undefined && typeof P.readout !== 'boolean') p.push('gr-lensing: readout must be true or false');
  return p;
}

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: '', label: 'A gravitational lens: the paths of light seen from the side, and the lensed images on your sky' });
  F.slider({ key: 'beta', label: 'Galaxy’s true offset from the lens $\\beta$', min: 0, max: 2, step: 0.01, value: P.beta, unit: '\\theta_E', explain: 'In Einstein radii $\\theta_E$. Or drag the dashed circle on the sky. At 0 the galaxy is exactly behind the lens.' });
  F.slider({ key: 'size', label: 'Galaxy size', min: 0.04, max: 0.6, step: 0.01, value: P.size, unit: '\\theta_E', explain: 'Its radius on the sky, if there were no lens.' });
  F.choice({ key: 'system', label: 'What is the lens?', options: [['star', 'A star'], ['galaxy', 'A galaxy']], value: P.system, explain: 'Sets the real angle $\\theta_E$: a 0.5 M☉ star halfway to a source 8 kpc away, or a 10¹² M☉ galaxy halfway to one 2 Gpc away (flat-space distances: rough).' });
  F.onChange(() => draw());

  const side = new Plot(canvas, { x: [-0.1, 1.12], y: [-2.7, 2.7], grid: false, axes: false });
  const sky = new Plot(canvas, { x: [-FIELD, FIELD], y: [-FIELD, FIELD], equal: true, grid: false, axes: false });
  sky.handle(() => [F.params.beta, 0], (x) => { F.set('beta', Math.max(0, Math.min(2, Math.round(x * 100) / 100))); });

  const off = document.createElement('canvas');
  let cacheKey = '';
  function renderSky(n, beta, size) {
    const key = `${n}|${beta}|${size}`;
    if (key === cacheKey) return;
    cacheKey = key;
    off.width = off.height = n;
    const g = off.getContext('2d');
    const img = g.createImageData(n, n), d = img.data;
    const s2 = 2 * size * size, rs2 = 0.03 * 0.03;
    for (let j = 0; j < n; j++) {
      const ty = (1 - ((j + 0.5) / n) * 2) * FIELD;
      for (let i = 0; i < n; i++) {
        const tx = (((i + 0.5) / n) * 2 - 1) * FIELD;
        const [bx, by] = lensMap(tx, ty);
        let R = 6, Gn = 9, B = 20;                       // night sky
        if (Number.isFinite(bx)) {
          const dx = bx - beta, dy = by;
          const q = Math.exp(-(dx * dx + dy * dy) / s2);  // the galaxy: warm core, bluish rim
          R += 250 * q; Gn += 200 * q + 25 * q * (1 - q); B += 120 * q + 120 * q * (1 - q);
          for (const [sx, sy, w] of STARS) {
            const ex = bx - sx, ey = by - sy;
            if (ex * ex + ey * ey < rs2) { R += 170 * w; Gn += 190 * w; B += 235 * w; }
          }
        }
        const k = 4 * (j * n + i);
        d[k] = Math.min(255, R); d[k + 1] = Math.min(255, Gn); d[k + 2] = Math.min(255, B); d[k + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  }

  function draw() {
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300;
    const S = Math.min(H, W * 0.56);                    // sky panel side, px
    sky.o.pad = { l: W - S + 6, r: 6, t: 6, b: 6 };
    side.o.pad = { l: 8, r: S + 14, t: 24, b: 10 };
    side.resize(); side.refreshTheme(); sky.resize(); sky.refreshTheme();
    const g = side.ctx;
    g.clearRect(0, 0, side.w, side.h);
    const { beta: u, size } = F.params;
    const [a, b] = images(u);

    // ── side view ─────────────────────────────────────────────────────────
    side.line(0, 0, 1, 0, { color: 'ink4', width: 1, dash: [3, 5] });
    const rays = [[a, 'gold'], [b, 'accent2']];
    for (const [th, col] of rays) {
      side.path([[0, 0], [0.5, 0.5 * th], [1, u]], { color: col, width: 2.2 });
      side.line(0.5, 0.5 * th, 1, th, { color: col, width: 1.2, dash: [4, 4], alpha: 0.7 });
      side.point(1, th, { color: col, r: 4, ring: col });
    }
    side.point(0.5, 0, { color: 'ink', r: 6 });
    side.point(1, u, { color: 'gold', r: 5 });
    side.point(0, 0, { color: 'teal', r: 5 });
    side.text('you', 0, 0, { dy: 16, align: 'center', color: 'teal', size: 11, weight: 650 });
    side.text('lens', 0.5, 0, { dy: 16, align: 'center', color: 'ink2', size: 11, weight: 650 });
    if (W >= 480) side.text('galaxy', 1, u, { dx: 8, dy: u > 0.15 ? -2 : 12, color: 'gold', size: 11 });
    const narrow = W < 480;
    if (!narrow) side.text('seen here', 1, a, { dx: 8, dy: a - u < 0.25 ? -10 : 0, color: 'ink2', size: 10 });
    side.text(narrow ? 'Side view' : 'Side view — angles exaggerated', side.L, 12, { screen: true, color: 'ink2', size: 11, weight: 650 });

    // ── your sky ──────────────────────────────────────────────────────────
    const px = Math.max(1, Math.round((sky.R - sky.L) * Math.min(2, devicePixelRatio || 1)));
    renderSky(Math.min(340, px), u, size);
    const x0 = sky.X(-FIELD), y0 = sky.Y(FIELD), side2 = sky.X(FIELD) - x0;
    g.save();
    g.imageSmoothingEnabled = true;
    g.drawImage(off, x0, y0, side2, side2);
    g.strokeStyle = sky.col.line3; g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, side2 - 1, side2 - 1);
    g.restore();
    sky.circle(0, 0, 1, { color: '#9fb4d8', width: 1, dash: [3, 5], alpha: 0.55 });
    sky.circle(u, 0, Math.max(0.08, size * 1.6), { color: '#f2c14e', width: 1.2, dash: [2, 4], alpha: 0.8 });
    sky.point(0, 0, { color: '#e7edf7', r: 2.5 });
    sky.text('Einstein ring', Math.cos(2.3), Math.sin(2.3), { dx: -4, dy: -8, align: 'right', color: '#9fb4d8', size: 10, halo: false });
    sky.text(narrow ? 'Your sky' : 'Your sky (ray-traced)', x0 + 8, y0 + 13, { screen: true, color: '#cdd8ea', size: 11, weight: 650, halo: false });
    sky.drawHandles();

    const sys = SYSTEMS[F.params.system];
    const tE = einsteinRadius(sys.M, sys.DL, sys.DS) * RAD_TO_ARCSEC;     // arcsec
    const ang = tE < 1 ? `${(tE * 1e3).toPrecision(2)}\\,\\mathrm{mas}` : `${tE.toPrecision(2)}''`;
    const m = magnifications(Math.max(u, 1e-9));
    if (P.readout !== false) F.readout([
      ['true offset', `${u.toFixed(2)}\\,\\theta_E`],
      ['images at', `${a.toFixed(2)}\\,\\theta_E\\ \\text{and}\\ ${b.toFixed(2)}\\,\\theta_E`],
      ['brightening (point source)', u >= 0.01 ? `${m.total.toFixed(2)}\\times` : '\\text{huge: a ring}'],
      [`$\\theta_E$ for ${sys.label}`, ang],
    ]);
  }
  F.draw(draw);
  F.caption('A point-mass lens in the weak-field, thin-lens approximation (bending 4GM/c²b). The sky is ray-traced: every pixel is followed back through the lens equation to the galaxy behind, so the shapes are exact for this model — lensing keeps surface brightness, and images look brighter by being bigger. The side view exaggerates every angle enormously; real ones are milliarcseconds (a star) to arcseconds (a galaxy).');
  return { get: (k) => F.params[k] };
}
