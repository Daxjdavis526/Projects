//! The player's figure: a Fremen, animated.
//!
//! The pose comes from `wormsign_core::anim` (planted feet, IK legs, arms,
//! spine and head, all from what the simulation is doing); this module
//! builds the figure's meshes once (see [`fremen`]), places each rigid
//! segment between its two joints every frame, and runs the cloak as cloth
//! pinned round the shoulders. When the player dies the same segments are
//! driven by the ragdoll instead, so what the worm takes is the same figure
//! that was walking a moment before.

mod fremen;
mod geo;

use bevy::camera::visibility::NoFrustumCulling;
use bevy::math::Mat3;
use wormsign_core::glam::DMat3;
use wormsign_core::skin;
use bevy::prelude::*;
use wormsign_core::anim::{j, Activity, AnimInput, Animator, Pose, Proportions, LEFT, RIGHT};
use wormsign_core::cloth::{Capsule, Cloth};
use wormsign_core::glam::DVec3;
use wormsign_core::hook::HookState;
use wormsign_core::ragdoll;
use wormsign_core::worm::Worm;

use crate::death::Fate;
use crate::player::{Feet, Look, PlayerBody, StepEvents, View};
use crate::rider::Riding;
use crate::world::{Desert, Origin, Phase};
use crate::worms::WormBody;
use fremen::{Seg, Stuff, SEGS};

pub struct AvatarPlugin;

impl Plugin for AvatarPlugin {
    fn build(&self, app: &mut App) {
        app.insert_resource(Figure::new())
            .add_systems(Startup, spawn)
            .add_systems(Update, (animate, draw).chain().in_set(Phase::Place).after(crate::world::place));
    }
}

/// Stature, metres.
pub const HEIGHT: f64 = 1.78;

/// Cloak resolution: columns round the shoulders, rows down.
const CLOAK_W: usize = 13;
const CLOAK_H: usize = 11;
const CLOAK_LEN: f64 = 1.12;

#[derive(Resource)]
pub struct Figure {
    pub anim: Animator,
    /// This frame's joints, world space, whoever drives them.
    pub pose: Option<Pose>,
    cloak: Option<Cloth>,
    was_stowed: [bool; 2],
    throw: Option<(bool, f64)>,
    plant: Option<f64>,
    /// Where each hand is, for the ropes.
    pub hands: [DVec3; 2],
}

impl Figure {
    fn new() -> Self {
        Self {
            anim: Animator::new(Proportions::of_height(HEIGHT)),
            pose: None,
            cloak: None,
            was_stowed: [true, true],
            throw: None,
            plant: None,
            hands: [DVec3::ZERO; 2],
        }
    }

    /// The first-person eye: just in front of the head's centre.
    pub fn eye(&self) -> Option<DVec3> {
        let p = self.pose.as_ref()?;
        let head = p.j[j::HEAD];
        let up = (head - p.j[j::NECK]).normalize_or_zero();
        // In front of the face whichever way it looks, never down into the
        // collar.
        let flat = DVec3::new(p.look.x, 0.0, p.look.z).normalize_or(p.fwd);
        Some(head + flat * 0.08 + up * 0.03)
    }
}

/// The joints the ragdoll takes over from the animated pose.
pub fn ragdoll_joints(p: &Pose) -> [DVec3; ragdoll::JOINTS] {
    let mut r = [DVec3::ZERO; ragdoll::JOINTS];
    r[ragdoll::HEAD] = p.j[j::HEAD];
    r[ragdoll::CHEST] = p.j[j::CHEST];
    r[ragdoll::PELVIS] = p.j[j::PELVIS];
    r[ragdoll::L_ELBOW] = p.j[j::ELBOW[LEFT]];
    r[ragdoll::R_ELBOW] = p.j[j::ELBOW[RIGHT]];
    r[ragdoll::L_HAND] = p.j[j::WRIST[LEFT]];
    r[ragdoll::R_HAND] = p.j[j::WRIST[RIGHT]];
    r[ragdoll::L_KNEE] = p.j[j::KNEE[LEFT]];
    r[ragdoll::R_KNEE] = p.j[j::KNEE[RIGHT]];
    r[ragdoll::L_FOOT] = p.j[j::ANKLE[LEFT]];
    r[ragdoll::R_FOOT] = p.j[j::ANKLE[RIGHT]];
    r[ragdoll::L_SHOULDER] = p.j[j::SHOULDER[LEFT]];
    r[ragdoll::R_SHOULDER] = p.j[j::SHOULDER[RIGHT]];
    r[ragdoll::L_HIP] = p.j[j::HIP[LEFT]];
    r[ragdoll::R_HIP] = p.j[j::HIP[RIGHT]];
    r[ragdoll::L_TOE] = p.j[j::TOE[LEFT]];
    r[ragdoll::R_TOE] = p.j[j::TOE[RIGHT]];
    r
}

