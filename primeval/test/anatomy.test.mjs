// Every animal in the bestiary must build into a sane, finite mesh.
// This suite exists because a single Math.pow(-1e-8, 0.62) once poisoned an
// entire forest with NaN, and nothing in the browser said so.

import { test, assert, finite } from './harness.mjs';
import { buildCreature } from '../src/life/anatomy.js';
import { SPECIES, SPECIES_LIST, creatureHeight, creatureRadius, dangerWord } from '../src/life/species.js';
import {
  canopyTree, treeFern, giantFern, cycad, stiltTree, spireTree, snag,
  berryBush, grassClump, reeds, glowcap, boulder, obsidian, driftwood,
} from '../src/world/props.js';

export const NAME = 'life + props';

function checkGeometry(g, label) {
  assert(g, `${label}: no geometry`);
  const pos = g.attributes.position.array;
  assert(pos.length > 0, `${label}: empty geometry`);
  for (let i = 0; i < pos.length; i++) {
    if (!Number.isFinite(pos[i])) throw new Error(`${label}: NaN at position[${i}]`);
  }
  const col = g.attributes.color?.array;
  if (col) {
    for (let i = 0; i < col.length; i++) {
      if (!Number.isFinite(col[i])) throw new Error(`${label}: NaN in colour[${i}]`);
    }
  }
  // Merged props are indexed; a few single-primitive ones (boulder) are not.
  // Either is fine to render — what matters is that indices, when present,
  // address real vertices.
  const maxIndex = g.attributes.position.count - 1;
  if (g.index) {
    assert(g.index.count % 3 === 0, `${label}: index count ${g.index.count} is not whole triangles`);
    for (let i = 0; i < g.index.count; i++) {
      const v = g.index.array[i];
      assert(v >= 0 && v <= maxIndex, `${label}: index ${v} out of range (max ${maxIndex})`);
    }
  } else {
    assert(g.attributes.position.count % 3 === 0, `${label}: unindexed but not whole triangles`);
  }
}

export async function run() {
  for (const sp of SPECIES_LIST) {
    test(`${sp.name} builds`, () => {
      const { geometry, bones, rig } = buildCreature(sp.body, 7 + sp.name.length * 13);
      checkGeometry(geometry, sp.name);
      assert(bones.length >= 10, `${sp.name}: only ${bones.length} bones`);
      assert(rig.legs.length === (sp.body.biped ? 2 : 4),
        `${sp.name}: ${rig.legs.length} legs for a ${sp.body.biped ? 'biped' : 'quadruped'}`);
      assert(rig.head && rig.jaw, `${sp.name}: missing head or jaw bone`);

      // Skin weights must be normalised or the mesh tears apart when posed.
      const sw = geometry.attributes.skinWeight.array;
      for (let i = 0; i < sw.length; i += 4) {
        const sum = sw[i] + sw[i + 1] + sw[i + 2] + sw[i + 3];
        assert(sum > 0.98 && sum < 1.02, `${sp.name}: skin weights sum to ${sum.toFixed(3)}`);
      }
      // Skin indices must address real bones.
      const si = geometry.attributes.skinIndex.array;
      for (let i = 0; i < si.length; i++) {
        assert(si[i] < bones.length, `${sp.name}: skinIndex ${si[i]} exceeds ${bones.length} bones`);
      }
    });

    test(`${sp.name} matches its stated size`, () => {
      const { geometry } = buildCreature(sp.body, 3);
      geometry.computeBoundingBox();
      const bb = geometry.boundingBox;
      const len = bb.max.z - bb.min.z;
      const ratio = len / sp.lengthM;
      // Wingspan, where a species has one, is measured across instead.
      if (sp.wingspanM) {
        const span = bb.max.x - bb.min.x;
        const sr = span / sp.wingspanM;
        assert(sr > 0.7 && sr < 1.3,
          `${sp.name}: wingspan is ${span.toFixed(1)} m but the table says ${sp.wingspanM} m`);
      }
      assert(ratio > 0.7 && ratio < 1.3,
        `${sp.name}: mesh is ${len.toFixed(1)} m but the table says ${sp.lengthM} m`);
    });

    test(`${sp.name} stands on the ground`, () => {
      const { geometry, rig } = buildCreature(sp.body, 5);
      geometry.computeBoundingBox();
      const low = geometry.boundingBox.min.y;
      // Feet at y=0: anything much below is a creature buried in the terrain,
      // anything much above is one floating over it.
      assert(low > -0.45 && low < 0.35,
        `${sp.name}: lowest vertex at y=${low.toFixed(2)}`);
      for (const leg of rig.legs) {
        const toe = leg.toe.userData.world;
        assert(Math.abs(toe.y) < 0.35, `${sp.name}: a toe rests at y=${toe.y.toFixed(2)}`);
      }
    });
  }

  test('species metadata is complete', () => {
    for (const sp of SPECIES_LIST) {
      assert(sp.name && sp.binomial && sp.klass, `${sp.id}: missing naming`);
      assert(sp.scan && sp.scan.length > 40, `${sp.id}: scanner text too thin`);
      assert(sp.stats.run > sp.stats.walk, `${sp.id}: runs slower than it walks`);
      assert(sp.stats.health > 0 && sp.lengthM > 0, `${sp.id}: nonsense stats`);
      assert(Object.keys(sp.spawn.biomes).length > 0 || sp.spawn.aquatic,
        `${sp.id}: lives nowhere`);
      finite(creatureHeight(sp), `${sp.id} height`);
      finite(creatureRadius(sp), `${sp.id} radius`);
      assert(dangerWord(sp.danger).length > 0, `${sp.id}: no danger word`);
    }
  });

  test('predators are dangerous and herbivores mostly are not', () => {
    assert(SPECIES.ashmaw.danger >= 8, 'the apex predator is not rated dangerous');
    assert(SPECIES.dartleg.danger === 0, 'the food is rated dangerous');
    assert(SPECIES.dreadcrown.stats.health > SPECIES.ashmaw.stats.health,
      'the rare apex is not tougher than the common one');
  });

  const props = {
    canopyTree, treeFern, giantFern, cycad, stiltTree, spireTree, snag,
    berryBush, grassClump, reeds, glowcap, boulder, obsidian, driftwood,
  };
  for (const [name, fn] of Object.entries(props)) {
    test(`${name} builds clean`, () => {
      for (let seed = 1000; seed < 1004; seed++) {
        const g = fn(seed, 1);
        checkGeometry(g, `${name}#${seed}`);
        assert(g.attributes.aSway, `${name}: no sway attribute — wind will not touch it`);
      }
    });
  }
}
