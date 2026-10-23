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
        // After the ground's material exists: the wake strip shares it, and
        // a handle taken before then is Bevy's magenta "missing" material.
        app.add_systems(Startup, spawn_population.after(crate::player::spawn).after(crate::ground::setup_material))
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
        let d = if giant { rng.range(5000.0, 7000.0) } else { rng.range(1500.0, 3000.0) };
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

/// Add a triangle wound to face the way its vertices' normals point, so
/// nothing in the mouth is ever culled from the wrong side.
fn tri(pos: &[[f32; 3]], nor: &[[f32; 3]], idx: &mut Vec<u32>, a: u32, b: u32, c: u32) {
    let p = |i: u32| Vec3::from_array(pos[i as usize]);
    let n = Vec3::from_array(nor[a as usize]) + Vec3::from_array(nor[b as usize]) + Vec3::from_array(nor[c as usize]);
    if (p(b) - p(a)).cross(p(c) - p(a)).dot(n) >= 0.0 {
        idx.extend_from_slice(&[a, b, c]);
    } else {
        idx.extend_from_slice(&[a, c, b]);
    }
}

/// A grid of vertices `w` wide starting at `base`, as triangles.
fn grid(pos: &[[f32; 3]], nor: &[[f32; 3]], idx: &mut Vec<u32>, base: u32, rows: u32, w: u32, wrap: bool) {
    let cols = if wrap { w } else { w - 1 };
    for i in 0..rows {
        for j in 0..cols {
            let j1 = if wrap { (j + 1) % w } else { j + 1 };
            let (a, b, c, d) = (base + i * w + j, base + i * w + j1, base + (i + 1) * w + j, base + (i + 1) * w + j1);
            tri(pos, nor, idx, a, b, d);
            tri(pos, nor, idx, a, d, c);
        }
    }
}

/// Cheap deterministic jitter in -1..1.
fn jit(a: u32, b: u32) -> f64 {
    let h = (a.wrapping_mul(374761393) ^ b.wrapping_mul(668265263)).wrapping_mul(1274126177);
    ((h >> 8) as f64 / (1u32 << 24) as f64) * 2.0 - 1.0
}

/// One curved, back-raked tooth from `root`: out along `-rd` (into the
/// mouth) and bending back along `-t` (down the throat).
#[allow(clippy::too_many_arguments)]
fn tooth(
    pos: &mut Vec<[f32; 3]>,
    nor: &mut Vec<[f32; 3]>,
    col: &mut Vec<[f32; 4]>,
    idx: &mut Vec<u32>,
    root: DVec3,
    inward: DVec3,
    back: DVec3,
    len: f64,
    wid: f64,
    rake: f64,
) {
    const SIDES: usize = 5;
    let pivot = inward.cross(back).normalize_or(DVec3::X);
    // Spine of the tooth: a curve from the gum to a point.
    let spine = |u: f64| root + inward * (len * u) + back * (len * rake * u * u);
    let base = pos.len() as u32;
    let rings = [0.0, 0.45, 0.8];
    let ivory = Vec3::new(0.86, 0.83, 0.72);
    let yellow = Vec3::new(0.52, 0.44, 0.30);
    for (ri, &u) in rings.iter().enumerate() {
        let c = spine(u);
        let d = (spine(u + 0.05) - c).normalize_or(inward);
        let side = pivot - d * pivot.dot(d);
        let side = side.normalize_or(pivot);
        let other = d.cross(side);
        let r = wid * (1.0 - u).powf(0.8);
        let shade = yellow.lerp(ivory, (u as f32 * 1.3).min(1.0));
        for k in 0..SIDES {
            let a = k as f64 / SIDES as f64 * std::f64::consts::TAU;
            let rn = side * a.cos() + other * a.sin();
            push(pos, nor, col, c + rn * r, rn, shade * if ri == 0 { 0.8 } else { 1.0 });
        }
    }
    let tip = push(pos, nor, col, spine(1.0), (spine(1.0) - spine(0.9)).normalize_or(inward), ivory);
    grid(pos, nor, idx, base, 2, SIDES as u32, true);
    let last = base + 2 * SIDES as u32;
    for k in 0..SIDES as u32 {
        tri(pos, nor, idx, last + k, last + (k + 1) % SIDES as u32, tip);
    }
}

