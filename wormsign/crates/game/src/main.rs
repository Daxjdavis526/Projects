//! WORMSIGN — entry point.

mod ground;
mod hud;
mod player;
mod quake;
mod sky;
mod web;
mod world;
mod worms;

use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "WORMSIGN".into(),
                // On the web, render into the page's canvas and let it size us.
                canvas: Some("#wormsign".into()),
                fit_canvas_to_parent: true,
                // Keys and the mouse belong to the game, not the page.
                prevent_default_event_handling: true,
                ..default()
            }),
            ..default()
        }))
        .add_plugins((world::WorldPlugin, sky::SkyPlugin, ground::GroundPlugin, player::PlayerPlugin, hud::HudPlugin, quake::QuakePlugin, worms::WormsPlugin))
        .run();
}
