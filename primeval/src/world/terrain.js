// Quadtree level-of-detail terrain.
//
// The ground is an analytic function (world/field.js), so nothing is ever
// stored for a place you are not looking at. This file only decides which
// patches to build, at what resolution, and paints them.

import * as THREE from 'three';
import {
  heightAt, riverField, hotspotField, moistureAt, temperatureAt, BIOME, classify,
} from './field.js';
import { ACCENT_ID, ACCENT_CELL } from './textures.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';
import { injectCurve, attachAerial, sharedUniforms, GLSL_NOISE } from './shaders.js';

const ROOT_SIZE = 1048576;      // 1048 km across — you will not find the edge
const LEAF_SIZE = 64;
const GRID = 32;                // quads per chunk edge; verts = GRID+1
const MAX_LEVEL = Math.round(Math.log2(ROOT_SIZE / LEAF_SIZE));

// --- palette ---------------------------------------------------------------
// Colours are linear-ish sRGB triples; the renderer's tone mapping does the rest.
const C = {
  seabed: [0.055, 0.075, 0.086],
  shallow: [0.16, 0.20, 0.19],
  sand: [0.72, 0.655, 0.52],
  sandWet: [0.44, 0.40, 0.33],
  jungle: [0.052, 0.142, 0.062],
  jungleDeep: [0.028, 0.092, 0.049],
  jungleAlien: [0.072, 0.165, 0.128],
  plains: [0.26, 0.285, 0.125],
  plainsDry: [0.375, 0.345, 0.168],
  swamp: [0.115, 0.145, 0.086],
  swampMud: [0.135, 0.118, 0.082],
  rock: [0.225, 0.212, 0.196],
  rockDark: [0.155, 0.148, 0.145],
  highland: [0.175, 0.205, 0.105],
  basalt: [0.068, 0.062, 0.062],
  ash: [0.20, 0.175, 0.165],
  scoria: [0.28, 0.115, 0.07],
  snow: [0.86, 0.885, 0.93],
  alpine: [0.36, 0.365, 0.38],
};

function mix3(a, b, t, out) {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}

const tmpA = [0, 0, 0], tmpB = [0, 0, 0];

/** Ground colour for a point, given its height, slope and climate. */
export function groundColor(h, slope, moist, temp, hot, river, out = [0, 0, 0]) {
  const biome = classify(h, slope, moist, temp, hot, river);
  let base;
  switch (biome) {
    case BIOME.OCEAN:
      base = mix3(C.seabed, C.shallow, smoothstep(-60, -1, h), tmpA);
      base = mix3(base, C.sandWet, smoothstep(-6, 0, h), tmpB);
      break;
    case BIOME.BEACH:
      base = mix3(C.sandWet, C.sand, smoothstep(0.2, 3.0, h), tmpA);
      break;
    case BIOME.JUNGLE: {
      const t = smoothstep(0.35, 0.9, moist);
      base = mix3(C.jungle, C.jungleDeep, t, tmpA);
      base = mix3(base, C.jungleAlien, smoothstep(0.62, 1.0, moist) * 0.55, tmpB);
      break;
    }
    case BIOME.PLAINS:
      base = mix3(C.plainsDry, C.plains, smoothstep(0.25, 0.7, moist), tmpA);
      break;
    case BIOME.SWAMP:
      base = mix3(C.swampMud, C.swamp, smoothstep(0.2, 0.8, moist), tmpA);
      break;
    case BIOME.HIGHLAND:
      base = mix3(C.highland, C.rock, smoothstep(520, 1250, h), tmpA);
      break;
    case BIOME.VOLCANIC: {
      base = mix3(C.basalt, C.ash, smoothstep(0.7, 0.95, hot), tmpA);
      base = mix3(base, C.scoria, smoothstep(700, 1600, h) * 0.7, tmpB);
      break;
    }
    default: { // ALPINE
      base = mix3(C.alpine, C.snow, smoothstep(1350, 1750, h), tmpA);
      break;
    }
  }
  // Exposed rock on anything steep, everywhere.
  const rockT = smoothstep(0.36, 0.70, slope) * (biome === BIOME.OCEAN ? 0.4 : 1);
  const rockCol = h > 1500 ? C.alpine : (hot > 0.68 ? C.basalt : C.rock);
  base = mix3(base, rockCol, rockT, tmpA);
  // Snow caps sit on top of everything cold and not-vertical.
  if (h > 1200 && temp < 0.4) {
    const s = smoothstep(1200, 1900, h) * (1 - smoothstep(0.45, 0.72, slope)) * (1 - temp * 1.6);
    base = mix3(base, C.snow, clamp(s, 0, 1), tmpB);
  }
  // River margins are darker and wetter.
  if (river > 0.05) base = mix3(base, C.swampMud, smoothstep(0.05, 0.55, river) * 0.55, tmpA);
  out[0] = base[0]; out[1] = base[1]; out[2] = base[2];
  return out;
}

