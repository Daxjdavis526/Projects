//! The title / pause card, settings and statistics.
//!
//! Shown whenever the pointer is not captured. Before you have first clicked
//! in, the world runs behind it (worms are already out there); after that,
//! releasing the pointer with Esc pauses everything. `?debug` never shows it,
//! so scripted screenshots stay clean.

use bevy::prelude::*;
use bevy::window::{CursorGrabMode, CursorOptions, PrimaryWindow};

use crate::death::Fate;
use crate::player::{Look, Shake};
use crate::rider::Riding;
use crate::web;

pub struct MenuPlugin;

impl Plugin for MenuPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<Stats>()
            .insert_resource(Settings { sensitivity: 1.0, shake: 1.0, fov: 70.0 })
            .add_systems(Startup, spawn)
            .add_systems(Update, (settings_keys, apply_settings, count, card).chain().in_set(crate::world::Phase::View));
    }
}

#[derive(Resource)]
pub struct Settings {
    /// Multiplier on mouse look.
    pub sensitivity: f32,
    /// Multiplier on camera shake; 0 turns it off.
    pub shake: f32,
    /// Base vertical field of view, degrees.
    pub fov: f32,
}

#[derive(Resource, Default)]
pub struct Stats {
    pub rides: u32,
    pub ridden_m: f64,
    pub longest_ride_m: f64,
    current_ride_m: f64,
    was_riding: bool,
    pub walked_m: f64,
    last_pos: Option<wormsign_core::glam::DVec3>,
    played: bool,
}

#[derive(Component)]
struct Card;

#[derive(Component)]
struct CardBody;

fn spawn(mut commands: Commands) {
    let ink = Color::srgb(0.95, 0.88, 0.74);
    commands
        .spawn((
            Card,
            Node {
                position_type: PositionType::Absolute,
                width: percent(100),
                height: percent(100),
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                row_gap: px(14),
                ..default()
            },
            BackgroundColor(Color::srgba(0.08, 0.05, 0.03, 0.55)),
            Visibility::Hidden,
        ))
        .with_children(|c| {
            c.spawn((Text::new("WORMSIGN"), TextFont { font_size: FontSize::Px(46.0), ..default() }, TextColor(ink)));
            c.spawn((
                CardBody,
                Text::new(""),
                TextFont { font_size: FontSize::Px(13.0), ..default() },
                TextColor(ink.with_alpha(0.9)),
                TextLayout::justify(Justify::Center),
            ));
        });
}

fn settings_keys(keys: Res<ButtonInput<KeyCode>>, mut s: ResMut<Settings>) {
    let step = |k: KeyCode| keys.just_pressed(k);
    if step(KeyCode::Digit1) {
        s.sensitivity = (s.sensitivity - 0.1).max(0.2);
    }
    if step(KeyCode::Digit2) {
        s.sensitivity = (s.sensitivity + 0.1).min(3.0);
    }
    if step(KeyCode::Digit3) {
        s.shake = (s.shake - 0.25).max(0.0);
    }
    if step(KeyCode::Digit4) {
        s.shake = (s.shake + 0.25).min(2.0);
    }
    if step(KeyCode::Digit5) {
        s.fov = (s.fov - 5.0).max(50.0);
    }
    if step(KeyCode::Digit6) {
        s.fov = (s.fov + 5.0).min(100.0);
    }
}

fn apply_settings(s: Res<Settings>, mut look: ResMut<Look>, mut shake: ResMut<Shake>) {
    look.sensitivity = 0.0022 * s.sensitivity;
    look.base_fov = s.fov;
    shake.scale = s.shake;
}

fn count(
    time: Res<Time>,
    riding: Res<Riding>,
    fate: Res<Fate>,
    player: Query<&crate::player::PlayerBody>,
    mut stats: ResMut<Stats>,
) {
    let dt = time.delta_secs_f64();
    let now = riding.riding();
    if now {
        stats.current_ride_m += riding.speed * dt;
        stats.ridden_m += riding.speed * dt;
    }
    if now && !stats.was_riding {
        stats.rides += 1;
        stats.current_ride_m = 0.0;
    }
    stats.longest_ride_m = stats.longest_ride_m.max(stats.current_ride_m);
    stats.was_riding = now;
    if let Ok(pb) = player.single() {
        if fate.alive() && !now && pb.0.grounded && !riding.on_back {
            if let Some(last) = stats.last_pos {
                stats.walked_m += (pb.0.pos - last).length().min(3.0);
            }
        }
        stats.last_pos = Some(pb.0.pos);
    }
}

#[allow(clippy::too_many_arguments)]
fn card(
    cursor: Query<&CursorOptions, With<PrimaryWindow>>,
    settings: Res<Settings>,
    fate: Res<Fate>,
    pack: Res<crate::caller::Pack>,
    mut stats: ResMut<Stats>,
    mut vtime: ResMut<Time<Virtual>>,
    mut card: Query<&mut Visibility, With<Card>>,
    mut body: Query<&mut Text, With<CardBody>>,
    mut debug: Local<Option<bool>>,
) {
    let debug = *debug.get_or_insert_with(|| web::has_flag("debug"));
    let captured = cursor.single().map(|c| c.grab_mode != CursorGrabMode::None).unwrap_or(false);
    if captured {
        stats.played = true;
    }
    let show = !debug && !captured && fate.alive();
    // Pause behind the card once you have been playing.
    let pause = show && stats.played;
    if pause && !vtime.is_paused() {
        vtime.pause();
    } else if !pause && vtime.is_paused() {
        vtime.unpause();
    }
    if let Ok(mut v) = card.single_mut() {
        let want = if show { Visibility::Inherited } else { Visibility::Hidden };
        if *v != want {
            *v = want;
        }
    }
    if !show {
        return;
    }
    let Ok(mut t) = body.single_mut() else { return };
    let lead = if stats.played { "paused - click to go back" } else { "a sandworm-riding fan game - click to begin" };
    let s = format!(
        "{lead}\n\n\
         WASD move   shift run   space jump   C crouch   hold Q sandwalk\n\
         T plant or lift a worm caller ({} carried)   V first / third person   K cinematic\n\
         mouse L / R throw hooks (Z / X)   R / F reel   E let go   G brace / walk\n\
         riding, braced: A / D pry to turn   W drive   S ease off   space jump clear\n\n\
         Worms hunt by vibration. Rhythm carries; stillness is safe; sandwalking\n\
         breaks your rhythm. Rock is refuge. A caller drums them in.\n\n\
         [1 / 2] look sensitivity {:.1}x    [3 / 4] camera shake {:.0}%    [5 / 6] field of view {:.0}\n\n\
         rides {}   longest {:.1} km   ridden {:.1} km   walked {:.1} km   taken {}",
        pack.thumpers,
        settings.sensitivity,
        settings.shake * 100.0,
        settings.fov,
        stats.rides,
        stats.longest_ride_m / 1000.0,
        stats.ridden_m / 1000.0,
        stats.walked_m / 1000.0,
        fate.deaths,
    );
    if t.0 != s {
        t.0 = s;
    }
}
