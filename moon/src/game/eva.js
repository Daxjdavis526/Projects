/* =============================================================================
   EVA — being outside, in a suit, on foot
   -----------------------------------------------------------------------------
   Ties together the three things that make up walking on the Moon: the
   locomotion model in physics/player.js, the life support in physics/suit.js,
   and the small amount of light you brought with you.

   The cameras are here too, because first and third person are not two views of
   the same thing. In first person you are inside a helmet: the view sits where
   the eyes are, the head bobs with the gait, and the field of view is narrowed a
   little because a helmet is not a window onto everything. In third person you
   are watching a person move in a sixth of a gravity, which is worth watching,
   so the camera hangs back and lets the arcs read.

   The lamps matter more here than they would anywhere else. There is no sky
   light on the Moon, so a shadow is not merely darker: it is lit only by
   whatever the Earth happens to be throwing at it, which is about a ten
   thousandth of sunlight. Inside a crater at the wrong time of day, the lamps
   are the only reason there is anything to see at all, and they are also the
   reason the battery is the first consumable to run out down there.
   ========================================================================== */

import * as THREE from 'three';
import { Player, GAIT } from '../physics/player.js';
import { Suit } from '../physics/suit.js';
import { PLAYER } from '../config.js';
import { enuBasis, xyzToLlh } from '../physics/frames.js';

export const VIEW = { FIRST: 'first', THIRD: 'third' };

/* 120 Hz. Fast enough that a push-off and the contact after it are both
   resolved, cheap enough that a slow frame catching up costs nothing. */
const FIXED_STEP = 1 / 120;

/* Three lamps, because one is never the right one. The headlamp is for reading
   the ground in front of your boots, the flood is for not walking into things,
   and the beam is for looking into a crater you are standing on the rim of. */
const LAMPS = [
  { id: 'flood', angle: 0.95, distance: 45, intensity: 22, penumbra: 0.9, on: true },
  { id: 'head', angle: 0.38, distance: 110, intensity: 55, penumbra: 0.45, on: true },
  { id: 'beam', angle: 0.10, distance: 900, intensity: 260, penumbra: 0.2, on: false },
];

export class EVA {
  /**
   * @param {object} opts { stage, heightfield, quality, lat, lon, yaw, suitMode }
   */
  constructor(opts) {
    this.stage = opts.stage;
    this.heightfield = opts.heightfield;
    this.player = new Player({
      lat: opts.lat, lon: opts.lon, yaw: opts.yaw ?? 90,
      ground: opts.heightfield,
    });
    this.suit = new Suit({ mode: opts.suitMode });
    this.view = VIEW.FIRST;
    this.lampMode = 0;                  // 0 off, 1 flood+head, 2 all three
    this.model = null;
    this.group = new THREE.Group();
    opts.stage.world.add(this.group);

    /* Lamps live on a small rig that is moved to the helmet every frame rather
       than parented to the model, so they work before the astronaut has been
       built and keep working in first person when the model is hidden. */
    this.lampRig = new THREE.Group();
    this.group.add(this.lampRig);
    this.lamps = LAMPS.map((spec) => {
      const light = new THREE.SpotLight(0xfff3e2, 0, spec.distance, spec.angle, spec.penumbra, 1.1);
      light.visible = false;
      light.castShadow = false;
      light.target.position.set(0, 0, -1);
      light.add(light.target);
      this.lampRig.add(light);
      return { spec, light };
    });
    /* Only the headlamp casts a shadow, and only on the better settings: three
       shadow-casting spot lights on top of the terrain's own cascade is more
       than the frame can afford. */
    if (opts.quality && opts.quality.shadow >= 2048) {
      const head = this.lamps.find(l => l.spec.id === 'head');
      head.light.castShadow = true;
      head.light.shadow.mapSize.set(1024, 1024);
      head.light.shadow.camera.near = 0.4;
      head.light.shadow.camera.far = lampShadowFar(head.spec.distance);
      head.light.shadow.bias = -0.0012;
    }

    this._eye = { x: 0, y: 0, z: 0 };
    this._basis = null;
    this._q = new THREE.Quaternion();
    this._m = new THREE.Matrix4();
    this._up = new THREE.Vector3();
    this._fwd = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this.jumpEdge = false;
  }

  /** Attach the astronaut once it has been built. */
  setModel(model) {
    if (this.model) this.group.remove(this.model.group);
    this.model = model;
    if (model) this.group.add(model.group);
  }

  toggleView() { this.view = this.view === VIEW.FIRST ? VIEW.THIRD : VIEW.FIRST; }
  cycleLamps() { this.lampMode = (this.lampMode + 1) % 3; }

  place(lat, lon, agl = 0) { this.player.place(lat, lon, agl); }