/// A body to draw: joint positions and the frames the segments hang in.
struct Skeleton {
    j: [DVec3; j::COUNT],
    /// Toward the back of the pelvis, of the chest, and of the head.
    pelvis_back: DVec3,
    chest_back: DVec3,
    head_back: DVec3,
    /// Per segment: drawn or not.
    shown: [bool; 16],
    /// Red where something was torn off.
    stumps: Vec<DVec3>,
    /// Per segment: its first joint has been torn through, so the skin
    /// must not stretch across it.
    cut: [bool; 16],
}

impl Skeleton {
    fn from_pose(p: &Pose) -> Self {
        Self {
            j: p.j,
            pelvis_back: -p.fwd,
            chest_back: -p.chest_fwd,
            head_back: -p.look,
            shown: [true; 16],
            stumps: Vec::new(),
            cut: [false; 16],
        }
    }

    fn from_ragdoll(rag: &ragdoll::Ragdoll, fate: &Fate, pr: &Proportions) -> Self {
        use ragdoll::*;
        let q = &rag.p;
        let intact = |a: usize, b: usize| rag.links.iter().any(|l| l.bone && l.intact && ((l.a == a && l.b == b) || (l.a == b && l.b == a)));
        let up = (q[CHEST] - q[PELVIS]).normalize_or(DVec3::Y);
        let right = (q[R_SHOULDER] - q[L_SHOULDER]).normalize_or(DVec3::X);
        let hip_right = (q[R_HIP] - q[L_HIP]).normalize_or(right);
        let chest_back = right.cross(up).normalize_or(DVec3::Z);
        let pelvis_back = hip_right.cross(up).normalize_or(chest_back);
        let mut jj = [DVec3::ZERO; wormsign_core::anim::j::COUNT];
        let k_waist = (pr.waist_height - pr.hip_height) / (pr.chest_height - pr.hip_height);
        jj[j::PELVIS] = q[PELVIS];
        jj[j::WAIST] = q[PELVIS].lerp(q[CHEST], k_waist);
        jj[j::CHEST] = q[CHEST];
        let head_dir = (q[HEAD] - q[CHEST]).normalize_or(up);
        let neck_len = pr.neck_height - pr.chest_height;
        let head_len = pr.head_centre - pr.neck_height;
        jj[j::HEAD] = q[HEAD];
        jj[j::NECK] = if intact(CHEST, HEAD) { q[CHEST] + (q[HEAD] - q[CHEST]) * (neck_len / (neck_len + head_len)) } else { q[HEAD] - head_dir * head_len };
        let mut stumps = Vec::new();
        let legs = [(L_HIP, L_KNEE, L_FOOT, L_TOE), (R_HIP, R_KNEE, R_FOOT, R_TOE)];
        for (f, (hip, knee, foot, toe)) in legs.into_iter().enumerate() {
            jj[j::KNEE[f]] = q[knee];
            jj[j::ANKLE[f]] = q[foot];
            jj[j::TOE[f]] = q[toe];
            jj[j::HIP[f]] = if intact(hip, knee) {
                q[hip]
            } else {
                // The thigh went with the leg.
                stumps.push(q[hip]);
                let top = q[knee] + (q[knee] - q[foot]).normalize_or(up) * pr.thigh;
                stumps.push(top);
                top
            };
        }
        let arms = [(L_SHOULDER, L_ELBOW, L_HAND), (R_SHOULDER, R_ELBOW, R_HAND)];
        for (f, (sh, el, hand)) in arms.into_iter().enumerate() {
            jj[j::ELBOW[f]] = q[el];
            jj[j::WRIST[f]] = q[hand];
            jj[j::FINGERS[f]] = q[hand] + (q[hand] - q[el]).normalize_or(-up) * pr.hand * 0.8;
            jj[j::SHOULDER[f]] = if intact(sh, el) {
                q[sh]
            } else {
                stumps.push(q[sh]);
                let top = q[el] + (q[el] - q[hand]).normalize_or(up) * pr.upper_arm;
                stumps.push(top);
                top
            };
        }
        if !intact(CHEST, HEAD) {
            stumps.push(q[CHEST] + up * neck_len * 0.8);
            stumps.push(jj[j::NECK]);
        }
        let gone = |i: usize| fate.swallowed[i];
        let mut shown = [true; 16];
        for (k, seg) in SEGS.iter().enumerate() {
            let parts: &[usize] = match seg {
                Seg::Pelvis => &[PELVIS],
                Seg::Abdomen => &[PELVIS, CHEST],
                Seg::Chest => &[CHEST],
                Seg::Head => &[HEAD],
                Seg::Thigh(f) => &[[L_KNEE, R_KNEE][*f]],
                Seg::Shank(f) => &[[L_FOOT, R_FOOT][*f]],
                Seg::Foot(f) => &[[L_TOE, R_TOE][*f]],
                Seg::UpperArm(f) => &[[L_ELBOW, R_ELBOW][*f]],
                Seg::Forearm(f) | Seg::Hand(f) => &[[L_HAND, R_HAND][*f]],
            };
            shown[k] = parts.iter().all(|&i| !gone(i));
        }
        let stumps = stumps.into_iter().filter(|s| rag.p.iter().enumerate().any(|(i, q)| !gone(i) && (*q - *s).length() < 0.6)).collect();
        let mut cut = [false; 16];
        for (k, seg) in SEGS.iter().enumerate() {
            cut[k] = match seg {
                Seg::Thigh(f) => !intact([L_HIP, R_HIP][*f], [L_KNEE, R_KNEE][*f]),
                Seg::UpperArm(f) => !intact([L_SHOULDER, R_SHOULDER][*f], [L_ELBOW, R_ELBOW][*f]),
                Seg::Head => !intact(CHEST, HEAD),
                _ => false,
            };
        }
        Self { j: jj, pelvis_back, chest_back, head_back: chest_back, shown, stumps, cut }
    }