// --- chunk geometry --------------------------------------------------------

const SIDE = GRID + 3;      // inner grid plus a one-vertex skirt ring
let indexArray = null;

/**
 * Every patch has identical topology, so the index data is computed once.
 * Each geometry still gets its own BufferAttribute wrapper — sharing one would
 * mean disposing any chunk frees the GPU buffer the others are drawing from.
 */
function sharedIndices() {
  if (!indexArray) {
    const idx = new Uint16Array((SIDE - 1) * (SIDE - 1) * 6);
    let p = 0;
    for (let j = 0; j < SIDE - 1; j++) {
      for (let i = 0; i < SIDE - 1; i++) {
        const a = j * SIDE + i, b = a + 1, c = a + SIDE, d = c + 1;
        idx[p++] = a; idx[p++] = c; idx[p++] = b;
        idx[p++] = b; idx[p++] = c; idx[p++] = d;
      }
    }
    indexArray = idx;
  }
  return new THREE.BufferAttribute(indexArray, 1);
}

const _hgrid = new Float32Array((GRID + 1) * (GRID + 1));
const _col = [0, 0, 0];
const _splat = [0, 0, 0];

/**
 * Build one terrain patch. `size` is its world extent, `ox/oz` the min corner.
 * Returns a BufferGeometry with positions relative to the patch centre.
 */
