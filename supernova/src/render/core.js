/* =============================================================================
   CORE — the collapse at true scale: iron core, proto-neutron star,
   neutrinosphere, neutrino burst, infall
   -----------------------------------------------------------------------------
   Everything here is drawn at real kilometres. A 12 km neutron star inside a
   4e8 km photosphere is a 3e-8 speck: you fly to it (FOCUS CORE) rather than
   it being inflated to visibility. The one concession is an optional labelled
   marker halo, off by default.

   While the camera is inside the photosphere the star surface is faded to a
   ghost — an x-ray view, disclosed in the UI — because the alternative is
   staring at the inside of an opaque ball.
   ========================================================================== */

import * as THREE from 'three';
import { NOISE_KIT, BLACKBODY } from '../shaders/common.glsl.js';
import { KM, C } from '../config.js';

const C_KMS = C * KM;   // light speed, km/s

export class Core {
  constructor(stage) {
    this.stage = stage;
    this.group = new THREE.Group();
    stage.near.add(this.group);

    /* --- proto-neutron star / iron core surface -------------------------- */
    this.pnsUniforms = {
      uTime: { value: 0 },
      uTemp: { value: 8e9 },
      uGlow: { value: 0 },       // ramps up through collapse
    };
    this.pns = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 48),
      new THREE.ShaderMaterial({
        uniforms: this.pnsUniforms,
        vertexShader: /* glsl */`
          varying vec3 vN; varying vec3 vV; varying vec3 vD;
          #include <common>
          #include <logdepthbuf_pars_vertex>
          void main(){
            vD = normalize(position);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vV = -mv.xyz; vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mv;
            #include <logdepthbuf_vertex>
          }`,
        fragmentShader: /* glsl */`
          ${NOISE_KIT}
          ${BLACKBODY}
          uniform float uTime, uTemp, uGlow;
          varying vec3 vN; varying vec3 vV; varying vec3 vD;
          #include <logdepthbuf_pars_fragment>
          void main(){
            #include <logdepthbuf_fragment>
            vec3 N = normalize(vN), V = normalize(vV);
            float mu = max(dot(N, V), 0.0);
            /* violent small-scale convection on the surface */
            float n = fbm(vD * 6.0 + vec3(0.0, 0.0, uTime * 1.7), 3, 2.2, 0.55);
            /* the colour of ~1e9-1e11 K matter is far beyond the visual
               blackbody locus — render as the hottest visible locus colour,
               blue-white, with brightness carrying the temperature */
            vec3 col = blackbody(clamp(uTemp * 0.002, 8000.0, 40000.0));
            float I = (0.55 + 0.45 * n) * (0.4 + 2.4 * uGlow) * (0.45 + 0.55 * mu);
            gl_FragColor = vec4(col * I, 1.0);
          }`,
      }),
    );
    this.group.add(this.pns);

    /* --- neutrinosphere ---------------------------------------------------
       The surface of last scattering for neutrinos — a real, physically
       meaningful radius (~50-70 km), drawn as a whisper-thin cyan shell. */
    this.nuSphUniforms = { uTime: { value: 0 }, uAlpha: { value: 0 } };
    this.nuSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 32),
      new THREE.ShaderMaterial({
        uniforms: this.nuSphUniforms,
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
            float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.5);
            gl_FragColor = vec4(vec3(0.50, 0.90, 1.0) * rim * uAlpha, rim * uAlpha);
          }`,
        transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, side: THREE.FrontSide,
      }),
    );
    this.group.add(this.nuSphere);

    /* --- neutrino burst ---------------------------------------------------
       Not particles: a single translucent shell expanding at literally c.
       It outruns everything else on screen, which is the correct and
       striking physical statement. Faint anisotropy from a low-order noise
       field; S6's zeta will replace it. */
    this.burstUniforms = { uTime: { value: 0 }, uAlpha: { value: 0 } };
    this.burst = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 48),
      new THREE.ShaderMaterial({
        uniforms: this.burstUniforms,
        vertexShader: /* glsl */`
          varying vec3 vN; varying vec3 vV; varying vec3 vD;
          #include <common>
          #include <logdepthbuf_pars_vertex>
          void main(){
            vD = normalize(position);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vV = -mv.xyz; vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mv;
            #include <logdepthbuf_vertex>
          }`,
        fragmentShader: /* glsl */`
          ${NOISE_KIT}
          uniform float uTime, uAlpha;
          varying vec3 vN; varying vec3 vV; varying vec3 vD;
          #include <logdepthbuf_pars_fragment>
          void main(){
            #include <logdepthbuf_fragment>
            float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.8);
            float n = 0.85 + 0.18 * fbm(vD * 1.3, 2, 2.0, 0.5);
            float a = rim * n * uAlpha;
            gl_FragColor = vec4(vec3(0.55, 0.92, 1.0) * a, a);
          }`,
        transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, side: THREE.BackSide,
      }),
    );
    this.burst.visible = false;
    this.group.add(this.burst);

    /* --- infall streaks ---------------------------------------------------
       The outer core raining onto the PNS at up to a quarter of light speed.
       Instanced elongated prisms, stretched along their velocity; recycled
       from a spawn shell as they reach the surface. */
    this.infall = makeInfall(2000);
    this.group.add(this.infall.mesh);

    this.markerOn = false;
  }

  update(dt, snap) {
    const g = this.group;
    const o = this.stage.origin;
    g.position.set(-o.x, -o.y, -o.z);

    const post = snap.t >= 0;
    const inCollapse = snap.phase === 'collapse';
    const coreR = (post ? snap.R_pns : snap.R_core) * KM;   // km

    /* PNS / core surface */
    const show = inCollapse || (post && snap.R_pns > 0 && !snap.bhFormed);
    this.pns.visible = show;
    if (show) {
      this.pns.scale.setScalar(Math.max(coreR, 1e-3));
      this.pnsUniforms.uTime.value += dt;
      this.pnsUniforms.uTemp.value = snap.T_c;
      /* glow ramps with central density through collapse, full after bounce */
      const prog = Math.min(Math.log10(Math.max(snap.rho_c / 3e9, 1)) / 5.0, 1);
      this.pnsUniforms.uGlow.value = post ? 1 : 0.15 + 0.85 * prog;
    }

    /* neutrinosphere */
    const nuShow = snap.R_nu > 0 && !snap.bhFormed && snap.L_nu > 1e49;
    this.nuSphere.visible = nuShow;
    if (nuShow) {
      this.nuSphere.scale.setScalar(snap.R_nu * KM);
      this.nuSphUniforms.uAlpha.value = Math.min(Math.log10(snap.L_nu / 1e49) / 4, 1) * 0.5;
    }

    /* neutrino burst shell: launched at bounce, expands at c */
    if (post && snap.t < 30 && !snap.bhFormed) {
      const r = C_KMS * snap.t;             // km — literally light speed
      if (r > 1) {
        this.burst.visible = true;
        this.burst.scale.setScalar(r);
        /* fades as it dilutes; brief brilliant start */
        this.burstUniforms.uAlpha.value = 0.38 * Math.exp(-snap.t / 6.0);
        this.burstUniforms.uTime.value += dt;
      }
    } else this.burst.visible = false;

    /* infall streaks: only while there is infall to show */
    const infOn = inCollapse || (post && snap.M_dot_acc > 1e31);
    this.infall.mesh.visible = infOn;
    if (infOn) this.infall.update(dt, snap);
  }
}

/* ---------------------------------------------------------------------------- */
function makeInfall(count) {
  const geo = new THREE.CylinderGeometry(0.012, 0.004, 1, 4, 1, true);
  geo.translate(0, 0.5, 0);
  geo.rotateX(Math.PI / 2);          // length along +Z

  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(1.6, 0.75, 0.35),
    transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;

  /* per-streak state in km, unit sphere directions */
  let seed = 777;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const dirs = [], phase = [];
  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, k = Math.sqrt(1 - u * u);
    dirs.push(new THREE.Vector3(k * Math.cos(th), u, k * Math.sin(th)));
    phase.push(rnd());
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 0, 1);
  const pos = new THREE.Vector3(), scl = new THREE.Vector3();

  return {
    mesh,
    update(dt, snap) {
      const Rin = Math.max((snap.t >= 0 ? snap.R_pns : snap.R_core * 0.3) * KM, 2);
      const Rout = Math.max(snap.R_core * KM * 2.5, Rin * 30);
      for (let i = 0; i < mesh.count; i++) {
        /* each streak cycles from Rout to Rin, accelerating as sqrt(1/r) */
        phase[i] += dt * (0.10 + 0.25 * ((i * 2654435761 >>> 16 & 255) / 255)) ;
        const f = 1 - (phase[i] % 1);                    // 1 -> 0
        const r = Rin + (Rout - Rin) * f * f;            // accelerating inward
        const v = (Rout - Rin) * 2 * (1 - f) * 0.4 + Rin; // ~ speed proxy
        pos.copy(dirs[i]).multiplyScalar(r);
        q.setFromUnitVectors(up, dirs[i]);
        const len = Math.min(v * 0.12, r * 0.5);
        scl.set(r * 0.006 + 1, r * 0.006 + 1, Math.max(len, r * 0.02));
        m4.compose(pos, q, scl);
        mesh.setMatrixAt(i, m4);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