    /// Joints and back reference of a segment.
    fn span(&self, seg: Seg) -> (DVec3, DVec3, DVec3) {
        let jj = &self.j;
        match seg {
            Seg::Pelvis => (jj[j::PELVIS], jj[j::WAIST], self.pelvis_back),
            Seg::Abdomen => (jj[j::WAIST], jj[j::CHEST], (self.pelvis_back + self.chest_back).normalize_or(self.chest_back)),
            Seg::Chest => (jj[j::CHEST], jj[j::NECK], self.chest_back),
            Seg::Head => (jj[j::NECK], jj[j::HEAD], self.head_back),
            Seg::Thigh(f) => (jj[j::HIP[f]], jj[j::KNEE[f]], -(jj[j::TOE[f]] - jj[j::ANKLE[f]])),
            Seg::Shank(f) => (jj[j::KNEE[f]], jj[j::ANKLE[f]], -(jj[j::TOE[f]] - jj[j::ANKLE[f]])),
            Seg::Foot(f) => (jj[j::ANKLE[f]], jj[j::TOE[f]], jj[j::ANKLE[f]] - jj[j::KNEE[f]]),
            Seg::UpperArm(f) => (jj[j::SHOULDER[f]], jj[j::ELBOW[f]], self.chest_back),
            Seg::Forearm(f) => (jj[j::ELBOW[f]], jj[j::WRIST[f]], self.chest_back),
            Seg::Hand(f) => (jj[j::WRIST[f]], jj[j::FINGERS[f]], self.chest_back),
        }
    }
}

/// The length a segment's mesh was built for.
fn rest_len(seg: Seg, p: &Proportions) -> f64 {
    match seg {
        Seg::Pelvis => p.waist_height - p.hip_height,
        Seg::Abdomen => p.chest_height - p.waist_height,
        Seg::Chest => p.neck_height - p.chest_height,
        Seg::Head => p.head_centre - p.neck_height,
        Seg::Thigh(_) => p.thigh,
        Seg::Shank(_) => p.shank,
        Seg::Foot(_) => {
            let ball = p.foot * 0.62;
            let drop = p.ankle_height * 0.7;
            (ball * ball + drop * drop).sqrt()
        }
        Seg::UpperArm(_) => p.upper_arm,
        Seg::Forearm(_) => p.forearm,
        Seg::Hand(_) => p.hand * 0.8,
    }
}

/// Rotation taking +y to a→b and +z as near `back` as it can.
fn frame(a: DVec3, b: DVec3, back: DVec3) -> (Quat, f64) {
    let d = b - a;
    let len = d.length();
    let y = if len > 1e-6 { d / len } else { DVec3::Y };
    let mut z = back - y * back.dot(y);
    if z.length_squared() < 1e-4 {
        // Pointing straight along the reference: pick anything square.
        z = y.any_orthonormal_vector();
    }
    let z = z.normalize();
    let x = y.cross(z);
    let m = Mat3::from_cols(x.as_vec3(), y.as_vec3(), z.as_vec3());
    (Quat::from_mat3(&m).normalize(), len)
}

/// The same frame, in f64, as a skinning bone.
fn bone(a: DVec3, b: DVec3, back: DVec3, rest: f64) -> skin::Frame {
    let d = b - a;
    let len = d.length();
    let y = if len > 1e-6 { d / len } else { DVec3::Y };
    let mut z = back - y * back.dot(y);
    if z.length_squared() < 1e-4 {
        z = y.any_orthonormal_vector();
    }
    let z = z.normalize();
    let x = y.cross(z);
    skin::Frame { origin: a, rot: DMat3::from_cols(x, y, z), stretch: (len / rest).clamp(0.3, 3.0) }
}

fn seg_index(seg: Seg) -> usize {
    SEGS.iter().position(|s| *s == seg).unwrap()
}