/// The mouth: a thick, folded lip; five petals with ragged, toothed edges
/// and hooked teeth down their inner faces, closing into a cone and peeling
/// right back when it opens; and a long ribbed gullet lined with ring after
/// ring of back-raked teeth, going dark far down.
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
    let gum = Vec3::new(0.40, 0.11, 0.10);
    let flesh = Vec3::new(0.30, 0.05, 0.04);
    let flesh_deep = Vec3::new(0.05, 0.01, 0.01);
    let r = f.r;
    let around = 40usize;

    // --- throat -------------------------------------------------------------
    // Ribbed: a groove behind each ring of teeth.
    let depth_rings = 48;
    let throat_len = r * 6.0;
    let tooth_rings = 6;
    let ring_u = |k: usize| 0.04 + 0.13 * k as f64;
    let throat_rad = |u: f64| r * (0.9 - 0.55 * u.powf(0.8));
    let base = pos.len() as u32;
    for i in 0..=depth_rings {
        let u = i as f64 / depth_rings as f64;
        let ribs = 1.0 - 0.07 * ((u - 0.04) / 0.13 * PI).sin().abs().powf(0.5);
        let rad = throat_rad(u) * ribs;
        let centre = f.c - f.t * (throat_len * u);
        let groove = 1.0 - 0.45 * ((1.0 - ribs) / 0.07) as f32;
        let shade = flesh.lerp(flesh_deep, (u as f32).powf(0.55)) * groove.clamp(0.4, 1.0);
        for k in 0..around {
            let a = k as f64 / around as f64 * TAU;
            let rd = f.radial(a);
            // Wet folds running down the throat.
            let fold = 1.0 + 0.04 * (a * 9.0 + u * 5.0).sin();
            push(pos, nor, col, centre + rd * rad * fold, -rd, shade);
        }
    }
    grid(pos, nor, idx, base, depth_rings as u32, around as u32, true);
    // Cap it far down: nothing but dark.
    let end = f.c - f.t * throat_len;
    let hub = push(pos, nor, col, end - f.t * r * 0.2, f.t, flesh_deep * 0.3);
    let last = base + depth_rings as u32 * around as u32;
    for k in 0..around as u32 {
        tri(pos, nor, idx, last + k, last + (k + 1) % around as u32, hub);
    }

    // --- teeth down the gullet ---------------------------------------------
    for ring in 0..tooth_rings {
        let u = ring_u(ring);
        let n = 34 - ring * 2;
        let rad = throat_rad(u) * 0.97;
        for k in 0..n {
            let j = jit(ring as u32 * 97 + 1, k as u32);
            let a = (k as f64 + 0.5 * (ring % 2) as f64 + 0.25 * j) / n as f64 * TAU;
            let rd = f.radial(a);
            let root = f.c - f.t * (throat_len * u) + rd * rad;
            let len = r * (0.34 - 0.035 * ring as f64) * (0.55 + 0.45 * open) * (1.0 + 0.25 * jit(k as u32, ring as u32 + 7));
            tooth(pos, nor, col, idx, root, -rd, -f.t, len, r * 0.05, 0.9 + 0.3 * j);
        }
    }

    // --- lip ----------------------------------------------------------------
    // A thick fleshy torus joining the hide to the petals and the gullet,
    // folded all the way round.
    let lip_rings = 10;
    let base = pos.len() as u32;
    for i in 0..=lip_rings {
        let beta = i as f64 / lip_rings as f64 * TAU;
        for k in 0..around {
            let a = k as f64 / around as f64 * TAU;
            let rd = f.radial(a);
            let lr = r * 0.13 * (1.0 + 0.18 * (a * 23.0).sin() * (a * 7.0).cos());
            let n = f.t * beta.sin() + rd * beta.cos();
            let p = f.c + f.t * (r * 0.03) + rd * (r * 0.9) + n * lr;
            // Hide outside, raw wet gum inside.
            let inner = (-(beta.cos()) * 0.5 + 0.5) as f32;
            push(pos, nor, col, p, n, skin.lerp(gum, inner.powf(1.5)));
        }
    }
    grid(pos, nor, idx, base, lip_rings as u32, around as u32, true);

    // --- petals -------------------------------------------------------------
    // Closed, they lean in to a blunt cone ahead of the head; open, they
    // peel right back past the rim.
    let petals = 5;
    let lean = (-66.0f64).to_radians() + open * 185f64.to_radians();
    let (along_n, across_n) = (9usize, 8usize);
    for petal in 0..petals {
        let mid = petal as f64 / petals as f64 * TAU + PI / petals as f64;
        let half = TAU / (2.0 * petals as f64) * 0.97;
        let geom = |u: f64, v: f64| -> (DVec3, DVec3) {
            let curl = u * u * 0.5 * (2.0 * open - 1.0);
            let phi = lean + curl;
            // Ragged, serrated edges.
            let saw = 1.0 - 0.12 * ((u * 7.0).fract() - 0.5).abs() * 2.0;
            let span = half * (1.0 - 0.7 * u.powf(1.6)) * if v.abs() > 0.8 { saw } else { 1.0 };
            let a = mid + v * span;
            let rd = f.radial(a);
            let dir = f.t * phi.cos() + rd * phi.sin();
            let rim = f.c + rd * r * 0.96;
            // Slightly cupped across.
            let cup = (1.0 - v * v) * r * 0.06;
            let out = (rd * phi.cos() - f.t * phi.sin()).normalize();
            (rim + dir * r * 1.15 * u + out * cup, out)
        };
        for face in 0..2 {
            let base = pos.len() as u32;
            for i in 0..=along_n {
                let u = i as f64 / along_n as f64;
                for j in 0..=across_n {
                    let v = j as f64 / across_n as f64 * 2.0 - 1.0;
                    let (p, out) = geom(u, v);
                    let (n, c) = if face == 0 {
                        (out, skin * (0.85 + 0.15 * (1.0 - u as f32)))
                    } else {
                        // Inside: wet, darker in the creases.
                        (-out, gum.lerp(flesh, (u as f32).sqrt()) * (0.6 + 0.4 * (1.0 - v.abs() as f32)))
                    };
                    // Push the inner face a hair inward so the two never fight.
                    let p = if face == 1 { p - out * r * 0.012 } else { p };
                    push(pos, nor, col, p, n, c);
                }
            }
            grid(pos, nor, idx, base, along_n as u32, (across_n + 1) as u32, false);
        }
        // Hooked teeth in two rows down the inside of each petal, and a
        // fringe along its edges.
        for row in [-0.45f64, 0.45] {
            for k in 0..5 {
                let u = 0.18 + 0.15 * k as f64;
                let (p, out) = geom(u, row);
                let (p2, _) = geom(u + 0.05, row);
                let down = (p - p2).normalize_or(-f.t);
                let len = r * (0.2 - 0.02 * k as f64) * (0.4 + 0.6 * open);
                tooth(pos, nor, col, idx, p - out * r * 0.01, -out, down, len, r * 0.04, 0.8);
            }
        }
        for edge in [-1.0f64, 1.0] {
            for k in 0..6 {
                let u = 0.12 + 0.14 * k as f64;
                let (p, out) = geom(u, edge * 0.97);
                let (q, _) = geom(u, edge * 0.7);
                let sideways = (p - q).normalize_or(out);
                tooth(pos, nor, col, idx, p, (sideways * 0.6 - out * 0.8).normalize(), -out, r * 0.1 * (0.5 + 0.5 * open), r * 0.025, 0.4);
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
        let far = if wb.worm.spec.length > 500.0 { 12_000.0 } else { 6_000.0 };
        if (wb.worm.head() - p).length() < far {
            continue;
        }
        for _ in 0..20 {
            let a = rng.range(0.0, std::f64::consts::TAU);
            let at = p + DVec3::new(a.cos(), 0.0, a.sin()) * rng.range(1500.0, 3000.0) * if wb.worm.spec.length > 500.0 { 2.5 } else { 1.0 };
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
