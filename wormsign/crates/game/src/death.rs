//! Being eaten.
//!
//! No fade to black. When an attacking worm's open mouth reaches you, the
//! sand erupts, you are thrown up as a ragdoll, time slows, and the camera
//! pulls out so you can see it happen. Suction drags the body into the
//! mouth; the mouth snaps shut; limbs tear, one is flung clear onto the
//! sand, blood sprays; what is left is pulled down the throat. The camera
//! lingers as the worm goes on its way, then you get up somewhere else.

use bevy::prelude::*;
use wormsign_core::glam::DVec3;
use wormsign_core::ragdoll::{self, Ragdoll, JOINTS};
use wormsign_core::rng::Rng;
use wormsign_core::worm::Worm;

use crate::fx::Fx;
use crate::player::{Controls, Look, PlayerBody, Shake};
use crate::worms::WormBody;
use crate::world::{Desert, Origin, Phase, SimClock, SimSet, Tick};

pub struct DeathPlugin;

impl Plugin for DeathPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<Fate>()
            .add_systems(Startup, spawn_overlay)
            .add_systems(
                Update,
                (seize, step_ragdoll).chain().in_set(Phase::Simulate).in_set(SimSet).after(crate::worms::simulate),
            )
            .add_systems(Update, (death_camera.after(crate::player::camera), overlay, respawn).in_set(Phase::View));
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
pub enum Stage {
    #[default]
    Alive,
    /// Thrown up and being drawn in.
    Seized,
    /// The mouth has closed on it.
    Crushed,
    /// Nothing left to see but the worm leaving.
    Gone,
}

#[derive(Resource, Default)]
pub struct Fate {
    pub stage: Stage,
    /// Sim seconds since the current stage began.
    t: f64,
    /// The body, once it is no longer the player's to move. The avatar
    /// draws it.
    pub rag: Option<Ragdoll>,
    worm: Option<Entity>,
    /// Joints thrown clear: gravity only, left on the sand.
    flung: Vec<usize>,
    pub swallowed: [bool; JOINTS],
    cam: Option<DVec3>,
    orbit: f64,
    rng: Option<Rng>,
    pub deaths: u32,
    pub alive_since: f64,
    pub walked: f64,
    last_pos: Option<DVec3>,
    /// Survival time and distance of the life just ended, for the overlay.
    last_life: (f64, f64),
}

impl Fate {
    pub fn alive(&self) -> bool {
        self.stage == Stage::Alive
    }

    fn enter(&mut self, s: Stage) {
        self.stage = s;
        self.t = 0.0;
    }
}

fn seize(
    clock: Res<SimClock>,
    mut fate: ResMut<Fate>,
    mut fx: ResMut<Fx>,
    mut vtime: ResMut<Time<Virtual>>,
    mut shake: ResMut<Shake>,
    figure: Res<crate::avatar::Figure>,
    player: Query<&PlayerBody>,
    mut worms: Query<(Entity, &mut WormBody)>,
) {
    let Ok(pb) = player.single() else { return };
    let p = &pb.0;
    if fate.alive() {
        // Bookkeeping for the stats line.
        if let Some(last) = fate.last_pos {
            fate.walked += (p.pos - last).length().min(5.0);
        }
        fate.last_pos = Some(p.pos);
    }
    if !fate.alive() {
        return;
    }
    use wormsign_core::brain::State;
    for (e, mut wb) in &mut worms {
        if !matches!(wb.brain.state, State::Attack | State::Pass) {
            continue;
        }
        let chest = p.pos + DVec3::new(0.0, 1.2, 0.0);
        if !wb.worm.in_mouth(chest) {
            continue;
        }
        // Taken.
        let w = &wb.worm;
        let facing = w.facing();
        let seed = (clock.0 * 1000.0) as u64 ^ 0x5EED;
        let mut rng = Rng::new(seed);
        let dt = crate::world::SUBSTEP;
        // The figure as it was this instant becomes the ragdoll.
        let mut rag = match figure.pose.as_ref() {
            Some(pose) => Ragdoll::from_joints(crate::avatar::ragdoll_joints(pose), p.vel, dt),
            None => Ragdoll::new(p.pos, figure.anim.yaw(), p.vel, dt),
        };
        let side = DVec3::new(rng.gauss(), 0.0, rng.gauss()) * 1.5;
        rag.kick(facing * w.speed * 0.45 + DVec3::new(0.0, rng.range(10.0, 14.0), 0.0) + side, dt);
        let ground = DVec3::new(p.pos.x, p.pos.y, p.pos.z);
        fx.eruption(ground, DVec3::Y, 5.0, 1.2);
        fx.eruption(w.mouth_centre() - DVec3::Y * w.spec.radius * 0.5, DVec3::Y, w.spec.radius * 1.1, 0.9);
        wb.brain.mouth_override = Some(1.0);
        let lived = clock.0 - fate.alive_since;
        let walked = fate.walked;
        *fate = Fate {
            stage: Stage::Seized,
            t: 0.0,
            rag: Some(rag),
            worm: Some(e),
            flung: Vec::new(),
            swallowed: [false; JOINTS],
            cam: None,
            orbit: 0.0,
            rng: Some(rng),
            deaths: fate.deaths + 1,
            alive_since: fate.alive_since,
            walked: 0.0,
            last_pos: None,
            last_life: (lived, walked),
        };
        vtime.set_relative_speed(0.3);
        shake.trauma = 1.0;
        return;
    }
}