  /**
   * @param {number} dt seconds
   * @param {object} input { forward, strafe, run, jump, jet, dYaw, dPitch }
   * @param {object} env   { sunlit, inShelter, timeScale }
   */
  step(dt, input, env = {}) {
    const p = this.player;
    if (input.dYaw) p.yaw -= input.dYaw;
    if (input.dPitch) p.pitch = Math.max(-1.5, Math.min(1.5, p.pitch - input.dPitch));

    /* A jump is an edge, not a state: holding the key must not pogo. */
    let jump = input.jump && !this.jumpEdge;
    this.jumpEdge = !!input.jump;

    /* Locomotion runs at a fixed rate regardless of the frame rate. A bound has
       an airborne phase measured in tenths of a second, and stepping it once per
       frame on a slow machine loses most of the contact time, which quietly
       halves how hard you can push off the ground. */
    const unconscious = this.suit.unconscious;
    const command = unconscious ? {} : {
      forward: input.forward, strafe: input.strafe,
      run: input.run, jump, jet: input.jet,
    };
    this.accumulator = Math.min(0.25, (this.accumulator || 0) + dt);
    while (this.accumulator >= FIXED_STEP) {
      p.step(FIXED_STEP, command);
      this.accumulator -= FIXED_STEP;
      command.jump = false;             // one jump per press, not one per substep
    }

    /* Life support runs on simulated time, which may be running fast. */
    this.suit.step(dt * (env.timeScale ?? 1), {
      exertion: p.exertion,
      sunlit: env.sunlit !== false,
      lights: this.lampMode > 0,
      inShelter: env.inShelter,
    });
    return this;
  }

  /** Where the eyes are, in world coordinates, and which way they look. */
  camera() {
    const p = this.player;
    const u = p.up();
    const b = enuBasis(p.llh.lat, p.llh.lon);
    const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
    const cp = Math.cos(p.pitch), sp = Math.sin(p.pitch);
    const fx = (b.n.x * cy + b.e.x * sy), fy = (b.n.y * cy + b.e.y * sy), fz = (b.n.z * cy + b.e.z * sy);
    const dir = { x: fx * cp + u.x * sp, y: fy * cp + u.y * sp, z: fz * cp + u.z * sp };

    const eyeH = PLAYER.eye + p.bob;
    const head = { x: p.pos.x + u.x * eyeH, y: p.pos.y + u.y * eyeH, z: p.pos.z + u.z * eyeH };

    if (this.view === VIEW.FIRST) {
      this._eye = head;
      return { eye: head, dir, up: u, head, fov: 52 };
    }

    /* Third person: behind and a little above, and never underground. The Moon
       has no haze to hide a camera in a hillside, so the clamp is not optional. */
    const back = 4.2, lift = 1.5;
    const e = {
      x: head.x - dir.x * back + u.x * lift,
      y: head.y - dir.y * back + u.y * lift,
      z: head.z - dir.z * back + u.z * lift,
    };
    const llh = this.heightfield ? xyzToLlh(e.x, e.y, e.z) : null;
    if (llh) {
      const g = this.heightfield.heightAt(llh.lat, llh.lon) + 1.2;
      if (llh.h < g) {
        const lift2 = g - llh.h;
        e.x += u.x * lift2; e.y += u.y * lift2; e.z += u.z * lift2;
      }
    }
    /* Look at the figure rather than along the same ray, so the astronaut stays
       framed while the view swings. */
    const look = { x: head.x - e.x, y: head.y - e.y, z: head.z - e.z };
    const ll = Math.hypot(look.x, look.y, look.z) || 1;
    this._eye = e;
    return { eye: e, dir: { x: look.x / ll, y: look.y / ll, z: look.z / ll }, up: u, head, fov: 55 };
  }

  /**
   * Put the lamps on the helmet and point them where the player is looking.
   * `origin` is the renderer's floating origin, since lights live in render
   * space like everything else.
   */
  updateLights(origin, cameraFrame) {
    const on = this.lampMode > 0;
    const head = cameraFrame.head, dir = cameraFrame.dir;
    this.lampRig.position.set(head.x - origin.x, head.y - origin.y, head.z - origin.z);
    for (const { spec, light } of this.lamps) {
      const wanted = on && (spec.id !== 'beam' || this.lampMode === 2);
      light.visible = wanted;
      if (!wanted) continue;
      light.intensity = spec.intensity;
      light.position.set(0, 0, 0);
      light.target.position.set(dir.x * 10, dir.y * 10, dir.z * 10);
      light.target.updateMatrixWorld();
    }
    if (this.model) {
      this.model.setHelmetLights(on);
      this.model.group.visible = this.view === VIEW.THIRD;
    }
  }

  /** Stand the astronaut model up at the player's position. */
  updateModel(origin, dt) {
    if (!this.model) return;
    const p = this.player;
    const u = p.up();
    const b = enuBasis(p.llh.lat, p.llh.lon);
    /* The model is authored +Y up, +X east, +Z south, so the columns are east,
       up, and south, and the yaw turns it about the local vertical. */
    const cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
    const east = this._right.set(b.e.x * cy - b.n.x * sy, b.e.y * cy - b.n.y * sy, b.e.z * cy - b.n.z * sy);
    const south = this._fwd.set(-(b.n.x * cy + b.e.x * sy), -(b.n.y * cy + b.e.y * sy), -(b.n.z * cy + b.e.z * sy));
    this._up.set(u.x, u.y, u.z);
    this._m.makeBasis(east, this._up, south);
    this.model.group.quaternion.setFromRotationMatrix(this._m);
    this.model.group.position.set(p.pos.x - origin.x, p.pos.y - origin.y, p.pos.z - origin.z);
    this.model.animate({
      gait: p.gait, speed: p.speed, stepPhase: p.stepPhase, grounded: p.grounded,
      jetOn: p.jetOn, exertion: p.exertion, dt,
    });
  }

  snapshot() {
    return {
      player: this.player.snapshot(),
      suit: this.suit.snapshot(),
      view: this.view, lamps: this.lampMode,
    };
  }
}

/* A shadow camera that reaches no further than the lamp does. */
function lampShadowFar(distance) { return Math.max(20, distance); }

export { GAIT };
