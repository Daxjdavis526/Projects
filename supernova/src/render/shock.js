/* =============================================================================
   SHOCK — the stalled shock surface and its SASI slosh
   -----------------------------------------------------------------------------
   Lives from core bounce through the explosion. During the stall it sloshes
   with the l=1-dominated SASI the physics grows; at revival the coefficients
   freeze and the same lobes become the explosion's permanent asymmetry.

   Press Z for the debug view: zeta rendered raw on an undisplaced sphere.
   If the lobes on screen don't match that field, the physics is not reaching
   the pixels and everything else is decoration.
   ========================================================================== */

import * as THREE from 'three';
import { shockVert, shockFrag } from '../shaders/shockshell.glsl.js';
import { QUALITY, KM } from '../config.js';

export class Shock {
  constructor(stage, quality) {
    this.stage = stage;

    this.uniforms = {
      uA:     { value: new Float32Array(24) },
      uR:     { value: 100 },
      uRT:    { value: 0 },
      uTime:  { value: 0 },
      uHeat:  { value: 0 },
      uAlpha: { value: 0.9 },
      uDebugZeta: { value: 0 },
    };

    this.mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, quality.shockDetail),
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: shockVert,
        fragmentShader: shockFrag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 6;
    stage.near.add(this.mesh);

    addEventListener('keydown', e => {
      if (e.code === 'KeyZ') this.uniforms.uDebugZeta.value = 1 - this.uniforms.uDebugZeta.value;
    });
  }

  update(dt, snap) {
    const show = ['bounce', 'stall', 'explosion'].includes(snap.phase)
      && snap.R_shock > 0 && !snap.bhFormed;
    this.mesh.visible = show;
    if (!show) return;

    const o = this.stage.origin;
    this.mesh.position.set(-o.x, -o.y, -o.z);
    this.mesh.scale.setScalar(1);   // radius carried in uR so displacement math stays unit

    this.uniforms.uTime.value += dt;
    this.uniforms.uR.value = snap.R_shock * KM;
    this.uniforms.uA.value.set(snap.a);
    this.uniforms.uRT.value = snap.rtAmp * 0.5;

    /* heating indicator: neutrino luminosity against the stall's scale */
    this.uniforms.uHeat.value = Math.min(Math.max(Math.log10(Math.max(snap.L_nu, 1) / 3e51) / 2, 0), 1);

    /* the shell thins as it expands through the envelope */
    const Rkm = snap.R_shock * KM;
    this.uniforms.uAlpha.value = snap.phase === 'explosion'
      ? Math.max(0.25, 0.9 - 0.3 * Math.log10(Math.max(Rkm / 300, 1)))
      : 0.9;
  }
}
