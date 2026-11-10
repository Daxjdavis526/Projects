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
use wormsign_core::shade::HeightCache;
use wormsign_core::tilemesh::build_tile_shaded;
use bevy::pbr::{ExtendedMaterial, MaterialExtension};
use bevy::render::render_resource::{AsBindGroup, ShaderType};
use bevy::shader::ShaderRef;

use crate::world::{Desert, Origin, OriginAnchor, Phase, WorldPos};

/// Milliseconds of tile building per frame once the game is running.
const BUDGET_MS: f64 = 4.0;
/// While the loading screen is up, spend much more.
const LOADING_BUDGET_MS: f64 = 40.0;
/// Re-plan the tile set when the player has moved this far.
const REPLAN_M: f64 = 8.0;

pub struct GroundPlugin;

impl Plugin for GroundPlugin {
    fn build(&self, app: &mut App) {
        bevy::asset::embedded_asset!(app, "sand.wgsl");
        app.add_plugins(MaterialPlugin::<SandMaterial>::default())
            .init_resource::<Tiles>()
            .add_systems(Startup, setup_material)
            .add_systems(Update, stream.after(Phase::Simulate).before(Phase::Place))
            .add_systems(Update, sand_params.in_set(Phase::View));
    }
}

#[derive(Resource, Default)]
pub struct Tiles {
    live: HashMap<TileKey, (Entity, bool)>,
    desired: Vec<TileKey>,
    desired_set: HashSet<TileKey>,
    planned_at: Option<DVec3>,
    material: Handle<SandMaterial>,
    /// Heights shared between tiles for the shadow march.
    cache: HeightCache,
    /// True once everything wanted at startup has been built.
    pub ready: bool,
    /// Fraction of the desired set that is built, for the loading bar.
    pub progress: f32,
    pub built_total: u32,
}

impl Tiles {
    /// The sand material, shared with anything that must match the ground.
    pub fn material(&self) -> Handle<SandMaterial> {
        self.material.clone()
    }

    pub fn live_count(&self) -> usize {
        self.live.len()
    }
}

/// Marks a terrain tile entity, carrying its key for debugging.
#[derive(Component)]
#[allow(dead_code)]
pub struct Tile(pub TileKey);

/// The ground's material: standard lighting plus the sand shader.
pub type SandMaterial = ExtendedMaterial<StandardMaterial, SandExt>;

#[derive(Asset, AsBindGroup, Reflect, Debug, Clone, Default)]
pub struct SandExt {
    #[uniform(100)]
    pub p: SandParams,
}

/// Mirrors `SandParams` in sand.wgsl.
#[derive(ShaderType, Reflect, Debug, Clone, Default)]
pub struct SandParams {
    pub sun: Vec4,
    pub wind: Vec4,
    pub ripple: Vec4,
    pub n0: Vec4,
    pub n1: Vec4,
    pub n2: Vec4,
    pub n3: Vec4,
    pub fade: Vec4,
}

impl MaterialExtension for SandExt {
    fn fragment_shader() -> ShaderRef {
        "embedded://wormsign/sand.wgsl".into()
    }
}

/// Noise frequencies and ripple wavelengths; must match sand.wgsl.
const FREQS: [f64; 4] = [0.476, 0.0526, 0.00435, 0.303];
const RIPPLES: [f64; 2] = [0.32, 1.9];

impl SandParams {
    /// Everything that depends on where the floating origin is, split so the
    /// shader's noise stays put in the world when the origin moves.
    fn at_origin(origin: DVec3, wind: (f64, f64)) -> Self {
        let s = wormsign_core::shade::sun_dir();
        let split = |f: f64| {
            let (x, z) = (origin.x * f, origin.z * f);
            Vec4::new((x - x.floor()) as f32, (z - z.floor()) as f32, x.floor() as f32, z.floor() as f32)
        };
        let along = origin.x * wind.0 + origin.z * wind.1;
        let ph = |l: f64| ((along / l) - (along / l).floor()) as f32;
        Self {
            // Lit is ambient + direct; the ratio sets how dark baked shade is.
            sun: Vec4::new(s[0] as f32, s[1] as f32, s[2] as f32, 7.5),
            wind: Vec4::new(wind.0 as f32, wind.1 as f32, -wind.1 as f32, wind.0 as f32),
            ripple: Vec4::new(ph(RIPPLES[0]), ph(RIPPLES[1]), 0.0, 0.0),
            n0: split(FREQS[0]),
            n1: split(FREQS[1]),
            n2: split(FREQS[2]),
            n3: split(FREQS[3]),
            // The shadow map covers ~800 m; baked shade takes over beyond.
            fade: Vec4::new(420.0, 720.0, 0.0, 0.0),
        }
    }
}

pub fn setup_material(mut tiles: ResMut<Tiles>, desert: Res<Desert>, mut materials: ResMut<Assets<SandMaterial>>) {
    tiles.material = materials.add(ExtendedMaterial {
        base: StandardMaterial {
            base_color: Color::WHITE,
            perceptual_roughness: 0.92,
            reflectance: 0.2,
            ..default()
        },
        extension: SandExt { p: SandParams::at_origin(DVec3::ZERO, desert.0.wind()) },
    });
}

/// Keep the shader's world-space noise anchored when the origin jumps.
fn sand_params(origin: Res<Origin>, desert: Res<Desert>, tiles: Res<Tiles>, mut materials: ResMut<Assets<SandMaterial>>, mut last: Local<Option<DVec3>>) {
    if *last == Some(origin.0) {
        return;
    }
    if let Some(mut m) = materials.get_mut(&tiles.material) {
        m.extension.p = SandParams::at_origin(origin.0, desert.0.wind());
        *last = Some(origin.0);
    }
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
        let tm = {
            let t = &mut *tiles;
            build_tile_shaded(&desert.0, key, &mut t.cache)
        };
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
    let sand_steep = Vec3::new(0.47, 0.28, 0.13);
    let rock_col = Vec3::new(0.12, 0.075, 0.05);
    // Colour in rgb, the baked sun visibility in alpha; rock weight and
    // curvature ride in the UV for the shader.
    let colors: Vec<[f32; 4]> = (0..tm.positions.len())
        .map(|i| {
            let n = tm.normals[i];
            let steep = ((1.0 - n[1]) * 3.2).clamp(0.0, 1.0);
            let sand = sand_lit.lerp(sand_steep, steep);
            let c = sand.lerp(rock_col, tm.rock[i].clamp(0.0, 1.0));
            [c.x, c.y, c.z, tm.sun[i]]
        })
        .collect();
    let uvs: Vec<[f32; 2]> = (0..tm.positions.len()).map(|i| [tm.rock[i], tm.curv[i].clamp(-2.0, 2.0)]).collect();
    Mesh::new(PrimitiveTopology::TriangleList, RenderAssetUsages::RENDER_WORLD)
        .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, tm.positions.clone())
        .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, tm.normals.clone())
        .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, colors)
        .with_inserted_attribute(Mesh::ATTRIBUTE_UV_0, uvs)
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
