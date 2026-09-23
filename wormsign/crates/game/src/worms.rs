//! Worms in the game: a small population roaming under the desert, hearing
//! the vibration bus, and drawn as a tube body plus the mound of sand it
//! shoves up.
//!
//! The mound is a separate strip mesh draped over the terrain along the
//! body, sunk a little so that only the part pushed up by the worm pokes
//! through the real ground. Its height comes from [`Worm::wake`], the same
//! function the player's ground query uses, so you can stand on it.

use bevy::asset::RenderAssetUsages;
use bevy::camera::visibility::NoFrustumCulling;
use bevy::light::NotShadowCaster;
use bevy::mesh::{Indices, PrimitiveTopology};
use bevy::prelude::*;
use wormsign_core::brain::{Brain, State, Surroundings};
use wormsign_core::glam::DVec3;
use wormsign_core::rng::Rng;
use wormsign_core::vibration::Listener;
use wormsign_core::worm::{Worm, WormSpec};

use crate::player::PlayerBody;
use crate::quake::Quakes;
use crate::web;
use crate::world::{Desert, Origin, Phase, SimSet, Tick};

/// Sides of the tube.
const AROUND: usize = 20;
/// How far below the true ground the wake strip sits where there is no mound.
const SINK: f64 = 0.6;
/// Worms further than this from the player do not get a drawn mound.
const WAKE_DRAW_RANGE: f64 = 3500.0;

pub struct WormsPlugin;

impl Plugin for WormsPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Startup, spawn_population.after(crate::player::spawn))
            .add_systems(Update, simulate.in_set(Phase::Simulate).in_set(SimSet).after(crate::player::simulate))
            .add_systems(Update, (draw_bodies, draw_wakes).in_set(Phase::View));
    }
}

#[derive(Component)]
pub struct WormBody {
    pub worm: Worm,
    pub brain: Brain,
    pub ear: Listener,
}

#[derive(Component)]
struct TubeMesh(Handle<Mesh>);

#[derive(Component)]
struct WakeMesh(Handle<Mesh>, Entity);

/// Rocks as the brain needs them.
struct DesertRocks<'a>(&'a Desert);

impl Surroundings for DesertRocks<'_> {
    fn rock(&self, x: f64, z: f64, margin: f64) -> Option<(f64, f64, f64)> {
        self.0 .0.rock_near(x, z, margin).map(|r| (r.x, r.z, r.radius * 1.3))
    }
}

pub fn spawn_population(
    mut commands: Commands,
    desert: Res<Desert>,
    player: Query<&PlayerBody>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut mats: ResMut<Assets<StandardMaterial>>,
    tiles: Res<crate::ground::Tiles>,
) {
    let Ok(p) = player.single() else { return };
    let p = p.0.pos;
    let mut rng = Rng::new(0xD0E);
    let skin = mats.add(StandardMaterial {
        base_color: Color::WHITE,
        perceptual_roughness: 0.82,
        reflectance: 0.25,
        ..default()
    });
    let sand = tiles.material();

    // Test hook: `?worm=D` puts one D metres ahead of the starting view,
    // offset to the left and crossing to the right, so it passes in front.
    let mut placed: Vec<(DVec3, f64, f64)> = Vec::new();
    if let Some(d) = web::flag_f32("worm") {
        let yaw = crate::player::Look::default().yaw as f64;
        let fwd = DVec3::new(-yaw.sin(), 0.0, -yaw.cos());
        let right = DVec3::new(yaw.cos(), 0.0, -yaw.sin());
        let at = p + fwd * d as f64 - right * web::flag_f32("wormside").unwrap_or(120.0) as f64;
        let depth = web::flag_f32("wormdepth").map(|v| v as f64).unwrap_or(26.0);
        placed.push((at, right.z.atan2(right.x), depth));
    }
    // The resident population: two, somewhere out there.
    while placed.len() < 3 {
        let a = rng.range(0.0, std::f64::consts::TAU);
        let d = rng.range(2500.0, 4500.0);
        let at = p + DVec3::new(a.cos(), 0.0, a.sin()) * d;
        if desert.0.rock_near(at.x, at.z, 200.0).is_some() {
            continue;
        }
        placed.push((at, rng.range(-3.1, 3.1), 26.0));
    }

    for (i, (at, heading, depth)) in placed.into_iter().enumerate() {
        let spec = WormSpec::standard();
        let d = desert.clone();
        let worm = Worm::new(spec, at.x, at.z, heading, depth, move |x, z| d.0.sand(x, z));
        let tube = meshes.add(empty_mesh());
        let wake = meshes.add(empty_mesh());
        let wake_e = commands
            .spawn((Mesh3d(wake.clone()), MeshMaterial3d(sand.clone()), Transform::default(), NoFrustumCulling, NotShadowCaster))
            .id();
        let mut brain = Brain::new(100 + i as u64);
        brain.set_wander(heading);
        if i == 0 {
            // `?wormhold=speed,depth` pins the test worm, for screenshots.
            if let Some(v) = web::flag_value("wormhold") {
                let mut it = v.split(',').filter_map(|x| x.parse::<f64>().ok());
                if let (Some(sp), Some(dp)) = (it.next(), it.next()) {
                    brain.hold = Some((sp, dp));
                }
            }
        }
        commands.spawn((
            WormBody { worm, brain, ear: Listener::new(200 + i as u64) },
            TubeMesh(tube.clone()),
            WakeMesh(wake, wake_e),
            Mesh3d(tube),
            MeshMaterial3d(skin.clone()),
            Transform::default(),
            NoFrustumCulling,
        ));
    }
}

