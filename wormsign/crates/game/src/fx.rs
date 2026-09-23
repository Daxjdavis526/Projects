//! Pooled particles: sand thrown up by a breach, dust, blood and the stains
//! it leaves. A fixed pool of entities is made once and recycled, oldest
//! first, so a violent moment never allocates and never grows unbounded.

use bevy::light::NotShadowCaster;
use bevy::prelude::*;
use wormsign_core::glam::DVec3;
use wormsign_core::rng::Rng;

use crate::world::{Desert, Origin, Phase};

const POOL: usize = 900;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Kind {
    /// Clods of sand: fall, and puff into dust where they land.
    Sand,
    /// Soft, slow, swelling, fading.
    Dust,
    /// Droplets: fall, and leave a stain where they land.
    Blood,
    /// A dark patch on the sand, for a long while.
    Stain,
}

#[derive(Clone, Copy)]
struct Particle {
    pos: DVec3,
    vel: DVec3,
    age: f32,
    life: f32,
    size: f32,
    kind: Kind,
    live: bool,
}

#[derive(Resource)]
pub struct Fx {
    parts: Vec<Particle>,
    entities: Vec<Entity>,
    next: usize,
    mats: [Handle<StandardMaterial>; 4],
    /// Ball for solid bits, soft quad for dust.
    meshes: [Handle<Mesh>; 2],
    rng: Rng,
}

/// A soft round blob, white with alpha falling off to the edge, for dust.
fn puff_texture() -> Image {
    use bevy::asset::RenderAssetUsages;
    use bevy::render::render_resource::{Extent3d, TextureDimension, TextureFormat};
    let n = 64u32;
    let mut data = Vec::with_capacity((n * n * 4) as usize);
    for y in 0..n {
        for x in 0..n {
            let dx = (x as f32 + 0.5) / n as f32 * 2.0 - 1.0;
            let dy = (y as f32 + 0.5) / n as f32 * 2.0 - 1.0;
            let r = (dx * dx + dy * dy).sqrt();
            let a = (1.0 - r).clamp(0.0, 1.0).powf(1.6);
            data.extend_from_slice(&[255, 255, 255, (a * 255.0) as u8]);
        }
    }
    Image::new(
        Extent3d { width: n, height: n, depth_or_array_layers: 1 },
        TextureDimension::D2,
        data,
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::RENDER_WORLD,
    )
}

pub struct FxPlugin;

impl Plugin for FxPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Startup, setup).add_systems(Update, update.in_set(Phase::View));
    }
}

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut mats: ResMut<Assets<StandardMaterial>>,
    mut images: ResMut<Assets<Image>>,
) {
    let ball = meshes.add(Sphere::new(1.0).mesh().ico(1).unwrap());
    let quad = meshes.add(Rectangle::new(2.0, 2.0));
    let puff = images.add(puff_texture());
    let m = [
        // Same albedo as the ground, so thrown sand reads as sand.
        mats.add(StandardMaterial { base_color: Color::linear_rgb(0.50, 0.31, 0.15), perceptual_roughness: 1.0, ..default() }),
        mats.add(StandardMaterial {
            base_color: Color::linear_rgba(0.84, 0.66, 0.46, 0.55),
            base_color_texture: Some(puff),
            alpha_mode: AlphaMode::Blend,
            unlit: true,
            cull_mode: None,
            ..default()
        }),
        mats.add(StandardMaterial { base_color: Color::srgb(0.30, 0.01, 0.01), perceptual_roughness: 0.35, reflectance: 0.5, ..default() }),
        mats.add(StandardMaterial { base_color: Color::srgb(0.20, 0.03, 0.02), perceptual_roughness: 0.7, ..default() }),
    ];
    let mut entities = Vec::with_capacity(POOL);
    for _ in 0..POOL {
        entities.push(
            commands
                .spawn((Mesh3d(ball.clone()), MeshMaterial3d(m[0].clone()), Transform::default(), Visibility::Hidden, NotShadowCaster))
                .id(),
        );
    }
    let dead = Particle { pos: DVec3::ZERO, vel: DVec3::ZERO, age: 0.0, life: 0.0, size: 0.0, kind: Kind::Sand, live: false };
    commands.insert_resource(Fx { parts: vec![dead; POOL], entities, next: 0, mats: m, meshes: [ball, quad], rng: Rng::new(0xF1) });
}

impl Fx {
    pub fn emit(&mut self, kind: Kind, pos: DVec3, vel: DVec3, size: f32, life: f32) {
        let i = self.next;
        self.next = (self.next + 1) % POOL;
        self.parts[i] = Particle { pos, vel, age: 0.0, life, size, kind, live: true };
        // Material is swapped lazily in `update` when the kind changes.
    }