export function buildChunkGeometry(ox, oz, size, detail, sampler = THERA_SAMPLER) {
  const step = size / GRID;
  const n1 = GRID + 1;
  // Heights on the inner grid.
  for (let j = 0; j < n1; j++) {
    const z = oz + j * step;
    for (let i = 0; i < n1; i++) {
      _hgrid[j * n1 + i] = sampler.height(ox + i * step, z, detail);
    }
  }
  // Climate on a coarse sub-grid; these fields vary over kilometres.
  const CS = 5, cs1 = CS + 1;
  const cm = new Float32Array(cs1 * cs1 * 3);
  for (let j = 0; j <= CS; j++) {
    for (let i = 0; i <= CS; i++) {
      const x = ox + (i / CS) * size, z = oz + (j / CS) * size;
      const h = _hgrid[Math.min(GRID, Math.round(j / CS * GRID)) * n1 + Math.min(GRID, Math.round(i / CS * GRID))];
      const k = (j * cs1 + i) * 3;
      const c = sampler.climate(x, z, h);
      cm[k] = c[0]; cm[k + 1] = c[1]; cm[k + 2] = c[2];
    }
  }
  const climate = (u, v, c) => {
    const fx = clamp(u * CS, 0, CS - 0.0001), fy = clamp(v * CS, 0, CS - 0.0001);
    const i = fx | 0, j = fy | 0, tx = fx - i, ty = fy - j;
    const k00 = ((j) * cs1 + i) * 3 + c, k10 = ((j) * cs1 + i + 1) * 3 + c;
    const k01 = ((j + 1) * cs1 + i) * 3 + c, k11 = ((j + 1) * cs1 + i + 1) * 3 + c;
    return lerp(lerp(cm[k00], cm[k10], tx), lerp(cm[k01], cm[k11], tx), ty);
  };

  const count = SIDE * SIDE;
  const pos = new Float32Array(count * 3);
  const nrm = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const hot = new Float32Array(count);        // drives the lava cracks
  const splatA = new Float32Array(count * 3); // turf weight, accent weight, accent id
  const cx = ox + size * 0.5, cz = oz + size * 0.5;
  const skirt = Math.max(2, step * 3.0);
  let minY = Infinity, maxY = -Infinity;

  for (let j = 0; j < SIDE; j++) {
    const gj = clamp(j - 1, 0, GRID);
    const outerJ = (j === 0 || j === SIDE - 1);
    for (let i = 0; i < SIDE; i++) {
      const gi = clamp(i - 1, 0, GRID);
      const outer = outerJ || i === 0 || i === SIDE - 1;
      const h = _hgrid[gj * n1 + gi];
      const wx = ox + gi * step, wz = oz + gj * step;
      const k = (j * SIDE + i) * 3;
      pos[k] = wx - cx;
      pos[k + 1] = outer ? h - skirt : h;
      pos[k + 2] = wz - cz;
      if (!outer) { if (h < minY) minY = h; if (h > maxY) maxY = h; }

      // Normal from the height grid (clamped at the borders).
      const hl = _hgrid[gj * n1 + Math.max(0, gi - 1)];
      const hr = _hgrid[gj * n1 + Math.min(GRID, gi + 1)];
      const hd = _hgrid[Math.max(0, gj - 1) * n1 + gi];
      const hu = _hgrid[Math.min(GRID, gj + 1) * n1 + gi];
      let nx = (hl - hr), ny = 2 * step, nz = (hd - hu);
      const il = 1 / (Math.hypot(nx, ny, nz) || 1);
      nrm[k] = nx * il; nrm[k + 1] = ny * il; nrm[k + 2] = nz * il;

      const slope = 1 - nrm[k + 1];
      const u = gi / GRID, v = gj / GRID;
      sampler.color(h, slope, climate(u, v, 0), climate(u, v, 1), climate(u, v, 2),
        detail > 0.5 ? sampler.river(wx, wz) : 0, _col);
      col[k] = _col[0]; col[k + 1] = _col[1]; col[k + 2] = _col[2];
      hot[j * SIDE + i] = climate(u, v, 2);
      if (sampler.splat) {
        sampler.splat(h, slope, climate(u, v, 0), climate(u, v, 1), climate(u, v, 2),
          detail > 0.5 ? sampler.river(wx, wz) : 0, _splat);
        splatA[k] = _splat[0]; splatA[k + 1] = _splat[1]; splatA[k + 2] = _splat[2];
      }
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aHot', new THREE.BufferAttribute(hot, 1));
  g.setAttribute('aSplat', new THREE.BufferAttribute(splatA, 3));
  g.setIndex(sharedIndices());
  const r = size * 0.75 + (maxY - minY) * 0.5 + skirt;
  g.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(0, (minY + maxY) * 0.5 - (isFinite(minY) ? 0 : 0), 0), r
  );
  g.userData = { minY, maxY };
  return g;
}

// --- material --------------------------------------------------------------

/** Lava emission is dialled down in daylight and up at night. */
export const lavaUniform = { value: 1 };

/**
 * The ground material. Four splat layers — soil, turf, one accent from a 2x2
 * sheet, and triplanar rock on anything steep — each with its own normal map,
 * sampled at two scales so a 4 m tile does not read as a 4 m tile.
 *
 * The per-vertex biome colour survives as a hue tint rather than as the
 * albedo itself: the texture supplies the value and the detail, the vertex
 * colour supplies the "this is jungle, not savanna".
 */
export function makeTerrainMaterial(tex) {
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.94,
    metalness: 0.0,
    dithering: true,
  });
  if (!tex) return mat;

  const U = {
    tSoil: { value: tex.soil.map }, nSoil: { value: tex.soil.normalMap },
    tTurf: { value: tex.turf.map }, nTurf: { value: tex.turf.normalMap },
    tRock: { value: tex.rock.map }, nRock: { value: tex.rock.normalMap },
    tAcc: { value: tex.accent.map }, nAcc: { value: tex.accent.normalMap },
    uLava: lavaUniform,
    uTile: { value: 0.24 },        // 1 / metres per tile
    uMacro: { value: 0.031 },
    uBumpStrength: { value: 1.0 },
  };
  mat.userData.uniforms = U;

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U, {
      uCurveOrigin: sharedUniforms.uCurveOrigin,
      uCurveRadius: sharedUniforms.uCurveRadius,
      uCurveAmount: sharedUniforms.uCurveAmount,
    });

    shader.vertexShader = `
      uniform vec3 uCurveOrigin; uniform float uCurveRadius; uniform float uCurveAmount;
      attribute float aHot; attribute vec3 aSplat;
      varying float vHot; varying vec3 vSplat; varying vec3 vPvWorld;
      vec3 primevalCurve(vec3 wp){
        vec2 d = wp.xz - uCurveOrigin.xz;
        wp.y -= (dot(d, d) / (2.0 * uCurveRadius)) * uCurveAmount;
        return wp;
      }
    ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
      vec4 primevalWorld = modelMatrix * vec4( transformed, 1.0 );
      vPvWorld = primevalWorld.xyz;
      vHot = aHot; vSplat = aSplat;
      primevalWorld.xyz = primevalCurve( primevalWorld.xyz );
      vec4 mvPosition = viewMatrix * primevalWorld;
      gl_Position = projectionMatrix * mvPosition;
    `);

    shader.fragmentShader = `
      uniform sampler2D tSoil; uniform sampler2D nSoil;
      uniform sampler2D tTurf; uniform sampler2D nTurf;
      uniform sampler2D tRock; uniform sampler2D nRock;
      uniform sampler2D tAcc;  uniform sampler2D nAcc;
      uniform float uLava; uniform float uTile; uniform float uMacro; uniform float uBumpStrength;
      varying float vHot; varying vec3 vSplat; varying vec3 vPvWorld;
      ${GLSL_NOISE}

      // Two scales, mixed by a slow third — the standard cure for visible tiling.
      // The second octave is rotated as well as rescaled: leave both axis
      // aligned and the shared grain direction reads as stripes on open ground.
      const mat2 PV_TWIST = mat2(0.6820, -0.7314, 0.7314, 0.6820);
      vec4 detail2(sampler2D t, vec2 uv, float blend){
        return mix(texture2D(t, uv), texture2D(t, PV_TWIST * uv * 0.171 + 0.37), blend);
      }
      vec2 accentUV(vec2 uv, float id){
        vec2 cell = vec2(mod(id, 2.0) * 0.5, id < 1.5 ? 0.5 : 0.0);
        // Wrap inside the cell by hand, since the sheet cannot repeat.
        return cell + fract(uv) * 0.5;
      }
    ` + shader.fragmentShader;

    // Albedo: splat, before <color_fragment> multiplies in the biome tint.
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      vec2 uv = vPvWorld.xz * uTile;
      float macro = fract(sin(dot(floor(vPvWorld.xz * uMacro), vec2(12.9898, 78.233))) * 43758.5);
      float blend = 0.30 + macro * 0.30;

      float wAcc = clamp(vSplat.y, 0.0, 1.0);
      float wTurf = clamp(vSplat.x, 0.0, 1.0) * (1.0 - wAcc);
      float wSoil = max(0.0, 1.0 - wTurf - wAcc);

      vec3 soilC = detail2(tSoil, uv, blend).rgb;
      vec3 turfC = detail2(tTurf, uv * 1.7, blend).rgb;
      vec3 accC  = texture2D(tAcc, accentUV(uv * 0.9, floor(vSplat.z + 0.5))).rgb;
      vec3 ground = soilC * wSoil + turfC * wTurf + accC * wAcc;

      vec3 gN = texture2D(nSoil, uv).xyz * wSoil
              + texture2D(nTurf, uv * 1.7).xyz * wTurf
              + texture2D(nAcc, accentUV(uv * 0.9, floor(vSplat.z + 0.5))).xyz * wAcc;

      // Rock takes over on anything steep, projected triplanar so cliffs are
      // not smeared vertical stripes.
      float slope = 1.0 - clamp(vNormal.y, 0.0, 1.0);
      float rockW = smoothstep(0.24, 0.62, slope);
      vec3 rockC = vec3(0.0), rN = vec3(0.5, 0.5, 1.0);
      if (rockW > 0.004) {
        vec3 an = abs(normalize(vNormal));
        an = an / (an.x + an.y + an.z);
        vec2 uvX = vPvWorld.zy * uTile * 0.7;
        vec2 uvY = vPvWorld.xz * uTile * 0.7;
        vec2 uvZ = vPvWorld.xy * uTile * 0.7;
        rockC = detail2(tRock, uvX, blend).rgb * an.x
              + detail2(tRock, uvY, blend).rgb * an.y
              + detail2(tRock, uvZ, blend).rgb * an.z;
        rN = texture2D(nRock, uvX).xyz * an.x
           + texture2D(nRock, uvY).xyz * an.y
           + texture2D(nRock, uvZ).xyz * an.z;
      }

      vec3 albedo = mix(ground, rockC, rockW);

      // Large-scale drift, so a plain is not one flat green. Half-kilometre
      // patches go dry and straw-coloured, hollows stay damp and olive.
      float pvBigA = pvFbm(vPvWorld.xz * 0.0023);
      float pvBigB = pvFbm(vPvWorld.xz * 0.00072 + 31.0);
      float pvSoft = 1.0 - rockW;
      albedo *= 0.82 + pvBigB * 0.42;
      albedo = mix(albedo, albedo * vec3(1.26, 1.10, 0.62),
                   smoothstep(0.54, 0.88, pvBigA) * pvSoft * 0.60);
      albedo = mix(albedo, albedo * vec3(0.70, 0.92, 0.80),
                   smoothstep(0.46, 0.14, pvBigA) * pvSoft * 0.45);

      vec3 packedN = mix(gN, rN, rockW);
      diffuseColor.rgb *= albedo * 1.16;
      vPvNormalMap = packedN * 2.0 - 1.0;
      vPvRock = rockW;
    `);

    // The biome colour becomes a hue tint, not the albedo.
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #ifdef USE_COLOR
        vec3 tint = vColor / max(dot(vColor, vec3(0.299, 0.587, 0.114)), 0.004);
        diffuseColor.rgb *= mix(vec3(1.0), tint, mix(0.72, 0.22, vPvRock));
      #endif
    `);

    // Perturb the shading normal by the splatted normal map.
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `
      {
        vec3 N = normalize(normal);
        vec3 T = normalize(vec3(1.0, 0.0, 0.0) - N * N.x);
        vec3 B = cross(N, T);
        normal = normalize(N + (T * vPvNormalMap.x + B * vPvNormalMap.y) * uBumpStrength);
      }
    `);

    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
      #include <common>
      vec3 vPvNormalMap = vec3(0.0);
      float vPvRock = 0.0;
    `);

    // Molten fissures in the volcanic country.
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
      #include <emissivemap_fragment>
      if (vHot > 0.62) {
        vec2 cuv = vPvWorld.xz * 0.055;
        float veins = texture2D(tSoil, cuv).r * 0.6 + texture2D(tRock, cuv * 0.31).r * 0.4;
        float crack = smoothstep(0.46, 0.36, abs(veins - 0.46) * 4.0);
        float amt = crack * smoothstep(0.62, 0.86, vHot) * uLava;
        totalEmissiveRadiance += vec3(1.8, 0.36, 0.05) * amt * 2.4;
        totalEmissiveRadiance += vec3(1.0, 0.74, 0.32) * amt * amt * 1.6;
      }
    `);

    attachAerial(shader);
  };
  mat.customProgramCacheKey = () => 'primeval-terrain-v4';
  return mat;
}

