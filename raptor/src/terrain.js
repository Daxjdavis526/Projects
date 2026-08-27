// Streamed procedural terrain at true Earth scale.
//
// A geometry clipmap: concentric rings of tiles whose size doubles with each
// LOD level, snapped to the *camera* (not the aircraft) so that orbiting or
// zooming the chase camera never reveals unloaded ground. Tiles are rebuilt on
// a per-frame budget, so streaming never stalls the frame.

import * as THREE from 'three';
import { fbm, ridged, value2, rand2 } from './noise.js';
import { origin, curvatureDrop, AIRPORTS, CITIES, geoToWorld } from './world.js';

const SEA_LEVEL = 0;

// ---------------------------------------------------------------------------
// Coastline: a polyline roughly following the California coast, in world
// metres. Land is east of it; the sea runs west to the edge of the world.
// ---------------------------------------------------------------------------
const COAST = [
  [-770000, -430000], [-660000, -180000], [-640000, -60000], [-560000, 60000],
  [-500000, 120000], [-330000, 190000], [-250000, 260000], [-210000, 330000],
  [-150000, 420000], [-120000, 520000],
];
function coastX(z) {
  if (z <= COAST[0][1]) return COAST[0][0];
  for (let i = 1; i < COAST.length; i++) {
    if (z <= COAST[i][1]) {
      const [x0, z0] = COAST[i - 1], [x1, z1] = COAST[i];
      const t = (z - z0) / (z1 - z0);
      return x0 + (x1 - x0) * t;
    }
  }
  return COAST[COAST.length - 1][0];
}

// Mountain ranges, anchored on their real geography: a start line, an end
// line, a crest height above the surrounding ground, and a half-width.
const RANGE_SPEC = [
  // [lat0, lon0, lat1, lon1, crest m, half-width m]
  [36.32, -115.72, 35.88, -115.52, 2400, 13000],   // Spring Mountains
  [36.80, -115.22, 36.34, -115.12, 1700, 9000],    // Sheep Range
  [36.10, -114.90, 35.70, -114.70, 1200, 8000],    // McCullough Range
  [39.70, -120.40, 36.30, -118.15, 2900, 38000],   // Sierra Nevada
  [36.70, -117.15, 35.85, -116.95, 1900, 11000],   // Panamint Range
  [37.40, -116.90, 36.60, -116.60, 1500, 12000],   // Nevada Test Range hills
  [34.35, -119.10, 34.28, -117.20, 1800, 20000],   // Transverse Ranges
  [34.20, -116.90, 33.70, -116.30, 1900, 15000],   // San Jacinto / San Bernardino
  [41.20, -111.75, 39.80, -111.60, 2300, 17000],   // Wasatch Front
  [38.60, -119.60, 37.20, -117.90, 1600, 26000],   // White Mountains / Inyo
  [35.60, -111.60, 34.90, -111.55, 1600, 9000],    // San Francisco Peaks
];
// Real Basin-and-Range mountains rise a couple of kilometres over five, not
// over thirty; narrow the profiles so the ranges have flanks you can fly along.
const RANGES = RANGE_SPEC.map(([la0, lo0, la1, lo1, h, w]) => {
  const a = geoToWorld(la0, lo0), b = geoToWorld(la1, lo1);
  return [a.x, a.z, b.x, b.z, h * 1.15, w * 0.5];
});

// Broad uplifted plateaus: [lat, lon, radius m, lift m]
const PLATEAUX = [
  [36.30, -112.20, 190000, 1500],   // Colorado Plateau
  [39.50, -117.00, 240000, 1200],   // Great Basin
  [40.60, -111.90, 150000, 1100],   // Wasatch back country
];
const PLATEAU = PLATEAUX.map(([la, lo, r, h]) => {
  const p = geoToWorld(la, lo);
  return [p.x, p.z, r, h];
});

