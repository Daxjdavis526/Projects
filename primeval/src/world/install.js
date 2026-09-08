// Wires the world systems into a Game. Kept separate so game.js does not need
// to know the full cast.

import * as THREE from 'three';
import { Vegetation } from './vegetation.js';

export function installWorld(game) {
  game.vegetation = game.addSystem(new VegetationSystem());
  return game;
}

class VegetationSystem {
  async load(game) {
    this.veg = new Vegetation(game.scene, game.quality);
    game.veg = this.veg;
    const p = game.player.pos;
    // Grow the whole first field before the player ever sees the ground.
    this.veg.update(0, p.x, p.z, p.y);
    let guard = 0;
    while (this.veg.job && guard++ < 400) this.veg._stepJob();
  }

  update(dt, game) {
    if (game.locale.id !== 'planet') { this.veg.group.visible = false; return; }
    const c = game.camera.position;
    this.veg.update(dt, c.x, c.z, c.y);
    this.veg.setNightGlow(game.daylight.nightT);
    // Trunks are solid. Push the player out of any they are standing in.
    if (game.mode === 'ON_FOOT') pushOut(game.player.pos, 0.42, this.veg.treeColliders);
  }
}

const _d = new THREE.Vector2();

/** Shove a point out of a list of vertical cylinders. */
export function pushOut(pos, radius, cylinders) {
  for (const c of cylinders) {
    if (pos.y > c.y + c.h || pos.y + 1.8 < c.y) continue;
    const dx = pos.x - c.x, dz = pos.z - c.z;
    const rr = c.r + radius;
    const d2 = dx * dx + dz * dz;
    if (d2 >= rr * rr || d2 < 1e-8) continue;
    const d = Math.sqrt(d2);
    const push = (rr - d) / d;
    pos.x += dx * push;
    pos.z += dz * push;
  }
}