fn empty_mesh() -> Mesh {
    Mesh::new(PrimitiveTopology::TriangleList, RenderAssetUsages::RENDER_WORLD | RenderAssetUsages::MAIN_WORLD)
        .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, vec![[0.0f32; 3]; 3])
        .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, vec![[0.0f32, 1.0, 0.0]; 3])
        .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, vec![[1.0f32; 4]; 3])
        .with_inserted_indices(Indices::U32(vec![0, 1, 2]))
}

pub fn simulate(tick: Res<Tick>, desert: Res<Desert>, quakes: Res<Quakes>, mut worms: Query<&mut WormBody>) {
    if tick.n == 0 {
        return;
    }
    let rocks = DesertRocks(&desert);
    let sand = |x: f64, z: f64| desert.0.sand(x, z);
    for mut wb in &mut worms {
        let wb = &mut *wb;
        let head = wb.worm.head();
        for ev in &quakes.events {
            wb.ear.hear(head, ev);
        }
        let t = tick.time(tick.n - 1);
        wb.brain.think(&mut wb.worm, &mut wb.ear, t, tick.dt * tick.n as f64, &rocks);
        for _ in 0..tick.n {
            wb.worm.step(tick.dt, sand);
        }
    }
}

/// The height the player actually stands on: sand, rock, and any worm's
/// mound. Normal by central differences of the whole thing.
pub fn ground_height(desert: &Desert, worms: &[&Worm], x: f64, z: f64) -> f64 {
    let g = desert.0.sample(x, z);
    let mut h = g.height as f64;
    if g.rock < 0.5 {
        let w = worms.iter().map(|w| w.wake(x, z)).fold(0.0, f64::max);
        h += w;
    }
    h
}

fn draw_bodies(origin: Res<Origin>, worms: Query<(&WormBody, &TubeMesh)>, mut meshes: ResMut<Assets<Mesh>>) {
    for (wb, tube) in &worms {
        let Some(mut mesh) = meshes.get_mut(&tube.0) else { continue };
        build_tube(&wb.worm, &origin, &mut mesh);
    }
}

