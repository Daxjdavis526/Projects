//! The worm caller: a stake driven into the sand with a spring hammer that
//! strikes it at a steady beat. Planted with T where you stand, it winds up
//! for a couple of seconds and then drums until it is picked up again (T,
//! standing next to it) or a worm takes it.
//!
//! It is nothing but a very loud, very regular vibration source; the worms
//! come for it because of what the vibration model makes of that, not
//! because it is a caller. On rock it barely couples into the ground and
//! is close to useless, the same as footsteps.

use bevy::prelude::*;
use wormsign_core::brain::State;
use wormsign_core::glam::DVec3;
use wormsign_core::vibration::{sources, SourceKind, VibrationEvent};

use crate::death::Fate;
use crate::fx::{Fx, Kind};
use crate::player::{Look, PlayerBody};
use crate::quake::Quakes;
use crate::worms::WormBody;
use crate::world::{Desert, Phase, SimSet, Tick, WorldPos};

/// Seconds between planting and the first blow.
const WIND_UP: f64 = 2.0;
/// How many the player carries.
pub const CARRIED: u32 = 2;

pub struct CallerPlugin;

impl Plugin for CallerPlugin {
    fn build(&self, app: &mut App) {
        app.insert_resource(Pack { thumpers: CARRIED })
            .add_systems(Startup, setup)
            .add_systems(Update, plant.in_set(Phase::Simulate).before(SimSet))
            .add_systems(Update, (drum, taken).chain().in_set(Phase::Simulate).in_set(SimSet).after(crate::worms::simulate))
            .add_systems(Update, animate.in_set(Phase::View));
    }
}

#[derive(Resource)]
pub struct Pack {
    pub thumpers: u32,
}

#[derive(Component)]
pub struct Thumper {
    pub pos: DVec3,
    planted_at: f64,
    next: f64,
    last_blow: f64,
    pub blows: u32,
    coupling: f64,
}

#[derive(Component)]
struct Hammer;

#[derive(Resource)]
struct Kit {
    stake: Handle<Mesh>,
    hammer: Handle<Mesh>,
    plate: Handle<Mesh>,
    metal: Handle<StandardMaterial>,
    dark: Handle<StandardMaterial>,
}

fn setup(mut commands: Commands, mut meshes: ResMut<Assets<Mesh>>, mut mats: ResMut<Assets<StandardMaterial>>) {
    commands.insert_resource(Kit {
        stake: meshes.add(Cylinder::new(0.045, 1.5)),
        hammer: meshes.add(Cylinder::new(0.12, 0.34)),
        plate: meshes.add(Cylinder::new(0.28, 0.05)),
        metal: mats.add(StandardMaterial { base_color: Color::srgb(0.42, 0.40, 0.37), metallic: 0.8, perceptual_roughness: 0.45, ..default() }),
        dark: mats.add(StandardMaterial { base_color: Color::srgb(0.12, 0.10, 0.09), perceptual_roughness: 0.7, ..default() }),
    });
}