// --- quadtree --------------------------------------------------------------

class Node {
  constructor(x, z, size, level) {
    this.x = x; this.z = z; this.size = size; this.level = level;
    this.children = null;
    this.mesh = null;
    this.wanted = false;
  }
  get cx() { return this.x + this.size * 0.5; }
  get cz() { return this.z + this.size * 0.5; }
  /** Distance from a point to this node's footprint (0 if inside). */
  distTo(px, pz) {
    const dx = Math.max(this.x - px, 0, px - (this.x + this.size));
    const dz = Math.max(this.z - pz, 0, pz - (this.z + this.size));
    return Math.hypot(dx, dz);
  }
}

/**
 * The default sampler describes THERA. ANVIL supplies its own — same quadtree,
 * different planet.
 */
export const THERA_SAMPLER = {
  height: (x, z, detail) => heightAt(x, z, detail),
  climate: (x, z, h) => [moistureAt(x, z, h), temperatureAt(x, z, h), hotspotField(x, z)],
  color: (h, slope, moist, temp, hot, river, out) => groundColor(h, slope, moist, temp, hot, river, out),
  river: (x, z) => riverField(x, z),
  splat: (h, slope, moist, temp, hot, river, out) => {
    const biome = classify(h, slope, moist, temp, hot, river);
    // out = [turf weight, accent weight, accent id]
    let turf = 0, acc = 0, id = ACCENT_ID.sand;
    switch (biome) {
      case BIOME.PLAINS: turf = 0.92; break;
      case BIOME.JUNGLE: turf = 0.42; break;
      case BIOME.HIGHLAND: turf = 0.55; break;
      case BIOME.SWAMP: turf = 0.22; break;
      case BIOME.BEACH: acc = 0.95; id = ACCENT_ID.sand; break;
      case BIOME.OCEAN: acc = 0.75; id = ACCENT_ID.sand; break;
      case BIOME.VOLCANIC: acc = 0.90; id = ACCENT_ID.ash; break;
      case BIOME.ALPINE: acc = 0.5; id = ACCENT_ID.snow; break;
    }
    // Snow overrides everything cold and high.
    const snow = clamp(smoothstep(1200, 1900, h) * (1 - temp * 1.6) * (1 - smoothstep(0.45, 0.72, slope)), 0, 1);
    if (snow > acc) { acc = snow; id = ACCENT_ID.snow; }
    // River margins are bare mud, not turf.
    if (river > 0.05) turf *= 1 - smoothstep(0.05, 0.5, river);
    out[0] = turf * (1 - acc);
    out[1] = acc;
    out[2] = id;
    return out;
  },
};