function ridgeInfluence(x, z) {
  let best = 0;
  for (const [x0, z0, x1, z1, h, w] of RANGES) {
    const dx = x1 - x0, dz = z1 - z0;
    const len2 = dx * dx + dz * dz;
    let s = ((x - x0) * dx + (z - z0) * dz) / len2;
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    const px = x0 + dx * s, pz = z0 + dz * s;
    const d = Math.hypot(x - px, z - pz);
    if (d > w * 2.6) continue;
    // taper toward both ends so ranges do not stop dead
    const cap = Math.sin(Math.PI * Math.min(1, Math.max(0, s * 1.12)));
    // a sharper-than-Gaussian profile: steep flanks, a defined crest line
    const u = d / w;
    const f = Math.exp(-u * u * 0.85) * (1 - 0.35 * Math.min(1, u)) * h * (0.30 + 0.70 * cap);
    if (f > best) best = f;
  }
  return best;
}

function plateauLift(x, z) {
  let lift = 0;
  for (const [px, pz, r, h] of PLATEAU) {
    const d = Math.hypot(x - px, z - pz);
    if (d > r * 1.5) continue;
    const t = Math.min(1, d / r);
    lift += h * (1 - t * t * (3 - 2 * t));
  }
  return lift;
}

/** Terrain elevation in metres above sea level. Also used by the flight model. */
export function heightAt(x, z) {
  // --- sea / land mask ---
  const cx = coastX(z) + fbm(x * 2e-5, z * 2e-5, 4) * 26000;
  const inland = x - cx;
  if (inland < -1500) {
    // ocean floor, only ever seen as water colour
    return -80 - 900 * Math.min(1, -inland / 200000);
  }

  // --- broad continental uplift, plus the big plateaus ---
  let h = 200 + (fbm(x * 2.6e-5 + 11.3, z * 2.6e-5 - 4.1, 5) * 0.5 + 0.5) * 700;
  // the interior sits high: the ground rises away from the coast
  h += Math.min(1, Math.max(0, inland / 260000)) * 800;
  h += plateauLift(x, z);

  // --- mountain ranges ---
  const range = ridgeInfluence(x, z);
  const rough = ridged(x * 3.6e-5 + 3.1, z * 3.6e-5 - 7.7, 6);
  const rough2 = ridged(x * 1.15e-4, z * 1.15e-4, 5);
  const mountainMask = Math.max(0, fbm(x * 1.5e-5 - 30.7, z * 1.5e-5 + 8.2, 3) * 0.9 + 0.42);
  // range crests carry their own ridge texture, so they read as a range of
  // peaks rather than one smooth whaleback
  h += range * (0.35 + 0.95 * rough) * (0.55 + 0.75 * rough2);
  h += Math.pow(rough, 1.35) * 2050 * mountainMask;
  h += Math.pow(rough2, 2.0) * 520 * mountainMask;

  // --- basins: broad depressions that make the Basin and Range read right ---
  const basin = fbm(x * 2.1e-5 + 71.1, z * 2.1e-5 - 22.5, 3);
  if (basin < -0.12) h -= (-basin - 0.12) * 1050 * (1 - Math.min(1, range / 900));

  // nothing inland goes below Death Valley
  if (h < -90) h = -90 + (h + 90) * 0.05;

  // --- coastal ramp down to the sea ---
  if (inland < 22000) {
    const t = Math.max(0, inland) / 22000;
    h *= t * t * (3 - 2 * t);
    h = Math.max(h, inland < 0 ? -30 : 1);
  }

  // --- canyon incision: narrow, deep cuts through the high plateaus ---
  const canyon = Math.abs(value2(x * 1.4e-5 + 4.4, z * 1.4e-5) * 2 - 1);
  if (canyon < 0.05 && h > 900) h -= (0.05 - canyon) * 22000;

  // --- cities sit on gentler ground; do this before the airfields so an
  //     airfield inside a city footprint still wins ---
  for (const c of CITIES) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d > c.radius) continue;
    const s = Math.min(1, d / c.radius);
    const flat = 0.74 + 0.26 * s * s;
    const base = 200 + (fbm(c.x * 6e-6 + 11.3, c.z * 6e-6 - 4.1, 4) * 0.5 + 0.5) * 1500;
    h = h * flat + base * (1 - flat);
  }

  // --- flatten airports along the runway, not in a circle: a 3 km runway
  //     does not fit inside a 1 km disc, and half-buried thresholds are how
  //     you end up starting a takeoff roll inside a hill ---
  for (const a of AIRPORTS) {
    const dx = x - a.x, dz = z - a.z;
    if (dx * dx + dz * dz > 4.2e7) continue;      // ~6.5 km cull
    // distance along and across the runway centreline
    const along = Math.abs(dx * a.dir.x + dz * a.dir.y) - a.rwyLen * 0.5;
    const across = Math.abs(-dx * a.dir.y + dz * a.dir.x) - a.rwyWidth * 3.5;
    const d = Math.hypot(Math.max(0, along), Math.max(0, across));
    if (d > 2600) continue;
    const t = Math.min(1, Math.max(0, (d - 600) / 2000));
    const s = t * t * (3 - 2 * t);
    // The paved surfaces are drawn a little proud of the terrain so they do
    // not z-fight with it at range; the ground the wheels roll on matches.
    h = (a.elev + 0.80) * (1 - s) + h * s;
  }

  return h;
}

