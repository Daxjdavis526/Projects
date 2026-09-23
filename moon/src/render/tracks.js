/* =============================================================================
   TRACKS — the marks you leave, which do not go away
   -----------------------------------------------------------------------------
   There is no wind, no rain and no biology on the Moon, so the only things that
   erase a footprint are micrometeorite gardening and the solar wind, and both
   work on a timescale of ten million years. What you leave here you leave for
   longer than the species has existed. That is the fact this draws.

   The marks are darker than the ground around them, and that is not an artistic
   choice: pressing regolith compacts it, which reduces the shadow-hiding within
   the porous top layer that makes undisturbed regolith so bright at low phase
   angles. It is why Apollo boot prints photograph as dark on grey, why the LRV
   tracks are visible from orbit, and why the trails at Tranquility Base radiate
   out of the ladder as darkened lines. The Apollo 11 reconstruction already
   draws its own on exactly that reasoning; this is the same thing for wherever
   you happen to have walked.

   It is a ribbon, not a decal texture, for the same reason the site's trails
   are: the surface here is a streaming quadtree whose tiles come and go, and
   painting into their textures would mean owning that lifecycle. A thin strip
   held a few centimetres above the ground is unambiguous, survives a tile
   rebuild, and costs one draw call per kind of mark.
   ========================================================================== */

import * as THREE from 'three';
import { llhToXyz, enuBasis, surfaceDistance, bearing } from '../physics/frames.js';
import { regolithBrdf } from './photometry.js';
import { OPTICS } from '../config.js';

/* How wide the marks are. A suited boot is about 33 cm across the sole and
   leaves a print rather than a continuous line, so the walking ribbon is
   deliberately narrower than the wheel one and fades faster. The rover's
   wheels are 23 cm wide on a 2.4 m track, so what it leaves is two lines a
   little over two metres apart — drawn here as one band of that width, because
   at any distance you can see it from that is what it looks like. */
/* How much of the ground's reflectance a mark takes away. Compaction reduces
   the shadow-hiding in the porous top layer, which is what makes undisturbed
   regolith so bright at low phase; a fifth is enough to see at low sun and
   from orbit and nowhere near a black stripe. The wheels compact harder than
   a boot does. */
const KIND = {
  boots: { half: 0.22, darken: 0.80, lift: 0.02, step: 1.5 },
  wheels: { half: 1.25, darken: 0.74, lift: 0.03, step: 2.5 },
};
/* One fixed factor on top, matched against the rendered mare rather than
   derived. The terrain shader carries its own light scaling and its own
   micro-relief shading, and reproducing that exactly on a strip that is not
   the terrain would mean giving the strip the terrain's shader, its vertex
   attributes and its horizon map. This is the only number in this file that is
   a calibration rather than a measurement, and it is written down as one. */
const LAMBERT_MATCH = 1.0;

/* Beyond this the marks are not worth carrying: a ribbon reaching to the
   horizon is thousands of vertices for something a pixel wide. */
const DRAW_RANGE = 4000;

