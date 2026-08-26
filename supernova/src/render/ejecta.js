/* =============================================================================
   EJECTA — the exploding envelope: knots, filaments, and the hot interior
   -----------------------------------------------------------------------------
   Three rules, all downstream of "no particle spheres":

   1. The macroscopic shape belongs to zeta. Knot directions are importance-
      sampled against the SAME spherical-harmonic field that displaces the
      shock surface — knots cluster in the lobes and thin out at the pinches,
      so the fine detail agrees with the leading edge about what shape this
      explosion is.
   2. Motion is homologous: r = v t exactly, per knot. Fast material is
      outside slow material forever, which is what stratifies the composition
      colours without any bookkeeping.
   3. Real geometry, not points: stretched icosahedra, elongated along their
      own velocity by the local shear, so close approach shows glowing
      streaked matter rather than squares.

   Composition colouring by launch depth: innermost knots are Ni/Fe gold
   (radioactively heated — the physical reason they glow), silicon orange,
   oxygen teal, then the broad rose hydrogen envelope, dimmer and more
   numerous.
   ========================================================================== */

import * as THREE from 'three';
import { KM } from '../config.js';
import { SPHERICAL_HARMONICS, NOISE_KIT } from '../shaders/common.glsl.js';

/* composition groups: fraction of knots, speed band (km/s), colour, gain */
const GROUPS = [
  { f: 0.10, v0: 2200,  v1: 4200,  col: [1.00, 0.80, 0.38], gain: 1.55, late: 0.85 }, // Ni/Fe
  { f: 0.14, v0: 3800,  v1: 6000,  col: [1.00, 0.55, 0.28], gain: 1.05, late: 0.95 }, // Si
  { f: 0.22, v0: 5200,  v1: 8200,  col: [0.30, 0.95, 0.85], gain: 0.85, late: 1.25 }, // O
  { f: 0.18, v0: 7400,  v1: 9600,  col: [1.00, 0.88, 0.55], gain: 0.55, late: 0.40 }, // He
  { f: 0.36, v0: 8600,  v1: 13500, col: [1.00, 0.66, 0.62], gain: 0.38, late: 0.22 }, // H
];

/* Type Ia ash: over half a solar mass of radioactive nickel, silicon-group
   material, unburned carbon/oxygen at the edges — and no hydrogen at all. */
const GROUPS_IA = [
  { f: 0.42, v0: 6000,  v1: 11000, col: [1.00, 0.80, 0.38], gain: 1.6,  late: 0.85 }, // Ni/Fe
  { f: 0.30, v0: 9500,  v1: 14500, col: [1.00, 0.55, 0.28], gain: 1.0,  late: 0.95 }, // Si/S
  { f: 0.16, v0: 13000, v1: 19000, col: [0.30, 0.95, 0.85], gain: 0.7,  late: 1.1 },  // O
  { f: 0.12, v0: 16000, v1: 23000, col: [0.62, 0.66, 0.72], gain: 0.5,  late: 0.6 },  // C
];