fn build_tube(w: &Worm, origin: &Origin, mesh: &mut Mesh) {
    let rings = &w.rings;
    let n = rings.len();
    let mut pos = Vec::with_capacity(n * (AROUND + 1) + 2);
    let mut nor = Vec::with_capacity(pos.capacity());
    let mut col = Vec::with_capacity(pos.capacity());
    // Parallel transport: carry a normal vector down the body, rotating it
    // only as much as the tangent turns, so the tube never twists.
    let mut up = {
        let t = rings[0].tangent;
        let u = DVec3::Y - t * t.y;
        if u.length_squared() < 1e-6 { DVec3::X } else { u.normalize() }
    };
    let mut prev_t = rings[0].tangent;
    for (i, r) in rings.iter().enumerate() {
        let t = r.tangent;
        let axis = prev_t.cross(t);
        if axis.length_squared() > 1e-12 {
            let ang = prev_t.dot(t).clamp(-1.0, 1.0).acos();
            up = DQuatLike::rotate(up, axis.normalize(), ang);
        }
        up = (up - t * up.dot(t)).normalize();
        prev_t = t;
        let side = t.cross(up);
        let c = r.centre - origin.0;
        // Segment ridges: every other ring slightly proud and darker in the
        // groove, reading as the ringed hide at a distance.
        let ridge = if i % 2 == 0 { 1.0 } else { 0.965 };
        let shade = if i % 2 == 0 { 1.0 } else { 0.78 };
        for k in 0..=AROUND {
            let a = k as f64 / AROUND as f64 * std::f64::consts::TAU;
            let radial = up * a.cos() + side * a.sin();
            let p = c + radial * r.radius * ridge;
            pos.push([p.x as f32, p.y as f32, p.z as f32]);
            nor.push([radial.x as f32, radial.y as f32, radial.z as f32]);
            // Weathered, sand-scoured grey-brown on top, paler underneath.
            let belly = (-a.cos()).max(0.0);
            let base = Vec3::new(0.16, 0.12, 0.095).lerp(Vec3::new(0.30, 0.23, 0.17), belly as f32);
            let cc = base * shade;
            col.push([cc.x, cc.y, cc.z, 1.0]);
        }
    }
    let mut idx = Vec::with_capacity((n - 1) * AROUND * 6 + AROUND * 3);
    let w1 = (AROUND + 1) as u32;
    for i in 0..(n as u32 - 1) {
        for k in 0..AROUND as u32 {
            let a = i * w1 + k;
            let b = a + w1;
            idx.extend_from_slice(&[a, b, a + 1, a + 1, b, b + 1]);
        }
    }
    // Cap the mouth end with a dark disc for now; the mouth proper comes
    // with the breach.
    let r0 = &rings[0];
    let cap = pos.len() as u32;
    let c = r0.centre - origin.0 + r0.tangent * 0.5;
    pos.push([c.x as f32, c.y as f32, c.z as f32]);
    nor.push([r0.tangent.x as f32, r0.tangent.y as f32, r0.tangent.z as f32]);
    col.push([0.05, 0.02, 0.02, 1.0]);
    for k in 0..AROUND as u32 {
        idx.extend_from_slice(&[cap, k + 1, k]);
    }

    mesh.insert_attribute(Mesh::ATTRIBUTE_POSITION, pos);
    mesh.insert_attribute(Mesh::ATTRIBUTE_NORMAL, nor);
    mesh.insert_attribute(Mesh::ATTRIBUTE_COLOR, col);
    mesh.insert_indices(Indices::U32(idx));
}

/// Rodrigues rotation, for DVec3 without pulling in a quaternion type.
struct DQuatLike;
impl DQuatLike {
    fn rotate(v: DVec3, axis: DVec3, ang: f64) -> DVec3 {
        let (s, c) = ang.sin_cos();
        v * c + axis.cross(v) * s + axis * axis.dot(v) * (1.0 - c)
    }
}

fn draw_wakes(
    origin: Res<Origin>,
    desert: Res<Desert>,
    player: Query<&PlayerBody>,
    worms: Query<(&WormBody, &WakeMesh)>,
    mut vis: Query<&mut Visibility>,
    mut meshes: ResMut<Assets<Mesh>>,
) {
    let Ok(pl) = player.single() else { return };
    for (wb, wake) in &worms {
        let w = &wb.worm;
        let far = (w.head() - pl.0.pos).length() > WAKE_DRAW_RANGE;
        if let Ok(mut v) = vis.get_mut(wake.1) {
            let want = if far { Visibility::Hidden } else { Visibility::Inherited };
            if *v != want {
                *v = want;
            }
        }
        if far {
            continue;
        }
        let Some(mut mesh) = meshes.get_mut(&wake.0) else { continue };
        build_wake(w, &desert, &origin, &mut mesh);
    }
}