/// Which bone a segment's skin blends into at its first joint and at its
/// second, and over how many metres either side of the joint.
fn neighbours(seg: Seg) -> (Option<(Seg, f64)>, Option<(Seg, f64)>) {
    match seg {
        Seg::Pelvis => (None, Some((Seg::Abdomen, 0.05))),
        Seg::Abdomen => (Some((Seg::Pelvis, 0.05)), Some((Seg::Chest, 0.05))),
        Seg::Chest => (Some((Seg::Abdomen, 0.05)), Some((Seg::Head, 0.04))),
        Seg::Head => (Some((Seg::Chest, 0.04)), None),
        Seg::Thigh(f) => (Some((Seg::Pelvis, 0.07)), Some((Seg::Shank(f), 0.06))),
        Seg::Shank(f) => (Some((Seg::Thigh(f), 0.06)), Some((Seg::Foot(f), 0.04))),
        Seg::Foot(f) => (Some((Seg::Shank(f), 0.04)), None),
        Seg::UpperArm(f) => (Some((Seg::Chest, 0.06)), Some((Seg::Forearm(f), 0.05))),
        Seg::Forearm(f) => (Some((Seg::UpperArm(f), 0.05)), Some((Seg::Hand(f), 0.03))),
        Seg::Hand(f) => (Some((Seg::Forearm(f), 0.03)), None),
    }
}

/// One vertex of the skin: where it sits in its own bone's frame, and how
/// much it follows a neighbouring bone.
#[derive(Clone, Copy)]
struct SkinVert {
    local: DVec3,
    n: DVec3,
    seg: u8,
    /// Neighbouring segment and its weight, and whether the blend is across
    /// the segment's first joint (else its second).
    nb: Option<(u8, f32, bool)>,
}

/// All the figure's pieces of one material, as one skinned mesh.
struct SkinPart {
    verts: Vec<SkinVert>,
    col: Vec<[f32; 4]>,
    idx: Vec<u32>,
    /// Owning segment of each triangle, for hiding parts.
    tri_seg: Vec<u8>,
    mesh: Handle<Mesh>,
    entity: Entity,
}

#[derive(Resource)]
struct Body {
    parts: Vec<SkinPart>,
    bind: [skin::Frame; 16],
    rest: [f64; 16],
}

#[derive(Component)]
struct BackHook(usize);

#[derive(Component)]
struct CloakMesh;

#[derive(Component)]
struct StumpBall;

#[derive(Resource)]
struct CloakHandle(Handle<Mesh>);

fn materials(mats: &mut Assets<StandardMaterial>) -> impl Fn(Stuff) -> Handle<StandardMaterial> + use<> {
    let suit = mats.add(StandardMaterial { base_color: Color::WHITE, perceptual_roughness: 0.52, reflectance: 0.45, ..default() });
    let leather = mats.add(StandardMaterial { base_color: Color::WHITE, perceptual_roughness: 0.72, reflectance: 0.3, ..default() });
    let cloth = mats.add(StandardMaterial {
        base_color: Color::WHITE,
        perceptual_roughness: 0.97,
        reflectance: 0.2,
        double_sided: true,
        cull_mode: None,
        ..default()
    });
    let metal = mats.add(StandardMaterial { base_color: Color::WHITE, metallic: 0.85, perceptual_roughness: 0.38, ..default() });
    let skin = mats.add(StandardMaterial { base_color: Color::WHITE, perceptual_roughness: 0.6, reflectance: 0.35, ..default() });
    move |s| match s {
        Stuff::Suit => suit.clone(),
        Stuff::Leather => leather.clone(),
        Stuff::Cloth => cloth.clone(),
        Stuff::Metal => metal.clone(),
        Stuff::Skin => skin.clone(),
    }
}

