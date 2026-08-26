/* =============================================================================
   PROFILES — the one bridge from physics state to GPU resources
   -----------------------------------------------------------------------------
   Three 256x1 float textures, refreshed per frame (~12 KB of upload):

     profileTex  RGBA = (log10 rho [normalised], log10 T [normalised],
                         v/c [biased at 0.5], r/R_max)      indexed by SHELL
     compTexA    RGBA = mass fractions H, He, C, O           indexed by SHELL
     compTexB    RGBA = mass fractions Ne, Mg, Si, Fe        indexed by SHELL
     radiusLUT   R    = shell index / N                      indexed by r/R_max

   radiusLUT is the inversion the volume raymarcher needs: given a sample
   radius, one texture fetch yields the mass coordinate, and with it every
   physical quantity. Shells move; mass is the stable label.

   No other module converts physics units for the GPU. The normalisation
   ranges live here, in one place, as uniforms the shaders share.
   ========================================================================== */

import * as THREE from 'three';
import { N_SHELL, NEL, KM } from '../config.js';

const LRHO_MIN = -8, LRHO_MAX = 15;    // log10 g/cm^3
const LT_MIN = 3, LT_MAX = 12;         // log10 K
/* The radius->mass LUT is logarithmic in radius: an evolved star's structure
   spans seven decades of radius, and a linear LUT's first bin would swallow
   the entire core. LUT_EPS is the innermost resolvable radius as a fraction
   of the outermost shell. */
const LUT_EPS = 1e-7;

export class Profiles {
  constructor() {
    const mk = (w) => {
      const t = new THREE.DataTexture(new Float32Array(w * 4), w, 1,
        THREE.RGBAFormat, THREE.FloatType);
      t.magFilter = THREE.LinearFilter;
      t.minFilter = THREE.LinearFilter;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.needsUpdate = true;
      return t;
    };
    this.profileTex = mk(N_SHELL);
    this.compTexA = mk(N_SHELL);
    this.compTexB = mk(N_SHELL);
    this.radiusLUT = mk(512);

    /* Shared uniform bag — every material that samples the profile textures
       holds THESE objects by reference, so one write per frame updates all. */
    this.uniforms = {
      uProfile:  { value: this.profileTex },
      uCompA:    { value: this.compTexA },
      uCompB:    { value: this.compTexB },
      uRadiusLUT:{ value: this.radiusLUT },
      uRmax:     { value: 1 },          // km — outermost shell radius
      uRhoRange: { value: new THREE.Vector2(LRHO_MIN, LRHO_MAX) },
      uTRange:   { value: new THREE.Vector2(LT_MIN, LT_MAX) },
    };
  }

  upload(snap) {
    const N = N_SHELL;
    const p = this.profileTex.image.data;
    const a = this.compTexA.image.data;
    const b = this.compTexB.image.data;
    const rMax = snap.r[N - 1];

    for (let i = 0; i < N; i++) {
      const lrho = Math.log10(Math.max(snap.rho[i], 1e-30));
      const lT = Math.log10(Math.max(snap.T[i], 1));
      p[i * 4]     = (lrho - LRHO_MIN) / (LRHO_MAX - LRHO_MIN);
      p[i * 4 + 1] = (lT - LT_MIN) / (LT_MAX - LT_MIN);
      p[i * 4 + 2] = 0.5 + 0.5 * Math.max(-1, Math.min(1, snap.v[i] / 2.998e10));
      p[i * 4 + 3] = snap.r[i] / rMax;

      a[i * 4]     = snap.X[i * NEL];
      a[i * 4 + 1] = snap.X[i * NEL + 1];
      a[i * 4 + 2] = snap.X[i * NEL + 2];
      a[i * 4 + 3] = snap.X[i * NEL + 3];
      b[i * 4]     = snap.X[i * NEL + 4];
      b[i * 4 + 1] = snap.X[i * NEL + 5];
      b[i * 4 + 2] = snap.X[i * NEL + 6];
      b[i * 4 + 3] = snap.X[i * NEL + 7];
    }

    /* radius -> mass-coordinate LUT, log-spaced: bin x covers physical radius
       rMax * LUT_EPS^(1-x). Bins ascend in radius, so the shell pointer only
       ever advances. */
    const lut = this.radiusLUT.image.data;
    let shell = 0;
    for (let j = 0; j < 512; j++) {
      const x = j / 511;
      const r = rMax * Math.pow(LUT_EPS, 1 - x);
      while (shell < N - 1 && snap.r[shell] < r) shell++;
      const r1 = snap.r[shell], r0 = shell > 0 ? snap.r[shell - 1] : 0;
      const f = r1 > r0 ? (r - r0) / (r1 - r0) : 1;
      const idx = (shell - 1 + Math.max(0, Math.min(1, f)) + 0.5) / N;
      lut[j * 4] = Math.max(0, Math.min(1, idx));
      lut[j * 4 + 1] = 0; lut[j * 4 + 2] = 0; lut[j * 4 + 3] = 1;
    }

    this.profileTex.needsUpdate = true;
    this.compTexA.needsUpdate = true;
    this.compTexB.needsUpdate = true;
    this.radiusLUT.needsUpdate = true;
    this.uniforms.uRmax.value = rMax * KM;
  }
}
