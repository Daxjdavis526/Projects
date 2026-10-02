/* The exhaust plume: a volume ray-marched inside a box that starts at the
   nozzle exit, emission only (a flame gives off light; the smoke and steam
   that block it are particles, see particles.js).

   Everything about its SHAPE that is physics comes in as uniforms from
   jetState (sim/visual.js): the exit and fully expanded jet radii, the
   shock-cell spacing, the length of the supersonic core, how many diamonds
   and how strong, whether there is a Mach disk, how much of the nozzle has
   separated. Its brightness and colour come from flameLook. The turbulence,
   the luminous length past the core and the spread are shaped by eye. */
import * as THREE from 'three';

const vert = /* glsl */`
varying vec3 vObj;
void main() {
  vObj = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const frag = /* glsl */`
precision highp float;
varying vec3 vObj;
uniform vec3 uCam;                 // camera, object space (unit box)
uniform float uL, uR;              // box: x in [0,1]·uL, y,z in [-1,1]·uR  (m)
uniform float uRe, uRj, uCell, uCore, uNdia, uStrength, uDisk, uLvis, uSpread;
uniform float uTime, uLum, uSoot, uAfter, uSep, uFlick, uCold, uVel, uSide;
uniform vec3 uCoreCol, uDiaCol, uEdgeCol;

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { return 0.55 * vnoise(p) + 0.3 * vnoise(p * 2.03 + 7.1) + 0.15 * vnoise(p * 4.1 + 3.3); }

/* jet radius at x (m) */
float radiusAt(float x) {
  float r0 = uRe * (1.0 - 0.45 * uSep);
  float near = uRj + (r0 - uRj) * exp(-x / max(1e-4, 0.35 * uCell + 0.5 * uRe));
  float ripple = uCell > 0.0 ? 0.10 * uStrength * uRj * sin(6.2831853 * x / uCell) * max(0.0, 1.0 - x / max(uCore, 1e-4)) : 0.0;
  float far = max(0.0, x - uCore) * uSpread;
  return max(0.3 * uRj, near + ripple + far + 0.02 * x);
}

vec3 emission(vec3 p) {
  float x = p.x;
  // a separated nozzle flaps: the jet wanders off axis
  vec2 yz = p.yz - uSep * uRj * 0.35 * vec2(sin(uTime * 37.0 + x * 9.0), cos(uTime * 29.0 + x * 7.0));
  float r = length(yz);
  float R = radiusAt(x);
  if (r > 1.7 * R) return vec3(0.0);
  float q = r / R;
  float axial = exp(-x / max(1e-3, uLvis));
  // eddies convect at ~0.6 U — far too fast for a 60 Hz camera, which smears
  // them into streaks: stretched along the axis, slowed to a crawl
  vec3 adv = vec3((x - uTime * min(uVel, 600.0) * 0.01) * 0.3, yz) / max(uRj, 1e-3);
  float n = fbm(adv * 0.8);
  if (uCold > 0.5) {
    // nitrogen: no light of its own; humid air condensing in the cold jet
    float fog = exp(-q * q * 1.6) * smoothstep(0.0, uRj * 6.0, x) * exp(-x / max(1e-3, uLvis)) * (0.4 + 0.9 * n);
    return vec3(0.75, 0.82, 0.9) * fog * 0.05;
  }
  // the supersonic core: hottest and brightest at the exit, translucent
  float inCore = 1.0 - smoothstep(uCore * 0.7, uCore * 1.2, x);
  float hot = 1.0 + 2.5 * exp(-x / max(1e-3, 0.25 * uCore));
  float core = exp(-q * q * 2.5) * (0.35 + 0.65 * inCore) * axial * hot;
  vec3 col = uCoreCol * core * (0.7 + 0.3 * n) * 0.9;
  // shock diamonds: rhombus-shaped hot gas behind each shock crossing
  if (uCell > 0.0 && uNdia > 0.5) {
    float k = clamp(floor(x / uCell - 0.62 + 0.5), 0.0, uNdia - 1.0);
    float xk = (k + 0.62) * uCell;
    float d = abs(x - xk) / (0.36 * uCell) + q / 0.8;
    float dia = (1.0 - smoothstep(0.2, 1.0, d)) * uStrength * exp(-0.3 * k) * (1.0 - smoothstep(uCore * 0.85, uCore * 1.15, xk));
    col += uDiaCol * dia * 4.0;
  }
  // the Mach disk: a normal shock across the first cell
  if (uDisk > 0.5 && uCell > 0.0) {
    float xm = 0.52 * uCell;
    float disk = (1.0 - smoothstep(0.0, 0.06 * uCell + 0.1 * uRj, abs(x - xm))) * (1.0 - smoothstep(0.4, 0.7, q));
    col += uDiaCol * disk * 4.0 * (0.6 + 0.4 * uStrength);
  }
  // the turbulent mantle: mixing with the air; afterburning if fuel-rich
  float mant = exp(-pow((q - 0.7) / 0.38, 2.0)) * smoothstep(0.0, uCore * 0.4 + uRj, x) * exp(-x / max(1e-3, uLvis * 0.55));
  mant *= smoothstep(0.25, 0.8, n);
  col += uEdgeCol * mant * (0.3 + 1.2 * uAfter + 0.6 * uSoot);
  return col;
}

