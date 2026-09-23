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
            .init_resource::<Danger>()
            .add_systems(Update, recycle.in_set(Phase::Simulate).after(SimSet))
            .add_systems(Update, (draw_bodies, draw_wakes, approach).in_set(Phase::View));
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
        // `?wormface` points it straight at the player instead.
        let heading = if web::has_flag("wormface") { (p.z - at.z).atan2(p.x - at.x) } else { right.z.atan2(right.x) };
        placed.push((at, heading, depth));
    }
    // The resident population: a few, somewhere out there, and one giant
    // much further off.
    let residents = placed.len() + 3;
    while placed.len() < residents + 1 {
        let giant = placed.len() == residents;
        let a = rng.range(0.0, std::f64::consts::TAU);
        let d = if giant { rng.range(6500.0, 8500.0) } else { rng.range(2500.0, 4500.0) };
        let at = p + DVec3::new(a.cos(), 0.0, a.sin()) * d;
        if desert.0.rock_near(at.x, at.z, if giant { 600.0 } else { 200.0 }).is_some() {
            continue;
        }
        placed.push((at, rng.range(-3.1, 3.1), if giant { 70.0 } else { 26.0 }));
    }

    for (i, (at, heading, depth)) in placed.into_iter().enumerate() {
        let spec = if i == residents { WormSpec::giant() } else { WormSpec::standard() };
        let d = desert.clone();
        let worm = Worm::new(spec, at.x, at.z, heading, depth, move |x, z| d.0.sand(x, z));
        let tube = meshes.add(empty_mesh());
        let wake = meshes.add(empty_mesh());
        let wake_e = commands
            .spawn((Mesh3d(wake.clone()), MeshMaterial3d(sand.clone()), Transform::default(), NoFrustumCulling, NotShadowCaster))
            .id();
        let mut brain = Brain::new(100 + i as u64);
        brain.set_wander(heading);
        if i == 0 && web::has_flag("wormattack") {
            // `?wormattack`: the test worm is already lunging at the player.
            brain.attack(p, 0.0);
        }
        if i == 0 {
            // `?wormhold=speed,depth` pins the test worm, for screenshots.
            if let Some(v) = web::flag_value("wormhold") {
                let mut it = v.split(',').filter_map(|x| x.parse::<f64>().ok());
                if let (Some(sp), Some(dp)) = (it.next(), it.next()) {
                    brain.hold = Some((sp, dp));
                    brain.hold_mouth = it.next().unwrap_or(0.0);
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

pub fn simulate(
    tick: Res<Tick>,
    desert: Res<Desert>,
    quakes: Res<Quakes>,
    riding: Res<crate::rider::Riding>,
    mut worms: Query<(Entity, &mut WormBody)>,
) {
    if tick.n == 0 {
        return;
    }
    let rocks = DesertRocks(&desert);
    let sand = |x: f64, z: f64| desert.0.sand(x, z);
    for (e, mut wb) in &mut worms {
        let wb = &mut *wb;
        let head = wb.worm.head();
        for ev in &quakes.events {
            wb.ear.hear(head, ev);
        }
        let t = tick.time(tick.n - 1);
        if riding.worm == Some(e) && !riding.reins.hooks.is_empty() {
            wb.brain.ride(&mut wb.worm, &riding.reins, t, tick.dt * tick.n as f64);
        } else {
            wb.brain.think(&mut wb.worm, &mut wb.ear, t, tick.dt * tick.n as f64, &rocks);
        }
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
            let base = Vec3::new(0.25, 0.20, 0.16).lerp(Vec3::new(0.38, 0.30, 0.23), belly as f32);
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
    // The mouth, in the head ring's frame.
    let r0 = &rings[0];
    let t = r0.tangent;
    let up0 = {
        let u = DVec3::Y - t * t.y;
        if u.length_squared() < 1e-6 { DVec3::X } else { u.normalize() }
    };
    let side0 = t.cross(up0);
    let frame = MouthFrame { c: r0.centre - origin.0, t, up: up0, side: side0, r: r0.radius };
    build_mouth(&frame, w.mouth, &mut pos, &mut nor, &mut col, &mut idx);

    mesh.insert_attribute(Mesh::ATTRIBUTE_POSITION, pos);
    mesh.insert_attribute(Mesh::ATTRIBUTE_NORMAL, nor);
    mesh.insert_attribute(Mesh::ATTRIBUTE_COLOR, col);
    mesh.insert_indices(Indices::U32(idx));
}

struct MouthFrame {
    c: DVec3,
    t: DVec3,
    up: DVec3,
    side: DVec3,
    r: f64,
}

impl MouthFrame {
    fn radial(&self, a: f64) -> DVec3 {
        self.up * a.cos() + self.side * a.sin()
    }
}

fn push(pos: &mut Vec<[f32; 3]>, nor: &mut Vec<[f32; 3]>, col: &mut Vec<[f32; 4]>, p: DVec3, n: DVec3, c: Vec3) -> u32 {
    pos.push([p.x as f32, p.y as f32, p.z as f32]);
    nor.push([n.x as f32, n.y as f32, n.z as f32]);
    col.push([c.x, c.y, c.z, 1.0]);
    pos.len() as u32 - 1
}

/// Three petals that close into a blunt cone and open back like a flower,
/// two rings of crystal teeth just inside the rim, and a throat that goes
/// dark a few tens of metres in.
fn build_mouth(
    f: &MouthFrame,
    open: f64,
    pos: &mut Vec<[f32; 3]>,
    nor: &mut Vec<[f32; 3]>,
    col: &mut Vec<[f32; 4]>,
    idx: &mut Vec<u32>,
) {
    use std::f64::consts::{PI, TAU};
    let skin = Vec3::new(0.24, 0.18, 0.14);
    let flesh = Vec3::new(0.42, 0.10, 0.08);
    let flesh_deep = Vec3::new(0.10, 0.02, 0.02);
    let tooth = Vec3::new(0.80, 0.78, 0.70);

    // --- throat -----------------------------------------------------------
    let depth_rings = 10;
    let throat_len = f.r * 2.5;
    let base = pos.len() as u32;
    for i in 0..=depth_rings {
        let u = i as f64 / depth_rings as f64;
        let rad = f.r * (0.88 - 0.62 * u);
        let centre = f.c - f.t * (throat_len * u);
        let shade = flesh.lerp(flesh_deep, (u as f32).powf(0.6));
        for k in 0..=AROUND {
            let a = k as f64 / AROUND as f64 * TAU;
            let rd = f.radial(a);
            push(pos, nor, col, centre + rd * rad, -rd, shade);
        }
    }
    let w1 = (AROUND + 1) as u32;
    for i in 0..depth_rings as u32 {
        for k in 0..AROUND as u32 {
            let a = base + i * w1 + k;
            let b = a + w1;
            // Inward-facing: opposite winding to the hide.
            idx.extend_from_slice(&[a, a + 1, b, a + 1, b + 1, b]);
        }
    }

    // --- teeth --------------------------------------------------------------
    // Crystalline, curved slightly back into the throat, so whatever goes in
    // does not come out.
    let n_teeth = 44;
    for ring in 0..2 {
        let back = f.r * (0.12 + 0.28 * ring as f64);
        let len = f.r * (0.30 - 0.08 * ring as f64) * (0.4 + 0.6 * open);
        for k in 0..n_teeth {
            let a = (k as f64 + 0.5 * ring as f64) / n_teeth as f64 * TAU;
            let rd = f.radial(a);
            let tang = f.radial(a + PI / 2.0);
            let root = f.c - f.t * back + rd * f.r * 0.86;
            let tip = root - rd * len - f.t * len * 0.45;
            let wid = f.r * 0.045;
            let b0 = push(pos, nor, col, root + tang * wid, tang, tooth * 0.8);
            let b1 = push(pos, nor, col, root - tang * wid, -tang, tooth * 0.8);
            let b2 = push(pos, nor, col, root - f.t * wid * 1.5, -rd, tooth * 0.7);
            let tp = push(pos, nor, col, tip, -rd, tooth);
            idx.extend_from_slice(&[b0, b1, tp, b1, b2, tp, b2, b0, tp]);
        }
    }

    // --- petals -------------------------------------------------------------
    // Closed, each petal leans in to meet the others ahead of the head;
    // open, it swings out and back past the rim like a peeled flower.
    let lean = (-62.0f64).to_radians() + open * 170f64.to_radians();
    let (along_n, across_n) = (7usize, 7usize);
    for petal in 0..3 {
        let mid = petal as f64 / 3.0 * TAU + PI / 3.0;
        let half = TAU / 6.0 * 0.98;
        for face in 0..2 {
            let base = pos.len() as u32;
            for i in 0..=along_n {
                let u = i as f64 / along_n as f64;
                // Curl: the tip of each petal bends a little more.
                let phi = lean + u * 0.35 * (1.0 - 2.0 * open).signum() * 0.4;
                let span = half * (1.0 - 0.55 * u * u);
                for j in 0..=across_n {
                    let v = j as f64 / across_n as f64 * 2.0 - 1.0;
                    let a = mid + v * span;
                    let rd = f.radial(a);
                    let dir = f.t * phi.cos() + rd * phi.sin();
                    let rim = f.c + rd * f.r * 0.98;
                    let p = rim + dir * f.r * 1.05 * u;
                    // Outer normal of the petal surface.
                    let out = (rd * phi.cos() - f.t * phi.sin()).normalize();
                    let (n, c) = if face == 0 { (out, skin * (0.9 + 0.1 * (1.0 - u as f32))) } else { (-out, flesh.lerp(flesh_deep, 0.3)) };
                    push(pos, nor, col, p, n, c);
                }
            }
            let w = (across_n + 1) as u32;
            for i in 0..along_n as u32 {
                for j in 0..across_n as u32 {
                    let a = base + i * w + j;
                    let b = a + w;
                    if face == 0 {
                        idx.extend_from_slice(&[a, b, a + 1, a + 1, b, b + 1]);
                    } else {
                        idx.extend_from_slice(&[a, a + 1, b, a + 1, b + 1, b]);
                    }
                }
            }
        }
    }
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

/// How close and how fast the nearest worm is coming, for shake and sound.
#[derive(Resource, Default)]
pub struct Danger {
    /// 0 nothing near .. 1 right on top of you.
    pub level: f32,
    /// Distance to the nearest part of any worm, metres.
    pub distance: f64,
    /// Direction to it, world space, flattened.
    pub bearing: DVec3,
    pub speed: f64,
    /// 0..1: how exposed the nearest worm is (1 = back out of the sand).
    pub surfaced: f32,
}

/// The build-up. A worm moving fast near the surface throws a plume of dust
/// you can see for kilometres and sprays sand off its bow; close ones make
/// the ground shake under you.
fn approach(
    time: Res<Time>,
    mut fx: ResMut<crate::fx::Fx>,
    mut shake: ResMut<crate::player::Shake>,
    mut danger: ResMut<Danger>,
    player: Query<&PlayerBody>,
    worms: Query<&WormBody>,
    mut acc: Local<Vec<(f64, f64)>>,
) {
    let Ok(pl) = player.single() else { return };
    let p = pl.0.pos;
    let dt = time.delta_secs() as f64;
    let n = worms.iter().count();
    if acc.len() != n {
        *acc = vec![(0.0, 0.0); n];
    }
    let mut best = Danger { distance: f64::MAX, ..default() };
    for (i, wb) in worms.iter().enumerate() {
        let w = &wb.worm;
        let head = w.head();
        let r = w.spec.radius;
        let top_depth = w.rings[0].sand - (head.y + r);
        let near_surface = top_depth < r * 0.9;
        let fwd = w.forward();
        // Dust plume, rate rising with speed.
        if near_surface && w.speed > 8.0 && (head - p).length() < 6000.0 {
            acc[i].0 += dt * (w.speed - 6.0) * 0.12;
            while acc[i].0 >= 1.0 {
                acc[i].0 -= 1.0;
                let rng_a = fx_rand(i as f64 + acc[i].1);
                acc[i].1 += 1.0;
                let side = DVec3::new(-fwd.z, 0.0, fwd.x) * (rng_a - 0.5) * r * 1.6;
                let at = DVec3::new(head.x, w.rings[0].sand, head.z) + side - fwd * r * 0.5;
                let v = DVec3::new(0.0, 3.0 + 4.0 * rng_a, 0.0) - fwd * w.speed * 0.15;
                fx.emit(crate::fx::Kind::Dust, at, v, (7.0 + 9.0 * rng_a) as f32, (5.0 + 4.0 * rng_a) as f32);
            }
        }
        // Sand thrown off the bow when it is fast and shallow.
        if top_depth < r * 0.4 && w.speed > 16.0 && (head - p).length() < 1500.0 {
            acc[i].1 += dt * w.speed * 1.2;
            let burst = acc[i].1.floor() as usize - (acc[i].1 - dt * w.speed * 1.2).floor() as usize;
            for k in 0..burst.min(6) {
                let a = fx_rand(acc[i].1 + k as f64);
                let side = DVec3::new(-fwd.z, 0.0, fwd.x) * if a > 0.5 { 1.0 } else { -1.0 };
                let at = DVec3::new(head.x, w.rings[0].sand, head.z) + fwd * r * 0.8 + side * r * 0.9;
                let v = side * (6.0 + 10.0 * a) + DVec3::Y * (5.0 + 12.0 * a) + fwd * w.speed * 0.5;
                fx.emit(crate::fx::Kind::Sand, at, v, (0.1 + 0.3 * a * a) as f32, 3.0);
            }
        }
        // Nearest part of the body, from a few samples.
        let d = w.rings.iter().step_by(8).map(|rg| (rg.centre - p).length() - rg.radius).fold(f64::MAX, f64::min).max(0.0);
        if d < best.distance {
            let to = head - p;
            best = Danger {
                level: 0.0,
                distance: d,
                bearing: DVec3::new(to.x, 0.0, to.z).normalize_or_zero(),
                speed: w.speed,
                surfaced: (1.0 - top_depth / (2.0 * r)).clamp(0.0, 1.0) as f32,
            };
        }
    }
    if best.distance < f64::MAX {
        let closeness = (1.0 - best.distance / 1200.0).clamp(0.0, 1.0);
        let pace = (best.speed / 30.0).clamp(0.15, 1.0);
        best.level = (closeness * closeness * pace) as f32;
    } else {
        best.distance = 1e9;
    }
    shake.rumble = best.level;
    *danger = best;
}

fn fx_rand(x: f64) -> f64 {
    ((x * 12.9898 + 78.233).sin() * 43758.5453).fract().abs()
}

/// Worms are never spawned on a timer, but on a long ride the ones you left
/// behind would otherwise be gone forever. A worm more than 9 km away that
/// nobody is on is quietly moved to somewhere 3.5 to 5 km from you, deep,
/// roaming. It never happens within sight: the fog closes at about 15 km
/// for terrain, but a deep worm leaves nothing to see.
fn recycle(
    desert: Res<Desert>,
    riding: Res<crate::rider::Riding>,
    player: Query<&PlayerBody>,
    mut worms: Query<(Entity, &mut WormBody)>,
    mut rng: Local<Option<Rng>>,
) {
    let Ok(pl) = player.single() else { return };
    let p = pl.0.pos;
    let rng = rng.get_or_insert_with(|| Rng::new(0x5EC7));
    for (e, mut wb) in &mut worms {
        if riding.worm == Some(e) {
            continue;
        }
        let far = if wb.worm.spec.length > 500.0 { 14_000.0 } else { 9_000.0 };
        if (wb.worm.head() - p).length() < far {
            continue;
        }
        for _ in 0..20 {
            let a = rng.range(0.0, std::f64::consts::TAU);
            let at = p + DVec3::new(a.cos(), 0.0, a.sin()) * rng.range(3500.0, 5000.0) * if wb.worm.spec.length > 500.0 { 1.8 } else { 1.0 };
            if desert.0.rock_near(at.x, at.z, 250.0).is_none() {
                let spec = wb.worm.spec;
                let d = desert.clone();
                let depth = spec.radius * 2.4;
                wb.worm = Worm::new(spec, at.x, at.z, rng.range(-3.1, 3.1), depth, move |x, z| d.0.sand(x, z));
                let seed = rng.next_u64();
                wb.brain = Brain::new(seed);
                wb.ear = Listener::new(seed ^ 1);
                break;
            }
        }
    }
}
