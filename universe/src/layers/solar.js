/* ============================================================================
   layers/solar.js — the Solar System
   ----------------------------------------------------------------------------
   Real relative sizes, real orbital elements, positions for today's date.
   Planet surfaces: Earth/Moon use real imagery; the rest are procedural
   (documented as artistic). Belts and the Oort cloud are statistical point
   distributions with real extents. The heliopause is drawn as a schematic
   sphere at ~120 AU (the real shape is windsock-like).
   ========================================================================== */
import * as THREE from 'three';
import { AU, LY, clamp, bandFade, mulberry32, gauss } from '../scale.js';
import { PLANETS, MOON, SUN, planetPos, moonPos,
         HELIOPAUSE_INFO, OORT_INFO, KUIPER_INFO, ASTEROIDS_INFO } from '../data.js';
import { placeBody, starMaterial, updateStarUniforms } from '../render.js';

// ------------------------------------------------ procedural textures
function fbmTexture(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  const d = img.data;
  // periodic-in-x value noise
  const P = 256, grid = new Float32Array(P * P);
  const rnd = mulberry32(77);
  for (let i = 0; i < P * P; i++) grid[i] = rnd();
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
    const i00 = ((yi & 255) * P + (xi & 255));
    const i10 = ((yi & 255) * P + ((xi + 1) & 255));
    const i01 = (((yi + 1) & 255) * P + (xi & 255));
    const i11 = (((yi + 1) & 255) * P + ((xi + 1) & 255));
    return (grid[i00] * (1 - sx) + grid[i10] * sx) * (1 - sy)
         + (grid[i01] * (1 - sx) + grid[i11] * sx) * sy;
  };
  const fbm = (x, y, oct = 5) => {
    let v = 0, a = 0.5, f = 1;
    for (let i = 0; i < oct; i++) { v += a * noise(x * f, y * f); f *= 2; a *= 0.5; }
    return v;
  };
  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const [r, gg, b] = paint(u, v, (fx, fy, o) => fbm(fx, fy, o));
      const i = (y * w + x) * 4;
      d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
const mix = (a, b, t) => a + (b - a) * t;
const px3 = (c1, c2, t) => [mix(c1[0], c2[0], t), mix(c1[1], c2[1], t), mix(c1[2], c2[2], t)];