/** Surface normal by central difference — used for lighting and colouring. */
export function normalAt(x, z, eps = 12) {
  const hL = heightAt(x - eps, z), hR = heightAt(x + eps, z);
  const hD = heightAt(x, z - eps), hU = heightAt(x, z + eps);
  return new THREE.Vector3(hL - hR, 2 * eps, hD - hU).normalize();
}

// ---------------------------------------------------------------------------
// Colour: biome by elevation, slope, latitude-ish and moisture.
// ---------------------------------------------------------------------------
const C = {
  sand:   [0.72, 0.63, 0.45],
  desert: [0.63, 0.50, 0.34],
  scrub:  [0.45, 0.42, 0.28],
  grass:  [0.33, 0.40, 0.22],
  forest: [0.17, 0.27, 0.15],
  rock:   [0.42, 0.39, 0.36],
  scree:  [0.52, 0.49, 0.46],
  snow:   [0.93, 0.94, 0.97],
  shore:  [0.78, 0.72, 0.56],
};
function mix(a, b, t, out) {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}
const _c = [0, 0, 0], _c2 = [0, 0, 0];

function colorAt(x, z, h, slope, out) {
  const moisture = fbm(x * 4e-6 + 91.2, z * 4e-6 - 13.8, 3) * 0.5 + 0.5;
  // several scales of tonal variation: without them a desert reads as one flat
  // sheet of brown from any altitude
  const variation = fbm(x * 2.2e-4, z * 2.2e-4, 2) * 0.085
    + fbm(x * 2.6e-5 + 5.5, z * 2.6e-5 - 2.2, 3) * 0.075
    + fbm(x * 1.1e-3, z * 1.1e-3, 2) * 0.030;
  const hue = fbm(x * 1.7e-5 - 61.3, z * 1.7e-5 + 44.9, 2);

  if (h < 2) { mix(C.shore, C.sand, 0.4, out); }
  else if (h < 60) mix(C.shore, moisture > 0.55 ? C.grass : C.desert, Math.min(1, h / 60), out);
  else {
    // low ground: desert in the dry south, grass and forest where it's wetter
    const low = mix(C.desert, C.grass, Math.max(0, (moisture - 0.42) * 3), _c);
    const mid = mix(low, C.forest, Math.min(1, Math.max(0, (h - 1400) / 900) * (0.3 + moisture)), _c2);
    const alp = mix(mid, C.rock, Math.min(1, Math.max(0, (h - 2400) / 700)), out);
    // snow line falls with altitude and rises on sun-facing slopes
    const snowLine = 2900 - moisture * 400;
    const sn = Math.min(1, Math.max(0, (h - snowLine) / 450));
    mix(alp, C.snow, sn * (1 - Math.min(0.8, slope * 0.9)), out);
  }
  // steep faces are bare rock whatever the biome
  const steep = Math.min(1, Math.max(0, (slope - 0.42) / 0.35));
  mix(out, h > 2600 ? C.scree : C.rock, steep * 0.85, out);

  out[0] = Math.min(1, Math.max(0, out[0] + variation + hue * 0.055));
  out[1] = Math.min(1, Math.max(0, out[1] + variation + hue * 0.012));
  out[2] = Math.min(1, Math.max(0, out[2] + variation * 0.7 - hue * 0.040));
  return out;
}