fn step_ragdoll(
    tick: Res<Tick>,
    desert: Res<Desert>,
    mut fate: ResMut<Fate>,
    mut fx: ResMut<Fx>,
    mut vtime: ResMut<Time<Virtual>>,
    mut shake: ResMut<Shake>,
    mut worms: Query<&mut WormBody>,
) {
    if fate.alive() || fate.rag.is_none() {
        return;
    }
    let Some(we) = fate.worm else { return };
    let Ok(mut wb) = worms.get_mut(we) else { return };
    let fate = &mut *fate;
    for _ in 0..tick.n {
        let dt = tick.dt;
        fate.t += dt;
        let w: &Worm = &wb.worm;
        let mouth = w.mouth_centre();
        let facing = w.facing();
        let wvel = facing * w.speed;
        let stage = fate.stage;
        let t = fate.t;
        let flung = fate.flung.clone();
        let rag = fate.rag.as_mut().unwrap();

        let force = |i: usize, p: DVec3, v: DVec3| -> DVec3 {
            if flung.contains(&i) {
                return DVec3::ZERO;
            }
            match stage {
                Stage::Seized => {
                    // A moment of being thrown, then the pull.
                    if t < 0.45 {
                        return DVec3::ZERO;
                    }
                    let k = 30.0 * ((t - 0.45) / 0.8).min(1.0);
                    (mouth - p) * k + (wvel - v) * 3.0 + DVec3::Y * 9.81 * 0.6
                }
                Stage::Crushed | Stage::Gone => {
                    // Down the throat, each part to its own depth.
                    let depth = 3.0 + (i as f64) * 1.3 + t * 6.0;
                    let target = mouth - facing * depth;
                    (target - p) * 60.0 + (wvel - v) * 8.0 + DVec3::Y * 9.81
                }
                Stage::Alive => DVec3::ZERO,
            }
        };
        let vels: Vec<DVec3> = (0..JOINTS).map(|i| rag.velocity(i, dt)).collect();
        let worms_only: [&Worm; 1] = [w];
        rag.step(dt, |x, z| crate::worms::ground_height(&desert, &worms_only, x, z), |i, p| force(i, p, vels[i]));

        match stage {
            Stage::Seized => {
                let near = (rag.centre() - mouth).length() < w.mouth_radius() * 0.75;
                if near || t > 2.6 {
                    // The mouth closes.
                    wb.brain.mouth_override = Some(0.0);
                    let rng = fate.rng.as_mut().unwrap();
                    let mut wounds = Vec::new();
                    let arm = if rng.chance(0.5) { (ragdoll::L_SHOULDER, ragdoll::L_ELBOW) } else { (ragdoll::R_SHOULDER, ragdoll::R_ELBOW) };
                    let leg = if rng.chance(0.5) { (ragdoll::L_HIP, ragdoll::L_KNEE) } else { (ragdoll::R_HIP, ragdoll::R_KNEE) };
                    let mut torn = vec![arm, leg];
                    if rng.chance(0.5) {
                        torn.push((ragdoll::CHEST, ragdoll::HEAD));
                    }
                    for (a, b) in &torn {
                        if let Some(at) = rag.tear_bone(*a, *b) {
                            wounds.push(at);
                        }
                    }
                    // One piece is flung clear, to land on the sand.
                    let (_, fb) = torn[rng.chance(0.5) as usize];
                    let limb: Vec<usize> = ragdoll::limb(fb).to_vec();
                    let side = facing.cross(DVec3::Y).normalize_or_zero() * if rng.chance(0.5) { 1.0 } else { -1.0 };
                    let fling = side * rng.range(9.0, 15.0) + DVec3::Y * rng.range(5.0, 9.0) + wvel * 0.5;
                    for &j in &limb {
                        // Replace the limb's velocity outright with the fling.
                        let p = rag.p[j];
                        rag.set_prev(j, p - fling * dt);
                    }
                    fate.flung = limb;
                    for at in &wounds {
                        fx.bleed(*at, wvel * 0.4, 45, 8.0);
                    }
                    fx.bleed(mouth, wvel * 0.3, 90, 12.0);
                    shake.trauma = 1.0;
                    vtime.set_relative_speed(0.45);
                    fate.enter(Stage::Crushed);
                }
            }
            Stage::Crushed => {
                // Parts that are well inside are gone.
                for i in 0..JOINTS {
                    if !fate.flung.contains(&i) && (rag.p[i] - mouth).dot(facing) < -2.0 {
                        fate.swallowed[i] = true;
                    }
                }
                // A little more blood as it goes down.
                if (t * 10.0).fract() < 0.1 {
                    fx.bleed(mouth + facing * 1.0, wvel * 0.5, 4, 5.0);
                }
                if t > 1.2 {
                    vtime.set_relative_speed(1.0);
                }
                if t > 3.0 {
                    wb.brain.mouth_override = None;
                    fate.enter(Stage::Gone);
                }
            }
            Stage::Gone => {
                for i in 0..JOINTS {
                    if !fate.flung.contains(&i) {
                        fate.swallowed[i] = true;
                    }
                }
            }
            Stage::Alive => {}
        }
    }
}