fn spawn(mut commands: Commands, mut meshes: ResMut<Assets<Mesh>>, mut mats: ResMut<Assets<StandardMaterial>>) {
    let p = Proportions::of_height(HEIGHT);
    let mat = materials(&mut mats);
    // The bind pose: the animator's own standing pose.
    let bind_pose = {
        let mut an = Animator::new(p);
        let mut pose = None;
        for _ in 0..30 {
            let input = AnimInput {
                pos: DVec3::ZERO,
                vel: DVec3::ZERO,
                ground_vel: DVec3::ZERO,
                look_yaw: 0.0,
                look_pitch: 0.0,
                gait: wormsign_core::player::Gait::Still,
                grounded: true,
                crouch: 0.0,
                step_interval: 0.55,
                last_left: false,
                strike: None,
                landed: None,
                activity: Activity::Move,
            };
            pose = Some(an.update(&input, 1.0 / 30.0, |_, _| 0.0));
        }
        pose.unwrap()
    };
    let sk = Skeleton::from_pose(&bind_pose);
    let mut rest = [0.0; 16];
    let mut bind = [skin::Frame { origin: DVec3::ZERO, rot: DMat3::IDENTITY, stretch: 1.0 }; 16];
    for (k, seg) in SEGS.iter().enumerate() {
        rest[k] = rest_len(*seg, &p);
        let (a, b, back) = sk.span(*seg);
        bind[k] = bone(a, b, back, rest[k]);
        bind[k].stretch = 1.0;
    }
    let mut parts: Vec<(Stuff, SkinPart)> = Vec::new();
    for (k, seg) in SEGS.iter().enumerate() {
        let (start, end) = neighbours(*seg);
        for (stuff, geo) in fremen::build(*seg, &p) {
            let at = match parts.iter().position(|(s, _)| *s == stuff) {
                Some(i) => i,
                None => {
                    parts.push((stuff, SkinPart { verts: vec![], col: vec![], idx: vec![], tri_seg: vec![], mesh: Handle::default(), entity: Entity::PLACEHOLDER }));
                    parts.len() - 1
                }
            };
            let part = &mut parts[at].1;
            let base = part.verts.len() as u32;
            for (i, q) in geo.pos.iter().enumerate() {
                let local = DVec3::new(q[0] as f64, q[1] as f64, q[2] as f64);
                let n = geo.nor[i];
                let before = -local.y;
                let after = local.y - rest[k];
                let nb = match (start, end) {
                    (Some((ns, r)), _) if before > -r && (end.is_none() || before >= after) => {
                        Some((seg_index(ns) as u8, skin::neighbour_weight(before, r) as f32, true))
                    }
                    (_, Some((ns, r))) if after > -r => Some((seg_index(ns) as u8, skin::neighbour_weight(after, r) as f32, false)),
                    _ => None,
                };
                part.verts.push(SkinVert { local, n: DVec3::new(n[0] as f64, n[1] as f64, n[2] as f64), seg: k as u8, nb });
                part.col.push(geo.col[i]);
            }
            for t in geo.idx.chunks(3) {
                part.idx.extend(t.iter().map(|i| i + base));
                part.tri_seg.push(k as u8);
            }
        }
    }
    let mut body = Body { parts: Vec::new(), bind, rest };
    for (stuff, mut part) in parts {
        let mesh = meshes.add(
            Mesh::new(bevy::mesh::PrimitiveTopology::TriangleList, bevy::asset::RenderAssetUsages::RENDER_WORLD | bevy::asset::RenderAssetUsages::MAIN_WORLD)
                .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, vec![[0.0f32; 3]; part.verts.len()])
                .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, vec![[0.0f32, 1.0, 0.0]; part.verts.len()])
                .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, part.col.clone())
                .with_inserted_indices(bevy::mesh::Indices::U32(part.idx.clone())),
        );
        part.entity = commands.spawn((Mesh3d(mesh.clone()), MeshMaterial3d(mat(stuff)), Transform::default(), Visibility::Hidden, NoFrustumCulling)).id();
        part.mesh = mesh;
        body.parts.push(part);
    }
    commands.insert_resource(body);
    for i in 0..2 {
        commands.spawn((BackHook(i), Transform::default(), Visibility::Hidden)).with_children(|c| {
            for (stuff, geo) in fremen::maker_hook(HEIGHT as f32 / 1.78) {
                c.spawn((Mesh3d(meshes.add(geo.mesh())), MeshMaterial3d(mat(stuff)), Transform::default()));
            }
        });
    }
    let cloak = meshes.add(
        Mesh::new(bevy::mesh::PrimitiveTopology::TriangleList, bevy::asset::RenderAssetUsages::RENDER_WORLD | bevy::asset::RenderAssetUsages::MAIN_WORLD)
            .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, vec![[0.0f32; 3]; 3])
            .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, vec![[0.0f32, 1.0, 0.0]; 3])
            .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, vec![[1.0f32; 4]; 3])
            .with_inserted_indices(bevy::mesh::Indices::U32(vec![0, 1, 2])),
    );
    commands.spawn((CloakMesh, Mesh3d(cloak.clone()), MeshMaterial3d(mat(Stuff::Cloth)), Transform::default(), Visibility::Hidden, NoFrustumCulling));
    commands.insert_resource(CloakHandle(cloak));
    let raw = mats.add(StandardMaterial { base_color: Color::srgb(0.42, 0.03, 0.02), perceptual_roughness: 0.3, reflectance: 0.5, ..default() });
    let ball = meshes.add(Sphere::new(1.0).mesh().ico(2).unwrap());
    for _ in 0..8 {
        commands.spawn((StumpBall, Mesh3d(ball.clone()), MeshMaterial3d(raw.clone()), Transform::default(), Visibility::Hidden));
    }
}

