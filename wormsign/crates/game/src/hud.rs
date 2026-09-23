//! On-screen text: a controls card, and a debug line with `?debug`.

use bevy::diagnostic::{DiagnosticsStore, FrameTimeDiagnosticsPlugin};
use bevy::prelude::*;

use crate::ground::Tiles;
use crate::quake::Meter;
use wormsign_core::player::Gait;
use crate::player::{Look, PlayerBody};
use crate::web;
use crate::world::{Origin, Phase};

pub struct HudPlugin;

impl Plugin for HudPlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins(FrameTimeDiagnosticsPlugin::default())
            .insert_resource(Debug(web::has_flag("debug")))
            .add_systems(Startup, setup)
            .add_systems(Update, (loading, status, meter_ui, living_hud).after(Phase::View));
    }
}

#[derive(Resource)]
pub struct Debug(pub bool);

#[derive(Component)]
struct StatusText;

#[derive(Component)]
struct MeterFill;

/// Anything that should vanish while the player is not alive.
#[derive(Component)]
struct LivingHud;

#[derive(Component)]
struct GaitText;

const CONTROLS: &str = "Esc: controls and settings";

fn setup(mut commands: Commands) {
    spawn_meter(&mut commands);
    let font = TextFont { font_size: FontSize::Px(13.0), ..default() };
    commands.spawn((
        LivingHud,
        Text::new(CONTROLS),
        font.clone(),
        TextColor(Color::srgba(1.0, 0.95, 0.85, 0.75)),
        Node { position_type: PositionType::Absolute, left: px(14), bottom: px(12), ..default() },
    ));
    commands.spawn((
        StatusText,
        Text::new(""),
        font,
        TextColor(Color::srgba(1.0, 0.95, 0.85, 0.85)),
        Node { position_type: PositionType::Absolute, right: px(14), top: px(10), ..default() },
    ));
}

/// The signal meter: bottom centre, a thin bar with the gait under it.
fn spawn_meter(commands: &mut Commands) {
    commands
        .spawn((LivingHud, Node {
            position_type: PositionType::Absolute,
            bottom: px(54),
            left: percent(50),
            margin: UiRect::left(px(-110)),
            width: px(220),
            flex_direction: FlexDirection::Column,
            align_items: AlignItems::Center,
            row_gap: px(5),
            ..default()
        }))
        .with_children(|c| {
            c.spawn((
                Text::new("SIGNAL"),
                TextFont { font_size: FontSize::Px(10.0), ..default() },
                TextColor(Color::srgba(1.0, 0.95, 0.85, 0.55)),
            ));
            c.spawn((
                Node { width: percent(100), height: px(4), ..default() },
                BackgroundColor(Color::srgba(0.0, 0.0, 0.0, 0.35)),
            ))
            .with_children(|b| {
                b.spawn((
                    MeterFill,
                    Node { width: percent(0), height: percent(100), ..default() },
                    BackgroundColor(Color::srgb(0.95, 0.8, 0.5)),
                ));
            });
            c.spawn((
                GaitText,
                Text::new(""),
                TextFont { font_size: FontSize::Px(11.0), ..default() },
                TextColor(Color::srgba(1.0, 0.95, 0.85, 0.8)),
            ));
        });
}

fn meter_ui(
    meter: Res<Meter>,
    body: Query<&PlayerBody>,
    mut fill: Query<(&mut Node, &mut BackgroundColor), With<MeterFill>>,
    mut gait: Query<&mut Text, With<GaitText>>,
) {
    let l = meter.level.clamp(0.0, 1.0);
    if let Ok((mut n, mut c)) = fill.single_mut() {
        n.width = percent(l * 100.0);
        // Sand-pale when quiet, hot red when anything nearby would notice.
        let quiet = Vec3::new(0.95, 0.8, 0.5);
        let loud = Vec3::new(0.95, 0.22, 0.12);
        let k = quiet.lerp(loud, (l * 1.4 - 0.3).clamp(0.0, 1.0));
        c.0 = Color::srgb(k.x, k.y, k.z);
    }
    if let (Ok(b), Ok(mut t)) = (body.single(), gait.single_mut()) {
        let s = match b.0.gait {
            Gait::Still => "still",
            Gait::Walk => "walking",
            Gait::Run => "running",
            Gait::Crouch => "crouching",
            Gait::Sandwalk => "sandwalk",
            Gait::Air => "",
        };
        if t.0 != s {
            t.0 = s.into();
        }
    }
}