const PAINTERS = {
  mercury: (u, v, fbm) => {
    const n = fbm(u * 14, v * 7, 6);
    const crater = Math.pow(fbm(u * 40 + 9, v * 20, 4), 6) * 2.2;
    const g = clamp(72 + n * 90 - crater * 60, 20, 180);
    return [g, g * 0.97, g * 0.92];
  },
  venus: (u, v, fbm) => {
    const sw = fbm(u * 5 + fbm(u * 3, v * 3, 3) * 1.6, v * 4, 4);
    return px3([225, 195, 140], [190, 150, 95], sw);
  },
  mars: (u, v, fbm) => {
    const n = fbm(u * 9, v * 5, 6);
    const dark = Math.pow(fbm(u * 5 + 3, v * 3 + 7, 4), 2.2);
    let c = px3([190, 105, 55], [95, 45, 25], dark * 1.4);
    c = px3(c, [225, 160, 110], n * 0.35);
    const pole = Math.max(0, Math.abs(v - 0.5) * 2 - 0.82) * 6;
    return px3(c, [250, 245, 240], clamp(pole + fbm(u * 8, v * 8, 3) * pole, 0, 1));
  },
  jupiter: (u, v, fbm) => {
    const warp = fbm(u * 4, v * 12, 4) * 0.06;
    const band = Math.sin((v + warp) * Math.PI * 13) * 0.5 + 0.5;
    let c = px3([222, 200, 170], [150, 110, 80], band * 0.75);
    c = px3(c, [240, 228, 205], fbm(u * 18, v * 9, 5) * 0.3);
    // Great Red Spot
    const dx = (u - 0.68) * 2.6, dy = (v - 0.69) * 6.5;
    const spot = Math.exp(-(dx * dx + dy * dy) * 3.5);
    return px3(c, [195, 95, 60], spot * 0.85);
  },
  saturn: (u, v, fbm) => {
    const warp = fbm(u * 3, v * 10, 3) * 0.04;
    const band = Math.sin((v + warp) * Math.PI * 11) * 0.5 + 0.5;
    let c = px3([225, 205, 160], [180, 155, 110], band * 0.55);
    return px3(c, [240, 225, 190], fbm(u * 12, v * 6, 4) * 0.22);
  },
  uranus: (u, v, fbm) => {
    const band = Math.sin(v * Math.PI * 6) * 0.5 + 0.5;
    let c = px3([160, 215, 222], [130, 190, 205], band * 0.4);
    return px3(c, [185, 228, 232], fbm(u * 6, v * 4, 3) * 0.18);
  },
  neptune: (u, v, fbm) => {
    const warp = fbm(u * 4, v * 8, 3) * 0.05;
    const band = Math.sin((v + warp) * Math.PI * 8) * 0.5 + 0.5;
    let c = px3([55, 95, 200], [30, 55, 140], band * 0.55);
    const dx = (u - 0.4) * 3.2, dy = (v - 0.38) * 7;
    const spot = Math.exp(-(dx * dx + dy * dy) * 4);
    c = px3(c, [20, 35, 90], spot * 0.7);
    return px3(c, [120, 160, 230], fbm(u * 14, v * 7, 4) * 0.2);
  },
  pluto: (u, v, fbm) => {
    const n = fbm(u * 7, v * 4, 5);
    let c = px3([200, 170, 140], [120, 90, 70], n);
    const dx = (u - 0.55) * 3.4, dy = (v - 0.62) * 4.2;
    const heart = Math.exp(-(dx * dx + dy * dy) * 3);
    return px3(c, [235, 225, 215], heart * 0.8);
  },
};