void main() {
  vec3 scale = vec3(uL, uR, uR);
  vec3 ro = uCam * scale, pe = vObj * scale;
  vec3 rd = normalize(pe - ro);
  // slab intersection with the box
  vec3 bmin = vec3(0.0, -uR, -uR), bmax = vec3(uL, uR, uR);
  vec3 inv = 1.0 / rd;
  vec3 t0 = (bmin - ro) * inv, t1 = (bmax - ro) * inv;
  vec3 tn = min(t0, t1), tf = max(t0, t1);
  float ta = max(max(max(tn.x, tn.y), tn.z), 0.0);
  float tb = min(min(tf.x, tf.y), tf.z);
  if (tb <= ta) discard;
  const int N = 56;
  float dt = (tb - ta) / float(N);
  float j = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  vec3 acc = vec3(0.0);
  for (int i = 0; i < N; i++) {
    vec3 p = ro + rd * (ta + (float(i) + j) * dt);
    acc += emission(p);
  }
  float flick = 1.0 + uFlick * (vnoise(vec3(uTime * 23.0, 0.0, 0.0)) - 0.5) * 2.0;
  acc *= dt / max(uRj, 1e-4) * 0.55 * uLum * flick;
  gl_FragColor = vec4(acc, 1.0);
}`;

export class Plume {
  constructor() {
    const geo = new THREE.BoxGeometry(1, 2, 2);
    geo.translate(0.5, 0, 0);
    this.u = {
      uCam: { value: new THREE.Vector3() }, uL: { value: 1 }, uR: { value: 0.2 },
      uRe: { value: 0.014 }, uRj: { value: 0.014 }, uCell: { value: 0 }, uCore: { value: 0.3 }, uNdia: { value: 0 },
      uStrength: { value: 0 }, uDisk: { value: 0 }, uLvis: { value: 0.5 }, uSpread: { value: 0.12 },
      uTime: { value: 0 }, uLum: { value: 0 }, uSoot: { value: 0 }, uAfter: { value: 0 }, uSep: { value: 0 }, uFlick: { value: 0 },
      uCold: { value: 0 }, uVel: { value: 2000 }, uSide: { value: 0 },
      uCoreCol: { value: new THREE.Color(0.6, 0.6, 1) }, uDiaCol: { value: new THREE.Color(1, 0.8, 0.5) }, uEdgeCol: { value: new THREE.Color(1, 0.5, 0.2) },
    };
    this.mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: this.u, vertexShader: vert, fragmentShader: frag,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
    this.light = new THREE.PointLight(0xffaa66, 0, 40, 2);
    this.visibleLen = 0;
  }

  /* jet: from cellState; s: the engine's world scale (1); cam: the camera */
  update(jet, time, camera) {
    const u = this.u, m = this.mesh;
    if (!jet || !(jet.mdot > 1e-6) || jet.regime === 'none') { m.visible = false; this.light.intensity = 0; this.visibleLen = 0; return; }
    const cold = !jet.lit;
    const products = jet.products ?? 0;
    // nothing to see from a purge, a subsonic dribble, or a cold-flow chamber
    if (cold && (jet.fog ?? 0) < 0.02) { m.visible = false; this.light.intensity = 0; return; }
    if (!cold && products < 0.05) { m.visible = false; this.light.intensity = 0; return; }
    m.visible = true;
    const Re = jet.De / 2, Rj = Math.max(0.3 * Re, jet.Dj / 2);
    const Mj = Math.max(0.3, jet.Mj);
    const look = jet.look;
    const k = Math.sqrt(Math.max(0, Math.min(1.3, jet.Pc / Math.max(1, jet.Pnom))));
    const Lvis = cold ? jet.Dj * 30 * (jet.fog ?? 0) : jet.Dj * (14 + 2 * Mj * Mj) * (0.8 + 0.6 * (look?.afterburn ?? 0)) * Math.max(0.25, k);
    const L = Math.min(40, Math.max(Lvis * 2.2, (jet.core || 0) * 1.4, Re * 10));
    const spread = 0.065;
    const R = Math.max(Rj * 1.6, Re * 1.4) + Math.max(0, L - (jet.core || 0)) * spread * 1.4 + Rj;
    u.uL.value = L; u.uR.value = R;
    u.uRe.value = Re; u.uRj.value = Rj; u.uCell.value = jet.cell || 0; u.uCore.value = Math.max(jet.core || 0, Rj * 4);
    u.uNdia.value = jet.diamonds || 0; u.uStrength.value = jet.strength || 0; u.uDisk.value = jet.machDisk ? 1 : 0;
    u.uLvis.value = Math.max(Re * 2, Lvis); u.uSpread.value = spread;
    u.uTime.value = time; u.uSep.value = jet.regime === 'separated' ? Math.max(0.3, jet.sepFrac) : 0;
    u.uCold.value = cold ? 1 : 0; u.uVel.value = Math.max(50, jet.Uj || 300);
    u.uFlick.value = Math.min(0.9, 0.06 + 3 * (jet.chug || 0) + 2 * (jet.hf || 0) + (jet.regime === 'separated' ? 0.3 : 0));
    if (look) {
      u.uCoreCol.value.setRGB(...look.core); u.uDiaCol.value.setRGB(...look.diamond); u.uEdgeCol.value.setRGB(...look.edge);
      u.uSoot.value = look.soot; u.uAfter.value = look.afterburn;
      u.uLum.value = (look.lum || 0) * 1.6;
    } else u.uLum.value = 1;
    m.scale.set(L, R, R);
    this.visibleLen = Lvis;
    m.updateMatrixWorld();
    u.uCam.value.copy(camera.position);
    m.worldToLocal(u.uCam.value);
    // the light the flame throws on the cell
    if (!cold && look) {
      const c = new THREE.Color().setRGB(...look.edge).lerp(new THREE.Color().setRGB(...look.core), 0.35);
      this.light.color.copy(c);
      this.light.intensity = 3 * (look.lum || 0) * Math.pow(Math.max(0.05, Lvis) / 0.66, 2) * (1 + u.uFlick.value * (Math.random() - 0.5));
      this.light.position.set(Lvis * 0.5, 0, 0);
    } else this.light.intensity = 0;
  }
}
