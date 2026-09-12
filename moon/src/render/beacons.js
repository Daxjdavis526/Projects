/* =============================================================================
   BEACONS — a column of light where you marked the map
   -----------------------------------------------------------------------------
   The one thing in this file that is not on the Moon.

   Waypoints have existed since the nav console was written, and they round-trip
   through the save, and they have always been drawn as a three pixel blue
   square on a 240 pixel map you could only see from the driver's seat. So
   marking somewhere and then walking towards it meant checking a panel you
   could not see, in a vehicle you had got out of. Nothing rendered a waypoint
   in the world at all.

   This does, and it is frankly a game object: a blue column standing four
   kilometres out of the ground, visible from a long way off, which is exactly
   the thing the rest of this project refuses to do to a real place. It is why
   it is drawn in a colour nothing on the Moon is — the surface runs from
   charcoal to bone and there is no blue anywhere in it — so it can never be
   mistaken for something measured. Apollo 11's marker, by contrast, is a 1.86 m
   hairline post with no glow and nothing that turns to face you, because that
   site is real and this is furniture.

   A narrow bright core inside a wide faint halo, both open cylinders, plus a
   ring on the ground at the exact spot. MeshBasicMaterial rather than a custom
   shader, deliberately: three.js patches its own materials for the logarithmic
   depth buffer and a hand-written shader has to ask, which render/dust.js
   forgot for as long as it existed and was invisible over terrain the whole
   time. Not worth repeating for a light column.

   Width is scaled on the CPU with range rather than in a shader. A column two
   metres across is a pixel wide at ten kilometres and effectively invisible,
   and the fix is either a shader or a multiply — so, a multiply.
   ========================================================================== */

import * as THREE from 'three';
import { enuBasis, llhToXyz, surfaceDistance } from '../physics/frames.js';

/* How tall. Four kilometres clears anything in the neighbourhood — the deepest
   crater floor this could stand in is about five below its own rim, and at
   that point you are in it and can see the walls anyway. */
const HEIGHT = 4000;
const CORE_R = 1.6;                 // metres, at arm's length
const HALO_R = 9.0;
const RING_R = 6.0;

/* How many to draw, and how far. Eight is more marks than anyone places in a
   session, and past 150 km a column is below a pixel even scaled. */
const MOST = 8;
const RANGE = 150000;

/* Scale the width up with distance so the column holds a few pixels at range.
   Referenced to 400 m: closer than that it is drawn at its honest size. */
const REF = 400;

