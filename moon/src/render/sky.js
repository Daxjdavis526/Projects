/* =============================================================================
   SKY — the real one
   -----------------------------------------------------------------------------
   Black, always. There is no atmosphere to scatter light, so the sky is exactly
   as dark at noon as at midnight; what changes is whether your eyes are adapted
   enough to see anything in it.

   Three objects live here, all drawn into the far tier where the camera has
   orientation but no position:

   Stars: the Yale Bright Star Catalogue, at their real right ascensions and
   declinations, rotated into the Moon's body-fixed frame by the same matrix the
   ephemeris uses. Brightness follows the magnitude scale, colour follows B-V.

   The Sun: half a degree across and blinding.

   The Earth: two degrees across, four times the width of the Sun in our sky,
   lit by the same direction vector as the ground, spun so the correct continents
   face you, and phased by geometry rather than by a texture. From the far side
   it is simply not there.
   ========================================================================== */

import * as THREE from 'three';
import { R_EARTH } from '../config.js';

const SKY_RADIUS = 1e6;    // arbitrary: the far tier has no depth relationship

/* --- stars ------------------------------------------------------------------ */

const STAR_VERT = /* glsl */`
attribute float aMag;
attribute vec3 aColour;
uniform float uPixelScale;
uniform float uBrightness;
varying vec3 vColour;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  /* Magnitudes are a logarithmic scale: five magnitudes is a factor of a
     hundred in flux. Bright stars get a slightly larger point as well as a
     brighter one, which is how the eye reads them. */
  float flux = pow(10.0, -0.4 * (aMag - 1.0));
  vAlpha = clamp(flux * uBrightness, 0.0, 1.0);
  gl_PointSize = uPixelScale * (0.7 + 0.55 * clamp(2.6 - aMag * 0.42, 0.0, 3.0));
  vColour = aColour;
}
`;

/* A ShaderMaterial does not get three.js's tone mapping automatically, so the
   chunks are included by hand. Without them the sky would ignore the exposure
   the ground is being drawn with, and the stars would either be invisible in
   the dark or blazing in daylight. */
