/* Textures for the test cell, painted on canvases at start-up: no image
   files to load, nothing to vendor. */
import * as THREE from 'three';

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function tex(c, { repeat = [1, 1], srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* Poured concrete: mottled grey, form-tie holes, a few stains. */
export function concrete({ seed = 1, base = [150, 148, 142], stains = true, joints = 0, repeat = [1, 1] } = {}) {
  const [c, g] = canvas(512, 512), r = rnd(seed);
  g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const v = (r() - 0.5) * 28, a = 0.08 + r() * 0.12;
    g.fillStyle = `rgba(${base.map(x => Math.round(x + v)).join(',')},${a})`;
    const s = 1 + r() * 5; g.fillRect(r() * 512, r() * 512, s, s);
  }
  for (let i = 0; i < 40; i++) {
    const x = r() * 512, y = r() * 512, R = 20 + r() * 80;
    const gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, `rgba(${r() < 0.5 ? '90,86,80' : '170,168,160'},${0.04 + r() * 0.06})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
  if (stains) for (let i = 0; i < 6; i++) {
    const x = r() * 512, w = 6 + r() * 20;
    const gr = g.createLinearGradient(0, 0, 0, 200 + r() * 200);
    gr.addColorStop(0, 'rgba(60,55,50,0.18)'); gr.addColorStop(1, 'rgba(60,55,50,0)');
    g.fillStyle = gr; g.fillRect(x, 0, w, 512);
  }
  if (joints) {
    g.strokeStyle = 'rgba(70,68,64,0.6)'; g.lineWidth = 2;
    for (let k = 1; k < joints; k++) { const p = 512 * k / joints; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 512); g.moveTo(0, p); g.lineTo(512, p); g.stroke(); }
  }
  return tex(c, { repeat });
}

/* Desert ground: sand with gravel. */
export function ground({ seed = 7, repeat = [40, 40] } = {}) {
  const [c, g] = canvas(256, 256), r = rnd(seed);
  g.fillStyle = 'rgb(176,156,124)'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6000; i++) {
    const v = (r() - 0.5) * 50;
    g.fillStyle = `rgba(${Math.round(160 + v)},${Math.round(140 + v)},${Math.round(108 + v)},${0.25 + r() * 0.4})`;
    const s = 0.6 + r() * 2.2; g.fillRect(r() * 256, r() * 256, s, s);
  }
  return tex(c, { repeat });
}

/* Diagonal hazard stripes. */
export function hazard({ a = '#e7b416', b = '#1b1b1b', repeat = [4, 1] } = {}) {
  const [c, g] = canvas(128, 32);
  g.fillStyle = a; g.fillRect(0, 0, 128, 32);
  g.fillStyle = b;
  for (let x = -32; x < 160; x += 32) { g.beginPath(); g.moveTo(x, 32); g.lineTo(x + 16, 32); g.lineTo(x + 32, 0); g.lineTo(x + 16, 0); g.fill(); }
  return tex(c, { repeat });
}

/* A stencilled or printed label. */
export function label(lines, { w = 512, h = 128, bg = null, fg = '#111', font = 'bold 54px "IBM Plex Mono", monospace', align = 'center', border = null } = {}) {
  const [c, g] = canvas(w, h);
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  if (border) { g.strokeStyle = border; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); }
  g.fillStyle = fg; g.textAlign = align; g.textBaseline = 'middle';
  const L = Array.isArray(lines) ? lines : [lines];
  L.forEach((s, i) => {
    const sz = typeof s === 'object' ? s : { text: s };
    g.font = sz.font || font;
    g.fillText(sz.text, align === 'center' ? w / 2 : 16, h * (i + 0.5) / L.length);
  });
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/* A soft round sprite for particles. */
export function puff() {
  const [c, g] = canvas(64, 64);
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  return t;
}