    /// A breach: sand hurled up and out in a ring, and a dust cloud.
    pub fn eruption(&mut self, centre: DVec3, up: DVec3, radius: f64, strength: f64) {
        let n = (220.0 * strength) as usize;
        for _ in 0..n {
            let a = self.rng.range(0.0, std::f64::consts::TAU);
            let out = DVec3::new(a.cos(), 0.0, a.sin());
            let r = radius * self.rng.range(0.6, 1.2);
            let v = up * self.rng.range(8.0, 30.0) * strength + out * self.rng.range(3.0, 14.0);
            // Mostly small clods, a few big ones.
            let size = (0.08 + 0.55 * self.rng.f64().powi(3)) as f32;
            let life = self.rng.range(2.0, 5.0) as f32;
            self.emit(Kind::Sand, centre + out * r, v, size, life);
        }
        for _ in 0..(40.0 * strength) as usize {
            let a = self.rng.range(0.0, std::f64::consts::TAU);
            let out = DVec3::new(a.cos(), 0.0, a.sin());
            let v = up * self.rng.range(2.0, 9.0) + out * self.rng.range(2.0, 8.0);
            let size = self.rng.range(4.0, 9.0) as f32;
            let life = self.rng.range(4.0, 9.0) as f32;
            let at = centre + out * radius * self.rng.range(0.5, 1.3);
            self.emit(Kind::Dust, at, v, size, life);
        }
    }

    /// A gout of blood from a wound.
    pub fn bleed(&mut self, at: DVec3, carry: DVec3, n: usize, speed: f64) {
        for _ in 0..n {
            let d = DVec3::new(self.rng.gauss(), self.rng.gauss() + 0.6, self.rng.gauss()).normalize_or_zero();
            let v = carry + d * self.rng.range(0.3, 1.0) * speed;
            let size = self.rng.range(0.03, 0.11) as f32;
            self.emit(Kind::Blood, at, v, size, 6.0);
        }
    }
}

fn update(
    time: Res<Time>,
    origin: Res<Origin>,
    desert: Res<Desert>,
    mut fx: ResMut<Fx>,
    mut q: Query<(&mut Transform, &mut Visibility, &mut MeshMaterial3d<StandardMaterial>, &mut Mesh3d), Without<Camera3d>>,
    cam: Query<&Transform, With<Camera3d>>,
    mut kinds: Local<Vec<Option<Kind>>>,
) {
    let cam_rot = cam.single().map(|t| t.rotation).unwrap_or_default();
    let dt = time.delta_secs().min(0.1);
    if kinds.len() != POOL {
        *kinds = vec![None; POOL];
    }
    let fx = &mut *fx;
    let mut spawn: Vec<(Kind, DVec3, DVec3, f32, f32)> = Vec::new();
    for i in 0..POOL {
        let p = &mut fx.parts[i];
        let e = fx.entities[i];
        let Ok((mut t, mut vis, mut mat, mut mesh)) = q.get_mut(e) else { continue };
        if !p.live {
            if *vis != Visibility::Hidden {
                *vis = Visibility::Hidden;
            }
            continue;
        }
        p.age += dt;
        if p.age >= p.life {
            p.live = false;
            *vis = Visibility::Hidden;
            continue;
        }
        let dtd = dt as f64;
        match p.kind {
            Kind::Sand | Kind::Blood => {
                p.vel.y -= 9.81 * dtd;
                p.vel *= 1.0 - 0.15 * dtd;
                p.pos += p.vel * dtd;
                let g = desert.0.height(p.pos.x, p.pos.z) as f64;
                if p.pos.y < g {
                    p.live = false;
                    *vis = Visibility::Hidden;
                    let ground = DVec3::new(p.pos.x, g, p.pos.z);
                    if p.kind == Kind::Blood {
                        spawn.push((Kind::Stain, ground, DVec3::ZERO, p.size * 3.0, 90.0));
                    } else if p.size > 0.35 {
                        spawn.push((Kind::Dust, ground, DVec3::new(0.0, 1.0, 0.0), p.size * 5.0, 2.5));
                    }
                    continue;
                }
            }
            Kind::Dust => {
                p.vel *= 1.0 - 1.2 * dtd;
                p.vel.y += 0.3 * dtd;
                p.pos += p.vel * dtd;
            }
            Kind::Stain => {}
        }
        if kinds[i] != Some(p.kind) {
            kinds[i] = Some(p.kind);
            mat.0 = fx.mats[p.kind as usize].clone();
            mesh.0 = fx.meshes[(p.kind == Kind::Dust) as usize].clone();
        }
        // Dust quads always face the camera.
        if p.kind == Kind::Dust {
            t.rotation = cam_rot;
        }
        let k = p.age / p.life;
        let scale = match p.kind {
            // Dust swells as it spreads and thins out.
            Kind::Dust => Vec3::splat(p.size * (1.0 + 2.5 * k) * (1.0 - k * k).max(0.05)),
            // Stains lie flat.
            Kind::Stain => Vec3::new(p.size, 0.02, p.size) * (1.0 - (k - 0.9).max(0.0) * 10.0),
            _ => Vec3::splat(p.size),
        };
        t.translation = origin.to_render(p.pos);
        t.scale = scale;
        if *vis != Visibility::Inherited {
            *vis = Visibility::Inherited;
        }
    }
    for (k, pos, vel, size, life) in spawn {
        fx.emit(k, pos, vel, size, life);
    }
}
