/* =============================================================================
   STAR — progenitor photosphere, chromosphere, dusty wind, circumstellar medium
   -----------------------------------------------------------------------------
   Everything visible before the collapse begins. The wind and the CSM are not
   decoration: the same mass-loss rate that makes the dust here sets the density
   the forward shock will plough into two thousand years later, in remnant.js.
   One parameter, two payoffs, and the visual continuity is the point.
   ========================================================================== */

import * as THREE from 'three';
import { photosphereVert, photosphereFrag, haloVert, haloFrag } from '../shaders/photosphere.glsl.js';
import { R_SUN, KM } from '../config.js';

export class Star {
  constructor(stage, quality, model) {
    this.stage = stage;
    this.R = model.R_star * KM;            // cm -> km, scene units
    this.group = new THREE.Group();
    stage.near.add(this.group);

    /* --- photosphere ---------------------------------------------------- */
    this.uniforms = {
      uTime:      { value: 0 },
      uTeff:      { value: model.T_eff },
      uCellFreq:  { value: 3.1 },     // LOW — a handful of cells across the disc
      uContrast:  { value: 0.150 },   // +/- ~500 K at 3500 K
      uIntensity: { value: 0.55 },
      uU1:        { value: 0.86 },    // severe limb darkening, red optical
      uU2:        { value: -0.10 },
      uHotspot:   { value: 0.15 },
      uSaturate:  { value: 1.55 },
      uWobble:    { value: 0.0 },
    };

    this.photosphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.R, 192, 96),
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: photosphereVert,
        fragmentShader: photosphereFrag,
      }),
    );
    this.group.add(this.photosphere);

    /* --- chromosphere ---------------------------------------------------- */
    this.haloUniforms = {
      uTime:      { value: 0 },
      uTeff:      { value: model.T_eff },
      uCenter:    { value: new THREE.Vector3() },
      uRstar:     { value: this.R * 0.975 },
      uScaleH:    { value: this.R * 0.14 },
      uIntensity: { value: 1.05 },
    };
    this.halo = new THREE.Mesh(
      new THREE.SphereGeometry(this.R * 2.2, 64, 32),
      new THREE.ShaderMaterial({
        uniforms: this.haloUniforms,
        vertexShader: haloVert,
        fragmentShader: haloFrag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    );
    this.group.add(this.halo);

    /* --- dusty wind ------------------------------------------------------ */
    this.wind = makeWind(this.R, quality.dust);
    this.group.add(this.wind);

    /* --- circumstellar medium -------------------------------------------- */
    this.csm = makeCSM(this.R, quality.starfield / 3);
    this.group.add(this.csm);
  }

  update(dt, t, snap) {
    this.uniforms.uTime.value += dt;
    this.haloUniforms.uTime.value += dt;
    const wu = this.wind.material.uniforms;
    wu.uTime.value += dt;

    if (snap) {
      /* Radius and temperature are driven by the physics. The mesh is a
         PHOTOSPHERE: it stops meaning anything once the envelope is blown
         off, so from the explosion onward it fades and never scales past
         breakout — the ejecta take over as a different representation. */
      const isStar = ['progenitor', 'collapse', 'bounce', 'stall',
                      'deflagration', 'detonation'].includes(snap.phase);
      const rCap = this.R * 1.05;
      const r = Math.min(snap.R_star * KM, rCap);
      this.photosphere.scale.setScalar(r / this.R);
      this.halo.scale.setScalar(r / this.R);
      this.haloUniforms.uRstar.value  = r * 0.975;
      this.haloUniforms.uScaleH.value = r * 0.14;
      this.uniforms.uTeff.value = snap.T_eff;
      this.haloUniforms.uTeff.value = snap.T_eff;

      let targetFade = isStar ? 1 : 0;
      if (this.xray) targetFade *= 0.035;     // ghost shell from inside
      this._fade = this._fade === undefined ? 1 : this._fade + (targetFade - this._fade) * Math.min(dt * 6.0, 1);
      const on = this._fade > 0.004;
      this.photosphere.visible = on && this.surfaceAllowed !== false;
      this.halo.visible = on && this.haloAllowed !== false;
      this.wind.visible = on && this.windAllowed !== false;
      this.uniforms.uIntensity.value = 0.55 * this._fade;
      this.haloUniforms.uIntensity.value = 1.05 * this._fade;
    }

    /* Floating origin — the star sits at the world origin, so it only needs
       the camera offset subtracted. This must happen BEFORE the halo centre is
       transformed, or the atmosphere trails the star by one frame. */
    const o = this.stage.origin;
    this.group.position.set(-o.x, -o.y, -o.z);
    this.group.updateMatrixWorld(true);

    const cam = this.stage.camera;
    cam.updateMatrixWorld(true);
    this.haloUniforms.uCenter.value
      .setFromMatrixPosition(this.group.matrixWorld)
      .applyMatrix4(cam.matrixWorldInverse);

    /* Pixels subtended per world unit at unit depth. */
    wu.uProjScale.value =
      (window.innerHeight * 0.5) / Math.tan(THREE.MathUtils.degToRad(cam.fov) * 0.5);
  }

  setVisible(v) { this.photosphere.visible = v; this.halo.visible = v; }
}