/// Points the cloak hangs from: an arc round the back of the shoulders,
/// from the front of one to the front of the other.
fn cloak_pins(sk: &Skeleton, p: &Proportions) -> Vec<DVec3> {
    let chest = sk.j[j::CHEST];
    let neck = sk.j[j::NECK];
    let up = (neck - chest).normalize_or(DVec3::Y);
    let back = sk.chest_back;
    let right = up.cross(back).normalize_or(DVec3::X);
    let right = if right.dot(sk.j[j::SHOULDER[RIGHT]] - sk.j[j::SHOULDER[LEFT]]) < 0.0 { -right } else { right };
    let c = chest.lerp(neck, 0.66);
    // Outside everything it drapes over: shoulders, the hooks' butts, the
    // caller.
    let (rx, rz) = (p.shoulder_half + 0.085, 0.17);
    let max = 118f64.to_radians();
    (0..CLOAK_W)
        .map(|k| {
            let th = -max + 2.0 * max * k as f64 / (CLOAK_W - 1) as f64;
            // Over the tops of the shoulders, dipping at the back of the neck.
            let lift = 0.02 * (1.0 - th.cos().abs()) - 0.01 * th.cos().max(0.0);
            c + right * (th.sin() * rx) + back * (th.cos() * rz) + up * lift
        })
        .collect()
}

fn capsules(sk: &Skeleton) -> Vec<Capsule> {
    let jj = &sk.j;
    let back = sk.chest_back;
    let up = (jj[j::NECK] - jj[j::CHEST]).normalize_or(DVec3::Y);
    let mut v = vec![
        // Torso, and the gear on the back (kept below the pin line).
        Capsule { a: jj[j::PELVIS] - up * 0.04, b: jj[j::CHEST] + up * 0.12, r: 0.16 },
        Capsule { a: jj[j::CHEST] + back * 0.1 - up * 0.3, b: jj[j::CHEST] + back * 0.1 + up * 0.04, r: 0.09 },
    ];
    for f in 0..2 {
        v.push(Capsule { a: jj[j::HIP[f]], b: jj[j::KNEE[f]], r: 0.1 });
        v.push(Capsule { a: jj[j::KNEE[f]], b: jj[j::ANKLE[f]], r: 0.075 });
        v.push(Capsule { a: jj[j::SHOULDER[f]], b: jj[j::ELBOW[f]], r: 0.07 });
        v.push(Capsule { a: jj[j::ELBOW[f]], b: jj[j::WRIST[f]], r: 0.055 });
    }
    v
}

#[allow(clippy::too_many_arguments)]
fn animate(
    time: Res<Time>,
    mut pack: ResMut<crate::caller::Pack>,
    desert: Res<Desert>,
    look: Res<Look>,
    fate: Res<Fate>,
    riding: Res<Riding>,
    mut steps: ResMut<StepEvents>,
    mut fig: ResMut<Figure>,
    player: Query<(&PlayerBody, &Feet)>,
    worms_q: Query<&WormBody>,
) {
    let Ok((body, feet)) = player.single() else { return };
    let dt = time.delta_secs_f64();
    let fig = &mut *fig;
    let p = &body.0;
    let worms: Vec<&Worm> = worms_q.iter().map(|w| &w.worm).collect();
    let y_near = p.pos.y;
    let ground = |x: f64, z: f64| crate::player::ground_at(&desert, &worms, x, z, y_near).height;
    let pr = fig.anim.p;

    if !fate.alive() {
        return;
    }

    // What the arms are doing.
    for i in 0..2 {
        let stowed = matches!(riding.hooks[i].state, HookState::Stowed);
        if fig.was_stowed[i] && matches!(riding.hooks[i].state, HookState::Flying { .. }) {
            fig.throw = Some((i == RIGHT, 0.0));
        }
        fig.was_stowed[i] = stowed;
    }
    if std::mem::take(&mut pack.planted_now) {
        fig.plant = Some(0.0);
    }
    let mut activity = Activity::Move;
    if let Some(t) = fig.plant.as_mut() {
        *t += dt;
        if *t > 1.1 {
            fig.plant = None;
        } else {
            activity = Activity::Plant { t: *t };
        }
    }
    if let Some((right, t)) = fig.throw.as_mut() {
        *t += dt;
        if *t > 0.6 {
            fig.throw = None;
        } else {
            activity = Activity::Throw { right: *right, t: *t };
        }
    }
    let mounted = riding.riding() && (riding.on_back || p.grounded);
    if mounted {
        // Hands on the ropes, a little way along each toward its hook.
        let mut hands = [DVec3::ZERO; 2];
        let prev = fig.pose.as_ref();
        for i in 0..2 {
            let shoulder = prev.map(|q| q.j[j::SHOULDER[i]]).unwrap_or(p.pos + DVec3::Y * 1.45);
            let worm = riding.hooked[i].and_then(|e| worms_q.get(e).ok()).map(|w| &w.worm);
            let end = riding.hooks[i].position(worm).or_else(|| riding.hooks[1 - i].position(riding.hooked[1 - i].and_then(|e| worms_q.get(e).ok()).map(|w| &w.worm)));
            hands[i] = match end {
                Some(e) => {
                    let d = (e - shoulder).normalize_or(DVec3::NEG_Y);
                    shoulder + d * (pr.upper_arm + pr.forearm) * 0.82
                }
                None => shoulder + DVec3::NEG_Y * 0.5,
            };
        }
        activity = Activity::Ride { hands };
    }

    let input = AnimInput {
        pos: p.pos,
        vel: p.vel,
        ground_vel: steps.ground_vel,
        look_yaw: look.yaw as f64,
        look_pitch: look.pitch as f64,
        gait: p.gait,
        grounded: p.grounded,
        crouch: p.crouch,
        step_interval: feet.0.interval(),
        last_left: feet.0.last_left(),
        strike: steps.strike.take(),
        landed: steps.landed.take(),
        activity,
    };
    // Long frames (a hitch, a slow machine) are taken in short steps, so the
    // gait and the landing spring stay stable; events go in with the first.
    let n = ((dt * 60.0).ceil() as usize).clamp(1, 15);
    let mut input = input;
    let mut pose = fig.anim.update(&input, dt / n as f64, &ground);
    for _ in 1..n {
        input.strike = None;
        input.landed = None;
        pose = fig.anim.update(&input, dt / n as f64, &ground);
    }
    fig.hands = [pose.j[j::WRIST[LEFT]], pose.j[j::WRIST[RIGHT]]];
    fig.pose = Some(pose);
    let _ = pr;
}