fn build_wake(w: &Worm, desert: &Desert, origin: &Origin, mesh: &mut Mesh) {
    // A grid following the body: rows every few rings, columns across.
    const ACROSS: usize = 13;
    let rings: Vec<_> = w.rings.iter().step_by(3).collect();
    let half = w.spec.radius * 1.35 * 2.6;
    let rows = rings.len() + 1;
    let mut pos = Vec::with_capacity(rows * ACROSS);
    let mut world_pts = Vec::with_capacity(rows * ACROSS);
    let fwd = w.forward();
    // One extra row ahead of the head for the bow wave.
    let lead = std::iter::once((w.rings[0].centre + fwd * w.spec.radius * 2.5, fwd));
    let rows_iter = lead.chain(rings.iter().map(|r| (r.centre, r.tangent)));
    for (c, t) in rows_iter {
        let side = DVec3::new(-t.z, 0.0, t.x).normalize_or_zero();
        for j in 0..ACROSS {
            let u = j as f64 / (ACROSS - 1) as f64 * 2.0 - 1.0;
            let x = c.x + side.x * u * half;
            let z = c.z + side.z * u * half;
            let g = desert.0.sample(x, z);
            let mound = if g.rock < 0.5 { w.wake(x, z) } else { 0.0 };
            let y = g.height as f64 + mound - SINK;
            world_pts.push(DVec3::new(x, y, z));
            let p = DVec3::new(x, y, z) - origin.0;
            pos.push([p.x as f32, p.y as f32, p.z as f32]);
        }
    }
    // Normals from the grid itself.
    let at = |r: usize, c: usize| world_pts[r.min(rows - 1) * ACROSS + c.min(ACROSS - 1)];
    let mut nor = Vec::with_capacity(pos.len());
    let mut col = Vec::with_capacity(pos.len());
    for r in 0..rows {
        for c in 0..ACROSS {
            let a = at(r.saturating_sub(1), c) - at(r + 1, c);
            let b = at(r, c + 1) - at(r, c.saturating_sub(1));
            let mut n = a.cross(b).normalize_or_zero();
            if n.y < 0.0 {
                n = -n;
            }
            nor.push([n.x as f32, n.y as f32, n.z as f32]);
            // Freshly turned sand is a shade darker and redder.
            let steep = ((1.0 - n.y) * 3.2).clamp(0.0, 1.0) as f32;
            let s = Vec3::new(0.50, 0.31, 0.15).lerp(Vec3::new(0.47, 0.28, 0.13), steep) * 0.94;
            col.push([s.x, s.y, s.z, 1.0]);
        }
    }
    let mut idx = Vec::with_capacity((rows - 1) * (ACROSS - 1) * 6);
    for r in 0..(rows as u32 - 1) {
        for c in 0..(ACROSS as u32 - 1) {
            let a = r * ACROSS as u32 + c;
            let b = a + ACROSS as u32;
            idx.extend_from_slice(&[a, a + 1, b, a + 1, b + 1, b]);
        }
    }
    // Whichever way the rows run, face the triangles upward.
    let flip = {
        let (a, b, c) = (world_pts[idx[0] as usize], world_pts[idx[1] as usize], world_pts[idx[2] as usize]);
        (b - a).cross(c - a).y < 0.0
    };
    if flip {
        for tri in idx.chunks_mut(3) {
            tri.swap(1, 2);
        }
    }
    mesh.insert_attribute(Mesh::ATTRIBUTE_POSITION, pos);
    mesh.insert_attribute(Mesh::ATTRIBUTE_NORMAL, nor);
    mesh.insert_attribute(Mesh::ATTRIBUTE_COLOR, col);
    mesh.insert_indices(Indices::U32(idx));
}

/// For the HUD: the most alarming worm, and how far away it is.
pub fn nearest<'a>(worms: impl Iterator<Item = &'a WormBody>, p: DVec3) -> Option<(&'a WormBody, f64)> {
    worms
        .map(|w| (w, (w.worm.head() - p).length()))
        .min_by(|a, b| {
            let rank = |s: State| if matches!(s, State::Roam) { 1 } else { 0 };
            rank(a.0.brain.state).cmp(&rank(b.0.brain.state)).then(a.1.partial_cmp(&b.1).unwrap())
        })
}