fn loading(tiles: Res<Tiles>, mut last: Local<i32>, mut done: Local<bool>) {
    if *done {
        return;
    }
    let pct = (tiles.progress * 100.0) as i32;
    if pct != *last {
        *last = pct;
        web::call("wormsignStatus", Some(&format!("raising dunes {pct}%")));
    }
    if tiles.ready {
        *done = true;
        web::call("wormsignReady", None);
        info!("terrain ready: {} tiles", tiles.live_count());
    }
}

fn status(
    debug: Res<Debug>,
    diag: Res<DiagnosticsStore>,
    tiles: Res<Tiles>,
    origin: Res<Origin>,
    look: Res<Look>,
    body: Query<&PlayerBody>,
    worms: Query<&crate::worms::WormBody>,
    riding: Res<crate::rider::Riding>,
    mut text: Query<&mut Text, With<StatusText>>,
    time: Res<Time>,
    mut last_log: Local<f32>,
) {
    let (Ok(b), Ok(mut t)) = (body.single(), text.single_mut()) else { return };
    let p = &b.0;
    let fps = diag
        .get(&FrameTimeDiagnosticsPlugin::FPS)
        .and_then(|d| d.smoothed())
        .unwrap_or(0.0);
    let speed = p.vel.x.hypot(p.vel.z);
    let worm = crate::worms::nearest(worms.iter(), p.pos)
        .map(|(w, d)| {
            let i = w.brain.track.and_then(|id| w.ear.track(id)).map(|t| t.interest(t.last_time)).unwrap_or(0.0);
            format!("worm {:?} {:.0} m  {:.0} m/s  depth {:.0}  interest {:.0}", w.brain.state, d, w.worm.speed, w.worm.depth, i)
        })
        .unwrap_or_default();
    t.0 = if debug.0 {
        format!(
            "{fps:.0} fps  |  {} tiles\n{:?}  {speed:.1} m/s  {:?}\nx {:.0}  y {:.1}  z {:.0}  (origin {:.0}, {:.0})\n{worm}",
            tiles.live_count(),
            p.gait,
            look.view,
            p.pos.x,
            p.pos.y,
            p.pos.z,
            origin.0.x,
            origin.0.z
        )
    } else {
        format!("{fps:.0} fps")
    };
    let now = time.elapsed_secs();
    if debug.0 && now - *last_log > 2.0 {
        *last_log = now;
        let hooks: Vec<String> = riding.hooks.iter().map(|h| match h.state {
            wormsign_core::hook::HookState::Stowed => "-".to_string(),
            wormsign_core::hook::HookState::Flying { .. } => "fly".to_string(),
            wormsign_core::hook::HookState::Anchored { d, len, .. } => format!("in@{d:.0}/{len:.1}"),
        }).collect();
        info!("debug pos=({:.1},{:.1},{:.1}) gait={:?} fps={fps:.0} tiles={} {worm} hooks={:?} riding={} back={}", p.pos.x, p.pos.y, p.pos.z, p.gait, tiles.live_count(), hooks, riding.riding(), riding.on_back);
    }
}

fn living_hud(fate: Res<crate::death::Fate>, mut q: Query<&mut Visibility, With<LivingHud>>) {
    let want = if fate.alive() { Visibility::Inherited } else { Visibility::Hidden };
    for mut v in &mut q {
        if *v != want {
            *v = want;
        }
    }
}
