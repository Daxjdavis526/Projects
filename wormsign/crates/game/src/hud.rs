//! On-screen text: a controls card, and a debug line with `?debug`.

use bevy::diagnostic::{DiagnosticsStore, FrameTimeDiagnosticsPlugin};
use bevy::prelude::*;

use crate::ground::Tiles;
use crate::player::{Look, PlayerBody};
use crate::web;
use crate::world::{Origin, Phase};

pub struct HudPlugin;

impl Plugin for HudPlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins(FrameTimeDiagnosticsPlugin::default())
            .insert_resource(Debug(web::has_flag("debug")))
            .add_systems(Startup, setup)
            .add_systems(Update, (loading, status).after(Phase::View));
    }
}

#[derive(Resource)]
pub struct Debug(pub bool);

#[derive(Component)]
struct StatusText;

const CONTROLS: &str = "click to look  ·  WASD move  ·  shift run  ·  space jump\n\
C crouch  ·  hold Q sandwalk  ·  V first/third person  ·  wheel zoom";

fn setup(mut commands: Commands) {
    let font = TextFont { font_size: FontSize::Px(13.0), ..default() };
    commands.spawn((
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
    t.0 = if debug.0 {
        format!(
            "{fps:.0} fps  ·  {} tiles\n{:?}  {speed:.1} m/s  {:?}\nx {:.0}  y {:.1}  z {:.0}  (origin {:.0}, {:.0})",
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
        info!("debug pos=({:.1},{:.1},{:.1}) gait={:?} fps={fps:.0} tiles={}", p.pos.x, p.pos.y, p.pos.z, p.gait, tiles.live_count());
    }
}