// --- camera ------------------------------------------------------------------

fn death_camera(
    time: Res<Time<Real>>,
    origin: Res<Origin>,
    desert: Res<Desert>,
    mut fate: ResMut<Fate>,
    worms: Query<&WormBody>,
    mut cam: Query<&mut Transform, With<Camera3d>>,
) {
    if fate.alive() {
        return;
    }
    let (Some(we), Some(rag)) = (fate.worm, fate.rag.as_ref()) else { return };
    let Ok(wb) = worms.get(we) else { return };
    let Ok(mut t) = cam.single_mut() else { return };
    let w = &wb.worm;
    let dt = time.delta_secs() as f64;
    let mouth = w.mouth_centre();
    let facing = w.facing();
    let flat = DVec3::new(facing.x, 0.0, facing.z).normalize_or_zero();
    let side = flat.cross(DVec3::Y).normalize_or_zero();
    let r = w.spec.radius;
    let remains = fate.flung.first().map(|&j| rag.p[j]).unwrap_or(rag.centre());
    let (want, focus) = match fate.stage {
        // Out to the side, level with it, to see the throw and the maw.
        Stage::Seized => {
            let focus = rag.centre().lerp(mouth, 0.35);
            (focus + side * (r * 2.6) + DVec3::Y * (r * 0.4) + flat * (r * 0.8), focus)
        }
        // Closer, as it shuts.
        Stage::Crushed => (mouth + side * (r * 1.9) + DVec3::Y * (r * 0.6) + flat * (r * 1.4), mouth),
        // Rise and circle over what is left while it goes.
        _ => {
            fate.orbit += dt * 0.12;
            let a = fate.orbit;
            let around = DVec3::new(a.cos(), 0.0, a.sin());
            let focus = remains.lerp(w.head(), 0.35);
            (remains + around * 45.0 + DVec3::Y * 28.0, focus)
        }
    };
    let cur = fate.cam.unwrap_or(origin.0 + t.translation.as_dvec3());
    let k = 1.0 - (-dt * 2.2).exp();
    let mut pos = cur + (want - cur) * k;
    // Never inside the worm, never under the sand.
    if let Some(hit) = w.surface(pos) {
        if hit.gap < 4.0 {
            pos += hit.normal * (4.0 - hit.gap);
        }
    }
    let floor = crate::worms::ground_height(&desert, &[w], pos.x, pos.z) + 1.5;
    pos.y = pos.y.max(floor);
    fate.cam = Some(pos);
    t.translation = origin.to_render(pos);
    let look = (focus - pos).as_vec3();
    if look.length_squared() > 1e-6 {
        t.rotation = Transform::default().looking_to(look, Vec3::Y).rotation;
    }
}