export class Ejecta {
  constructor(stage, quality, model) {
    this.groups = model?.id === 'ia' ? GROUPS_IA : GROUPS;
    this.stage = stage;
    this.count = quality.knots;
    this._built = false;
    this._seedState = 0;

    const geo = new THREE.IcosahedronGeometry(1, 0);
    geo.scale(0.35, 0.35, 1);              // elongated along +Z

    this.uniforms = {
      uT:    { value: 0 },                 // seconds since bounce
      uTime: { value: 0 },
      uFade: { value: 0 },
      uRcap: { value: 1e30 },              // forward-shock pile-up radius, km
      uAge:  { value: 0 },                 // 0 young -> 1 mature remnant
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */`
        attribute vec3 aDir;               // launch direction (unit)
        attribute float aV;                // speed, km/s
        attribute vec3 aCol;
        attribute float aGain;
        attribute float aSeed;
        attribute float aStretch;
        attribute float aLate;             // survival into the mature remnant
        uniform float uT;
        uniform float uRcap;
        uniform float uAge;
        varying vec3 vCol;
        varying float vGlow;
        #include <common>
        #include <logdepthbuf_pars_vertex>
        void main(){
          /* homologous: the knot IS at r = v t, stretched along its motion —
             until the forward shock, where the fastest material piles up */
          float r = min(aV * uT, uRcap * (0.82 + 0.15 * aSeed));
          /* Homologous flow shears a knot by its own internal velocity
             spread — a few per cent of its radius, no more. Anything bigger
             turns the debris field into warp streaks. */
          float len = max(r * (0.008 + 0.016 * aSeed) * aStretch, 1.0);
          len = min(len, r * 0.045);
          float wid = max(len * (0.22 + 0.25 * aSeed), 0.5);

          /* build a frame along the direction of motion */
          vec3 zAxis = aDir;
          vec3 xAxis = normalize(abs(zAxis.y) < 0.94
            ? cross(zAxis, vec3(0.0, 1.0, 0.0))
            : cross(zAxis, vec3(1.0, 0.0, 0.0)));
          vec3 yAxis = cross(zAxis, xAxis);
          vec3 local = position.x * wid * xAxis
                     + position.y * wid * yAxis
                     + position.z * len * zAxis;
          vec3 p = aDir * r + local;

          vCol = aCol;
          /* aging: hydrogen recombines and dims; the O/Si/Fe filaments keep
             shining (shock-heated) — which is why Cas A looks the way it does */
          vGlow = aGain * mix(1.0, aLate, uAge);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          #include <logdepthbuf_vertex>
        }`,
      fragmentShader: /* glsl */`
        uniform float uFade;
        varying vec3 vCol;
        varying float vGlow;
        #include <logdepthbuf_pars_fragment>
        void main(){
          #include <logdepthbuf_fragment>
          gl_FragColor = vec4(vCol * vGlow * uFade, 1.0);
        }`,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    this.mesh = new THREE.InstancedMesh(geo, mat, this.count);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 7;
    this.mesh.visible = false;
    /* instanced attributes are set once at (re)build */
    stage.near.add(this.mesh);

    /* hot interior: an additive radial glow that carries the white-hot
       centre of the young explosion, fading as the ejecta thin */
    this.glowUniforms = { uR: { value: 1 }, uAlpha: { value: 0 } };
    this.glow = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 24),
      new THREE.ShaderMaterial({
        uniforms: this.glowUniforms,
        vertexShader: /* glsl */`
          varying vec3 vN; varying vec3 vV;
          #include <common>
          #include <logdepthbuf_pars_vertex>
          void main(){
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vV = -mv.xyz; vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mv;
            #include <logdepthbuf_vertex>
          }`,
        fragmentShader: /* glsl */`
          uniform float uAlpha;
          varying vec3 vN; varying vec3 vV;
          #include <logdepthbuf_pars_fragment>
          void main(){
            #include <logdepthbuf_fragment>
            float mu = abs(dot(normalize(vN), normalize(vV)));
            float a = pow(mu, 1.6) * uAlpha;    // brightest through the middle
            gl_FragColor = vec4(vec3(1.0, 0.86, 0.62) * a, a);
          }`,
        transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, side: THREE.FrontSide,
      }),
    );
    this.glow.visible = false;
    stage.near.add(this.glow);
  }

  /* Importance-sample directions against zeta once the coefficients freeze.
     Rebuilt on reset because the seed changes. */
  build(snap) {
    const a = snap.a;
    const zeta = n => {
      /* JS twin of the GLSL zetaSH — only needed here, at build time */
      const [x, y, z] = n, x2 = x * x, y2 = y * y, z2 = z * z;
      return (
        a[0]*0.4886*y + a[1]*0.4886*z + a[2]*0.4886*x +
        a[3]*1.0925*x*y + a[4]*1.0925*y*z + a[5]*0.3154*(3*z2-1) +
        a[6]*1.0925*x*z + a[7]*0.5463*(x2-y2) +
        a[8]*0.59*y*(3*x2-y2) + a[9]*2.8906*x*y*z + a[10]*0.457*y*(5*z2-1) +
        a[11]*0.3732*z*(5*z2-3) + a[12]*0.457*x*(5*z2-1) + a[13]*1.4453*z*(x2-y2) +
        a[14]*0.59*x*(x2-3*y2) +
        a[15]*2.5033*x*y*(x2-y2) + a[16]*1.7701*y*z*(3*x2-y2) +
        a[17]*0.9462*x*y*(7*z2-1) + a[18]*0.669*y*z*(7*z2-3) +
        a[19]*0.1058*(35*z2*z2-30*z2+3) + a[20]*0.669*x*z*(7*z2-3) +
        a[21]*0.4731*(x2-y2)*(7*z2-1) + a[22]*1.7701*x*z*(x2-3*y2) +
        a[23]*0.6258*(x2*(x2-3*y2)-y2*(3*x2-y2))
      );
    };

    let seed = (snap.seed ^ 0x9e3779b9) >>> 0;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

    const dir = new Float32Array(this.count * 3);
    const vel = new Float32Array(this.count);
    const col = new Float32Array(this.count * 3);
    const gain = new Float32Array(this.count);
    const sd = new Float32Array(this.count);
    const str = new Float32Array(this.count);
    const late = new Float32Array(this.count);

    /* group boundaries by cumulative fraction */
    const GS = this.groups;
    let gi = 0, gAcc = GS[0].f;
    for (let i = 0; i < this.count; i++) {
      const u = i / this.count;
      while (u > gAcc && gi < GS.length - 1) { gi++; gAcc += GS[gi].f; }
      const G = GS[gi];

      /* accept-reject against (1 + zeta)^2.2 — knots go where the lobes go */
      let n, w, tries = 0;
      do {
        const q = rnd() * 2 - 1, th = rnd() * Math.PI * 2, k = Math.sqrt(1 - q * q);
        n = [k * Math.cos(th), q, k * Math.sin(th)];
        w = Math.pow(Math.max(1 + zeta(n), 0.05) / 1.6, 2.2);
      } while (rnd() > w && ++tries < 24);

      dir[i * 3] = n[0]; dir[i * 3 + 1] = n[1]; dir[i * 3 + 2] = n[2];
      /* the lobes are also FASTER — same field, second use */
      const boost = 1 + 0.35 * Math.max(zeta(n), 0);
      vel[i] = (G.v0 + (G.v1 - G.v0) * rnd()) * boost;
      col[i * 3] = G.col[0]; col[i * 3 + 1] = G.col[1]; col[i * 3 + 2] = G.col[2];
      gain[i] = G.gain * (0.6 + 0.8 * rnd());
      sd[i] = rnd();
      str[i] = 0.7 + 1.6 * rnd();
      late[i] = G.late * (0.5 + rnd());
    }

    const g = this.mesh.geometry;
    g.setAttribute('aDir', new THREE.InstancedBufferAttribute(dir, 3));
    g.setAttribute('aV', new THREE.InstancedBufferAttribute(vel, 1));
    g.setAttribute('aCol', new THREE.InstancedBufferAttribute(col, 3));
    g.setAttribute('aGain', new THREE.InstancedBufferAttribute(gain, 1));
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(sd, 1));
    g.setAttribute('aStretch', new THREE.InstancedBufferAttribute(str, 1));
    g.setAttribute('aLate', new THREE.InstancedBufferAttribute(late, 1));
    /* identity instance matrices — position work happens in the shader */
    const m = new THREE.Matrix4();
    for (let i = 0; i < this.count; i++) this.mesh.setMatrixAt(i, m);
    this.mesh.instanceMatrix.needsUpdate = true;
    this._built = true;
    this._builtSeed = snap.seed;
  }

  update(dt, snap) {
    const active = ['explosion', 'light', 'free', 'sedov', 'detonation', 'fireball', 'tail']
      .includes(snap.phase) && snap.t > 0 && !snap.bhFormed;
    this.mesh.visible = active;
    this.glow.visible = active && snap.phase === 'explosion';
    if (!active) return;

    if (!this._built || this._builtSeed !== snap.seed) this.build(snap);

    const o = this.stage.origin;
    this.mesh.position.set(-o.x, -o.y, -o.z);
    this.glow.position.copy(this.mesh.position);

    /* knots ride slightly behind the shock's leading edge */
    this.uniforms.uT.value = snap.t * 0.92;          // km/s * s -> km, slightly behind the shock
    this.uniforms.uRcap.value = ['free', 'sedov'].includes(snap.phase)
      ? snap.R_fwd * KM : 1e30;
    /* age on a log clock: 2 yr is young, 3000 yr is old */
    const YR = 3.15576e7;
    this.uniforms.uAge.value = Math.min(Math.max(Math.log10(Math.max(snap.t / YR, 0.1)) / 3.4, 0), 1);
    this.uniforms.uTime.value += dt;

    /* fade in through the explosion, hold, dim slowly in the remnant as the
       gas cools and recombines */
    let fade = Math.min(snap.phaseT / 400, 1);
    if (snap.phase === 'free')  fade = 0.75;
    if (snap.phase === 'sedov') fade = 0.55;
    this.uniforms.uFade.value = fade;

    if (this.glow.visible) {
      const r = Math.max(snap.R_shock * KM * 0.45, 1);
      this.glow.scale.setScalar(r);
      this.glowUniforms.uAlpha.value = 0.5 * Math.max(1 - snap.phaseT / (snap.t > 3600 ? 86400 : 2000), 0);
    }
  }
}
