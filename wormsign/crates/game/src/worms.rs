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
        // `?wormface` points it straight at the player instead.
        let heading = if web::has_flag("wormface") { (p.z - at.z).atan2(p.x - at.x) } else { right.z.atan2(right.x) };
        placed.push((at, heading, depth));
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
