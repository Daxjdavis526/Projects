// Procedural texture baking.
//
// Every surface in the game is textured, and none of the textures are files.
// They are rendered once at load by drawing a fullscreen quad through a
// procedural shader into a render target — which is fast enough to be free and
// keeps the whole project a folder of source.
//
// Each material bakes two maps: albedo, and a normal map derived analytically
// from the same height field the albedo is built from, so the lighting and the
// colour always agree.

import * as THREE from 'three';

// --- shared GLSL -----------------------------------------------------------

const NOISE = /* glsl */`
float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 h22(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }

// Tiling value noise: the lattice wraps at 'per', so the texture is seamless.
float vnoise(vec2 p, float per){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  vec2 a = mod(i, per), b = mod(i + vec2(1.0, 0.0), per);
  vec2 c = mod(i + vec2(0.0, 1.0), per), d = mod(i + vec2(1.0), per);
  return mix(mix(h21(a), h21(b), f.x), mix(h21(c), h21(d), f.x), f.y);
}
float fbm(vec2 p, float per, int oct){
  float v = 0.0, a = 0.5, pe = per;
  for (int i = 0; i < 8; i++){
    if (i >= oct) break;
    v += a * vnoise(p, pe);
    p *= 2.0; pe *= 2.0; a *= 0.5;
  }
  return v;
}
// Tiling worley — cell centres, for pebbles, cracks and crater fields.
vec2 worley(vec2 p, float per){
  vec2 i = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++){
    for (int x = -1; x <= 1; x++){
      vec2 g = vec2(float(x), float(y));
      vec2 o = h22(mod(i + g, per));
      float d = length(g + o - f);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
    }
  }
  return vec2(d1, d2);
}
vec3 hsv2rgb(vec3 c){
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
`;

// Wraps a user "height + colour" function into a bakeable program.
// The function must define:
//   float heightAt(vec2 uv);
//   vec3  colourAt(vec2 uv, float h);
const BAKE_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uMode;      // 0 = albedo, 1 = normal
uniform float uBump;
${NOISE}
//__BODY__
void main(){
  if (uMode < 0.5) {
    float h = heightAt(vUv);
    gl_FragColor = vec4(colourAt(vUv, h), 1.0);
  } else {
    float e = 1.0 / 512.0;
    float hx = heightAt(vUv + vec2(e, 0.0)) - heightAt(vUv - vec2(e, 0.0));
    float hy = heightAt(vUv + vec2(0.0, e)) - heightAt(vUv - vec2(0.0, e));
    vec3 n = normalize(vec3(-hx * uBump, -hy * uBump, 1.0));
    gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
  }
}
`;

const BAKE_VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }
`;

// --- the baker -------------------------------------------------------------

export class TextureBaker {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), null);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    this.made = [];
  }

  /**
   * @param body  GLSL defining heightAt(vec2) and colourAt(vec2,float)
   * @returns {{ map: THREE.Texture, normalMap: THREE.Texture }}
   */
  bake(body, { size = 512, bump = 40, alpha = false, normal = true } = {}) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uMode: { value: 0 }, uBump: { value: bump } },
      vertexShader: BAKE_VERT,
      fragmentShader: BAKE_FRAG.replace('//__BODY__', body),
      depthTest: false, depthWrite: false,
      transparent: alpha,
    });
    this.quad.material = mat;

    const render = (mode) => {
      const rt = new THREE.WebGLRenderTarget(size, size, {
        format: alpha && mode === 0 ? THREE.RGBAFormat : THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        depthBuffer: false,
        colorSpace: mode === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace,
      });
      rt.texture.wrapS = rt.texture.wrapT = THREE.RepeatWrapping;
      rt.texture.anisotropy = 8;
      mat.uniforms.uMode.value = mode;
      const prev = this.renderer.getRenderTarget();
      this.renderer.setRenderTarget(rt);
      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(prev);
      this.made.push(rt);
      return rt.texture;
    };

    const out = { map: render(0) };
    if (normal) out.normalMap = render(1);
    mat.dispose();
    return out;
  }

  dispose() { for (const rt of this.made) rt.dispose(); }
}

// --- the material library --------------------------------------------------