// ---------------------------------------------------------------------------

const SEG = 48;                 // segments per tile edge
const BASE_TILE = 3072;         // metres, level 0
const LEVELS = 7;

class Tile {
  constructor(level) {
    this.level = level;
    this.size = BASE_TILE * (1 << level);
    this.key = null;
    this.tx = 0; this.tz = 0;   // tile world corner
    const n = SEG + 1;
    const verts = n * n + n * 4;            // grid + skirt ring
    this.pos = new Float32Array(verts * 3);
    this.col = new Float32Array(verts * 3);
    this.nrm = new Float32Array(verts * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(this.nrm, 3));
    geo.setIndex(Tile.indices(n));
    this.geometry = geo;
    this.mesh = new THREE.Mesh(geo, null);
    // Curvature is applied in the vertex shader, which can drop a distant tile
    // by kilometres — more than enough to push its CPU-side bounding sphere
    // out of the frustum and cull ground that is plainly in view. There are
    // only ~90 of these, so cull nothing and let the GPU sort it out.
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.visible = false;
  }

  static indices(n) {
    if (!Tile._idx) Tile._idx = {};
    if (Tile._idx[n]) return Tile._idx[n];
    const idx = [];
    for (let j = 0; j < n - 1; j++) {
      for (let i = 0; i < n - 1; i++) {
        const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    // skirts: four strips hanging off the edges to hide LOD cracks
    const base = n * n;
    const edge = (i, j) => j * n + i;
    let s = base;
    const strips = [
      { get: i => edge(i, 0) },
      { get: i => edge(i, n - 1) },
      { get: i => edge(0, i) },
      { get: i => edge(n - 1, i) },
    ];
    for (const st of strips) {
      for (let i = 0; i < n - 1; i++) {
        const a = st.get(i), b = st.get(i + 1);
        const sa = s + i, sb = s + i + 1;
        idx.push(a, sa, b, b, sa, sb);
      }
      s += n;
    }
    const arr = new (n * n + n * 4 > 65535 ? Uint32Array : Uint16Array)(idx);
    const attr = new THREE.BufferAttribute(arr, 1);
    Tile._idx[n] = attr;
    return attr;
  }

  build(tx, tz) {
    this.tx = tx; this.tz = tz;
    const n = SEG + 1, step = this.size / SEG;
    const pos = this.pos, col = this.col, nrm = this.nrm;
    const eps = Math.max(8, step * 0.5);
    let minY = Infinity, maxY = -Infinity;

    for (let j = 0; j < n; j++) {
      const wz = tz + j * step;
      for (let i = 0; i < n; i++) {
        const wx = tx + i * step;
        const h = heightAt(wx, wz);
        const k = (j * n + i) * 3;
        pos[k] = i * step; pos[k + 1] = h; pos[k + 2] = j * step;
        if (h < minY) minY = h;
        if (h > maxY) maxY = h;

        const hL = heightAt(wx - eps, wz), hR = heightAt(wx + eps, wz);
        const hD = heightAt(wx, wz - eps), hU = heightAt(wx, wz + eps);
        let nx = hL - hR, ny = 2 * eps, nz = hD - hU;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len; ny /= len; nz /= len;
        nrm[k] = nx; nrm[k + 1] = ny; nrm[k + 2] = nz;
        colorAt(wx, wz, h, 1 - ny, _c);
        col[k] = _c[0]; col[k + 1] = _c[1]; col[k + 2] = _c[2];
      }
    }

    // Skirt vertices: copies of the edge ring, dropped just far enough to
    // cover the crack against a coarser neighbour. Long skirts show up as a
    // wall of dark cliffs along every LOD seam, so keep them short and give
    // them the same colour as the edge they hang from.
    const drop = Math.min(400, Math.max(14, this.size * 0.004));
    const base = n * n;
    const edges = [
      i => i, i => (n - 1) * n + i, i => i * n, i => i * n + (n - 1),
    ];
    let s = base;
    for (const e of edges) {
      for (let i = 0; i < n; i++) {
        const src = e(i) * 3, dst = (s + i) * 3;
        pos[dst] = pos[src]; pos[dst + 1] = pos[src + 1] - drop; pos[dst + 2] = pos[src + 2];
        col[dst] = col[src]; col[dst + 1] = col[src + 1]; col[dst + 2] = col[src + 2];
        nrm[dst] = nrm[src]; nrm[dst + 1] = nrm[src + 1]; nrm[dst + 2] = nrm[src + 2];
      }
      s += n;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
    const half = this.size * 0.5;
    this.geometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(half, (minY + maxY) * 0.5, half),
      Math.hypot(this.size, this.size, maxY - minY) * 0.75);
    this.center = new THREE.Vector3(tx + half, (minY + maxY) * 0.5, tz + half);
    this.mesh.visible = true;
  }

  place() {
    // Vertices are stored relative to the tile corner — at world scale that is
    // the difference between centimetre and metre precision in float32. The
    // mesh transform carries the corner and the floating-origin offset.
    this.mesh.position.set(this.tx - origin.x, -origin.y, this.tz - origin.z);
    this.mesh.updateMatrix();
  }
}

export class Terrain {
  constructor(scene) {
    // Lambert, with procedural surface detail injected per pixel. Lambert
    // shades per vertex, so at a 64 m grid the ground is one flat matte sheet
    // however much relief the height field has. Rather than pay for a
    // per-pixel material, the detail below modulates the albedo *and* fakes
    // the relief lighting from the noise gradient — cheap, and it is what
    // stops open desert reading as painted card.
    this.material = new THREE.MeshLambertMaterial({
      vertexColors: true, side: THREE.FrontSide,
    });
    this.material.onBeforeCompile = (sh) => {
      sh.uniforms.uCurveR = { value: 6371000 };
      sh.uniforms.uSunXZ = this.sunXZ = { value: new THREE.Vector2(0.5, 0.5) };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', `#include <common>
          uniform float uCurveR;
          varying vec3 vWPos;`)
        .replace('#include <begin_vertex>', `
          vec3 transformed = vec3( position );
          vec3 wp = (modelMatrix * vec4(transformed,1.0)).xyz;
          float d2 = wp.x*wp.x + wp.z*wp.z;
          transformed.y -= d2 / (2.0 * uCurveR);
          vWPos = (modelMatrix * vec4(transformed,1.0)).xyz;
        `);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>
          varying vec3 vWPos;
          uniform vec2 uSunXZ;
          float rhash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
          float rnoise(vec2 p){
            vec2 i = floor(p), f = fract(p);
            f = f*f*(3.0-2.0*f);
            return mix(mix(rhash(i), rhash(i+vec2(1,0)), f.x),
                       mix(rhash(i+vec2(0,1)), rhash(i+vec2(1,1)), f.x), f.y);
          }
          float rfbm(vec2 p){
            return rnoise(p) * 0.55 + rnoise(p * 2.17) * 0.28 + rnoise(p * 4.83) * 0.17;
          }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          {
            float dist = length(vWPos - cameraPosition);
            // two bands of detail: fine relief close in, broad mottling far out
            float kNear = 1.0 - smoothstep(150.0, 2600.0, dist);
            float kFar = 1.0 - smoothstep(3000.0, 30000.0, dist);
            if (kFar > 0.004) {
              vec2 q = vWPos.xz * 0.0115;
              float g = rfbm(q) * 0.55 + rfbm(q * 0.13) * 0.45;
              diffuseColor.rgb *= 1.0 + (g - 0.5) * 0.30 * kFar;
            }
            if (kNear > 0.004) {
              vec2 q = vWPos.xz * 0.075;
              float h0 = rfbm(q);
              float hx = rfbm(q + vec2(0.09, 0.0));
              float hz = rfbm(q + vec2(0.0, 0.09));
              // gradient dotted with the sun's ground track: fake relief light
              float rel = ((h0 - hx) * uSunXZ.x + (h0 - hz) * uSunXZ.y) * 3.4;
              diffuseColor.rgb *= clamp(1.0 + rel * kNear, 0.62, 1.42);
              diffuseColor.rgb *= 1.0 + (h0 - 0.5) * 0.16 * kNear;
            }
          }`);
    };
    this.group = new THREE.Group();
    this.group.matrixAutoUpdate = false;
    scene.add(this.group);

    this.tiles = [];
    this.byKey = new Map();
    this.queue = [];
    this.pool = [];
    for (let l = 0; l < LEVELS; l++) {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const t = new Tile(l);
        t.mesh.material = this.material;
        this.group.add(t.mesh);
        this.tiles.push(t);
      }
    }
    this.buildBudget = 2;
  }

