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
use wormsign_core::gait::Stride;
use wormsign_core::player::{Gait, GroundHit, Player, PlayerInput};
use wormsign_core::vibration::{sources, SourceKind, VibrationEvent};

use crate::web;
use crate::quake::Quakes;
use crate::worms::WormBody;
use wormsign_core::worm::Worm;
use crate::world::{Desert, Origin, OriginAnchor, Phase, SimSet, Tick, WorldPos};

pub struct PlayerPlugin;

impl Plugin for PlayerPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<Look>()
            .init_resource::<Controls>()
            .init_resource::<Shake>()
            .add_systems(Startup, spawn)
            .add_systems(Update, (grab_pointer, read_input).chain().in_set(Phase::Simulate).before(SimSet))
            .add_systems(Update, simulate.in_set(Phase::Simulate).in_set(SimSet))
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
    /// Head-bob amplitude, eased between gaits.
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

impl Look {
    /// Forget the smoothed third-person position (after a teleport).
    pub fn reset_smoothing(&mut self) {
        self.smooth = None;
    }
}

#[derive(Resource, Default)]
pub struct Controls(pub PlayerInput);

/// Camera shake. Anything violent adds trauma (0..1); it decays, and the
/// camera shakes by trauma squared, so small bumps are subtle and big ones
/// are violent. `scale` is the accessibility setting.
#[derive(Resource)]
pub struct Shake {
    pub trauma: f32,
    /// Continuous low rumble, 0..1, set every frame by whatever causes it.
    pub rumble: f32,
    pub scale: f32,
    t: f32,
}

impl Default for Shake {
    fn default() -> Self {
        Self { trauma: 0.0, rumble: 0.0, scale: 1.0, t: 0.0 }
    }
}

impl Shake {
    /// Offset and roll for this frame.
    fn sample(&mut self, dt: f32) -> (Vec3, f32) {
        self.t += dt;
        self.trauma = (self.trauma - dt * 0.8).max(0.0);
        let k = (self.trauma * self.trauma + self.rumble * 0.25) * self.scale;
        let t = self.t;
        let n = |f: f32, p: f32| (t * f + p).sin() * 0.6 + (t * f * 2.13 + p * 1.7).sin() * 0.4;
        (Vec3::new(n(23.0, 0.0), n(19.0, 1.3), n(21.0, 2.9)) * 0.35 * k, n(17.0, 4.1) * 0.03 * k)
    }
}

#[derive(Component)]
pub struct PlayerBody(pub Player);

/// The player's feet: when they strike, and how hard.
#[derive(Component)]
pub struct Feet(pub Stride);

#[derive(Component)]
struct BodyMesh;

