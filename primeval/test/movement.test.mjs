// Walking and jumping, driven headlessly.
//
// Written after "movement and jumping are glitchy". Three separate faults, all
// invisible in a stack trace and all obvious the moment you count frames:
// walking downhill dropped the ground flag on almost every frame, a jump
// pressed a fraction early was thrown away, and stepping off a lip cancelled
// the jump you were already in the middle of pressing.

import { test, assert } from './harness.mjs';
import * as THREE from 'three';
import { Player } from '../src/player/player.js';
import { PLAYER } from '../src/config.js';

export const NAME = 'player/movement';

/** Just enough of the input system to drive a player. */
function fakeInput() {
  return {
    held: new Set(),
    hits: new Set(),
    mouse: { dx: 0, dy: 0 },
    sensitivity: 1,
    locked: true,
    down(code) { return this.held.has(code); },
    any(codes) { return codes.some(c => this.held.has(c)); },
    hit(code) { return this.hits.has(code); },
    moveAxis() {
      let x = 0, z = 0;
      if (this.down('KeyW')) z += 1;
      if (this.down('KeyS')) z -= 1;
      if (this.down('KeyD')) x += 1;
      if (this.down('KeyA')) x -= 1;
      const l = Math.hypot(x, z);
      return l > 1 ? { x: x / l, z: z / l } : { x, z };
    },
    anyHit(codes) { return codes.some(c => this.hits.has(c)); },
    press(code) { this.held.add(code); this.hits.add(code); },
    release(code) { this.held.delete(code); },
    endFrame() { this.hits.clear(); },
  };
}

/** A plane of constant slope, dropping away toward +x. */
function ramp(grade) {
  return { gravity: 11.4, heightAt: (x) => -x * grade, waterAt: () => null };
}

/** Flat ground that ends at x = edge, beyond which it is a long way down. */
function ledge(edge) {
  return { gravity: 11.4, heightAt: (x) => (x < edge ? 0 : -4000), waterAt: () => null };
}

function makePlayer(world) {
  const p = new Player(new THREE.PerspectiveCamera(), null);
  p.pos.set(0, world.heightAt(0, 0), 0);
  p.yaw = -Math.PI / 2;          // face +x
  return p;
}

/** Step n frames; returns how many ended airborne. */
function step(p, world, input, frames, dt, before) {
  let airborne = 0;
  for (let i = 0; i < frames; i++) {
    if (before) before(i, input);
    p.update(dt, input, world, { survival: false });
    input.endFrame();
    if (!p.grounded) airborne++;
  }
  return airborne;
}

export async function run() {
  test('running downhill does not bounce off the ground every frame', () => {
    const world = ramp(0.6);                 // ~31 degrees
    const p = makePlayer(world);
    const input = fakeInput();
    input.press('KeyW');
    input.press('ShiftLeft');
    const airborne = step(p, world, input, 120, 1 / 60);
    assert(p.pos.x > 8, `did not actually run anywhere (x=${p.pos.x.toFixed(1)})`);
    assert(airborne <= 2, `left the ground on ${airborne} of 120 frames running downhill`);
  });

  test('a jump pressed just before landing still fires', () => {
    const world = ramp(0);
    const p = makePlayer(world);
    const input = fakeInput();
    step(p, world, input, 3, 1 / 60);

    // Falling, about a tenth of a second from touchdown — closer than a frame
    // but further than the ground snap, so the press cannot land on the same
    // frame it is made. Without a buffer this jump is thrown away.
    p.grounded = false;
    p.coyote = 0;
    p.pos.y = 0.55;
    p.vel.y = -5;
    input.press('Space');

    let jumped = false;
    for (let i = 0; i < 12; i++) {
      p.update(1 / 60, input, world, { survival: false });
      input.endFrame();
      input.release('Space');
      if (p.vel.y > 1) { jumped = true; break; }
    }
    assert(jumped, 'a jump pressed just before landing was swallowed');
  });

  test('you can still jump a moment after walking off an edge', () => {
    const world = ledge(3);
    const p = makePlayer(world);
    const input = fakeInput();
    input.press('KeyW');
    // Walk off the edge.
    let leftGround = -1;
    for (let i = 0; i < 300 && leftGround < 0; i++) {
      p.update(1 / 60, input, world, { survival: false });
      input.endFrame();
      if (!p.grounded && p.pos.x > 3) leftGround = i;
    }
    assert(leftGround >= 0, 'never walked off the ledge');
    // One frame later — well inside the coyote window — jump.
    input.press('Space');
    p.update(1 / 60, input, world, { survival: false });
    input.endFrame();
    assert(p.vel.y > 1, `coyote jump did not fire (vel.y=${p.vel.y.toFixed(2)})`);
  });

  test('the coyote window does not let you jump out of a real fall', () => {
    const world = ledge(3);
    const p = makePlayer(world);
    const input = fakeInput();
    input.press('KeyW');
    for (let i = 0; i < 400 && p.pos.y > -6; i++) {
      p.update(1 / 60, input, world, { survival: false });
      input.endFrame();
    }
    input.release('KeyW');
    assert(!p.grounded, 'should still be falling');
    assert(p.pos.y < -5, `should have fallen well past the lip (y=${p.pos.y.toFixed(1)})`);
    const before = p.vel.y;
    input.press('Space');
    p.update(1 / 60, input, world, { survival: false });
    input.endFrame();
    assert(p.vel.y < before + 0.5, 'jumped in mid-air, long after leaving the ground');
  });

  test('an exhausted player is not silently unable to jump', () => {
    const world = ramp(0);
    const p = makePlayer(world);
    const input = fakeInput();
    step(p, world, input, 3, 1 / 60);        // settle onto the ground first
    p.stamina = PLAYER.jumpCost - 1;         // less than a jump costs
    input.press('Space');
    p.update(1 / 60, input, world, { survival: false });
    input.endFrame();
    assert(p.vel.y > 1, 'a low-stamina jump did nothing at all');
    assert(p.stamina >= 0, 'stamina went negative');
  });

  test('standing still on flat ground stays perfectly still', () => {
    const world = ramp(0);
    const p = makePlayer(world);
    const input = fakeInput();
    step(p, world, input, 60, 1 / 60);
    assert(p.grounded, 'fell off flat ground while standing on it');
    assert(Math.abs(p.pos.y) < 1e-3, `drifted vertically to ${p.pos.y}`);
    assert(Math.hypot(p.pos.x, p.pos.z) < 1e-3, 'slid while standing still');
  });
}