/** Loam and leaf litter under a canopy: clumped, dark, organic. */
const SOIL = /* glsl */`
float heightAt(vec2 uv){
  vec2 p = uv * 8.0;
  float h = fbm(p, 8.0, 5) * 0.7;
  h += fbm(p * 3.0, 24.0, 4) * 0.3;
  // Leaf litter: flat overlapping shapes.
  vec2 w = worley(uv * 14.0, 14.0);
  h += (1.0 - smoothstep(0.0, 0.42, w.x)) * 0.22;
  return h;
}
vec3 colourAt(vec2 uv, float h){
  vec2 w = worley(uv * 14.0, 14.0);
  float litter = 1.0 - smoothstep(0.10, 0.46, w.x);
  float grain = fbm(uv * 46.0, 46.0, 3);
  vec3 dark = vec3(0.075, 0.065, 0.048);
  vec3 mid  = vec3(0.19, 0.165, 0.115);
  vec3 lit  = vec3(0.34, 0.30, 0.19);
  vec3 c = mix(dark, mid, smoothstep(0.28, 0.72, h));
  c = mix(c, lit, litter * 0.55 * (0.4 + grain * 0.9));
  c *= 0.78 + grain * 0.44;
  return c;
}
`;

/** Fine blade structure — used as the ground layer under grassland. */
const TURF = /* glsl */`
// Blades are stretched noise, but stretched noise alone combs the whole tile
// in one direction and reads as corduroy across an open field. A periodic
// domain warp curls them into tufts and keeps the tile seamless: the warp is
// itself periodic, so q(uv + 1) == q(uv) + 1 and the lattice still wraps.
vec2 turfWarp(vec2 uv){
  vec2 w = vec2(fbm(uv * 4.0, 4.0, 3), fbm(uv * 4.0 + 17.0, 4.0, 3)) - 0.5;
  return uv + w * 0.19;
}
float heightAt(vec2 uv){
  vec2 q = turfWarp(uv);
  // 96 and 24 are both whole multiples of the period, or the tile seams.
  float blades = fbm(vec2(q.x * 96.0, q.y * 24.0), 24.0, 4);
  float clump = fbm(uv * 5.0, 5.0, 4);
  return blades * 0.55 + clump * 0.45;
}
vec3 colourAt(vec2 uv, float h){
  vec2 q = turfWarp(uv);
  float clump = fbm(uv * 5.0, 5.0, 4);
  float fine = fbm(vec2(q.x * 80.0, q.y * 20.0), 20.0, 3);
  vec3 deep = vec3(0.055, 0.085, 0.030);
  vec3 mid  = vec3(0.135, 0.185, 0.062);
  vec3 dry  = vec3(0.30, 0.285, 0.115);
  vec3 c = mix(deep, mid, smoothstep(0.25, 0.75, h));
  c = mix(c, dry, smoothstep(0.55, 0.95, clump) * 0.55);
  c *= 0.72 + fine * 0.56;
  return c;
}
`;

/** Fractured cliff rock with bedding planes. */
const ROCK = /* glsl */`
float heightAt(vec2 uv){
  vec2 p = uv * 6.0;
  float bed = sin((uv.y * 9.0 + fbm(p, 6.0, 3) * 2.2) * 6.2831) * 0.5 + 0.5;
  float base = fbm(p * 1.4, 8.4, 5);
  vec2 w = worley(uv * 7.0 + fbm(uv * 3.0, 3.0, 3) * 0.6, 7.0);
  float crack = smoothstep(0.06, 0.0, w.y - w.x);
  return base * 0.62 + bed * 0.24 - crack * 0.5 + fbm(p * 9.0, 54.0, 3) * 0.14;
}
vec3 colourAt(vec2 uv, float h){
  vec2 w = worley(uv * 7.0 + fbm(uv * 3.0, 3.0, 3) * 0.6, 7.0);
  float crack = smoothstep(0.07, 0.0, w.y - w.x);
  float grain = fbm(uv * 40.0, 40.0, 3);
  float iron = smoothstep(0.45, 0.85, fbm(uv * 2.2 + 9.0, 2.2, 4));
  vec3 pale = vec3(0.315, 0.300, 0.278);
  vec3 dark = vec3(0.105, 0.100, 0.098);
  vec3 c = mix(dark, pale, smoothstep(0.20, 0.80, h));
  c = mix(c, vec3(0.30, 0.19, 0.115), iron * 0.35);
  c *= 1.0 - crack * 0.65;
  c *= 0.80 + grain * 0.38;
  return c;
}
`;

