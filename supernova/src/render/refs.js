/* =============================================================================
   REFS — scale references and the live scale bar
   -----------------------------------------------------------------------------
   The scale bar reads world-kilometres-per-pixel at the focus distance and
   snaps to a 1/2/5 decade, formatted through the same magnitude-aware
   formatter as everything else — km, then R☉, then AU, then light years.

   The reference rings are real sizes at the origin: the Sun (to scale!),
   Earth's orbit, Neptune's orbit. Against the progenitor the Earth-orbit ring
   sits INSIDE the star, which is the single most arresting scale fact this
   simulation can show. Rings only render when toggled — they are teaching
   props, not scenery.
   ========================================================================== */

import * as THREE from 'three';
import { R_SUN, AU, KM, CAMERA } from '../config.js';
import * as fmt from '../ui/format.js';

export class Refs {
  constructor(stage) {
    this.stage = stage;
    this.group = new THREE.Group();
    this.group.visible = false;
    stage.near.add(this.group);

    for (const R of [
      { r: R_SUN * KM, label: 'Sun', col: 0xffcc66 },
      { r: AU * KM, label: "Earth's orbit", col: 0x7fe6ff },
      { r: 30 * AU * KM, label: "Neptune's orbit", col: 0xb79bff },
    ]) {
      const seg = 256, pts = [];
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * R.r, 0, Math.sin(a) * R.r));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: R.col, transparent: true, opacity: 0.55 });
      this.group.add(new THREE.Line(geo, mat));
    }
    /* the Sun itself, to scale, as a tiny emissive ball */
    this.sun = new THREE.Mesh(
      new THREE.SphereGeometry(R_SUN * KM, 32, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.5, 0.9) }),
    );
    this.group.add(this.sun);

    this.barEl = document.getElementById('scalebar');
    this.barLabel = document.getElementById('scalebar-label');
    this.barLine = document.getElementById('scalebar-line');
  }

  toggle() { this.group.visible = !this.group.visible; return this.group.visible; }

  update(snap) {
    const o = this.stage.origin;
    this.group.position.set(-o.x, -o.y, -o.z);

    /* --- scale bar ------------------------------------------------------- */
    const d = Math.hypot(o.x, o.y, o.z);           // camera to origin, km
    const h = window.innerHeight;
    const kmPerPx = 2 * d * Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2)) / h;
    /* target ~140 px, snapped to 1/2/5 */
    const target = kmPerPx * 140;
    const p = Math.pow(10, Math.floor(Math.log10(target)));
    const m = target / p;
    const nice = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
    const px = nice / kmPerPx;
    this.barLine.style.width = px.toFixed(0) + 'px';
    this.barLabel.textContent = fmt.dist(nice);
  }
}