const STAR_FRAG = /* glsl */`
varying vec3 vColour;
varying float vAlpha;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r = length(d) * 2.0;
  float a = smoothstep(1.0, 0.15, r);
  if (a <= 0.001) discard;
  gl_FragColor = vec4(vColour * vAlpha, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Approximate stellar colour from the B-V index. */
function bvToRgb(bv, out) {
  const t = Math.max(-0.4, Math.min(2.0, bv));
  /* A simple fit: hot stars blue-white, cool stars orange-red. */
  const r = t < 0.0 ? 0.72 + 0.35 * (t + 0.4) : Math.min(1.0, 0.86 + 0.42 * t);
  const g = t < 0.0 ? 0.82 + 0.3 * (t + 0.4) : Math.max(0.55, 0.94 - 0.22 * t);
  const b = t < 0.0 ? 1.0 : Math.max(0.45, 1.0 - 0.44 * t);
  out[0] = Math.min(1, r); out[1] = Math.min(1, g); out[2] = Math.min(1, b);
  return out;
}

export function makeStars(buffer) {
  const f = new Float32Array(buffer);
  const n = f.length / 4;
  const pos = new Float32Array(n * 3);
  const mag = new Float32Array(n);
  const col = new Float32Array(n * 3);
  const rgb = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const ra = f[i * 4], dec = f[i * 4 + 1], vmag = f[i * 4 + 2], bv = f[i * 4 + 3];
    const c = Math.cos(dec);
    /* Equatorial J2000 cartesian; the group is rotated into the body frame. */
    pos[i * 3] = c * Math.cos(ra) * SKY_RADIUS;
    pos[i * 3 + 1] = c * Math.sin(ra) * SKY_RADIUS;
    pos[i * 3 + 2] = Math.sin(dec) * SKY_RADIUS;
    mag[i] = vmag;
    bvToRgb(bv, rgb);
    col[i * 3] = rgb[0]; col[i * 3 + 1] = rgb[1]; col[i * 3 + 2] = rgb[2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aMag', new THREE.BufferAttribute(mag, 1));
  g.setAttribute('aColour', new THREE.BufferAttribute(col, 3));
  const m = new THREE.ShaderMaterial({
    vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
    uniforms: { uPixelScale: { value: 2.2 }, uBrightness: { value: 2.6e-4 } },
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(g, m);
  points.frustumCulled = false;
  points.renderOrder = -10;
  return { points, material: m, count: n };
}

/* --- the Sun ---------------------------------------------------------------- */

const SUN_FRAG = /* glsl */`
uniform vec3 uColour;
uniform float uIntensity;
uniform float uDiscFraction;    // the disc's share of the oversized quad
varying vec2 vUv;
void main() {
  vec2 d = vUv - vec2(0.5);
  float r = length(d) * 2.0 / uDiscFraction;
  /* The disc itself, then the glare the eye and the camera both produce. */
  float disc = smoothstep(1.02, 0.94, r);
  float glare = pow(max(0.0, 1.0 - r * 0.055), 8.0) * 0.6;
  float a = clamp(disc + glare, 0.0, 1.0);
  if (a <= 0.002) discard;
  gl_FragColor = vec4(uColour * uIntensity * (disc * 12.0 + glare * 2.0), a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function makeSun() {
  const g = new THREE.PlaneGeometry(1, 1);
  const m = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: SUN_FRAG,
    uniforms: { uColour: { value: new THREE.Color(1.0, 0.97, 0.92) }, uIntensity: { value: 1 },
                uDiscFraction: { value: 1 / 9 } },
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  mesh.renderOrder = -5;
  return { mesh, material: m };
}

/* --- the Earth -------------------------------------------------------------- */

const EARTH_VERT = /* glsl */`
varying vec3 vNormalW;
varying vec3 vViewDirW;
varying vec2 vUv;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  /* The sky camera sits at the origin, so the direction to the eye has to come
     from the vertex: normalising the camera's own position would be
     normalising a zero vector, which is a quiet NaN and a black planet. */
  vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
  vViewDirW = normalize(cameraPosition - wp);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const EARTH_FRAG = /* glsl */`
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uClouds;
uniform vec3 uSunDir;
uniform float uIntensity;
uniform float uCloudAmount;
varying vec3 vNormalW;
varying vec3 vViewDirW;
varying vec2 vUv;
void main() {
  vec3 N = normalize(vNormalW);
  float mu = dot(N, uSunDir);
  vec3 day = texture2D(uDay, vUv).rgb;
  vec3 night = texture2D(uNight, vUv).rgb;
  float cloud = texture2D(uClouds, vUv).r * uCloudAmount;
  day = mix(day, vec3(1.0), cloud);

  /* A soft terminator: the Sun is half a degree across seen from Earth too, and
     the atmosphere spreads the twilight over a few degrees more. */
  float lit = smoothstep(-0.09, 0.12, mu);
  vec3 c = day * lit * uIntensity;
  /* City lights only where the Sun is genuinely down. */
  c += night * (1.0 - smoothstep(-0.12, 0.02, mu)) * 0.22 * uIntensity;
  /* A hint of limb brightening from the atmosphere, strongest near the
     terminator, which is what makes the blue edge in Apollo photographs. */
  float rim = pow(1.0 - abs(dot(N, vViewDirW)), 3.0);
  c += vec3(0.20, 0.36, 0.62) * rim * lit * 0.5 * uIntensity;
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function makeEarth(textures) {
  const g = new THREE.SphereGeometry(1, 96, 64);
  const m = new THREE.ShaderMaterial({
    vertexShader: EARTH_VERT, fragmentShader: EARTH_FRAG,
    uniforms: {
      uDay: { value: textures.day },
      uNight: { value: textures.night },
      uClouds: { value: textures.clouds },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
      uIntensity: { value: 1 },
      uCloudAmount: { value: 0.75 },
    },
    depthWrite: false, depthTest: false,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  mesh.renderOrder = -6;
  return { mesh, material: m };
}

/* --- the whole sky ---------------------------------------------------------- */

export class Sky {
  constructor(stage) {
    this.stage = stage;
    this.group = new THREE.Group();
    stage.sky.add(this.group);
    this.stars = null;
    this.sun = makeSun();
    this.earth = null;
    this.group.add(this.sun.mesh);
    this.starBrightness = 1;
  }

  setStars(buffer) {
    this.stars = makeStars(buffer);
    this.group.add(this.stars.points);
  }

  setEarth(textures) {
    this.earth = makeEarth(textures);
    this.group.add(this.earth.mesh);
  }

  /**
   * @param {object} eph  from ephemerisAt(): directions in the body frame
   * @param {number} exposure  the renderer's current exposure, so stars can be
   *        hidden when the eye is adapted to sunlit ground
   */
  update(eph, exposure) {
    /* The star field is fixed in J2000; rotate it into the body frame. */
    if (this.stars) {
      const M = eph.bodyFromJ2000;
      const m4 = this._m4 || (this._m4 = new THREE.Matrix4());
      m4.set(M[0], M[1], M[2], 0, M[3], M[4], M[5], 0, M[6], M[7], M[8], 0, 0, 0, 0, 1);
      this.stars.points.quaternion.setFromRotationMatrix(m4);
      /* Stars carry a fixed radiance and the exposure decides the rest, which
         is exactly why the Apollo crews saw none of them from sunlit ground and
         plenty from inside a shadow. */
      this.stars.material.uniforms.uBrightness.value = 2.6e-4 * this.starBrightness;
    }

    /* The Sun: a disc of the correct angular size. */
    const sd = eph.sunDir;
    const sunDist = SKY_RADIUS * 0.5;
    const sunSize = 2 * sunDist * Math.tan(eph.sunAngularRadius * Math.PI / 180);
    const OVER = 9;                       // room around the disc for the glare
    this.sun.mesh.position.set(sd.x * sunDist, sd.y * sunDist, sd.z * sunDist);
    this.sun.mesh.scale.set(sunSize * OVER, sunSize * OVER, 1);
    this.sun.material.uniforms.uDiscFraction.value = 1 / OVER;
    this.sun.mesh.lookAt(0, 0, 0);
    this.sun.material.uniforms.uIntensity.value = 1;

    if (this.earth) {
      const ed = eph.earthDir;
      const dist = SKY_RADIUS * 0.4;
      const radius = dist * Math.tan(eph.earthAngularRadius * Math.PI / 180);
      this.earth.mesh.position.set(ed.x * dist, ed.y * dist, ed.z * dist);
      this.earth.mesh.scale.setScalar(radius);

      /* Turn the globe so the right continents face the Moon.

         The ephemeris hands over Earth's body-fixed frame already expressed in
         the Moon's frame: the north pole, the direction of the Greenwich
         meridian on the equator, and the direction of 90 east. A sphere in
         three.js carries its equirectangular map with longitude zero on +X,
         north on +Y and 90 east on -Z, so those three directions are exactly
         the columns of the rotation, and nothing has to be guessed about
         sidereal time twice. */
      const prime = this._v1 || (this._v1 = new THREE.Vector3());
      const north = this._v2 || (this._v2 = new THREE.Vector3());
      const east = this._v3 || (this._v3 = new THREE.Vector3());
      const basis = this._m3 || (this._m3 = new THREE.Matrix4());
      prime.set(eph.earthPrime.x, eph.earthPrime.y, eph.earthPrime.z);
      north.set(eph.earthNorth.x, eph.earthNorth.y, eph.earthNorth.z);
      east.set(-eph.earthEast.x, -eph.earthEast.y, -eph.earthEast.z);
      basis.makeBasis(prime, north, east);
      this.earth.mesh.quaternion.setFromRotationMatrix(basis);
      this.earth.material.uniforms.uSunDir.value.set(sd.x, sd.y, sd.z);
      /* Earth's albedo is about three times the Moon's, so from here it is a
         genuinely bright object: roughly forty times the light of a full Moon
         seen from Earth. */
      this.earth.material.uniforms.uIntensity.value = 0.34;
    }
  }
}
