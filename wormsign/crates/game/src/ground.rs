//! Streaming the desert in and out around the player.
//!
//! The core crate says which tiles should exist ([`desired_tiles`]) and how to
//! build one ([`build_tile`]). This module spends a fixed slice of each frame
//! building whatever is missing, nearest first, and swaps old tiles for new
//! ones without ever leaving a hole:
//!
//! - a new tile is spawned hidden;
//! - an old tile is removed only once every new tile covering the same ground
//!   is built, and those are revealed in the same frame.
//!
//! So a walk or a 40 m/s ride never waits on the terrain; at worst the
//! distance goes on showing a coarser tile for a moment longer.

use bevy::asset::RenderAssetUsages;
use bevy::mesh::{Indices, PrimitiveTopology};
use bevy::platform::collections::{HashMap, HashSet};
use bevy::platform::time::Instant;
use bevy::prelude::*;
use wormsign_core::glam::DVec3;
use wormsign_core::lod::{desired_tiles, TileKey};
use wormsign_core::tilemesh::build_tile;

use crate::world::{Desert, OriginAnchor, Phase, WorldPos};

/// Milliseconds of tile building per frame once the game is running.
const BUDGET_MS: f64 = 4.0;
/// While the loading screen is up, spend much more.
const LOADING_BUDGET_MS: f64 = 40.0;
/// Re-plan the tile set when the player has moved this far.
const REPLAN_M: f64 = 8.0;

pub struct GroundPlugin;

impl Plugin for GroundPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<Tiles>()
            .add_systems(Startup, setup_material)
            .add_systems(Update, stream.after(Phase::Simulate).before(Phase::Place));
    }
}

#[derive(Resource, Default)]
pub struct Tiles {
    live: HashMap<TileKey, (Entity, bool)>,
    desired: Vec<TileKey>,
    desired_set: HashSet<TileKey>,
    planned_at: Option<DVec3>,
    material: Handle<StandardMaterial>,
    /// True once everything wanted at startup has been built.
    pub ready: bool,
    /// Fraction of the desired set that is built, for the loading bar.
    pub progress: f32,
    pub built_total: u32,
}

impl Tiles {
    pub fn live_count(&self) -> usize {
        self.live.len()
    }
}

/// Marks a terrain tile entity, carrying its key for debugging.
#[derive(Component)]
#[allow(dead_code)]
pub struct Tile(pub TileKey);

fn setup_material(mut tiles: ResMut<Tiles>, mut materials: ResMut<Assets<StandardMaterial>>) {
    tiles.material = materials.add(StandardMaterial {
        base_color: Color::WHITE,
        perceptual_roughness: 0.94,
        reflectance: 0.18,
        ..default()
    });
}

/// Does one tile overlap the other? In a quadtree, only if one contains the
/// other.
fn overlaps(a: TileKey, b: TileKey) -> bool {
    let (fine, coarse) = if a.level <= b.level { (a, b) } else { (b, a) };
    let d = coarse.level - fine.level;
    (fine.ix >> d) == coarse.ix && (fine.iz >> d) == coarse.iz
}

