/* =============================================================================
   HISTORIC — the places people have already been
   -----------------------------------------------------------------------------
   Reconstructions of real sites, placed at their real coordinates and built
   only when you are close enough to see them.

   The rule for these is stricter than for anything else in the game: nothing is
   invented. Every object is one that is documented as being there, at the
   offset it is documented at, and where a position is only known from a map
   rather than a measurement it is labelled approximate in the data as well as
   in the comment. The flag at Tranquility Base lies on the ground because the
   ascent engine knocked it over and LRO can see that it is not standing.

   Markers are off by default. You should be able to walk up to Tranquility Base
   and recognise it from the shape of the ground and the descent stage sitting
   in it, not from a floating waypoint. Turning the marker on gives you one
   quiet line of type and nothing else.
   ========================================================================== */

import * as THREE from 'three';
import { enuBasis, llhToXyz, surfaceDistance } from '../physics/frames.js';

/* Built when you come within this far, dropped when you leave. */
const BUILD_RANGE = 2600;

export class HistoricSites {
  constructor(opts) {
    this.stage = opts.stage;
    this.hf = opts.heightfield;
    this.quality = opts.quality || 'high';
    this.markers = false;
    this.sites = [];
    this.group = new THREE.Group();
    opts.stage.world.add(this.group);
    this._m = new THREE.Matrix4();
    this._e = new THREE.Vector3();
    this._u = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this._p = { x: 0, y: 0, z: 0 };
    this._sun = new THREE.Vector3();
  }

  /**
   * @param {object} spec { id, lat, lon, heading, build(opts) }
   */
  register(spec) {
    this.sites.push({ ...spec, kit: null, range: Infinity });
    return this;
  }

  setMarkers(on) {
    this.markers = on;
    for (const s of this.sites) if (s.kit) s.kit.setMarkers(on);
  }

  /** Build what is near, drop what is not, and place what exists. */
  update(lat, lon, origin, dt, sunDir) {
    for (const s of this.sites) {
      s.range = surfaceDistance(lat, lon, s.lat, s.lon);
      if (s.range < BUILD_RANGE && !s.kit) {
        try {
          s.kit = s.build({ quality: this.quality });
          s.kit.setMarkers(this.markers);
          this.group.add(s.kit.group);
        } catch (e) {
          console.warn(`could not build ${s.id}:`, e.message);
          s.build = () => { throw e; };          // do not try again every frame
          s.kit = null;
          s.failed = true;
        }
      } else if (s.range > BUILD_RANGE * 1.4 && s.kit) {
        this.group.remove(s.kit.group);
        s.kit.dispose();
        s.kit = null;
      }
      if (!s.kit) continue;

      /* Model +X east, +Y up, +Z south, standing on the real surface. */
      const b = enuBasis(s.lat, s.lon);
      const h = (s.heading || 0) * Math.PI / 180;
      const c = Math.cos(h), sn = Math.sin(h);
      this._e.set(b.e.x * c - b.n.x * sn, b.e.y * c - b.n.y * sn, b.e.z * c - b.n.z * sn);
      this._s.set(-(b.n.x * c + b.e.x * sn), -(b.n.y * c + b.e.y * sn), -(b.n.z * c + b.e.z * sn));
      this._u.set(b.u.x, b.u.y, b.u.z);
      this._m.makeBasis(this._e, this._u, this._s);
      s.kit.group.quaternion.setFromRotationMatrix(this._m);
      llhToXyz(s.lat, s.lon, this.hf.heightAt(s.lat, s.lon), this._p);
      s.kit.group.position.set(
        this._p.x - origin.x, this._p.y - origin.y, this._p.z - origin.z);

      if (sunDir && s.kit.animate) {
        /* The kit wants the Sun in its own frame, so turn the world direction
           into model space with the inverse of the rotation just applied. */
        this._sun.set(sunDir.x, sunDir.y, sunDir.z)
          .applyQuaternion(s.kit.group.quaternion.clone().invert());
        s.kit.animate({ dt, sunDir: this._sun });
      }
    }
  }

  /** The nearest reconstruction and how far away it is. */
  nearest() {
    let best = null;
    for (const s of this.sites) if (!best || s.range < best.range) best = s;
    return best;
  }
}