/** Wind-rippled sand. */
const SAND = /* glsl */`
float heightAt(vec2 uv){
  vec2 p = uv * 5.0;
  float ripple = sin((uv.x * 22.0 + fbm(p, 5.0, 4) * 3.4) * 6.2831) * 0.5 + 0.5;
  return ripple * 0.42 + fbm(uv * 34.0, 34.0, 4) * 0.58;
}
vec3 colourAt(vec2 uv, float h){
  float grain = fbm(uv * 90.0, 90.0, 2);
  float shell = smoothstep(0.93, 1.0, fbm(uv * 30.0 + 4.0, 30.0, 2));
  vec3 c = mix(vec3(0.42, 0.375, 0.295), vec3(0.72, 0.665, 0.525), smoothstep(0.3, 0.8, h));
  c = mix(c, vec3(0.86, 0.84, 0.80), shell * 0.8);
  c *= 0.86 + grain * 0.28;
  return c;
}
`;

/** Wind-crusted snow with a faint sparkle. */
const SNOW = /* glsl */`
float heightAt(vec2 uv){
  return fbm(uv * 6.0, 6.0, 5) * 0.7 + fbm(uv * 30.0, 30.0, 3) * 0.3;
}
vec3 colourAt(vec2 uv, float h){
  float sparkle = step(0.985, h21(floor(uv * 512.0)));
  vec3 c = mix(vec3(0.68, 0.72, 0.80), vec3(0.96, 0.975, 1.0), smoothstep(0.3, 0.8, h));
  return c + sparkle * 0.35;
}
`;

/** Basaltic ash and clinker. */
const ASH = /* glsl */`
float heightAt(vec2 uv){
  vec2 w = worley(uv * 11.0, 11.0);
  float clinker = 1.0 - smoothstep(0.0, 0.36, w.x);
  return fbm(uv * 9.0, 9.0, 5) * 0.6 + clinker * 0.4;
}
vec3 colourAt(vec2 uv, float h){
  float grain = fbm(uv * 60.0, 60.0, 3);
  vec2 w = worley(uv * 11.0, 11.0);
  float clinker = 1.0 - smoothstep(0.0, 0.36, w.x);
  vec3 c = mix(vec3(0.035, 0.032, 0.034), vec3(0.145, 0.135, 0.132), smoothstep(0.25, 0.8, h));
  c = mix(c, vec3(0.21, 0.105, 0.062), clinker * 0.4);
  c *= 0.8 + grain * 0.42;
  return c;
}
`;

/** Lunar regolith: fine dust, micro-craters, angular fragments. */
const REGOLITH = /* glsl */`
float heightAt(vec2 uv){
  float dust = fbm(uv * 16.0, 16.0, 5);
  vec2 w = worley(uv * 9.0, 9.0);
  float pits = smoothstep(0.30, 0.0, w.x) * 0.5;
  vec2 w2 = worley(uv * 26.0 + 3.0, 26.0);
  float frag = smoothstep(0.22, 0.0, w2.x) * 0.25;
  return dust * 0.6 - pits + frag;
}
vec3 colourAt(vec2 uv, float h){
  float grain = fbm(uv * 120.0, 120.0, 2);
  vec3 c = mix(vec3(0.085, 0.083, 0.086), vec3(0.30, 0.297, 0.292), smoothstep(0.15, 0.85, h));
  c *= 0.84 + grain * 0.32;
  return c;
}
`;

/**
 * Reptile hide: pebbled scales over a wrinkle field. Sampled triplanar in each
 * creature's bind pose, so the pattern is locked to the skin and does not swim
 * when a leg swings. The albedo is near-neutral on purpose — the species colour
 * comes from vertex colours, and this only has to give it grain and relief.
 */