// --- after -------------------------------------------------------------------------

#[derive(Component)]
struct Overlay;

#[derive(Component)]
struct OverlayLine;

fn spawn_overlay(mut commands: Commands) {
    commands
        .spawn((
            Overlay,
            Node {
                position_type: PositionType::Absolute,
                width: percent(100),
                top: percent(38),
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                row_gap: px(10),
                ..default()
            },
            Visibility::Hidden,
        ))
        .with_children(|c| {
            c.spawn((
                Text::new("TAKEN"),
                TextFont { font_size: FontSize::Px(44.0), ..default() },
                TextColor(Color::srgb(0.92, 0.84, 0.70)),
            ));
            c.spawn((
                OverlayLine,
                Text::new(""),
                TextFont { font_size: FontSize::Px(14.0), ..default() },
                TextColor(Color::srgba(0.92, 0.84, 0.70, 0.8)),
            ));
        });
}

fn overlay(fate: Res<Fate>, mut o: Query<&mut Visibility, With<Overlay>>, mut line: Query<&mut Text, With<OverlayLine>>) {
    let show = fate.stage == Stage::Gone && fate.t > 1.5;
    if let Ok(mut v) = o.single_mut() {
        let want = if show { Visibility::Inherited } else { Visibility::Hidden };
        if *v != want {
            *v = want;
        }
    }
    if show {
        if let Ok(mut t) = line.single_mut() {
            let (secs, m) = fate.last_life;
            let s = format!(
                "survived {}:{:02}  |  {:.1} km on foot\n\npress any key to walk again",
                (secs / 60.0) as u32,
                (secs % 60.0) as u32,
                m / 1000.0
            );
            if t.0 != s {
                t.0 = s;
            }
        }
    }
}

#[allow(clippy::too_many_arguments)]
fn respawn(
    keys: Res<ButtonInput<KeyCode>>,
    mouse: Res<ButtonInput<MouseButton>>,
    clock: Res<SimClock>,
    desert: Res<Desert>,
    mut fate: ResMut<Fate>,
    mut look: ResMut<Look>,
    mut controls: ResMut<Controls>,
    mut vtime: ResMut<Time<Virtual>>,
    mut player: Query<&mut PlayerBody>,
    worms: Query<&WormBody>,
) {
    if !(fate.stage == Stage::Gone && fate.t > 1.5) {
        return;
    }
    if keys.get_just_pressed().next().is_none() && !mouse.just_pressed(MouseButton::Left) {
        return;
    }
    let Ok(mut pb) = player.single_mut() else { return };
    // Get up a long way from the worm that did it, somewhere sandy.
    let from = fate.worm.and_then(|e| worms.get(e).ok()).map(|w| w.worm.head()).unwrap_or(pb.0.pos);
    let mut rng = fate.rng.clone().unwrap_or(Rng::new(1));
    let mut at = pb.0.pos;
    for _ in 0..40 {
        let a = rng.range(0.0, std::f64::consts::TAU);
        let c = from + DVec3::new(a.cos(), 0.0, a.sin()) * rng.range(1800.0, 2600.0);
        if desert.0.rock_near(c.x, c.z, 50.0).is_none() {
            at = c;
            break;
        }
    }
    let y = desert.0.height(at.x, at.z) as f64;
    pb.0 = wormsign_core::player::Player::new(DVec3::new(at.x, y + 0.3, at.z));
    controls.0 = Default::default();
    look.reset_smoothing();
    vtime.set_relative_speed(1.0);
    let deaths = fate.deaths;
    *fate = Fate { deaths, alive_since: clock.0, ..default() };
}
