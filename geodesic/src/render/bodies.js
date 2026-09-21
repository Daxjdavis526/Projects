/* =============================================================================
   BODIES — spheres, horizons, trails, selection
   -----------------------------------------------------------------------------
   Scale honesty lives here. Every body carries a flag saying whether what you
   are looking at is its true radius or a minimum-size marker, and the
   inspector reports that flag. See scene.js for why this matters.
   ========================================================================== */

import * as THREE from 'three';
import { MATERIALS } from '../physics/constants.js';

const MARKER_PX = 5;        // below this many pixels, draw a marker instead

const DEFAULT_COLORS = {
  ice: '#bfe8f5', rock: '#9c8e82', iron: '#b08878', terrestrial: '#5b9dd9',
  gasGiant: '#d8a06a', star: '#ffd27f', whiteDwarf: '#dfe9ff',
  neutronStar: '#cfe4ff', blackHole: '#000000',
};

export class BodyViews {
  constructor(stage) {
    this.stage = stage;
    this.group = new THREE.Group();
    stage.scene.add(this.group);
    this.views = new Map();          // id -> { mesh, halo, trail, ... }
    this.trailLength = 2000;
    this.showTrails = true;
    this.selected = null;
  }

  _create(snap) {
    const color = new THREE.Color(snap.color ?? DEFAULT_COLORS[snap.material] ?? '#cccccc');

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 20),
      snap.isBlackHole
        ? new THREE.MeshBasicMaterial({ color: 0x000000 })
        : new THREE.MeshStandardMaterial({
            color, roughness: 0.75, metalness: 0.05,
            emissive: snap.material === 'star' ? color : 0x000000,
            emissiveIntensity: snap.material === 'star' ? 0.55 : 0,
          }),
    );
    mesh.userData.id = snap.id;
    this.group.add(mesh);

    /* Ring marking the event horizon / photon sphere for compact objects, and
       a selection ring for everything. Always drawn at TRUE scale, so when a
       black hole is a marker dot these sit inside it and you have to zoom to
       resolve them — which is the honest situation. */
    const ringMat = new THREE.LineBasicMaterial({
      color: snap.isBlackHole ? 0xff5a4e : 0x7fe6c8,
      transparent: true, opacity: 0.55,
    });
    const ringGeo = new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 65 }, (_, i) => {
        const a = (i / 64) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      }));
    const ring = new THREE.LineLoop(ringGeo, ringMat);
    ring.visible = false;
    this.group.add(ring);

    /* Trail: a rolling buffer drawn as a line. Orbits are the point of this
       simulator, and an orbit you cannot see the shape of is not much use. */
    const tGeo = new THREE.BufferGeometry();
    tGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.trailLength * 3), 3));
    tGeo.setDrawRange(0, 0);
    const trail = new THREE.Line(tGeo, new THREE.LineBasicMaterial({
      color, transparent: true, opacity: 0.45,
    }));
    trail.frustumCulled = false;
    this.group.add(trail);

    const view = {
      mesh, ring, trail, color,
      trailPos: tGeo.attributes.position.array,
      trailCount: 0, trailHead: 0,
      isMarker: false, drawnRadius: 0,
    };
    this.views.set(snap.id, view);
    return view;
  }

  /* Remove views whose bodies are gone (merged or deleted). */
  _prune(snapshot) {
    const live = new Set(snapshot.bodies.map(b => b.id));
    for (const [id, v] of this.views) {
      if (!live.has(id)) {
        this.group.remove(v.mesh, v.ring, v.trail);
        v.mesh.geometry.dispose(); v.mesh.material.dispose();
        v.trail.geometry.dispose(); v.trail.material.dispose();
        this.views.delete(id);
      }
    }
  }

  update(snapshot, opts = {}) {
    this._prune(snapshot);
    const upp = this.stage.unitsPerPixel(this.stage.camDistance);
    const minWorld = upp * MARKER_PX;

    for (const b of snapshot.bodies) {
      let v = this.views.get(b.id);
      if (!v) v = this._create(b);

      v.mesh.position.set(b.pos[0], b.pos[1], b.pos[2]);

      /* True radius unless it would be sub-pixel, in which case a marker. */
      const isMarker = b.radius < minWorld;
      const drawn = isMarker ? minWorld : b.radius;
      v.isMarker = isMarker;
      v.drawnRadius = drawn;
      v.trueRadius = b.radius;
      v.mesh.scale.setScalar(drawn);

      /* A marker gets a dimmer, flatter look so it never reads as a surface. */
      if (v.mesh.material.opacity !== undefined) {
        v.mesh.material.transparent = isMarker;
        v.mesh.material.opacity = isMarker ? 0.85 : 1;
      }

      /* Horizon ring for compact objects, at true scale. */
      const showRing = this.selected === b.id || (b.compactness > 0.01);
      v.ring.visible = showRing;
      if (showRing) {
        v.ring.position.copy(v.mesh.position);
        /* A black hole drawn at true scale gets a ring at its true horizon.
           One drawn as a marker gets a ring around the MARKER instead — a
           black disc on a black sky is otherwise invisible, and an invisible
           black hole is worse than an oversized one as long as the inspector
           says which it is. */
        v.ring.scale.setScalar(b.isBlackHole
          ? Math.max(b.rs, isMarker ? drawn * 1.6 : 0)
          : Math.max(b.radius * 1.35, drawn * 1.35));
        v.ring.material.color.setHex(
          this.selected === b.id ? 0x7fe6c8 : (b.isBlackHole ? 0xff5a4e : 0xffd166));
        v.ring.material.opacity = this.selected === b.id ? 0.9 : 0.4;
      }

      /* trail */
      if (this.showTrails && !opts.paused) this._pushTrail(v, b.pos);
      v.trail.visible = this.showTrails;
    }
  }

  _pushTrail(v, p) {
    const arr = v.trailPos;
    /* Only record when the body has actually moved a visible amount, so a
       slow body doesn't fill the buffer with duplicate points. */
    if (v.trailCount > 0) {
      const i = ((v.trailHead - 1 + this.trailLength) % this.trailLength) * 3;
      const d = Math.hypot(arr[i] - p[0], arr[i + 1] - p[1], arr[i + 2] - p[2]);
      const upp = this.stage.unitsPerPixel(this.stage.camDistance);
      if (d < upp * 1.5) return;
    }
    const h = v.trailHead * 3;
    arr[h] = p[0]; arr[h + 1] = p[1]; arr[h + 2] = p[2];
    v.trailHead = (v.trailHead + 1) % this.trailLength;
    v.trailCount = Math.min(v.trailCount + 1, this.trailLength);

    /* Rebuild in order. The buffer is a ring; the draw range must be
       contiguous, so unwrap it into a temporary ordered copy. */
    const g = v.trail.geometry;
    if (v.trailCount < this.trailLength) {
      g.setDrawRange(0, v.trailCount);
    } else {
      /* full: rotate so the oldest sample is first */
      const ordered = new Float32Array(this.trailLength * 3);
      for (let k = 0; k < this.trailLength; k++) {
        const src = ((v.trailHead + k) % this.trailLength) * 3;
        ordered[k * 3] = arr[src]; ordered[k * 3 + 1] = arr[src + 1]; ordered[k * 3 + 2] = arr[src + 2];
      }
      g.attributes.position.array.set(ordered);
      g.setDrawRange(0, this.trailLength);
    }
    g.attributes.position.needsUpdate = true;
    g.computeBoundingSphere();
  }

  clearTrails() {
    for (const v of this.views.values()) {
      v.trailCount = 0; v.trailHead = 0;
      v.trail.geometry.setDrawRange(0, 0);
    }
  }

  setSelected(id) { this.selected = id; }

  /* Ray-pick a body. Uses the DRAWN radius so tiny markers stay clickable —
     a black hole you cannot select would make the sandbox unusable. */
  pick(raycaster) {
    const hits = [];
    for (const [id, v] of this.views) {
      const s = new THREE.Sphere(v.mesh.position, v.drawnRadius * 1.6);
      const p = new THREE.Vector3();
      if (raycaster.ray.intersectSphere(s, p)) {
        hits.push({ id, dist: raycaster.ray.origin.distanceTo(p) });
      }
    }
    hits.sort((a, b) => a.dist - b.dist);
    return hits.length ? hits[0].id : null;
  }

  viewOf(id) { return this.views.get(id); }
}