const HIDE = /* glsl */`
float heightAt(vec2 uv){
  // Wrinkles first, then scales sized by how stretched the skin is there.
  float wrinkle = fbm(uv * 7.0, 7.0, 4);
  vec2 warp = vec2(fbm(uv * 5.0 + 3.0, 5.0, 3), fbm(uv * 5.0 + 19.0, 5.0, 3)) - 0.5;
  vec2 w1 = worley(uv * 30.0 + warp * 4.0, 30.0);
  vec2 w2 = worley(uv * 13.0 + warp * 2.0, 13.0);
  // Rounded plates: distance to the cell edge, not to the centre.
  float plate = smoothstep(0.0, 0.30, w1.y - w1.x);
  float big = smoothstep(0.0, 0.22, w2.y - w2.x);
  float scale = mix(plate, big, 0.34);
  return scale * 0.62 + wrinkle * 0.28 + fbm(uv * 64.0, 64.0, 3) * 0.10;
}
vec3 colourAt(vec2 uv, float h){
  vec2 warp = vec2(fbm(uv * 5.0 + 3.0, 5.0, 3), fbm(uv * 5.0 + 19.0, 5.0, 3)) - 0.5;
  vec2 w2 = worley(uv * 13.0 + warp * 2.0, 13.0);
  float seam = smoothstep(0.16, 0.0, w2.y - w2.x);
  float mottle = fbm(uv * 3.0 + 7.0, 3.0, 4);
  // Near-white so it multiplies cleanly into the species colour.
  vec3 c = mix(vec3(0.62), vec3(1.06), smoothstep(0.2, 0.85, h));
  c *= 1.0 - seam * 0.42;
  c *= 0.88 + mottle * 0.30;
  return c;
}
`;

/** Fibrous bark with deep vertical fissures. */
const BARK = /* glsl */`
float heightAt(vec2 uv){
  vec2 p = vec2(uv.x * 3.0, uv.y * 0.9);
  float fissure = fbm(vec2(p.x * 4.0, p.y * 26.0), 12.0, 4);
  float ridge = abs(fissure - 0.5) * 2.0;
  float fibre = fbm(vec2(uv.x * 60.0, uv.y * 8.0), 60.0, 3);
  return ridge * 0.72 + fibre * 0.28;
}
vec3 colourAt(vec2 uv, float h){
  float moss = smoothstep(0.55, 0.9, fbm(uv * 4.0 + 7.0, 4.0, 4));
  vec3 dark = vec3(0.055, 0.042, 0.030);
  vec3 pale = vec3(0.26, 0.205, 0.145);
  vec3 c = mix(dark, pale, smoothstep(0.15, 0.85, h));
  c = mix(c, vec3(0.10, 0.15, 0.075), moss * 0.45 * smoothstep(0.2, 0.6, h));
  return c;
}
`;

// --- foliage atlas ---------------------------------------------------------
// One RGBA sheet, four cells. Alpha carries the leaf silhouette, which is what
// turns a canopy from a green blob into a tree.

const FOLIAGE_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
${NOISE}

// A single leaf: tapered, pointed, with a midrib.
float leaf(vec2 p, out float rib){
  float t = clamp(p.y * 0.5 + 0.5, 0.0, 1.0);
  float w = sin(3.14159 * pow(t, 0.62)) * 0.9;
  rib = 1.0 - smoothstep(0.0, 0.055, abs(p.x));
  float body = step(abs(p.x), w) * step(abs(p.y), 1.0);
  // Serrated edge.
  float serr = sin(t * 46.0) * 0.035;
  body *= step(abs(p.x), w + serr);
  return body;
}

vec2 rot(vec2 p, float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c) * p; }