export class Tracks {
  /**
   * @param {object} stage the render stage, for the world group
   * @param {object} heightfield to sit the ribbon on the ground
   */
  constructor(stage, heightfield) {
    this.stage = stage;
    this.hf = heightfield;
    this.group = new THREE.Group();
    this.group.name = 'tracks';
    stage.world.add(this.group);
    this.parts = {};
    this.mats = [];
    for (const [name, spec] of Object.entries(KIND)) {
      /* Multiplied into the frame rather than lit on its own.
         The ground here is drawn with the regolith BRDF — Lommel-Seeliger,
         backscatter and an opposition surge — and a standard Lambert strip
         laid on top of it is a different material under the same Sun, which
         at a low phase angle comes out several times too dark and reads as
         a painted-on decal. What a trail actually is, is the same ground
         reflecting a bit less, so that is what this is: a multiply, with no
         lighting of its own to disagree with the surface it is lying on. */
      /* Lit by the engine, corrected to the surface it is lying on.
         The ground is drawn with the regolith BRDF — Lommel-Seeliger,
         backscatter, an opposition surge — and a standard material under the
         same Sun is Lambert, which at low phase is several times dimmer: a
         strip of it laid on the mare comes out nearly black and reads as a
         decal someone painted on. A multiply blend does not fix that either,
         because the blend lands after tone mapping and the curve has already
         taken the multiplier to white.
         What does fix it is the ratio itself. `setLight` divides the BRDF by
         Lambert's own cosine for the current geometry and folds that into the
         colour, so the strip is lit and shaded and shadowed by the engine like
         any other object, at the brightness the regolith around it actually
         has, times the compaction. */
      const mat = new THREE.MeshStandardMaterial({
        color: 0x808080, roughness: 1.0, metalness: 0.0,
        transparent: true, opacity: 0.95, depthWrite: false,
        side: THREE.DoubleSide,
      });
      this.mats.push(mat);
      const geom = new THREE.BufferGeometry();
      const mesh = new THREE.Mesh(geom, mat);
      mesh.frustumCulled = false;      // rebuilt in origin-relative coordinates
      mesh.renderOrder = 1;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      this.group.add(mesh);
      this.parts[name] = { mesh, geom, spec, built: -1, at: null };
    }
    this.stats = { vertices: 0 };
  }

  /**
   * @param {object} sources { boots: Track, wheels: Track }
   * @param {object} origin the floating origin
   * @param {object} cam { lat, lon }
   */
  /**
   * @param {object} sources { boots: Track, wheels: Track }
   * @param {object} origin the floating origin
   * @param {object} cam { lat, lon }
   * @param {object} light { mu0, mu, phase, albedo } the same geometry the
   *        terrain shader is given, so the marks track the surface
   */
  setLight(light) {
    if (!light) return;
    const mu0 = Math.max(0.02, Math.min(1, light.mu0));
    const mu = Math.max(0.05, Math.min(1, light.mu));
    const albedo = light.albedo ?? OPTICS.albedoMare;
    /* How much brighter the regolith is than a Lambertian surface of the same
       albedo would be, here and now: at thirty degrees of phase this is one by
       construction and at opposition it is several. The floor of one is the
       honest part of the approximation — this strip is Lambert and the ground
       is not, and the mismatch can only make the strip too dark, so it is
       never allowed to go below the surface it is lying on. */
    const boost = Math.max(1, Math.min(4, regolithBrdf(mu0, mu, light.phase || 0.5) / mu0));
    for (const [name, part] of Object.entries(this.parts)) {
      const v = Math.max(0, Math.min(1,
        albedo * boost * LAMBERT_MATCH * KIND[name].darken));
      /* Faintly warm, because the regolith is. */
      part.mesh.material.color.setRGB(v, v * 0.985, v * 0.955);
    }
  }

  update(sources, origin, cam) {
    this.stats.vertices = 0;
    for (const [name, part] of Object.entries(this.parts)) {
      const track = sources && sources[name];
      if (!track || track.size < 2) { part.mesh.visible = false; continue; }
      /* Rebuild when the line has grown, or when the origin has moved far
         enough that the vertices would be visibly wrong — not every frame. */
      const moved = !part.at ||
        surfaceDistance(cam.lat, cam.lon, part.at.lat, part.at.lon) > 60;
      if (track.size !== part.built || moved) {
        this.build(part, track, origin, cam);
        part.built = track.size;
        part.at = { lat: cam.lat, lon: cam.lon };
      }
      part.mesh.visible = part.count > 0;
      this.stats.vertices += part.count;
    }
  }

