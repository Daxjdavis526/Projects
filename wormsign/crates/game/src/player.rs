//! The player in the game: input in, core simulation stepped, camera out.
//!
//! Controls
//!   mouse          look (click the game to capture the pointer)
//!   W A S D        move            Shift   run
//!   Space          jump            C (hold) crouch
//!   Q (hold)       sandwalk        V       first / third person
//!   mouse wheel    third-person distance

use bevy::input::mouse::{AccumulatedMouseMotion, AccumulatedMouseScroll};
use bevy::prelude::*;
use bevy::window::{CursorGrabMode, CursorOptions, PrimaryWindow};
use wormsign_core::glam::DVec3;
use wormsign_core::player::{GroundHit, Player, PlayerInput};

use crate::web;
use crate::world::{Desert, Origin, OriginAnchor, Phase, WorldPos};

/// Physics substep. The walker is cheap; small steps keep landings crisp.
const SUBSTEP: f64 = 1.0 / 120.0;

pub struct PlayerPlugin;

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<Look>()
            .init_resource::<Controls>()
            .add_systems(Startup, spawn)
            .add_systems(Update, (grab_pointer, read_input, simulate).chain().in_set(Phase::Simulate))
            .add_systems(Update, (camera, show_body).chain().in_set(Phase::View));
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum View {
    First,
    Third,
}

#[derive(Resource)]
pub struct Look {
    pub yaw: f32,
    pub pitch: f32,
    pub view: View,
    pub distance: f32,
    pub sensitivity: f32,
    /// Smoothed third-person camera position, world space.
    smooth: Option<DVec3>,
    /// Head-bob phase, advanced by distance walked.
    bob: f32,
}

impl Default for Look {
    fn default() -> Self {
        // URL overrides let scripted runs frame a shot without playing to it.
        Self {
            yaw: web::flag_f32("yaw").unwrap_or(0.6),
            pitch: web::flag_f32("pitch").unwrap_or(-0.08),
            view: if web::flag_value("view").as_deref() == Some("first") { View::First } else { View::Third },
            distance: web::flag_f32("dist").unwrap_or(5.0),
            sensitivity: 0.0022,
            smooth: None,
            bob: 0.0,
        }
    }
}

#[derive(Resource, Default)]
pub struct Controls(pub PlayerInput);

#[derive(Component)]
pub struct PlayerBody(pub Player);

#[derive(Component)]
struct BodyMesh;

fn spawn(mut commands: Commands, desert: Res<Desert>, mut meshes: ResMut<Assets<Mesh>>, mut mats: ResMut<Assets<StandardMaterial>>) {
    let (x, z) = spawn_point(&desert);
    let y = desert.0.height(x, z) as f64;
    let body = Player::new(DVec3::new(x, y + 0.5, z));
    commands
        .spawn((PlayerBody(body), WorldPos(DVec3::new(x, y, z)), OriginAnchor, Transform::default(), Visibility::default()))
        .with_children(|p| {
            // A stand-in figure: cloak-coloured capsule. Real model later.
            p.spawn((
                BodyMesh,
                Mesh3d(meshes.add(Capsule3d::new(0.26, 1.25))),
                MeshMaterial3d(mats.add(StandardMaterial {
                    base_color: Color::srgb(0.22, 0.18, 0.15),
                    perceptual_roughness: 0.9,
                    ..default()
                })),
                Transform::from_xyz(0.0, 0.885, 0.0),
            ));
        });
    commands.spawn((
        Camera3d::default(),
        Projection::Perspective(PerspectiveProjection {
            fov: 70f32.to_radians(),
            near: 0.05,
            far: 60_000.0,
            ..default()
        }),
        bevy::core_pipeline::tonemapping::Tonemapping::TonyMcMapface,
        crate::sky::fog(),
        Transform::default(),
    ));
}

/// Somewhere to start with a view: a flat patch of sand between big dunes,
/// within a couple of kilometres of the origin.
fn spawn_point(desert: &Desert) -> (f64, f64) {
    let t = &desert.0;
    let mut best = (0.0, 0.0, f64::MAX);
    for j in -30..=30 {
        for i in -30..=30 {
            let (x, z) = (i as f64 * 67.0, j as f64 * 67.0);
            let g = t.sample(x, z);
            let n = t.normal(x, z);
            let dunes = t.duniness(x, z);
            let score = (1.0 - n[1] as f64) * 40.0 + g.rock as f64 * 10.0 - dunes * 2.0 + x.hypot(z) / 4000.0;
            if score < best.2 {
                best = (x, z, score);
            }
        }
    }
    (best.0, best.1)
}

fn grab_pointer(
    mouse: Res<ButtonInput<MouseButton>>,
    keys: Res<ButtonInput<KeyCode>>,
    mut cursor: Query<&mut CursorOptions, With<PrimaryWindow>>,
) {
    let Ok(mut c) = cursor.single_mut() else { return };
    if mouse.just_pressed(MouseButton::Left) && c.grab_mode == CursorGrabMode::None {
        c.grab_mode = CursorGrabMode::Locked;
        c.visible = false;
    }
    if keys.just_pressed(KeyCode::Escape) {
        c.grab_mode = CursorGrabMode::None;
        c.visible = true;
    }
}

