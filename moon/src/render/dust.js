/* =============================================================================
   DUST — what regolith does when you disturb it, and what it does not
   -----------------------------------------------------------------------------
   Lunar dust is the thing every film of the Moon gets wrong, and it is wrong in
   a way that is easy to see once you know: there is no air, so nothing billows,
   nothing hangs, and nothing drifts. A grain thrown off a boot follows a
   parabola and lands. That is the whole model.

   The Apollo record is unambiguous about it. The Lunar Module's crew watched
   the descent engine's exhaust from about forty metres up and described "a
   transparent sheet of dust resembling a thin layer of ground fog that moved
   radially outward", not a cloud: the plume leaves the surface at one to three
   degrees above horizontal and the fine fraction goes faster than two
   kilometres a second, which on the Moon means it leaves entirely. The rover's
   wheels threw rooster tails that arced over and fell in silence, which is why
   the Grand Prix footage looks like nothing on Earth. And LADEE, orbiting for
   months looking for a lofted dust exosphere dense enough to see, did not find
   one.

   So the particles here are ballistic and nothing else. No drag, no turbulence,
   no buoyancy, no fade into a haze. They are launched, they fall at 1.62 m/s²,
   and they stop when they reach the ground. What makes it read as dust rather
   than as gravel is the size distribution and the fact that the fine ones are
   launched fastest and flattest, exactly as the physics says.
   ========================================================================== */

import * as THREE from 'three';
import { GM_MOON, R_MOON } from '../config.js';

const G = GM_MOON / (R_MOON * R_MOON);

const VERT = /* glsl */`
attribute float aSize;
attribute float aLife;
varying float vFade;
uniform float uPixelScale;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  /* Grains do not fade with age: on the Moon they are there and then they are
     on the ground. The only fade is the last tenth of a second, so a particle
     does not blink out mid-air on a low frame rate. */
  vFade = smoothstep(0.0, 0.12, aLife);
  gl_PointSize = max(1.0, aSize * uPixelScale / max(1.0, -mv.z));
}
`;

