/* =============================================================================
   LATTICE VIEW — drawing the cube of falling markers
   -----------------------------------------------------------------------------
   The lattice itself lives in physics/lattice.js and knows nothing about
   three.js. This file only turns its node positions into lines.

   Two frames, one subtraction apart:

     INFALL  draws each marker where it actually is. The grid pours into the
             masses. For a single body this is exactly the Gullstrand-Painleve
             "river" picture, in which space falls inward at the escape
             velocity — an exact rewriting of the Schwarzschild metric, not a
             cartoon. It shreds eventually, which is also true.

     TIDAL   subtracts the lattice's own centroid motion, which is to say it
             draws the grid in its own freely falling frame. The bulk fall
             disappears and what is left is pure geodesic deviation. This is
             the equivalence principle as a picture: take away the part that a
             change of frame can remove, and what remains is curvature.

   Edges are coloured by whether the two nodes they join have moved apart or
   together since release, on the same red-stretch / blue-squeeze convention
   the tendex mode uses, so the two modes agree with each other on sight.
   ========================================================================== */

import * as THREE from 'three';

export class LatticeView {
  constructor(stage) {
    this.stage = stage;
    this.group = new THREE.Group();
    stage.scene.add(this.group);
    this.frame = 'tidal';          // or 'infall'
    this.lattice = null;
    this._built = 0;
  }

  /* Build GPU buffers for a lattice of this size. Edge topology never
     changes, so the index buffer is written once. */
  attach(lattice) {
    if (this.lines) {
      this.group.remove(this.lines, this.nodes);
      this.lines.geometry.dispose(); this.lines.material.dispose();
      this.nodes.geometry.dispose(); this.nodes.material.dispose();
    }
    this.lattice = lattice;
    const nEdge = lattice.edges.length / 2;

    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nEdge * 2 * 3), 3));
    lg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(nEdge * 2 * 3), 3));
    this.lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.lines.frustumCulled = false;
    this.group.add(this.lines);

    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lattice.count * 3), 3));
    this.nodes = new THREE.Points(ng, new THREE.PointsMaterial({
      color: 0xdcd8d2, size: 1.6, sizeAttenuation: false,
      transparent: true, opacity: 0.5, depthWrite: false,
    }));
    this.nodes.frustumCulled = false;
    this.group.add(this.nodes);

    this._built = lattice.count;
    return this;
  }

  set visible(v) { this.group.visible = v; }
  get visible() { return this.group.visible; }

  update() {
    const L = this.lattice;
    if (!L || this._built !== L.count) return;

    /* The offset that turns one frame into the other. In the tidal frame the
       lattice is pinned to where it started, so the deformation is all you
       see; in the infall frame nothing is subtracted at all. */
    let ox = 0, oy = 0, oz = 0;
    if (this.frame === 'tidal') {
      const c = L.centroid(), s = L.seedCentroid;
      ox = c[0] - s[0]; oy = c[1] - s[1]; oz = c[2] - s[2];
    }

    const p = L.pos, e = L.edges, sp = L.seedPos;
    const lp = this.lines.geometry.attributes.position.array;
    const lc = this.lines.geometry.attributes.color.array;
    const np = this.nodes.geometry.attributes.position.array;

    for (let i = 0; i < L.count; i++) {
      const o = i * 3;
      np[o] = p[o] - ox; np[o + 1] = p[o + 1] - oy; np[o + 2] = p[o + 2] - oz;
    }

    for (let k = 0; k < e.length; k += 2) {
      const a = e[k] * 3, b = e[k + 1] * 3, o = k * 3;

      lp[o]     = p[a] - ox;     lp[o + 1] = p[a + 1] - oy; lp[o + 2] = p[a + 2] - oz;
      lp[o + 3] = p[b] - ox;     lp[o + 4] = p[b + 1] - oy; lp[o + 5] = p[b + 2] - oz;

      /* How much this edge has stretched or compressed since release. This is
         the quantity geodesic deviation predicts, measured directly off the
         two markers rather than inferred from anything. */
      const now = Math.hypot(p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]);
      const was = Math.hypot(sp[b] - sp[a], sp[b + 1] - sp[a + 1], sp[b + 2] - sp[a + 2]);
      const s = was > 0 ? now / was - 1 : 0;

      /* Log-ish response so a 0.1% strain is visible and a 100% one is not
         blinding. Red stretches, blue squeezes, grey neither. */
      const m = Math.min(1, Math.log10(1 + Math.abs(s) * 1e3) / 3);
      const r = s > 0 ? 0.30 + 0.70 * m : 0.30 - 0.18 * m;
      const g = 0.34 - 0.20 * m;
      const bl = s > 0 ? 0.30 - 0.18 * m : 0.30 + 0.70 * m;
      for (let v = 0; v < 2; v++) {
        lc[o + v * 3] = r; lc[o + v * 3 + 1] = g; lc[o + v * 3 + 2] = bl;
      }
    }

    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;
    this.nodes.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.computeBoundingSphere();
  }
}