export class Beacons {
  /**
   * @param {object} stage the renderer's two-tier stage
   * @param {object} opts { heightfield, waypoints }
   */
  constructor(stage, opts = {}) {
    this.hf = opts.heightfield || null;
    this.waypoints = opts.waypoints || [];
    this.group = new THREE.Group();
    this.group.renderOrder = 2;
    stage.world.add(this.group);

    /* Open-ended cylinders: there is no reason to draw a cap on either end of
       a column of light, and the ends are never in frame together. */
    this.coreGeom = new THREE.CylinderGeometry(CORE_R, CORE_R, HEIGHT, 10, 1, true);
    this.haloGeom = new THREE.CylinderGeometry(HALO_R, HALO_R, HEIGHT, 12, 1, true);
    this.ringGeom = new THREE.RingGeometry(RING_R * 0.72, RING_R, 28);
    /* The ring is authored in the XY plane and wants to lie flat. */
    this.ringGeom.rotateX(-Math.PI / 2);

    /* `toneMapped: false` on all three, and it is the whole reason these read
       as blue at all.

       The scene's exposure is analytic and lands on the renderer as a tone
       mapping multiplier, which for sunlit regolith is around five. Run this
       colour through that and the ACES curve takes every channel to white:
       the first version of these columns was a convincing pale grey, which is
       precisely the failure sky.js warns about a few files over — "the blend
       lands after tone mapping and the curve has already taken the multiplier
       to white".
       A marker is not a physical light and has no business being exposed like
       one. Opting out means the blue is the blue that was chosen, and stays
       that blue whatever the Sun is doing, which is what you want from a
       navigation aid. */
    this.coreMat = new THREE.MeshBasicMaterial({
      color: 0x6ea8ff, transparent: true, opacity: 0.62,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.haloMat = new THREE.MeshBasicMaterial({
      color: 0x3f6ed0, transparent: true, opacity: 0.13,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.ringMat = new THREE.MeshBasicMaterial({
      color: 0x8fc4ff, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      toneMapped: false,
    });

    this.marks = [];
    this._m = new THREE.Matrix4();
    this._e = new THREE.Vector3();
    this._u = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this._p = { x: 0, y: 0, z: 0 };
  }

  /** One column, built the first time it is needed and then reused. */
  grow() {
    const holder = new THREE.Group();
    const core = new THREE.Mesh(this.coreGeom, this.coreMat);
    const halo = new THREE.Mesh(this.haloGeom, this.haloMat);
    const ring = new THREE.Mesh(this.ringGeom, this.ringMat);
    /* The cylinders are centred on their own middle, so lift them by half
       their height to stand on the ground. */
    core.position.y = HEIGHT / 2;
    halo.position.y = HEIGHT / 2;
    ring.position.y = 0.25;
    for (const m of [core, halo, ring]) {
      m.castShadow = false; m.receiveShadow = false;
      m.frustumCulled = false;       // placed in origin-relative coordinates
    }
    holder.add(halo, core, ring);
    this.group.add(holder);
    const mark = { holder, core, halo, ring };
    this.marks.push(mark);
    return mark;
  }

  /**
   * Stand a column at each of the nearest few marks.
   *
   * MUST be called after `stage.setEye()`, like everything else placed against
   * the render origin. main.js carries the standing note about what happens to
   * anything placed against the previous one.
   *
   * @param {object} origin the render origin
   * @param {object} at { lat, lon } where the camera is, for range
   */
  place(origin, at) {
    const near = [];
    for (const w of this.waypoints) {
      const range = at ? surfaceDistance(at.lat, at.lon, w.lat, w.lon) : 0;
      if (range <= RANGE) near.push({ w, range });
    }
    near.sort((a, b) => a.range - b.range);
    const show = near.slice(0, MOST);

    for (let i = 0; i < show.length; i++) {
      const { w, range } = show[i];
      const mark = this.marks[i] || this.grow();
      mark.holder.visible = true;

      /* Standing on the local vertical, which is the only orientation a
         column of light can sensibly have. */
      const b = enuBasis(w.lat, w.lon);
      this._e.set(b.e.x, b.e.y, b.e.z);
      this._u.set(b.u.x, b.u.y, b.u.z);
      this._s.set(-b.n.x, -b.n.y, -b.n.z);
      this._m.makeBasis(this._e, this._u, this._s);
      mark.holder.quaternion.setFromRotationMatrix(this._m);

      const ground = this.hf ? this.hf.heightAt(w.lat, w.lon) : 0;
      llhToXyz(w.lat, w.lon, ground, this._p);
      mark.holder.position.set(
        this._p.x - origin.x, this._p.y - origin.y, this._p.z - origin.z);

      /* Hold a few pixels at range. Only the width grows; the height is a real
         height and stays one, so the column does not turn into a slab. */
      const k = Math.max(1, range / REF);
      mark.core.scale.set(k, 1, k);
      mark.halo.scale.set(k, 1, k);
      /* The ring is a footprint on the ground and should stay its own size, or
         a distant mark draws a ten kilometre disc over the landscape. */
      mark.ring.scale.set(1, 1, 1);
      mark.ring.visible = range < 4000;
    }
    for (let i = show.length; i < this.marks.length; i++) {
      this.marks[i].holder.visible = false;
    }
    return show.length;
  }

  dispose() {
    this.coreGeom.dispose(); this.haloGeom.dispose(); this.ringGeom.dispose();
    this.coreMat.dispose(); this.haloMat.dispose(); this.ringMat.dispose();
    this.group.removeFromParent();
    this.marks.length = 0;
  }
}