  /** One ribbon, in coordinates relative to the current floating origin. */
  build(part, track, origin, cam) {
    /* Only what is near enough to see. The recorder keeps thousands of points
       across a whole expedition and almost all of them are over the horizon. */
    const pts = [];
    for (const p of track.points) {
      if (surfaceDistance(cam.lat, cam.lon, p.lat, p.lon) > DRAW_RANGE) {
        /* A gap: end the current run rather than joining across the horizon. */
        if (pts.length && pts[pts.length - 1] !== null) pts.push(null);
        continue;
      }
      pts.push(p);
    }
    while (pts.length && pts[pts.length - 1] === null) pts.pop();

    const half = part.spec.half, lift = part.spec.lift, step = part.spec.step;
    const pos = [];
    const norm = [];
    const idx = [];
    let run = [];
    const flush = () => {
      if (run.length < 2) { run = []; return; }
      /* Resample before building. The recorder keeps a point only when it says
         something new, so a straight sixty-metre walk is five points — and a
         strip with a vertex every twelve metres is a plank laid over the
         ground rather than something on it: it bridges every hollow and buries
         itself in every rise. The ground is what the ribbon has to follow, so
         the spacing has to be the ground's, not the recorder's. */
      const fine = [];
      for (let i = 0; i + 1 < run.length; i++) {
        const a = run[i], b = run[i + 1];
        const d = surfaceDistance(a.lat, a.lon, b.lat, b.lon);
        const n = Math.max(1, Math.min(64, Math.ceil(d / step)));
        for (let k = 0; k < n; k++) {
          fine.push({ lat: a.lat + (b.lat - a.lat) * k / n,
                      lon: a.lon + (b.lon - a.lon) * k / n });
        }
      }
      fine.push(run[run.length - 1]);
      run = fine;

      const base = pos.length / 3;
      for (let i = 0; i < run.length; i++) {
        const p = run[i];
        /* The direction of travel here, from the neighbours, so the strip is
           square to the line rather than to the world. */
        const a = run[Math.max(0, i - 1)], b = run[Math.min(run.length - 1, i + 1)];
        const brg = bearing(a.lat, a.lon, b.lat, b.lon) * Math.PI / 180;
        const e = enuBasis(p.lat, p.lon);
        /* Across the direction of travel: rotate the heading by ninety
           degrees in the local horizontal plane. */
        const sx = e.e.x * Math.cos(brg) - e.n.x * Math.sin(brg);
        const sy = e.e.y * Math.cos(brg) - e.n.y * Math.sin(brg);
        const sz = e.e.z * Math.cos(brg) - e.n.z * Math.sin(brg);
        const h = this.hf.heightAt(p.lat, p.lon) + lift;
        const c = { x: 0, y: 0, z: 0 };
        llhToXyz(p.lat, p.lon, h, c);
        pos.push(c.x - origin.x - sx * half, c.y - origin.y - sy * half,
                 c.z - origin.z - sz * half);
        pos.push(c.x - origin.x + sx * half, c.y - origin.y + sy * half,
                 c.z - origin.z + sz * half);
        /* The normal is the ground's up, written rather than computed. A strip
           two vertices wide has no reliable geometric normal — computing one
           from the triangle winding gave a face pointing into the Moon, so the
           trail was unlit and came out black whatever colour it was given,
           which is a long way from where the colour looked like the problem. */
        norm.push(e.u.x, e.u.y, e.u.z, e.u.x, e.u.y, e.u.z);
      }
      for (let i = 0; i + 1 < run.length; i++) {
        const a = base + i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      run = [];
    };
    for (const p of pts) {
      if (p === null) flush(); else run.push(p);
    }
    flush();

    part.count = pos.length / 3;
    if (!part.count) { part.geom.setDrawRange(0, 0); return; }
    const arr = new Float32Array(pos);
    part.geom.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    part.geom.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(norm), 3));
    part.geom.setIndex(idx);
    part.geom.computeBoundingSphere();
  }

  dispose() {
    for (const p of Object.values(this.parts)) p.geom.dispose();
    for (const m of this.mats) m.dispose();
    this.group.removeFromParent();
  }
}