fn read_input(
    keys: Res<ButtonInput<KeyCode>>,
    mouse: Res<ButtonInput<MouseButton>>,
    motion: Res<AccumulatedMouseMotion>,
    scroll: Res<AccumulatedMouseScroll>,
    cursor: Query<&CursorOptions, With<PrimaryWindow>>,
    mut look: ResMut<Look>,
    mut controls: ResMut<Controls>,
) {
    let locked = cursor.single().map(|c| c.grab_mode != CursorGrabMode::None).unwrap_or(false);
    // Look with a captured pointer, or by dragging with the right button.
    if locked || mouse.pressed(MouseButton::Right) {
        let d = motion.delta * look.sensitivity;
        look.yaw -= d.x;
        look.pitch = (look.pitch - d.y).clamp(-1.45, 1.45);
    }
    if keys.just_pressed(KeyCode::KeyV) {
        look.view = if look.view == View::First { View::Third } else { View::First };
        look.smooth = None;
    }
    if scroll.delta.y != 0.0 {
        look.distance = (look.distance * (1.0 - scroll.delta.y * 0.1)).clamp(2.0, 40.0);
    }

    let axis = |pos: &[KeyCode], neg: &[KeyCode]| {
        (pos.iter().any(|k| keys.pressed(*k)) as i32 - neg.iter().any(|k| keys.pressed(*k)) as i32) as f64
    };
    let i = &mut controls.0;
    i.forward = axis(&[KeyCode::KeyW, KeyCode::ArrowUp], &[KeyCode::KeyS, KeyCode::ArrowDown]);
    i.right = axis(&[KeyCode::KeyD, KeyCode::ArrowRight], &[KeyCode::KeyA, KeyCode::ArrowLeft]);
    i.yaw = look.yaw as f64;
    i.run = keys.pressed(KeyCode::ShiftLeft) || keys.pressed(KeyCode::ShiftRight);
    i.crouch = keys.pressed(KeyCode::KeyC);
    i.sandwalk = keys.pressed(KeyCode::KeyQ);
    // Latched until the simulation consumes it, so a tap between substeps
    // is never lost.
    i.jump |= keys.just_pressed(KeyCode::Space);
}

pub fn ground_at(desert: &Desert, x: f64, z: f64) -> GroundHit {
    let h = desert.0.height(x, z) as f64;
    let n = desert.0.normal(x, z);
    GroundHit::still(h, DVec3::new(n[0] as f64, n[1] as f64, n[2] as f64))
}

fn simulate(
    time: Res<Time>,
    desert: Res<Desert>,
    mut controls: ResMut<Controls>,
    mut q: Query<(&mut PlayerBody, &mut WorldPos)>,
    mut acc: Local<f64>,
) {
    let Ok((mut body, mut wp)) = q.single_mut() else { return };
    // Never try to catch up more than a quarter second after a stall.
    *acc = (*acc + time.delta_secs_f64()).min(0.25);
    while *acc >= SUBSTEP {
        *acc -= SUBSTEP;
        let input = controls.0;
        body.0.step(&input, SUBSTEP, |x, z| ground_at(&desert, x, z));
        controls.0.jump = false;
    }
    wp.0 = body.0.pos;
}

pub fn camera(
    time: Res<Time>,
    origin: Res<Origin>,
    desert: Res<Desert>,
    mut look: ResMut<Look>,
    body: Query<&PlayerBody>,
    mut cam: Query<&mut Transform, With<Camera3d>>,
) {
    let (Ok(body), Ok(mut t)) = (body.single(), cam.single_mut()) else { return };
    let p = &body.0;
    let rot = Quat::from_euler(EulerRot::YXZ, look.yaw, look.pitch, 0.0);
    let dt = time.delta_secs();

    // Head bob: distance-driven so it matches the feet, not the clock.
    let hspeed = (p.vel.x.hypot(p.vel.z)) as f32;
    if p.grounded {
        look.bob += hspeed * dt * 1.9;
    }
    let bob_amp = if p.grounded { (hspeed / 5.5).min(1.0) * 0.045 } else { 0.0 };
    let bob = (look.bob).sin().abs() * bob_amp;

    let eye = p.pos + DVec3::new(0.0, p.eye_height() + bob as f64, 0.0);
    let world = match look.view {
        View::First => eye,
        View::Third => {
            let target = p.pos + DVec3::new(0.0, 1.55, 0.0);
            let back = (rot * Vec3::Z * look.distance).as_dvec3();
            let mut want = target + back;
            // Keep the camera out of the sand.
            let floor = desert.0.height(want.x, want.z) as f64 + 0.4;
            want.y = want.y.max(floor);
            let s = match look.smooth {
                Some(prev) => prev + (want - prev) * (1.0 - (-dt as f64 * 14.0).exp()),
                None => want,
            };
            look.smooth = Some(s);
            s
        }
    };
    t.translation = origin.to_render(world);
    t.rotation = rot;
}

fn show_body(look: Res<Look>, mut q: Query<&mut Visibility, With<BodyMesh>>) {
    // Hidden in first person. (So is its shadow; a proper model that can
    // cast a shadow without being drawn comes with the polish pass.)
    for mut v in &mut q {
        *v = if look.view == View::First { Visibility::Hidden } else { Visibility::Inherited };
    }
}