export class Terrain {
  constructor(scene, quality, sampler = THERA_SAMPLER, textures = null) {
    this.quality = quality;
    this.sampler = sampler;
    this.group = new THREE.Group();
    this.group.name = 'terrain';
    this.group.matrixAutoUpdate = false;
    scene.add(this.group);
    this.material = makeTerrainMaterial(textures);
    this.root = new Node(-ROOT_SIZE / 2, -ROOT_SIZE / 2, ROOT_SIZE, MAX_LEVEL);
    this.pending = [];
    this.live = new Map();          // key -> mesh
    this.viewDistance = 9000;
    this.buildBudget = 3;
    this.stats = { nodes: 0, built: 0, queued: 0 };
    this._visitList = [];
  }

  key(n) { return `${n.level}:${n.x},${n.z}`; }

  setViewDistance(d) { this.viewDistance = d; }

  update(px, pz, dt) {
    const K = 2.05 / this.quality.lodBias;
    const list = this._visitList;
    list.length = 0;
    this._select(this.root, px, pz, K, list);
    this.stats.nodes = list.length;

    // Anything currently drawn but no longer selected goes away.
    const wanted = new Set();
    for (const n of list) wanted.add(this.key(n));
    for (const [k, mesh] of this.live) {
      if (!wanted.has(k)) {
        this.group.remove(mesh);
        mesh.geometry.dispose();
        this.live.delete(k);
      }
    }

    // Build missing patches nearest-first, a few per frame.
    this.pending.length = 0;
    for (const n of list) {
      const k = this.key(n);
      if (!this.live.has(k)) this.pending.push(n);
    }
    if (this.pending.length) {
      this.pending.sort((a, b) => a.distTo(px, pz) - b.distTo(px, pz));
      const budget = Math.min(this.buildBudget, this.pending.length);
      for (let i = 0; i < budget; i++) this._build(this.pending[i]);
    }
    this.stats.queued = Math.max(0, this.pending.length - this.buildBudget);
    this.stats.built = this.live.size;
  }