  /** Rebuild the ring layout around the camera and queue any new tiles. */
  update(camWorld, dt, budget = this.buildBudget) {
    const wanted = new Map();
    // Each level covers a 4x4 block of its own tiles, snapped to its own grid.
    // The inner tiles are skipped only where the *previous* level actually
    // covers them — the two grids snap independently, so assuming the inner
    // 2x2 is covered leaves gaps you can see straight through.
    let covered = null;
    for (let l = 0; l < LEVELS; l++) {
      const size = BASE_TILE * (1 << l);
      const cx = Math.floor(camWorld.x / size), cz = Math.floor(camWorld.z / size);
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (let j = -2; j <= 1; j++) {
        for (let i = -2; i <= 1; i++) {
          const tx = (cx + i) * size, tz = (cz + j) * size;
          if (tx < minX) minX = tx;
          if (tx + size > maxX) maxX = tx + size;
          if (tz < minZ) minZ = tz;
          if (tz + size > maxZ) maxZ = tz + size;
          const inside = covered &&
            tx >= covered.minX && tx + size <= covered.maxX &&
            tz >= covered.minZ && tz + size <= covered.maxZ;
          if (inside) continue;
          wanted.set(`${l}:${cx + i}:${cz + j}`, { l, tx, tz, size });
        }
      }
      covered = { minX, maxX, minZ, maxZ };
    }

    // release tiles no longer wanted
    for (const t of this.tiles) {
      if (t.key && !wanted.has(t.key)) { t.key = null; t.mesh.visible = false; }
    }
    const live = new Set(this.tiles.filter(t => t.key).map(t => t.key));

    // queue missing tiles, nearest first
    this.queue.length = 0;
    for (const [key, w] of wanted) {
      if (live.has(key)) continue;
      const d = Math.hypot(w.tx + w.size * 0.5 - camWorld.x, w.tz + w.size * 0.5 - camWorld.z);
      this.queue.push({ key, w, d });
    }
    this.queue.sort((a, b) => a.d - b.d);

    let built = 0;
    for (const item of this.queue) {
      if (built >= budget) break;
      const free = this.tiles.find(t => t.level === item.w.l && !t.key);
      if (!free) continue;
      free.key = item.key;
      free.build(item.w.tx, item.w.tz);
      built++;
    }

    for (const t of this.tiles) if (t.key) t.place();
    this.group.updateMatrix();
    return { queued: this.queue.length, built };
  }

  /** Build everything the camera can see right now (used once at startup). */
  prime(camWorld, passes = 12) {
    for (let i = 0; i < passes; i++) this.update(camWorld, 0, 64);
  }

  /** Keep the fake relief lighting pointing the same way as the real sun. */
  setSun(dir) {
    if (!this.sunXZ) return;
    const l = Math.hypot(dir.x, dir.z) || 1;
    this.sunXZ.value.set(dir.x / l, dir.z / l);
  }

  heightAt(x, z) { return heightAt(x, z); }
}

export { SEA_LEVEL };