#[allow(clippy::too_many_arguments)]
fn draw(
    time: Res<Time>,
    origin: Res<Origin>,
    desert: Res<Desert>,
    look: Res<Look>,
    fate: Res<Fate>,
    riding: Res<Riding>,
    mut fig: ResMut<Figure>,
    cloak_h: Res<CloakHandle>,
    mut meshes: ResMut<Assets<Mesh>>,
    body: Res<Body>,
    mut vis: Query<&mut Visibility, (Without<BackHook>, Without<CloakMesh>, Without<StumpBall>)>,
    mut hooks: Query<(&BackHook, &mut Transform, &mut Visibility), (Without<CloakMesh>, Without<StumpBall>)>,
    mut cloak_q: Query<&mut Visibility, (With<CloakMesh>, Without<BackHook>, Without<StumpBall>)>,
    mut stumps: Query<(&mut Transform, &mut Visibility), (With<StumpBall>, Without<BackHook>, Without<CloakMesh>)>,
) {
    let fig = &mut *fig;
    let pr = fig.anim.p;
    let sk = if fate.alive() {
        match fig.pose.as_ref() {
            Some(p) => Skeleton::from_pose(p),
            None => return,
        }
    } else {
        match fate.rag.as_ref() {
            Some(r) => Skeleton::from_ragdoll(r, &fate, &pr),
            None => return,
        }
    };
    let first = fate.alive() && look.view == View::First && !look.cinematic;
    let everything_gone = !fate.alive() && sk.shown.iter().all(|s| !s);

    let set_vis = |v: &mut Visibility, on: bool| {
        let want = if on { Visibility::Inherited } else { Visibility::Hidden };
        if *v != want {
            *v = want;
        }
    };
    // The skin: every vertex taken through its bone (and, near a joint, its
    // neighbour's) from the bind pose to this frame's.
    let mut now = body.bind;
    for (k, seg) in SEGS.iter().enumerate() {
        let (a, b, back) = sk.span(*seg);
        now[k] = bone(a, b, back, body.rest[k]);
    }
    let mut shown = sk.shown;
    if first {
        shown[seg_index(Seg::Head)] = false;
    }
    let any = shown.iter().any(|s| *s);
    for part in &body.parts {
        if let Ok(mut v) = vis.get_mut(part.entity) {
            set_vis(&mut v, any);
        }
        if !any {
            continue;
        }
        let Some(mut mesh) = meshes.get_mut(&part.mesh) else { continue };
        let mut pos = Vec::with_capacity(part.verts.len());
        let mut nor = Vec::with_capacity(part.verts.len());
        for v in &part.verts {
            let k = v.seg as usize;
            let other = v.nb.and_then(|(o, w, at_start)| {
                let o = o as usize;
                // Never stretch skin across a torn joint.
                let torn = if at_start { sk.cut[k] } else { sk.cut[o] };
                (!torn).then_some((&body.bind[o], &now[o], w as f64))
            });
            let p = skin::skin_point(v.local, &body.bind[k], &now[k], other);
            let n = skin::skin_normal(v.n, &body.bind[k], &now[k], other);
            pos.push(origin.to_render(p).to_array());
            nor.push(n.as_vec3().to_array());
        }
        let idx: Vec<u32> = if shown.iter().all(|s| *s) {
            part.idx.clone()
        } else {
            part.idx.chunks(3).zip(&part.tri_seg).filter(|(_, s)| shown[**s as usize]).flat_map(|(t, _)| t.iter().copied()).collect()
        };
        mesh.insert_attribute(Mesh::ATTRIBUTE_POSITION, pos);
        mesh.insert_attribute(Mesh::ATTRIBUTE_NORMAL, nor);
        mesh.insert_indices(bevy::mesh::Indices::U32(idx));
    }
    let chest_frame = {
        let (a, b, back) = sk.span(Seg::Chest);
        let (rot, _) = frame(a, b, back);
        (rot, origin.to_render(a))
    };

    // The hooks ride on the back until thrown.
    for (h, mut t, mut v) in &mut hooks {
        let stowed = matches!(riding.hooks[h.0].state, HookState::Stowed);
        let chest_there = sk.shown[2];
        set_vis(&mut v, stowed && chest_there);
        let s = if h.0 == LEFT { -1.0 } else { 1.0 };
        let (rot, at) = chest_frame;
        let local = Vec3::new(s * 0.09, -0.5, 0.15);
        t.translation = at + rot * local;
        t.rotation = rot * Quat::from_rotation_z(-s * 0.3) * Quat::from_rotation_y(s * 0.3);
    }

    // Cloak.
    let dt = time.delta_secs_f64();
    let pins = cloak_pins(&sk, &pr);
    let cl = fig.cloak.get_or_insert_with(|| Cloth::new(&pins, CLOAK_H, CLOAK_LEN));
    let (wx, wz) = desert.0.wind();
    let t = time.elapsed_secs_f64();
    let gust = 1.4 + 0.9 * (t * 0.37).sin() + 0.5 * (t * 1.13 + 1.0).sin();
    let wind = DVec3::new(wx, 0.0, wz).normalize_or(DVec3::X) * gust;
    let caps = capsules(&sk);
    cl.step(dt, &pins, &caps, wind, |x, z| desert.0.height(x, z) as f64);
    let show_cloak = !everything_gone && sk.shown[2];
    if let Ok(mut v) = cloak_q.single_mut() {
        set_vis(&mut v, show_cloak);
    }
    if show_cloak {
        if let Some(mut mesh) = meshes.get_mut(&cloak_h.0) {
            cloak_mesh(&mut mesh, cl, &origin);
        }
    }

    for (k, (mut t, mut v)) in stumps.iter_mut().enumerate() {
        if let Some(s) = sk.stumps.get(k) {
            t.translation = origin.to_render(*s);
            t.scale = Vec3::splat(0.07);
            set_vis(&mut v, true);
        } else {
            set_vis(&mut v, false);
        }
    }
}