void main(){
  vec2 cell = floor(vUv * 2.0);
  vec2 uv = fract(vUv * 2.0);
  vec3 col = vec3(0.0);
  vec3 bleed = vec3(0.10, 0.19, 0.05);
  float a = 0.0;

  if (cell.y > 0.5 && cell.x < 0.5) {
    // --- broadleaf spray --------------------------------------------------
    // Leaves fan off a central stem with real gaps between them: the gaps are
    // the silhouette, and the silhouette is what makes a canopy read as a tree.
    bleed = vec3(0.115, 0.225, 0.055);
    float depth = -1.0;
    for (int i = 0; i < 22; i++){
      float fi = float(i);
      // Leaves fan out from a stem near the bottom centre.
      float t = (fi + 0.5) / 22.0;
      vec2 stem = vec2(0.5 + sin(t * 4.1) * 0.05, 0.10 + t * 0.72);
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      float reach = 0.17 + h21(vec2(fi, 5.3)) * 0.22;
      vec2 c = stem + vec2(side * reach * (0.35 + t * 0.8), reach * 0.35);
      float ang = side * (1.05 + h21(vec2(fi, 3.1)) * 0.55) + (h21(vec2(fi, 8.2)) - 0.5) * 0.4;
      float sc = (0.125 + h21(vec2(fi, 7.7)) * 0.085) * (1.25 - t * 0.55);
      vec2 p = rot((uv - c) / sc, ang);
      float rib;
      float m = leaf(vec2(p.x * 2.6, p.y), rib);
      if (m > 0.5 && fi > depth) {
        float shade = 0.42 + h21(vec2(fi, 11.3)) * 0.58;
        float tip = clamp(p.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 lc = mix(vec3(0.045, 0.115, 0.035), vec3(0.26, 0.44, 0.10), shade);
        lc = mix(lc, vec3(0.40, 0.42, 0.11), smoothstep(0.70, 1.0, tip) * 0.55);
        lc *= 1.0 - rib * 0.30;
        col = lc; depth = fi; a = 1.0;
      }
    }
    // A thin stem tying the spray together.
    float stemD = abs(uv.x - 0.5 - sin(uv.y * 4.1) * 0.04);
    if (uv.y < 0.86 && stemD < 0.008) { col = vec3(0.10, 0.16, 0.05); a = 1.0; }

  } else if (cell.y > 0.5) {
    // --- pinnate frond ----------------------------------------------------
    bleed = vec3(0.105, 0.205, 0.050);
    float t = uv.y;
    float across = abs(uv.x - 0.5);
    float spine = (1.0 - smoothstep(0.006, 0.014, across)) * step(t, 0.97);
    // Leaflets: narrow, clearly separated, shortening toward the tip.
    float span = sin(3.14159 * pow(clamp(t, 0.0, 1.0), 0.62)) * 0.42;
    // Leaflets rake toward the tip rather than sitting square to the spine, and
    // they close up enough that the frond reads as a leaf, not a comb.
    float pin = fract(t * 40.0 - across * 5.5);
    float leaflet = step(across, span) * step(pin, 0.74) * step(0.03, t) * step(t, 0.97);
    a = max(spine, leaflet);
    float shade = 0.42 + (1.0 - across / max(span, 0.001)) * 0.5;
    col = mix(vec3(0.040, 0.105, 0.032), vec3(0.24, 0.42, 0.095), clamp(shade, 0.0, 1.0));
    col = mix(col, vec3(0.11, 0.19, 0.055), spine * 0.6);

  } else if (cell.x < 0.5) {
    // --- grass blades -----------------------------------------------------
    // Nine bold blades, not twenty hairlines. A tuft card is only ~100 px wide
    // on screen from a few metres away; anything thinner than about 4% of the
    // cell averages away in the mip chain and the alpha cut erases the plant.
    bleed = vec3(0.130, 0.215, 0.050);
    float best = -1.0;
    for (int i = 0; i < 9; i++){
      float fi = float(i);
      float x0 = 0.12 + (fi + 0.5) / 9.0 * 0.76 + (h21(vec2(fi, 1.7)) - 0.5) * 0.06;
      float lean = (h21(vec2(fi, 4.3)) - 0.5) * 0.50;
      float hgt = 0.54 + h21(vec2(fi, 9.1)) * 0.44;
      float t = clamp(uv.y / hgt, 0.0, 1.0);
      float cx = x0 + lean * t * t;
      float w = 0.050 * (1.0 - t * 0.86);
      if (abs(uv.x - cx) < w && uv.y < hgt && fi > best) {
        float shade = 0.40 + h21(vec2(fi, 12.9)) * 0.60;
        vec3 g = mix(vec3(0.050, 0.095, 0.024), vec3(0.28, 0.40, 0.085), shade);
        g = mix(g, vec3(0.42, 0.38, 0.12), smoothstep(0.55, 1.0, t) * 0.5);
        col = g; a = 1.0; best = fi;
      }
    }
    if (best < 0.0) a = 0.0;

  } else {
    // --- bark, with a white strip on the right ----------------------------
    // Trunks sample the bark. Rocks, berries and anything else opaque sample
    // the strip, where the map is white and the vertex colour survives intact.
    a = 1.0;
    if (uv.x > 0.86) {
      col = vec3(1.0);
    } else {
      vec2 bp = vec2(uv.x / 0.86, uv.y);
      vec2 q = vec2(bp.x * 3.0, bp.y * 0.9);
      float fissure = fbm(vec2(q.x * 4.0, q.y * 26.0), 12.0, 4);
      float ridge = abs(fissure - 0.5) * 2.0;
      float fibre = fbm(vec2(bp.x * 60.0, bp.y * 8.0), 60.0, 3);
      float h = ridge * 0.72 + fibre * 0.28;
      float moss = smoothstep(0.55, 0.9, fbm(bp * 4.0 + 7.0, 4.0, 4));
      col = mix(vec3(0.09, 0.070, 0.050), vec3(0.60, 0.475, 0.335), smoothstep(0.15, 0.85, h));
      col = mix(col, vec3(0.20, 0.30, 0.15), moss * 0.42 * smoothstep(0.2, 0.6, h));
    }
  }

  // Transparent texels still carry a plausible green. Mipmaps average RGB
  // regardless of alpha, so a black background would fringe every distant
  // leaf card with soot.
  gl_FragColor = vec4(mix(bleed, col, step(0.5, a)), a);
}
`;

/** UV rectangles inside the foliage atlas. */
export const ATLAS = {
  leaf: [0.0, 0.5, 0.5, 0.5],       // x, y, w, h  (leaf cluster)
  frond: [0.5, 0.5, 0.5, 0.5],
  grass: [0.0, 0.0, 0.5, 0.5],
  bark: [0.5, 0.0, 0.43, 0.5],      // tileable-ish bark
  solid: [0.945, 0.05, 0.04, 0.4],  // flat white: vertex colour passes through
};

/** Map a 0..1 UV into an atlas cell, with a small inset to avoid bleeding. */
export function atlasUV(cell, u, v, inset = 0.004) {
  const [x, y, w, h] = ATLAS[cell];
  return [x + inset + u * (w - inset * 2), y + inset + v * (h - inset * 2)];
}

/** Four ground accents in one 2x2 sheet, so the terrain needs one fetch. */
const ACCENT = /* glsl */`
float accSand(vec2 uv){
  vec2 p = uv * 5.0;
  float ripple = sin((uv.x * 22.0 + fbm(p, 5.0, 4) * 3.4) * 6.2831) * 0.5 + 0.5;
  return ripple * 0.42 + fbm(uv * 34.0, 34.0, 4) * 0.58;
}
float accAsh(vec2 uv){
  vec2 w = worley(uv * 11.0, 11.0);
  return fbm(uv * 9.0, 9.0, 5) * 0.6 + (1.0 - smoothstep(0.0, 0.36, w.x)) * 0.4;
}
float accSnow(vec2 uv){ return fbm(uv * 6.0, 6.0, 5) * 0.7 + fbm(uv * 30.0, 30.0, 3) * 0.3; }
float accReg(vec2 uv){
  vec2 w = worley(uv * 9.0, 9.0);
  return fbm(uv * 16.0, 16.0, 5) * 0.6 - smoothstep(0.30, 0.0, w.x) * 0.5
       + smoothstep(0.22, 0.0, worley(uv * 26.0 + 3.0, 26.0).x) * 0.25;
}
float heightAt(vec2 uv){
  vec2 c = floor(uv * 2.0); vec2 p = fract(uv * 2.0);
  if (c.y > 0.5) return c.x < 0.5 ? accSand(p) : accAsh(p);
  return c.x < 0.5 ? accSnow(p) : accReg(p);
}
vec3 colourAt(vec2 uv, float h){
  vec2 c = floor(uv * 2.0); vec2 p = fract(uv * 2.0);
  float grain = fbm(p * 80.0, 80.0, 3);
  if (c.y > 0.5) {
    if (c.x < 0.5) {
      float shell = smoothstep(0.93, 1.0, fbm(p * 30.0 + 4.0, 30.0, 2));
      vec3 col = mix(vec3(0.42, 0.375, 0.295), vec3(0.74, 0.685, 0.545), smoothstep(0.3, 0.8, h));
      return mix(col, vec3(0.86, 0.84, 0.80), shell * 0.8) * (0.86 + grain * 0.28);
    }
    vec2 w = worley(p * 11.0, 11.0);
    float clinker = 1.0 - smoothstep(0.0, 0.36, w.x);
    vec3 col = mix(vec3(0.035, 0.032, 0.034), vec3(0.155, 0.145, 0.140), smoothstep(0.25, 0.8, h));
    return mix(col, vec3(0.24, 0.115, 0.065), clinker * 0.42) * (0.8 + grain * 0.42);
  }
  if (c.x < 0.5) {
    float sparkle = step(0.988, h21(floor(p * 512.0)));
    return mix(vec3(0.66, 0.71, 0.80), vec3(0.97, 0.98, 1.0), smoothstep(0.3, 0.8, h)) + sparkle * 0.3;
  }
  return mix(vec3(0.085, 0.083, 0.086), vec3(0.32, 0.317, 0.310), smoothstep(0.15, 0.85, h))
    * (0.84 + grain * 0.32);
}
`;

/** Accent cell centres in the 2x2 sheet, indexed by aAccentId. */
export const ACCENT_CELL = [[0.0, 0.5], [0.5, 0.5], [0.0, 0.0], [0.5, 0.0]];
export const ACCENT_ID = { sand: 0, ash: 1, snow: 2, regolith: 3 };

export function bakeTextures(renderer) {
  const baker = new TextureBaker(renderer);
  const S = 512;
  const set = {
    soil: baker.bake(SOIL, { size: S, bump: 26 }),
    turf: baker.bake(TURF, { size: S, bump: 18 }),
    rock: baker.bake(ROCK, { size: S, bump: 46 }),
    sand: baker.bake(SAND, { size: S, bump: 14 }),
    snow: baker.bake(SNOW, { size: 256, bump: 12 }),
    ash: baker.bake(ASH, { size: S, bump: 34 }),
    regolith: baker.bake(REGOLITH, { size: S, bump: 30 }),
    bark: baker.bake(BARK, { size: S, bump: 40 }),
    hide: baker.bake(HIDE, { size: S, bump: 30 }),
    accent: baker.bake(ACCENT, { size: 1024, bump: 26 }),
  };
  // The accent sheet must not wrap between cells.
  set.accent.map.wrapS = set.accent.map.wrapT = THREE.ClampToEdgeWrapping;
  set.accent.normalMap.wrapS = set.accent.normalMap.wrapT = THREE.ClampToEdgeWrapping;

  // The foliage atlas is bespoke: RGBA, no normal map, no mip-fade to grey.
  const mat = new THREE.ShaderMaterial({
    uniforms: {}, vertexShader: BAKE_VERT, fragmentShader: FOLIAGE_FRAG,
    depthTest: false, depthWrite: false, transparent: true,
    blending: THREE.NoBlending,   // write raw RGBA, do not premultiply
  });
  baker.quad.material = mat;
  const rt = new THREE.WebGLRenderTarget(1024, 1024, {
    format: THREE.RGBAFormat, type: THREE.UnsignedByteType,
    generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter, depthBuffer: false,
    colorSpace: THREE.SRGBColorSpace,
  });
  rt.texture.wrapS = rt.texture.wrapT = THREE.ClampToEdgeWrapping;
  rt.texture.anisotropy = 8;
  const prev = renderer.getRenderTarget();
  const prevAlpha = renderer.getClearAlpha();
  renderer.setRenderTarget(rt);
  // Without this the target clears to opaque black and every alpha-tested
  // leaf card renders as a solid slab.
  renderer.setClearAlpha(0);
  renderer.clear(true, false, false);
  renderer.render(baker.scene, baker.camera);
  renderer.setClearAlpha(prevAlpha);
  renderer.setRenderTarget(prev);
  mat.dispose();
  baker.made.push(rt);
  set.foliage = rt.texture;
  set.baker = baker;
  return set;
}