/* -----------------------------------------------------------------------------
   Dusty wind. A red supergiant sheds ~1e-5 Msun/yr at ~15 km/s, and the dust
   that condenses in it is genuinely clumpy. Instanced soft blobs on outward
   trajectories, distributed r^-2 so the column density falls off correctly.
-------------------------------------------------------------------------------*/
function makeWind(R, count) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  let s = 991117;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;

  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, k = Math.sqrt(1 - u * u);
    /* r^-2 in density means r uniform in a shell-volume sense: sample r
       linearly and the number per unit radius stays flat, which is what an
       r^-2 wind gives you. */
    const r = R * (1.35 + 9.0 * rnd());
    pos[i * 3]     = k * Math.cos(th) * r;
    pos[i * 3 + 1] = u * r;
    pos[i * 3 + 2] = k * Math.sin(th) * r;
    seed[i] = rnd();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  return new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProjScale: { value: 1000 },   // (viewportHeight/2)/tan(fov/2), set per frame
      uR: { value: R },
    },
    vertexShader: /* glsl */`
      attribute float aSeed;
      uniform float uTime, uProjScale, uR;
      varying float vFade;
      #include <common>
      #include <logdepthbuf_pars_vertex>
      void main(){
        /* Drift outward slowly; recycle so the wind never runs out. */
        float sp = 0.010 + 0.020 * aSeed;
        float r0 = length(position);
        float r  = r0 + mod(uTime * sp * uR, uR * 9.0);
        vec3 p = normalize(position) * r;
        /* Fade in at the dust condensation radius, out at the far edge. */
        vFade = smoothstep(1.4, 2.4, r / uR) * (1.0 - smoothstep(7.0, 10.5, r / uR));
        vFade *= 0.30 + 0.70 * aSeed;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        /* Real perspective sizing: a clump of physical size w at depth z
           subtends w * uProjScale / z pixels. */
        float w = uR * (0.004 + 0.013 * aSeed);
        gl_PointSize = clamp(w * uProjScale / max(-mv.z, 1.0), 1.0, 64.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */`
      varying float vFade;
      #include <logdepthbuf_pars_fragment>
      void main(){
        #include <logdepthbuf_fragment>
        vec2 d = gl_PointCoord - 0.5;
        float r2 = dot(d, d);
        if (r2 > 0.25) discard;
        float a = smoothstep(0.25, 0.0, r2) * vFade;
        /* Warm dust, reddened — it is being lit by a 3500 K star. */
        gl_FragColor = vec4(vec3(0.55, 0.22, 0.09) * a * 0.55, a * 0.55);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
}

/* -----------------------------------------------------------------------------
   Circumstellar medium: the wind, much further out and much fainter, filling
   the volume the remnant will eventually expand into. Density falls as r^-2.
-------------------------------------------------------------------------------*/
function makeCSM(R, count) {
  const pos = new Float32Array(count * 3);
  const bri = new Float32Array(count);
  let s = 60313;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;

  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, k = Math.sqrt(1 - u * u);
    const r = R * (12 + 260 * Math.pow(rnd(), 0.55));
    pos[i * 3]     = k * Math.cos(th) * r;
    pos[i * 3 + 1] = u * r;
    pos[i * 3 + 2] = k * Math.sin(th) * r;
    bri[i] = Math.pow(rnd(), 2.0) * (R * 12 / r);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aBri', new THREE.BufferAttribute(bri, 1));

  return new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uBoost: { value: 1.0 } },
    vertexShader: /* glsl */`
      attribute float aBri;
      uniform float uPixelRatio;
      varying float vB;
      #include <common>
      #include <logdepthbuf_pars_vertex>
      void main(){
        vB = aBri;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.0 + 2.0 * aBri) * uPixelRatio;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */`
      uniform float uBoost;
      varying float vB;
      #include <logdepthbuf_pars_fragment>
      void main(){
        #include <logdepthbuf_fragment>
        vec2 d = gl_PointCoord - 0.5;
        if (dot(d,d) > 0.25) discard;
        float a = vB * 0.55 * uBoost;
        gl_FragColor = vec4(vec3(0.42, 0.30, 0.26) * a, a);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
}