pub fn spawn(mut commands: Commands, desert: Res<Desert>, mut meshes: ResMut<Assets<Mesh>>, mut mats: ResMut<Assets<StandardMaterial>>) {
    let (x, z) = spawn_point(&desert);
    let y = desert.0.height(x, z) as f64;
    let body = Player::new(DVec3::new(x, y + 0.5, z));
    commands
        .spawn((PlayerBody(body), Feet(Stride::new(0xF007)), WorldPos(DVec3::new(x, y, z)), OriginAnchor, Transform::default(), Visibility::default()))
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

pub fn read_input(
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

/// Sand, rock, any worm mound under (x, z) — or a worm's back, if one is
/// there and the player (at height `y_near`) is on top of it.
pub fn ground_at(desert: &Desert, worms: &[&Worm], x: f64, z: f64, y_near: f64) -> GroundHit {
    let h = |x, z| crate::worms::ground_height(desert, worms, x, z);
    let e = 0.6;
    let (hx0, hx1, hz0, hz1) = (h(x - e, z), h(x + e, z), h(x, z - e), h(x, z + e));
    let n = DVec3::new(hx0 - hx1, 2.0 * e, hz0 - hz1).normalize();
    let sand = GroundHit::still(h(x, z), n);
    let mut best = sand;
    for w in worms {
        if let Some((hh, nn, v, _)) = w.back_ground(x, z, y_near + 0.5) {
            if hh > best.height {
                best = GroundHit::hide(hh, nn, v);
            }
        }
    }
    best
}

pub fn simulate(
    tick: Res<Tick>,
    desert: Res<Desert>,
    mut controls: ResMut<Controls>,
    mut quakes: ResMut<Quakes>,
    mut q: Query<(&mut PlayerBody, &mut Feet, &mut WorldPos)>,
    worms_q: Query<(Entity, &WormBody)>,
    fate: Res<crate::death::Fate>,
    mut riding: ResMut<crate::rider::Riding>,
    look: Res<Look>,
) {
    if !fate.alive() {
        return;
    }
    let Ok((mut body, mut feet, mut wp)) = q.single_mut() else { return };
    let with_ids: Vec<(Entity, &WormBody)> = worms_q.iter().collect();
    let worms: Vec<&Worm> = with_ids.iter().map(|w| &w.1.worm).collect();
    for k in 0..tick.n {
        let t = tick.time(k);
        let mut input = controls.0;
        // Sandwalking moves the body in lurches, one per step.
        let f = feet.0.speed_factor(body.0.gait);
        input.forward *= f;
        input.right *= f;
        let y_near = body.0.pos.y;
        let report = body.0.step(&input, tick.dt, |x, z| ground_at(&desert, &worms, x, z, y_near));
        controls.0.jump = false;
        crate::rider::step_hooks(&mut riding, &mut body.0, &look, &with_ids, |x, z| desert.0.height(x, z) as f64, tick.dt);
        let y_now = body.0.pos.y;
        riding.on_back = body.0.grounded && ground_at(&desert, &worms, body.0.pos.x, body.0.pos.z, y_now).worm;

        let p = &body.0;
        let on_rock = desert.0.sample(p.pos.x, p.pos.z).rock > 0.5;
        let coupling = if on_rock { sources::ROCK_COUPLING } else { sources::SAND_COUPLING };
        let speed = p.vel.x.hypot(p.vel.z);
        // Sandwalk speed is judged against the gait, not the lurch.
        let gait_speed = if p.gait == Gait::Sandwalk { speed / f.max(0.1) } else { speed };
        if let Some(s) = feet.0.update(p.gait, gait_speed, tick.dt) {
            quakes.emit(VibrationEvent {
                pos: p.pos,
                energy: s.energy,
                freq: s.freq,
                coupling,
                time: t,
                kind: SourceKind::Step,
            });
        }
        if let Some(v) = report.landed {
            if v > 1.0 {
                quakes.emit(VibrationEvent {
                    pos: p.pos,
                    energy: sources::LANDING_PER_V2 * v * v,
                    freq: sources::LANDING_FREQ,
                    coupling,
                    time: t,
                    kind: SourceKind::Landing,
                });
            }
        }
    }
    wp.0 = body.0.pos;
}

pub fn camera(
    time: Res<Time>,
    origin: Res<Origin>,
    desert: Res<Desert>,
    mut look: ResMut<Look>,
    body: Query<(&PlayerBody, &Feet)>,
    mut cam: Query<(&mut Transform, &mut Projection), With<Camera3d>>,
    mut shake: ResMut<Shake>,
    fate: Res<crate::death::Fate>,
    riding: Res<crate::rider::Riding>,
    mut ride_ease: Local<f32>,
) {
    let (Ok((body, feet)), Ok((mut t, mut proj))) = (body.single(), cam.single_mut()) else { return };
    // Mounted, the camera pulls back to take in the animal, and the view
    // widens with its speed.
    let mounted = riding.riding() || riding.on_back;
    let dt0 = time.delta_secs();
    *ride_ease += ((mounted as i32 as f32) - *ride_ease) * (1.0 - (-dt0 * 1.5).exp());
    if let Projection::Perspective(pp) = &mut *proj {
        let want = (70.0 + 12.0 * (riding.speed as f32 / 36.0).min(1.0)).to_radians();
        pp.fov += (want - pp.fov) * (1.0 - (-dt0 * 2.0).exp());
    }
    shake.rumble = shake.rumble.max(*ride_ease * (riding.speed as f32 / 36.0).min(1.0) * 0.7);
    let (jolt, roll) = shake.sample(time.delta_secs());
    if !fate.alive() {
        // The death camera drives; it still shakes.
        t.translation += jolt;
        return;
    }
    let p = &body.0;
    let rot = Quat::from_euler(EulerRot::YXZ, look.yaw, look.pitch, 0.0);
    let dt = time.delta_secs();

    // Head bob follows the actual footstrikes: lowest as a foot lands,
    // highest mid-stride. Sandwalking's broken rhythm shows up here too.
    let amp = match p.gait {
        Gait::Walk => 0.035,
        Gait::Run => 0.065,
        Gait::Crouch => 0.02,
        Gait::Sandwalk => 0.05,
        Gait::Still | Gait::Air => 0.0,
    };
    look.bob += (amp - look.bob) * (1.0 - (-dt * 8.0).exp());
    let bob = look.bob * ((std::f32::consts::PI * feet.0.phase() as f32).sin() - 0.5);

    let eye = p.pos + DVec3::new(0.0, p.eye_height() + bob as f64, 0.0);
    let world = match look.view {
        View::First => eye,
        View::Third => {
            let target = p.pos + DVec3::new(0.0, 1.55 + 1.5 * *ride_ease as f64, 0.0);
            let dist = look.distance + (look.distance.max(16.0) - look.distance) * *ride_ease;
            let back = (rot * Vec3::Z * dist).as_dvec3();
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
    t.translation = origin.to_render(world) + jolt;
    t.rotation = rot * Quat::from_rotation_z(roll);
}

fn show_body(look: Res<Look>, fate: Res<crate::death::Fate>, mut q: Query<&mut Visibility, With<BodyMesh>>) {
    // Hidden in first person. (So is its shadow; a proper model that can
    // cast a shadow without being drawn comes with the polish pass.)
    for mut v in &mut q {
        let want = if look.view == View::First || !fate.alive() { Visibility::Hidden } else { Visibility::Inherited };
        if *v != want {
            *v = want;
        }
    }
}