  /** Build everything currently selected — used once at load, before play. */
  flush(px, pz, maxNodes = 400) {
    const K = 2.05 / this.quality.lodBias;
    const list = [];
    this._select(this.root, px, pz, K, list);
    list.sort((a, b) => a.distTo(px, pz) - b.distTo(px, pz));
    for (let i = 0; i < Math.min(list.length, maxNodes); i++) {
      const k = this.key(list[i]);
      if (!this.live.has(k)) this._build(list[i]);
    }
  }

  _select(node, px, pz, K, out) {
    const d = node.distTo(px, pz);
    if (d > this.viewDistance + node.size * 0.75) return;
    if (node.size > LEAF_SIZE && d < node.size * K) {
      if (!node.children) {
        const h = node.size / 2, l = node.level - 1;
        node.children = [
          new Node(node.x, node.z, h, l),
          new Node(node.x + h, node.z, h, l),
          new Node(node.x, node.z + h, h, l),
          new Node(node.x + h, node.z + h, h, l),
        ];
      }
      for (const c of node.children) this._select(c, px, pz, K, out);
    } else {
      out.push(node);
    }
  }

  _build(node) {
    const detail = node.size <= 128 ? 1 : node.size <= 512 ? 0.6 : 0.2;
    const geo = buildChunkGeometry(node.x, node.z, node.size, detail, this.sampler);
    const mesh = new THREE.Mesh(geo, this.material);
    mesh.position.set(node.cx, 0, node.cz);
    mesh.receiveShadow = node.size <= 256;
    mesh.castShadow = false;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.renderOrder = 0;
    this.group.add(mesh);
    this.live.set(this.key(node), mesh);
  }

  /** Throw away every built patch — used when swapping worlds. */
  reset() {
    for (const [, m] of this.live) { this.group.remove(m); m.geometry.dispose(); }
    this.live.clear();
    this.root = new Node(-ROOT_SIZE / 2, -ROOT_SIZE / 2, ROOT_SIZE, MAX_LEVEL);
  }

  setSampler(sampler) {
    if (this.sampler === sampler) return;
    this.sampler = sampler;
    this.reset();
  }

  dispose() {
    this.reset();
    this.material.dispose();
  }
}

export { heightAt, MAX_LEVEL, LEAF_SIZE };