#[allow(clippy::too_many_arguments)]
fn plant(
    mut commands: Commands,
    keys: Res<ButtonInput<KeyCode>>,
    tick: Res<Tick>,
    desert: Res<Desert>,
    kit: Res<Kit>,
    look: Res<Look>,
    fate: Res<Fate>,
    mut pack: ResMut<Pack>,
    player: Query<&PlayerBody>,
    thumpers: Query<(Entity, &Thumper)>,
) {
    if !keys.just_pressed(KeyCode::KeyT) || !fate.alive() {
        return;
    }
    let Ok(pb) = player.single() else { return };
    let p = pb.0.pos;
    // Next to one already? Pick it up.
    if let Some((e, _)) = thumpers.iter().find(|(_, t)| (t.pos - p).length() < 2.5) {
        commands.entity(e).despawn();
        pack.thumpers += 1;
        return;
    }
    if pack.thumpers == 0 || !pb.0.grounded {
        return;
    }
    pack.thumpers -= 1;
    // A pace ahead of you.
    let yaw = look.yaw as f64;
    let at = DVec3::new(p.x - yaw.sin() * 1.2, 0.0, p.z - yaw.cos() * 1.2);
    let g = desert.0.sample(at.x, at.z);
    let pos = DVec3::new(at.x, g.height as f64, at.z);
    let coupling = if g.rock > 0.5 { sources::ROCK_COUPLING } else { sources::SAND_COUPLING };
    let now = tick.t0;
    commands
        .spawn((
            Thumper { pos, planted_at: now, next: now + WIND_UP, last_blow: f64::NEG_INFINITY, blows: 0, coupling },
            WorldPos(pos),
            Transform::default(),
            Visibility::default(),
        ))
        .with_children(|c| {
            c.spawn((Mesh3d(kit.stake.clone()), MeshMaterial3d(kit.dark.clone()), Transform::from_xyz(0.0, 0.55, 0.0)));
            c.spawn((Mesh3d(kit.plate.clone()), MeshMaterial3d(kit.metal.clone()), Transform::from_xyz(0.0, 0.62, 0.0)));
            c.spawn((Hammer, Mesh3d(kit.hammer.clone()), MeshMaterial3d(kit.metal.clone()), Transform::from_xyz(0.0, 1.1, 0.0)));
        });
}

fn drum(tick: Res<Tick>, mut quakes: ResMut<Quakes>, mut fx: ResMut<Fx>, mut q: Query<&mut Thumper>) {
    for mut th in &mut q {
        for k in 0..tick.n {
            let t = tick.time(k);
            if t >= th.next {
                // Mechanical, so nearly exact; a hair of jitter.
                let jitter = ((th.blows as f64 * 12.9898).sin() * 43758.5453).fract() * 0.01;
                th.next += sources::THUMPER_PERIOD + jitter;
                th.last_blow = t;
                th.blows += 1;
                quakes.emit(VibrationEvent {
                    pos: th.pos,
                    energy: sources::THUMPER_ENERGY,
                    freq: sources::THUMPER_FREQ,
                    coupling: th.coupling,
                    time: t,
                    kind: SourceKind::Thumper,
                });
                // A little puff of sand jumps off the ground with each blow.
                for i in 0..3 {
                    let a = (th.blows * 3 + i) as f64 * 2.4;
                    let v = DVec3::new(a.cos() * 0.8, 1.2, a.sin() * 0.8);
                    fx.emit(Kind::Dust, th.pos + DVec3::Y * 0.1, v, 0.5, 1.2);
                }
            }
        }
    }
}

/// A worm that takes the caller: the mouth closes on it and it is gone.
fn taken(mut commands: Commands, mut fx: ResMut<Fx>, q: Query<(Entity, &Thumper)>, worms: Query<&WormBody>) {
    for (e, th) in &q {
        for wb in &worms {
            if matches!(wb.brain.state, State::Attack | State::Pass) && wb.worm.in_mouth(th.pos + DVec3::Y * 0.8) {
                fx.eruption(th.pos, DVec3::Y, 4.0, 0.7);
                commands.entity(e).despawn();
                break;
            }
        }
    }
}

fn animate(
    clock: Res<crate::world::SimClock>,
    q: Query<(&Thumper, &Children)>,
    mut hammers: Query<&mut Transform, With<Hammer>>,
) {
    for (th, kids) in &q {
        // The hammer is hauled up slowly by its spring and let go.
        let since = clock.0 - th.last_blow;
        let wound = clock.0 - th.planted_at < WIND_UP;
        let lift = if wound {
            ((clock.0 - th.planted_at) / WIND_UP).min(1.0) * 0.45
        } else if since < 0.06 {
            0.0
        } else {
            ((since - 0.06) / (sources::THUMPER_PERIOD - 0.2)).clamp(0.0, 1.0).powf(0.7) * 0.45
        };
        for k in kids.iter() {
            if let Ok(mut t) = hammers.get_mut(k) {
                t.translation.y = 0.82 + lift as f32;
            }
        }
    }
}
