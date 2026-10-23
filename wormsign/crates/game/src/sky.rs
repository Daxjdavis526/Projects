//! Sun, sky and haze.
//!
//! The sky is a large unlit dome that follows the camera, coloured per
//! vertex: dusty and pale at the horizon, a washed-out blue overhead, and
//! a warm glow around the sun. The distance fog uses the horizon colour, so
//! far dunes dissolve into the sky rather than stopping at an edge — which
//! also hides the edge of the streamed terrain.
//!
//! None of this is a physical atmosphere; Bevy's real one needs compute
//! shaders, which WebGL2 does not have. It is a painted backdrop tuned to
//! look like a hot, dusty afternoon.

use bevy::asset::RenderAssetUsages;
use bevy::light::{CascadeShadowConfigBuilder, NotShadowCaster};
use bevy::mesh::{Indices, PrimitiveTopology};
use bevy::pbr::{DistanceFog, FogFalloff};
use bevy::prelude::*;

use crate::world::Phase;

/// Direction *toward* the sun.
pub fn sun_dir() -> Vec3 {
    // One sun for everything: the baked dune shadows use the same one.
    let s = wormsign_core::shade::sun_dir();
    Vec3::new(s[0] as f32, s[1] as f32, s[2] as f32)
}

/// Linear colours.
pub const HORIZON: Vec3 = Vec3::new(0.84, 0.68, 0.50);
/// A pale dusty blue a little above the horizon, then deeper overhead.
/// Going straight from tan to blue passes through grey; this does not.
const LOW_SKY: Vec3 = Vec3::new(0.52, 0.64, 0.80);
const ZENITH: Vec3 = Vec3::new(0.17, 0.36, 0.74);
const SUN_GLOW: Vec3 = Vec3::new(1.0, 0.78, 0.50);
pub const FOG_VISIBILITY: f32 = 15_000.0;
const DOME_RADIUS: f32 = 40_000.0;

#[derive(Component)]
pub struct SkyDome;

pub struct SkyPlugin;

impl Plugin for SkyPlugin {
    fn build(&self, app: &mut App) {
        app.insert_resource(bevy::light::DirectionalLightShadowMap { size: 4096 })
            .insert_resource(ClearColor(Color::linear_rgb(HORIZON.x, HORIZON.y, HORIZON.z)))
            .insert_resource(GlobalAmbientLight {
                // Shade on sand is lit by the blue sky, so it reads cool.
                color: Color::linear_rgb(0.62, 0.70, 0.86),
                brightness: 480.0,
                affects_lightmapped_meshes: true,
            })
            .add_systems(Startup, setup)
            .add_systems(Update, follow_camera.in_set(Phase::View).after(crate::player::camera));
    }
}

/// The fog every camera should carry.
pub fn fog() -> DistanceFog {
    DistanceFog {
        color: Color::linear_rgb(HORIZON.x, HORIZON.y, HORIZON.z),
        directional_light_color: Color::linear_rgba(1.0, 0.82, 0.55, 0.55),
        directional_light_exponent: 18.0,
        falloff: FogFalloff::from_visibility_colors(
            FOG_VISIBILITY,
            Color::linear_rgb(0.62, 0.52, 0.42),
            Color::linear_rgb(HORIZON.x, HORIZON.y, HORIZON.z),
        ),
    }
}

fn setup(mut commands: Commands, mut meshes: ResMut<Assets<Mesh>>, mut materials: ResMut<Assets<StandardMaterial>>) {
    let s = sun_dir();
    commands.spawn((
        DirectionalLight {
            color: Color::linear_rgb(1.0, 0.90, 0.78),
            illuminance: 30_000.0,
            // `?noshadow` is for headless software-rendered test runs.
            shadow_maps_enabled: !crate::web::has_flag("noshadow"),
            ..default()
        },
        Transform::default().looking_to(-s, Vec3::Y),
        // WebGL2 gets one cascade, so it is spent near the player where the
        // shadows that show scale — your own, a rock's, a worm's — fall.
        CascadeShadowConfigBuilder {
            num_cascades: 1,
            minimum_distance: 0.3,
            maximum_distance: 800.0,
            first_cascade_far_bound: 800.0,
            overlap_proportion: 0.2,
        }
        .build(),
    ));

    commands.spawn((
        SkyDome,
        Mesh3d(meshes.add(dome_mesh(s))),
        MeshMaterial3d(materials.add(StandardMaterial {
            base_color: Color::WHITE,
            unlit: true,
            fog_enabled: false,
            cull_mode: None,
            ..default()
        })),
        Transform::default(),
        NotShadowCaster,
    ));

    // The sun's disc: a bright unlit ball far away, inside the dome.
    commands.spawn((
        SkyDome,
        Mesh3d(meshes.add(Sphere::new(DOME_RADIUS * 0.009).mesh().ico(3).unwrap())),
        MeshMaterial3d(materials.add(StandardMaterial {
            base_color: Color::linear_rgb(14.0, 11.0, 7.0),
            unlit: true,
            fog_enabled: false,
            ..default()
        })),
        Transform::default(),
        SunDisc,
        NotShadowCaster,
    ));
}

#[derive(Component)]
struct SunDisc;

fn dome_mesh(sun: Vec3) -> Mesh {
    let (rings, segs) = (48usize, 96usize);
    let mut pos = Vec::new();
    let mut col = Vec::new();
    let mut idx = Vec::new();
    for r in 0..=rings {
        // From slightly below the horizon to the zenith: the bottom band stays
        // horizon-coloured so no gap shows under distant terrain.
        let t = r as f32 / rings as f32;
        let elev = -0.25 + t * (std::f32::consts::FRAC_PI_2 + 0.25);
        for s in 0..=segs {
            let a = s as f32 / segs as f32 * std::f32::consts::TAU;
            let d = Vec3::new(a.cos() * elev.cos(), elev.sin(), a.sin() * elev.cos());
            pos.push((d * DOME_RADIUS).to_array());
            let up = d.y.max(0.0);
            // Most of the colour change happens in the lowest 20 degrees.
            let low = (up / 0.22).min(1.0).powf(0.7);
            let high = ((up - 0.22) / 0.78).clamp(0.0, 1.0).powf(0.8);
            let mut c = HORIZON.lerp(LOW_SKY, low).lerp(ZENITH, high);
            let cos_sun = d.dot(sun).max(0.0);
            c += SUN_GLOW * (0.55 * cos_sun.powf(6.0) + 0.9 * cos_sun.powf(60.0));
            // Brighter band right at the horizon, as dust scatters it.
            c += Vec3::splat(0.06) * (1.0 - (d.y.abs() * 12.0).min(1.0));
            col.push([c.x, c.y, c.z, 1.0]);
        }
    }
    let w = segs as u32 + 1;
    for r in 0..rings as u32 {
        for s in 0..segs as u32 {
            let a = r * w + s;
            let b = a + w;
            idx.extend_from_slice(&[a, a + 1, b, a + 1, b + 1, b]);
        }
    }
    Mesh::new(PrimitiveTopology::TriangleList, RenderAssetUsages::RENDER_WORLD)
        .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, pos)
        .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, col)
        .with_inserted_indices(Indices::U32(idx))
}

fn follow_camera(
    cam: Query<&Transform, (With<Camera3d>, Without<SkyDome>)>,
    mut domes: Query<(&mut Transform, Has<SunDisc>), With<SkyDome>>,
) {
    let Ok(c) = cam.single() else { return };
    for (mut t, is_sun) in &mut domes {
        t.translation = c.translation + if is_sun { sun_dir() * DOME_RADIUS * 0.9 } else { Vec3::ZERO };
    }
}