// ----------------------------------------------------------- sun shader
const SUN_MAT = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */`
    varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    void main() {
      vN = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vV = normalize(-mv.xyz); vUv = uv;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */`
    varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    uniform float uTime;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
                 mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    void main() {
      float mu = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
      float limb = 0.35 + 0.65 * pow(mu, 0.55);           // limb darkening
      float g = noise(vUv * 42.0 + uTime * 0.015)
              + 0.5 * noise(vUv * 90.0 - uTime * 0.02);
      float gran = 0.92 + 0.08 * g;
      vec3 c = vec3(1.9, 1.55, 1.05) * limb * gran * 2.1;  // HDR, bloom feeds on it
      gl_FragColor = vec4(c, 1.0);
    }`,
});

// --------------------------------------------------------- earth shader
function earthMaterial(tex) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDay: { value: tex.day }, uNight: { value: tex.night },
      uSpec: { value: tex.spec }, uNormal: { value: tex.normal },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
      uCamPos: { value: new THREE.Vector3() },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vNw; varying vec3 vPw;
      void main() {
        vUv = uv;
        vNw = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vPw = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      varying vec2 vUv; varying vec3 vNw; varying vec3 vPw;
      uniform sampler2D uDay, uNight, uSpec, uNormal;
      uniform vec3 uSunDir, uCamPos;
      void main() {
        vec3 N = normalize(vNw);
        // cheap tangent-space perturbation from the normal map
        vec3 nm = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
        vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N));
        vec3 B = cross(N, T);
        vec3 Np = normalize(N + (T * nm.x + B * nm.y) * 0.35);
        float d = dot(Np, uSunDir);
        float day = smoothstep(-0.12, 0.18, d);
        vec3 dayC = texture2D(uDay, vUv).rgb * clamp(d * 1.1 + 0.18, 0.08, 1.15);
        vec3 nightC = texture2D(uNight, vUv).rgb * vec3(1.0, 0.82, 0.55) * 1.25;
        vec3 V = normalize(uCamPos - vPw);
        // ocean sun glint
        float sp = texture2D(uSpec, vUv).r;
        vec3 H = normalize(uSunDir + V);
        float glint = pow(clamp(dot(Np, H), 0.0, 1.0), 180.0) * sp * day * 0.5;
        // atmospheric rim
        float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 5.0);
        vec3 atm = vec3(0.35, 0.55, 1.0) * rim * (0.15 + 0.85 * day) * 0.7;
        vec3 c = mix(nightC, dayC, day) + glint * vec3(1.0, 0.95, 0.85) + atm;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
}

function atmosphereMesh(radiusScale = 1.03) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uSunDir: { value: new THREE.Vector3(1, 0, 0) } },
    vertexShader: /* glsl */`
      varying vec3 vNw; varying vec3 vPw;
      void main() {
        vNw = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vPw = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vNw; varying vec3 vPw;
      uniform vec3 uSunDir;
      void main() {
        vec3 V = normalize(cameraPosition - vPw);
        float rim = pow(1.0 - abs(dot(normalize(vNw), V)), 3.4);
        float lit = clamp(dot(normalize(vNw), uSunDir) * 0.5 + 0.55, 0.05, 1.0);
        gl_FragColor = vec4(vec3(0.30, 0.52, 1.0) * rim * lit, rim * lit * 0.55);
      }`,
    transparent: true, blending: THREE.AdditiveBlending,
    side: THREE.BackSide, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radiusScale, 48, 48), m);
  return mesh;
}

// ------------------------------------------------------------ the layer
export function buildSolarLayer(scene, registry, ctx0) {
  const group = new THREE.Group();
  scene.add(group);
  const loader = new THREE.TextureLoader();
  const load = (p) => { const t = loader.load(p); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  const posCache = new Map();
  let cacheFrame = -1;
  function bodyPos(id, ctx) {
    if (cacheFrame !== ctx.frame) { posCache.clear(); cacheFrame = ctx.frame; }
    let p = posCache.get(id);
    if (p) return p;
    if (id === 'sun') p = [0, 0, 0];
    else if (id === 'moon') p = moonPos(ctx.T, bodyPos('earth', ctx));
    else p = planetPos(PLANETS.find(q => q.id === id), ctx.T);
    posCache.set(id, p);
    return p;
  }

  // ---- sun
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), SUN_MAT);
  group.add(sunMesh);
  const sunLight = new THREE.PointLight(0xfff2e0, 2.6, 0, 0);
  group.add(sunLight);
  scene.add(new THREE.AmbientLight(0x223344, 0.10));
  registry.push({
    id: 'sun', name: SUN.name, cls: SUN.cls, blurb: SUN.blurb,
    radius: SUN.radius, color: new THREE.Color(1, 0.93, 0.78), lum: 6e26,
    pos: () => [0, 0, 0], labelBand: [8.2, 21.6], focusD: SUN.radius * 5,
    kind: 'star', priority: 10, mesh: sunMesh,
  });

  // ---- planets
  const bodies = [];   // {id, mesh, tiltGroup, spin, radius, atmo?}
  const beaconColors = {
    mercury: 0x9a9a94, venus: 0xe8d8a8, earth: 0x88aaff, mars: 0xd88860,
    jupiter: 0xd8c0a0, saturn: 0xe0d0a8, uranus: 0xa0d8dd, neptune: 0x5878d8,
    pluto: 0xc0a890, moon: 0xaaaaaa,
  };
  for (const p of PLANETS) {
    let mesh;
    if (p.id === 'earth') {
      const tex = { day: load('assets/earth_day.jpg'), night: load('assets/earth_night.png'),
                    spec: load('assets/earth_specular.jpg'), normal: load('assets/earth_normal.jpg') };
      tex.night.colorSpace = THREE.SRGBColorSpace;
      mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), earthMaterial(tex));
    } else {
      const t = fbmTexture(1024, 512, PAINTERS[p.id]);
      mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48),
        new THREE.MeshLambertMaterial({ map: t }));
    }
    const spin = new THREE.Group(); spin.add(mesh);
    const tiltG = new THREE.Group(); tiltG.add(spin);
    tiltG.rotation.z = -p.tilt * Math.PI / 180;
    const entry = { id: p.id, mesh, tiltGroup: tiltG, spin, radius: p.radius };
    if (p.id === 'earth') { entry.atmo = atmosphereMesh(1.03); spin.add(entry.atmo); }
    if (p.id === 'saturn') {
      const ringTex = fbmTexture(1024, 8, (u, v, fbm) => {
        const r = u;
        let a = 0.55 + 0.45 * Math.sin(r * 60) * fbm(r * 30, 0.5, 3);
        if (r > 0.28 && r < 0.34) a *= 0.12;         // Cassini division
        if (r < 0.06) a *= r / 0.06;                 // soft inner edge
        if (r > 0.97) a *= (1 - r) / 0.03;           // soft outer edge
        const c = mix(190, 230, fbm(r * 22, 0.2, 3));
        return [c * a, c * 0.94 * a, c * 0.82 * a];
      });
      ringTex.rotation = 0;
      const rg = new THREE.RingGeometry(1.24, 2.27, 128, 1);
      // remap uvs radially
      const uv = rg.attributes.uv, pos = rg.attributes.position;
      for (let i = 0; i < uv.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        uv.setXY(i, (Math.hypot(x, y) - 1.24) / (2.27 - 1.24), 0.5);
      }
      const ring = new THREE.Mesh(rg, new THREE.MeshLambertMaterial({
        map: ringTex, transparent: true, opacity: 0.96, side: THREE.DoubleSide,
        alphaMap: ringTex, depthWrite: false,
      }));
      ring.rotation.x = Math.PI / 2;
      spin.add(ring);
    }
    group.add(tiltG);
    bodies.push(entry);
    registry.push({
      id: p.id, name: p.name, cls: p.cls, blurb: p.blurb,
      radius: p.radius, color: new THREE.Color(beaconColors[p.id]),
      lum: p.radius * p.radius * 4e6 / (AU * AU) * 7.5e19, // reflected-light proxy
      pos: (c) => bodyPos(p.id, c ?? window.__ctx),
      labelBand: [6.3, 13.8], focusD: p.radius * 4.2,
      kind: 'planet', priority: 8, mesh, body: entry,
    });
  }
  // moon
  {
    const t = load('assets/moon.jpg');
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48),
      new THREE.MeshLambertMaterial({ map: t }));
    const spin = new THREE.Group(); spin.add(mesh);
    const tiltG = new THREE.Group(); tiltG.add(spin);
    group.add(tiltG);
    bodies.push({ id: 'moon', mesh, tiltGroup: tiltG, spin, radius: MOON.radius });
    registry.push({
      id: 'moon', name: MOON.name, cls: MOON.cls, blurb: MOON.blurb,
      radius: MOON.radius, color: new THREE.Color(0xb8b8b8),
      lum: 5e16,
      pos: (c) => bodyPos('moon', c ?? window.__ctx),
      labelBand: [6.8, 9.6], focusD: MOON.radius * 4.5,
      kind: 'moon', priority: 7, mesh,
    });
  }

  // ---- orbit lines
  const orbitGroup = new THREE.Group();
  group.add(orbitGroup);
  const GM = 1e9;                       // orbit vertices stored in gigameters
  const T0 = ctx0.T;
  for (const p of PLANETS) {
    const pts = [];
    const base = planetPos(p, T0);
    const period = Math.pow(p.el[0], 1.5) / 100;     // centuries (Kepler's 3rd)
    for (let i = 0; i <= 256; i++) {
      const q = planetPos(p, T0 + (i / 256) * period);
      pts.push(new THREE.Vector3(q[0] / GM, q[1] / GM, q[2] / GM));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: 0x5a7a9a, transparent: true, opacity: 0.30, depthWrite: false,
    }));
    orbitGroup.add(line);
  }
  // moon orbit
  {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const q = moonPos(T0 + (i / 128) * (MOON.period / 36525), [0, 0, 0]);
      pts.push(new THREE.Vector3(q[0] / GM, q[1] / GM, q[2] / GM));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const moonOrbit = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: 0x5a7a9a, transparent: true, opacity: 0.30, depthWrite: false }));
    moonOrbit.userData.isMoonOrbit = true;
    orbitGroup.add(moonOrbit);
  }

  // ---- belts + Oort (statistical distributions, real extents)
  function beltPoints(n, rMin, rMax, incSpread, colorFn, lum, seed) {
    const rnd = mulberry32(seed);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), lu = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = rMin + (rMax - rMin) * Math.pow(rnd(), 0.8);
      const th = rnd() * Math.PI * 2;
      const inc = gauss(rnd) * incSpread;
      const x = a * Math.cos(th), z = a * Math.sin(th) * -1;
      const y = a * Math.sin(inc);
      pos[i*3] = x / GM; pos[i*3+1] = y / GM; pos[i*3+2] = z / GM;
      const c = colorFn(rnd);
      col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2];
      lu[i] = Math.log2(lum * (0.3 + rnd()));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aLum', new THREE.BufferAttribute(lu, 1));
    const mat = starMaterial({ fluxScale: 1, maxPx: 3.5 });
    const pt = new THREE.Points(g, mat);
    pt.frustumCulled = false;
    return pt;
  }
  const nScale = ctx0.quality.points;
  const asteroids = beltPoints(Math.floor(22000 * nScale), 2.1 * AU, 3.3 * AU, 0.10,
    r => [0.62, 0.58, 0.53], 4e17, 11);
  asteroids.material.uniforms.uFluxScale.value = 13;
  const kuiper = beltPoints(Math.floor(26000 * nScale), 30 * AU, 50 * AU, 0.09,
    r => [0.55, 0.60, 0.68], 3e20, 12);
  kuiper.material.uniforms.uFluxScale.value = 5;
  group.add(asteroids); group.add(kuiper);

  // Oort cloud: spherical shell, log-ish radial distribution
  const oort = (() => {
    const n = Math.floor(24000 * nScale);
    const rnd = mulberry32(13);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), lu = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = (2000 * Math.pow(50, rnd())) * AU;   // 2k..100k AU
      const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      pos[i*3] = r * s * Math.cos(th) / GM;
      pos[i*3+1] = r * u / GM;
      pos[i*3+2] = r * s * Math.sin(th) / GM;
      col[i*3] = 0.55; col[i*3+1] = 0.62; col[i*3+2] = 0.75;
      lu[i] = Math.log2(2e24 * (0.3 + rnd()));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aLum', new THREE.BufferAttribute(lu, 1));
    const p = new THREE.Points(g, starMaterial({ fluxScale: 440, maxPx: 2.5 }));
    p.frustumCulled = false;
    return p;
  })();
  group.add(oort);

  // ---- heliopause (schematic sphere at 120 AU)
  const helio = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32),
    new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vN; varying vec3 vP;
        void main(){ vN = normalize(mat3(modelMatrix)*normal);
        vec4 w = modelMatrix*vec4(position,1.0); vP = w.xyz;
        gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vP; uniform float uOp;
        void main(){ vec3 V = normalize(cameraPosition - vP);
        float rim = pow(1.0 - abs(dot(normalize(vN), V)), 2.0);
        gl_FragColor = vec4(vec3(1.0,0.72,0.42)*rim, rim*uOp); }`,
      uniforms: { uOp: { value: 0.35 } },
      transparent: true, blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide, depthWrite: false,
    }));
  group.add(helio);

  // region registry entries (labels sit at a fixed offset point)
  const region = (id, info, dist, band, color) => registry.push({
    id, name: info.name, cls: info.cls, blurb: info.blurb,
    radius: info.radius, color: new THREE.Color(color), lum: 0,
    pos: () => [dist * 0.7071, 0, -dist * 0.7071],
    labelBand: band, focusD: info.radius * 2.6, kind: 'region', priority: 4,
  });
  region('belt', ASTEROIDS_INFO, 2.7 * AU, [11.2, 13.2], 0x9a9488);
  region('kuiper', KUIPER_INFO, 43 * AU, [12.4, 14.4], 0x8ba0b8);
  region('heliopause', HELIOPAUSE_INFO, 120 * AU, [12.8, 14.8], 0xffb877);
  region('oort', OORT_INFO, 30000 * AU, [15.0, 17.2], 0x8ba0b8);

  // ------------------------------------------------------------- update
  const V = new THREE.Vector3();
  function update(ctx) {
    const logS = ctx.logS;
    const vis = logS < 17.8;
    group.visible = vis;
    if (!vis) return;

    // sun
    SUN_MAT.uniforms.uTime.value = ctx.time;
    const sb = placeBody(sunMesh, [0, 0, 0], SUN.radius, ctx);
    sunMesh.visible = sb.px > 1.2 && logS < 16;
    sunLight.position.copy(sunMesh.position);

    // planets + moon
    for (const b of bodies) {
      const p = bodyPos(b.id, ctx);
      const r = placeBody(b.tiltGroup, p, b.radius, ctx);
      // crossfade mesh -> beacon under ~4 px
      b.tiltGroup.visible = r.px > 1.4 && logS < 15.5;
      b.beaconFade = 1 - clamp((r.px - 2.5) / 3, 0, 1);
      // real spin (visible in principle, honest in practice)
      const pl = PLANETS.find(q => q.id === b.id);
      if (pl) b.spin.rotation.y = (ctx.T * 36525 / pl.day) * Math.PI * 2 % (Math.PI * 2);
      if (b.id === 'earth') {
        const m = b.mesh.material;
        const sd = V.copy(sunMesh.position).sub(b.tiltGroup.position).normalize();
        m.uniforms.uSunDir.value.copy(sd);
        m.uniforms.uCamPos.value.copy(ctx.camRenderV);
        if (b.atmo) b.atmo.material.uniforms.uSunDir.value.copy(sd);
      }
    }

    // orbits: gigameter frame centered on the Sun
    const oFade = bandFade(logS, 9.6, 14.6, 0.5);
    orbitGroup.visible = oFade > 0.01;
    if (orbitGroup.visible) {
      const s = GM / ctx.S;
      const sp = sunMesh.position;
      for (const line of orbitGroup.children) {
        line.material.opacity = 0.30 * oFade;
        if (line.userData.isMoonOrbit) {
          const e = bodyPos('earth', ctx), f = ctx.focus;
          line.position.set((e[0]-f[0])/ctx.S, (e[1]-f[1])/ctx.S, (e[2]-f[2])/ctx.S);
          const mf = bandFade(logS, 7.6, 9.8, 0.4);
          line.material.opacity = 0.3 * mf;
          line.visible = mf > 0.01;
        } else {
          line.position.copy(sp);
        }
        line.scale.setScalar(s);
      }
    }

    // belts / oort: vertices live in gigameters around the Sun
    for (const [pts, lo, hi] of [[asteroids, 10.8, 13.6], [kuiper, 11.6, 14.2], [oort, 14.0, 17.0]]) {
      const f = bandFade(logS, lo, hi, 0.6);
      pts.visible = f > 0.01;
      if (pts.visible) {
        pts.material.uniforms.uOpacity.value = f;
        updateStarUniforms(pts.material, ctx, [0, 0, 0], null, GM);
      }
    }

    // heliopause
    const hf = bandFade(logS, 12.9, 14.9, 0.5);
    helio.visible = hf > 0.01;
    if (helio.visible) {
      placeBody(helio, [0, 0, 0], 120 * AU, ctx);
      helio.material.uniforms.uOp.value = 0.32 * hf;
    }
  }

  return { group, update, bodies, bodyPos };
}
