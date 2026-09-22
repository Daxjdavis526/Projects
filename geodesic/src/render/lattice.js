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

/* Beyond this much stretch an edge is dropped rather than drawn. */
const MAX_EDGE_STRETCH = 3;

/* How bright a completely unstrained edge is. Low on purpose: flat fabric
   should be present but quiet. */
const FLOOR = 0.055;

/* Below this an edge is not drawn at all. Tens of thousands of additive
   lines are fill-bound long before they are vertex-bound, and an edge this
   dim contributes nothing but cost — the distant, undeformed far side of the
   lattice is most of the geometry and almost none of the picture. Culling it
   roughly halves the edges drawn in a typical view and looks identical. */
const MIN_LIT = 0.035;

export class LatticeView {
  constructor(stage) {
    this.stage = stage;
    this.group = new THREE.Group();
    stage.scene.add(this.group);
    this.frame = 'tidal';          // or 'infall'
    /* 0..1 brightness envelope over a release cycle, set by main.js. */
    this.envelope = 1;
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
      vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.lines.frustumCulled = false;
    this.group.add(this.lines);

    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lattice.count * 3), 3));
    this.nodes = new THREE.Points(ng, new THREE.PointsMaterial({
      color: 0xdcd8d2, size: 1.3, sizeAttenuation: false,
      transparent: true, opacity: 0.18, depthWrite: false,
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

    /* Depth cue. Looking through fifteen layers of line with no attenuation
       gives a flat thicket where front and back are indistinguishable, and no
       amount of colour work fixes that — the eye reads depth from contrast.
       Fading with distance across the lattice's own width makes it work at
       any zoom, since the lattice is always sized to the view. */
    const cam = this.stage.camera.position;
    const fadeRef = Math.max(L.halfWidth, 1e-12) * 2.2;

    /* The offset that turns one frame into the other. In the tidal frame the
       lattice is pinned to where it started, so the deformation is all you
       see; in the infall frame nothing is subtracted at all. */
    let ox = 0, oy = 0, oz = 0;
    if (this.frame === 'tidal') {
      const c = L.centroid(), s = L.seedCentroid;
      ox = c[0] - s[0]; oy = c[1] - s[1]; oz = c[2] - s[2];
    }

    const p = L.pos, e = L.edges, sp = L.seedPos;
    const buried = L.buried, parked = L.parked;
    const lp = this.lines.geometry.attributes.position.array;
    const lc = this.lines.geometry.attributes.color.array;
    const np = this.nodes.geometry.attributes.position.array;

    let nn = 0;
    for (let i = 0; i < L.count; i++) {
      if (buried[i]) continue;
      const o = i * 3, d = nn * 3;
      np[d] = p[o] - ox; np[d + 1] = p[o + 1] - oy; np[d + 2] = p[o + 2] - oz;
      nn++;
    }
    this.nodes.geometry.setDrawRange(0, nn);

    let w = 0;
    for (let k = 0; k < e.length; k += 2) {
      const ia = e[k], ib = e[k + 1];

      /* An edge into the inside of a planet joins nothing to nothing. */
      if (buried[ia] || buried[ib]) continue;

      const a = ia * 3, b = ib * 3;

      const now = Math.hypot(p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]);
      const was = Math.hypot(sp[b] - sp[a], sp[b + 1] - sp[a + 1], sp[b + 2] - sp[a + 2]);
      const s = was > 0 ? now / was - 1 : 0;

      /* A pair of markers that has pulled this far apart is no longer
         describing a piece of fabric, and a line drawn between them says
         something false about the space in between — that it is one cell
         wide. The markers are the real objects; the line is a drawing aid,
         and past this point the aid stops helping. */
      if (s > MAX_EDGE_STRETCH) continue;

      /* Brightness is strain, with almost no floor.

         A lattice that spans the whole view is tens of thousands of edges,
         and drawing them all at an even grey makes a wall of lines you
         cannot see through, let alone read. Giving unstrained fabric a
         brightness near zero fixes that and says something true at the same
         time: far from any mass the markers keep their spacing, so there is
         nothing there to draw. The fabric lights up exactly where gravity is
         doing something to it.

         Log-ish response so a 0.1% strain is visible and a 100% one is not
         blinding. Red stretches, blue squeezes. A landed marker is dimmer
         still, because it is no longer in free fall and nothing it does from
         here is geodesic deviation. */
      const m = Math.min(1, Math.log10(1 + Math.abs(s) * 1e3) / 3);
      const mx = (p[a] - cam.x + p[b] - cam.x) * 0.5;
      const my = (p[a + 1] - cam.y + p[b + 1] - cam.y) * 0.5;
      const mz = (p[a + 2] - cam.z + p[b + 2] - cam.z) * 0.5;
      const depth = Math.hypot(mx, my, mz) / fadeRef;
      const near = Math.max(0.10, Math.min(1, 1.5 - depth));

      const rest = (parked[ia] && parked[ib]) ? 0.4 : 1;
      const lit = (FLOOR + (1 - FLOOR) * m * m) * near * this.envelope * rest;
      if (lit < MIN_LIT) continue;

      const o = w * 6;
      lp[o]     = p[a] - ox;     lp[o + 1] = p[a + 1] - oy; lp[o + 2] = p[a + 2] - oz;
      lp[o + 3] = p[b] - ox;     lp[o + 4] = p[b + 1] - oy; lp[o + 5] = p[b + 2] - oz;

      const r = s > 0 ? lit : lit * 0.34;
      const g = lit * 0.36;
      const bl = s > 0 ? lit * 0.30 : lit;
      for (let v = 0; v < 2; v++) {
        lc[o + v * 3] = r; lc[o + v * 3 + 1] = g; lc[o + v * 3 + 2] = bl;
      }
      w++;
    }
    this.lines.geometry.setDrawRange(0, w * 2);

    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;
    this.nodes.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.computeBoundingSphere();
  }
}