fn stream(
    mut commands: Commands,
    mut tiles: ResMut<Tiles>,
    desert: Res<Desert>,
    mut meshes: ResMut<Assets<Mesh>>,
    player: Query<&WorldPos, With<OriginAnchor>>,
    mut vis: Query<&mut Visibility, With<Tile>>,
) {
    let Ok(p) = player.single() else { return };
    let p = p.0;

    let replan = match tiles.planned_at {
        None => true,
        Some(at) => (p - at).x.hypot((p - at).z) > REPLAN_M,
    };
    if replan {
        let d = desired_tiles(p.x, p.z);
        tiles.desired_set = d.iter().copied().collect();
        tiles.desired = d;
        tiles.planned_at = Some(p);
    }

    // Build what is missing, nearest first, inside the frame budget.
    let budget = if tiles.ready { BUDGET_MS } else { LOADING_BUDGET_MS };
    let start = Instant::now();
    let mut built_now = 0;
    for i in 0..tiles.desired.len() {
        let key = tiles.desired[i];
        if tiles.live.contains_key(&key) {
            continue;
        }
        if built_now > 0 && start.elapsed().as_secs_f64() * 1000.0 > budget {
            break;
        }
        let tm = build_tile(&desert.0, key);
        let mesh = to_mesh(&tm);
        let (ox, oz) = key.origin();
        let e = commands
            .spawn((
                Tile(key),
                Mesh3d(meshes.add(mesh)),
                MeshMaterial3d(tiles.material.clone()),
                WorldPos(DVec3::new(ox, 0.0, oz)),
                Transform::default(),
                Visibility::Hidden,
            ))
            .id();
        tiles.live.insert(key, (e, false));
        built_now += 1;
        tiles.built_total += 1;
    }

    // Swap: an obsolete tile goes when everything replacing it is built.
    let obsolete: Vec<TileKey> =
        tiles.live.keys().filter(|k| !tiles.desired_set.contains(*k)).copied().collect();
    let mut reveal: Vec<TileKey> = Vec::new();
    for old in &obsolete {
        let covering: Vec<TileKey> = tiles.desired.iter().filter(|d| overlaps(**d, *old)).copied().collect();
        if covering.iter().all(|c| tiles.live.contains_key(c)) {
            if let Some((e, _)) = tiles.live.remove(old) {
                commands.entity(e).despawn();
            }
            reveal.extend(covering);
        }
    }
    // A hidden tile with nothing old underneath it can show at once.
    let remaining_old: Vec<TileKey> =
        tiles.live.keys().filter(|k| !tiles.desired_set.contains(*k)).copied().collect();
    for (k, (_, shown)) in tiles.live.iter() {
        if !shown && tiles.desired_set.contains(k) && !remaining_old.iter().any(|o| overlaps(*o, *k)) {
            reveal.push(*k);
        }
    }
    for k in reveal {
        if let Some((e, shown)) = tiles.live.get_mut(&k) {
            if !*shown {
                *shown = true;
                if let Ok(mut v) = vis.get_mut(*e) {
                    *v = Visibility::Inherited;
                } else {
                    // Spawned this frame; the command queue has not run yet.
                    commands.entity(*e).insert(Visibility::Inherited);
                }
            }
        }
    }

    let have = tiles.desired.iter().filter(|k| tiles.live.contains_key(*k)).count();
    tiles.progress = have as f32 / tiles.desired.len().max(1) as f32;
    if !tiles.ready && have == tiles.desired.len() {
        tiles.ready = true;
    }
}

/// Sand and rock colours, linear. Slip faces read slightly darker and warmer
/// than the windward slopes, which is what gives real dune fields their
/// banding from the air.
fn to_mesh(tm: &wormsign_core::tilemesh::TileMesh) -> Mesh {
    // Real dune sand has an albedo around 0.35-0.45; brighter than that and
    // the tonemapper flattens every dune into the same cream.
    let sand_lit = Vec3::new(0.50, 0.31, 0.15);
    let sand_steep = Vec3::new(0.40, 0.22, 0.10);
    let rock_col = Vec3::new(0.12, 0.075, 0.05);
    let colors: Vec<[f32; 4]> = tm
        .normals
        .iter()
        .zip(&tm.rock)
        .map(|(n, &r)| {
            let steep = ((1.0 - n[1]) * 3.2).clamp(0.0, 1.0);
            let sand = sand_lit.lerp(sand_steep, steep);
            let c = sand.lerp(rock_col, r.clamp(0.0, 1.0));
            [c.x, c.y, c.z, 1.0]
        })
        .collect();
    Mesh::new(PrimitiveTopology::TriangleList, RenderAssetUsages::RENDER_WORLD)
        .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, tm.positions.clone())
        .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, tm.normals.clone())
        .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, colors)
        .with_inserted_indices(Indices::U32(tm.indices.clone()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn overlap_is_containment() {
        let root = TileKey { level: 3, ix: -1, iz: 2 };
        for c in root.children() {
            assert!(overlaps(c, root) && overlaps(root, c));
            for g in c.children() {
                assert!(overlaps(g, root));
            }
        }
        assert!(!overlaps(TileKey { level: 3, ix: 0, iz: 2 }, TileKey { level: 1, ix: -1, iz: 8 }));
        assert!(overlaps(TileKey { level: 3, ix: -1, iz: 2 }, TileKey { level: 1, ix: -1, iz: 8 }));
    }
}
