// The collision helper. Written after a floor slab spent an afternoon
// shoving the player across the observation lounge.

import { test, assert, near } from './harness.mjs';
import * as THREE from 'three';
import { Colliders } from '../src/player/physics.js';

export const NAME = 'player/physics';

export async function run() {
  test('a floor you are standing on is not a wall', () => {
    const c = new Colliders();
    // A 20 x 20 slab whose top face is at y = 0.
    c.addBox(0, -0.25, 0, 10, 0.25, 10, 0, 'floor');
    // Gravity has just dipped the player a couple of centimetres into it.
    const p = new THREE.Vector3(0, -0.02, 0);
    c.resolve(p, 0.42, 1.68, 0.62);
    near(p.x, 0, 1e-6, 'player was pushed in x');
    near(p.z, 0, 1e-6, 'player was pushed in z');
  });

  test('a wall pushes you out along its shallow axis', () => {
    const c = new Colliders();
    c.addBox(0, 1.75, 3, 5, 1.75, 0.2, 0, 'wall');
    const p = new THREE.Vector3(0, 0, 2.9);
    c.resolve(p, 0.42, 1.68, 0.62);
    assert(p.z < 2.9, `expected to be pushed back, ended at z=${p.z.toFixed(3)}`);
    assert(p.z < 3 - 0.2 - 0.42 + 0.001, 'still overlapping the wall');
    near(p.x, 0, 1e-6, 'pushed sideways when it should have been backwards');
  });

  test('a step you can climb is not an obstruction', () => {
    const c = new Colliders();
    c.addBox(0, 0.2, 2, 4, 0.2, 2, 0, 'step');   // top at 0.4 m
    const p = new THREE.Vector3(0, 0, 2);
    c.resolve(p, 0.42, 1.68, 0.62);
    near(p.z, 2, 1e-6, 'a 0.4 m step blocked the player');
  });

  test('a step you cannot climb does obstruct', () => {
    const c = new Colliders();
    c.addBox(0, 1.0, 2, 4, 1.0, 2, 0, 'ledge');  // top at 2 m
    const p = new THREE.Vector3(0, 0, 1.0);
    c.resolve(p, 0.42, 1.68, 0.62);
    assert(p.z < 1.0, `expected obstruction, ended at z=${p.z.toFixed(3)}`);
  });

  test('surfaceAt finds the highest thing you could stand on', () => {
    const c = new Colliders();
    c.addBox(0, -0.25, 0, 10, 0.25, 10, 0, 'floor');   // top 0
    c.addBox(0, 1.0, 0, 2, 0.1, 2, 0, 'table');        // top 1.1
    assert(c.surfaceAt(0, 0, 5, 0.4) === 1.1, 'did not find the table');
    assert(c.surfaceAt(0, 0, 0.5, 0.4) === 0, 'stood on a table above head height');
    assert(c.surfaceAt(50, 50, 5, 0.4) === -Infinity, 'found ground where there is none');
  });

  test('rotated boxes still resolve in their own frame', () => {
    const c = new Colliders();
    c.addBox(0, 1.75, 0, 4, 1.75, 0.25, Math.PI / 4, 'diagonal wall');
    const p = new THREE.Vector3(0.1, 0, 0.1);
    const before = p.clone();
    c.resolve(p, 0.42, 1.68, 0.62);
    assert(p.distanceTo(before) > 0.1, 'the diagonal wall did nothing');
    // Pushed roughly perpendicular to the wall, i.e. along (1,-1)/sqrt2.
    const d = p.clone().sub(before).normalize();
    assert(Math.abs(Math.abs(d.x) - Math.abs(d.z)) < 0.25,
      `push direction ${d.x.toFixed(2)},${d.z.toFixed(2)} is not perpendicular to the wall`);
  });

  test('disabled colliders are inert', () => {
    const c = new Colliders();
    const b = c.addBox(0, 1.75, 1, 4, 1.75, 0.2, 0, 'wall');
    b.enabled = false;
    const p = new THREE.Vector3(0, 0, 1);
    c.resolve(p, 0.42, 1.68, 0.62);
    near(p.z, 1, 1e-6, 'a disabled collider still pushed');
  });

  test('raycast finds the nearest box', () => {
    const c = new Colliders();
    c.addBox(0, 1, 10, 3, 1, 0.5, 0, 'far');
    c.addBox(0, 1, 5, 3, 1, 0.5, 0, 'near');
    const t = c.raycast(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), 50);
    near(t, 4.5, 0.01, 'ray hit the wrong box');
  });
}