const FRAG = /* glsl */`
varying float vFade;
uniform vec3 uColor;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  if (dot(d, d) > 0.25) discard;
  gl_FragColor = vec4(uColor, vFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export class DustField {
  /**
   * @param {object} stage the renderer's two-tier stage
   * @param {object} opts { max }
   */
  constructor(stage, opts = {}) {
    this.max = opts.max ?? 1400;
    this.count = 0;
    /* Positions are kept in render space, which moves with the floating
       origin, so the whole field is shifted whenever the origin rebases. */
    this.pos = new Float32Array(this.max * 3);
    this.vel = new Float32Array(this.max * 3);
    this.life = new Float32Array(this.max);
    this.size = new Float32Array(this.max);
    this.up = new Float32Array(this.max * 3);
    this.ground = new Float32Array(this.max);

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('aLife', new THREE.BufferAttribute(this.life, 1));
    g.setDrawRange(0, 0);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(0.62, 0.60, 0.56) },
        uPixelScale: { value: 600 },
      },
      transparent: true, depthWrite: false,
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 3;
    stage.world.add(this.points);
    this.geometry = g;
  }

  /**
   * Throw some regolith.
   *
   * @param {object} o {
   *   at        render-space position of the disturbance
   *   up        unit vector away from the surface
   *   count     how many grains
   *   speed     m/s, the median launch speed
   *   angle     degrees above the surface, the median
   *   spread    0..1, how much the angle and speed vary
   *   size      pixels at one metre
   *   forward   optional unit vector to bias the throw along
   * }
   */
  burst(o) {
    const n = Math.min(o.count | 0, this.max - this.count);
    if (n <= 0) return;
    const up = o.up;
    /* Any two directions perpendicular to up will do for the fan. */
    let ax = Math.abs(up.x) < 0.9 ? 1 : 0, ay = Math.abs(up.x) < 0.9 ? 0 : 1;
    let ex = ay * up.z - 0 * up.y, ey = 0 * up.x - ax * up.z, ez = ax * up.y - ay * up.x;
    const el = Math.hypot(ex, ey, ez) || 1;
    ex /= el; ey /= el; ez /= el;
    const nx = up.y * ez - up.z * ey, ny = up.z * ex - up.x * ez, nz = up.x * ey - up.y * ex;

    for (let k = 0; k < n; k++) {
      const i = this.count++;
      const spread = o.spread ?? 0.5;
      const theta = Math.random() * Math.PI * 2;
      /* Low angles for the fine fraction, and the fine fraction is faster:
         that correlation is what makes it a sheet rather than a fountain. */
      const fine = Math.random();
      const angle = (o.angle ?? 20) * (0.25 + 1.5 * fine) * Math.PI / 180;
      const speed = (o.speed ?? 2) * (1.4 - fine) * (1 - spread * 0.5 + Math.random() * spread);
      const ca = Math.cos(angle), sa = Math.sin(angle);
      let dx = (ex * Math.cos(theta) + nx * Math.sin(theta)) * ca + up.x * sa;
      let dy = (ey * Math.cos(theta) + ny * Math.sin(theta)) * ca + up.y * sa;
      let dz = (ez * Math.cos(theta) + nz * Math.sin(theta)) * ca + up.z * sa;
      if (o.forward) {
        dx += o.forward.x * (o.bias ?? 0); dy += o.forward.y * (o.bias ?? 0);
        dz += o.forward.z * (o.bias ?? 0);
      }
      this.pos[i * 3] = o.at.x; this.pos[i * 3 + 1] = o.at.y; this.pos[i * 3 + 2] = o.at.z;
      this.vel[i * 3] = dx * speed; this.vel[i * 3 + 1] = dy * speed; this.vel[i * 3 + 2] = dz * speed;
      this.up[i * 3] = up.x; this.up[i * 3 + 1] = up.y; this.up[i * 3 + 2] = up.z;
      this.ground[i] = 0;
      this.life[i] = 8;
      this.size[i] = (o.size ?? 22) * (1.4 - fine);
    }
  }

  /** Move everything under gravity and retire whatever has landed. */
  update(dt, rebase) {
    if (rebase) {
      for (let i = 0; i < this.count; i++) {
        this.pos[i * 3] -= rebase.x;
        this.pos[i * 3 + 1] -= rebase.y;
        this.pos[i * 3 + 2] -= rebase.z;
      }
    }
    let live = 0;
    for (let i = 0; i < this.count; i++) {
      const p = i * 3;
      /* Gravity, and nothing else. There is no air to slow it down, no eddy to
         carry it sideways, and no reason for it to hang. */
      this.vel[p] -= this.up[p] * G * dt;
      this.vel[p + 1] -= this.up[p + 1] * G * dt;
      this.vel[p + 2] -= this.up[p + 2] * G * dt;
      this.pos[p] += this.vel[p] * dt;
      this.pos[p + 1] += this.vel[p + 1] * dt;
      this.pos[p + 2] += this.vel[p + 2] * dt;
      /* Height above the launch plane: once it is back, it is on the ground. */
      this.ground[i] += (this.vel[p] * this.up[p] + this.vel[p + 1] * this.up[p + 1] +
                         this.vel[p + 2] * this.up[p + 2]) * dt;
      this.life[i] -= dt;
      const landed = this.ground[i] < -0.02 || this.life[i] <= 0;
      if (landed) continue;
      if (live !== i) {
        const q = live * 3;
        this.pos[q] = this.pos[p]; this.pos[q + 1] = this.pos[p + 1]; this.pos[q + 2] = this.pos[p + 2];
        this.vel[q] = this.vel[p]; this.vel[q + 1] = this.vel[p + 1]; this.vel[q + 2] = this.vel[p + 2];
        this.up[q] = this.up[p]; this.up[q + 1] = this.up[p + 1]; this.up[q + 2] = this.up[p + 2];
        this.life[live] = this.life[i];
        this.size[live] = this.size[i];
        this.ground[live] = this.ground[i];
      }
      live++;
    }
    this.count = live;
    this.geometry.setDrawRange(0, live);
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aSize.needsUpdate = true;
    this.geometry.attributes.aLife.needsUpdate = true;
  }

  setPixelScale(heightPx, fovDeg) {
    this.material.uniforms.uPixelScale.value =
      heightPx / (2 * Math.tan(fovDeg * Math.PI / 360));
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.points.removeFromParent();
  }
}