fn cloak_mesh(mesh: &mut Mesh, cl: &Cloth, origin: &Origin) {
    let (w, h) = (cl.w, cl.h);
    let pos: Vec<[f32; 3]> = cl.p.iter().map(|q| origin.to_render(*q).to_array()).collect();
    let at = |r: usize, c: usize| Vec3::from_array(pos[r * w + c]);
    let mut nor = Vec::with_capacity(pos.len());
    let mut col = Vec::with_capacity(pos.len());
    let base = geo::lin(0.6, 0.51, 0.385);
    let dust = geo::lin(0.66, 0.56, 0.42);
    let dark = geo::lin(0.42, 0.34, 0.25);
    for r in 0..h {
        for c in 0..w {
            let du = at((r + 1).min(h - 1), c) - at(r.saturating_sub(1), c);
            let dv = at(r, (c + 1).min(w - 1)) - at(r, c.saturating_sub(1));
            // Agrees with the triangles' winding; the material is two-sided
            // and lights whichever face is toward the camera.
            let n = du.cross(dv).normalize_or(Vec3::Y);
            nor.push(n.to_array());
            let t = r as f32 / (h - 1) as f32;
            // Dusty toward the hem, darker right at it, a few old stains.
            let mut k = geo::mix(base, dust, t * t);
            if r == h - 1 {
                k = geo::mix(k, dark, 0.5);
            }
            let stain = ((c as f32 * 1.7 + r as f32 * 0.9).sin() * 0.5 + 0.5) * 0.08;
            k = geo::scale(k, 1.0 - stain);
            col.push([k[0], k[1], k[2], 1.0]);
        }
    }
    let mut idx = Vec::with_capacity((w - 1) * (h - 1) * 6);
    for r in 0..h - 1 {
        for c in 0..w - 1 {
            let a = (r * w + c) as u32;
            let b = a + 1;
            let d = a + w as u32;
            let e = d + 1;
            idx.extend_from_slice(&[a, d, b, b, d, e]);
        }
    }
    mesh.insert_attribute(Mesh::ATTRIBUTE_POSITION, pos);
    mesh.insert_attribute(Mesh::ATTRIBUTE_NORMAL, nor);
    mesh.insert_attribute(Mesh::ATTRIBUTE_COLOR, col);
    mesh.insert_indices(bevy::mesh::Indices::U32(idx));
}
