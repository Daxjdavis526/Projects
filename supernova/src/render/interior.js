/* =============================================================================
   INTERIOR — the cutaway view of the onion structure
   -----------------------------------------------------------------------------
   View modes:
     exterior   photosphere only (volume hidden)
     cutaway    photosphere clipped against a plane + volume behind it
     interior   volume only, full sphere, semi-transparent

   The cutaway plane passes through the star's centre; its normal slowly
   precesses unless the user grabs it (S9 adds that control). The photosphere
   mesh is clipped with a THREE.Plane so the volume shows through the opening.
   ========================================================================== */

import * as THREE from 'three';
import { volumeVert, volumeFrag } from '../shaders/volume.glsl.js';
import { KM } from '../config.js';

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();

export const VIEW = { EXTERIOR: 'exterior', CUTAWAY: 'cutaway', INTERIOR: 'interior' };

export class Interior {
  constructor(stage, profiles, quality) {
    this.stage = stage;
    this.profiles = profiles;
    this.mode = VIEW.EXTERIOR;
    this.vizMode = 0;                       // 0 structure · 1 elements · 2 rho · 3 T · 4 v

    this.uniforms = {
      ...profiles.uniforms,                 // shared by reference
      uCenter:   { value: new THREE.Vector3() },
      uRadius:   { value: 1 },
      uSteps:    { value: quality.volumeSteps },
      uMode:     { value: 0 },
      uGain:     { value: 1.0 },
      uCut:      { value: 0 },
      uCutNormal:{ value: new THREE.Vector3(1, 0, 0) },
      uTime:     { value: 0 },
      uMassMap:  { value: 1 },      // cutaway drawn in mass coordinate
    };

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 24),
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: volumeVert,
        fragmentShader: volumeFrag,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
    stage.near.add(this.mesh);

    /* clip plane for the photosphere in cutaway mode */
    this.clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
  }

  setMode(mode, star, renderer) {
    this.mode = mode;
    const cutting = mode === VIEW.CUTAWAY;
    this.mesh.visible = mode !== VIEW.EXTERIOR;
    this.uniforms.uCut.value = cutting ? 1 : 0;
    /* star.update owns per-frame visibility; it consults these flags */
    star.haloAllowed = mode === VIEW.EXTERIOR;
    star.windAllowed = mode === VIEW.EXTERIOR;
    star.surfaceAllowed = mode !== VIEW.INTERIOR;
    star.photosphere.material.clippingPlanes = cutting ? [this.clipPlane] : null;
    star.photosphere.material.clipping = cutting;
    star.photosphere.material.needsUpdate = true;   // NUM_CLIPPING_PLANES changes
    renderer.gl.localClippingEnabled = cutting;
    this.uniforms.uGain.value = mode === VIEW.INTERIOR ? 0.9 : 0.7;
    const note = document.getElementById('view-note');
    if (note) note.style.display = mode === VIEW.EXTERIOR ? 'none' : 'block';
  }

  setViz(v) { this.vizMode = v; this.uniforms.uMode.value = v; }

  update(dt, snap, starGroupPos) {
    if (!this.mesh.visible) return;
    this.uniforms.uTime.value += dt;

    /* the volume tracks the star's floating-origin position and CURRENT size */
    const R = snap.r[snap.n - 1] * KM;
    this.mesh.position.copy(starGroupPos);
    this.mesh.scale.setScalar(R);
    this.uniforms.uRadius.value = R;
    this.uniforms.uCenter.value.copy(starGroupPos);

    /* The open half faces the viewer — a cut you cannot see into is no cut
       at all — and precesses slowly around the view axis so the slice stays
       alive. uCutNormal points into the OPEN half (volume + wall); the
       photosphere keeps the other half, so its clip plane is the negation. */
    const n = this.uniforms.uCutNormal.value;
    const b = this.uniforms.uTime.value * 0.07;
    const toCam = _v1.copy(starGroupPos).negate().normalize();   // star -> camera
    const up = _v2.set(0, 1, 0);
    const right = _v3.crossVectors(toCam, up).normalize();
    const upO = _v2.crossVectors(right, toCam).normalize();
    n.copy(toCam)
      .addScaledVector(right, 0.62 * Math.cos(b))
      .addScaledVector(upO, 0.62 * Math.sin(b))
      .normalize();
    this.clipPlane.normal.copy(n).negate();
    this.clipPlane.constant = -this.clipPlane.normal.dot(starGroupPos);
  }
}
