//! Where things are.
//!
//! Gameplay lives in f64 world coordinates, so a position 60 km out is as
//! exact as one at the start. The GPU only gets f32, which starts to jitter
//! visibly a few kilometres out, so everything is drawn relative to a
//! floating [`Origin`] that jumps to the player whenever they wander more
//! than [`RECENTRE`] metres from it. Nothing but the `Transform`s notices.

use bevy::prelude::*;
use std::sync::Arc;
use wormsign_core::glam::DVec3;
use wormsign_core::terrain::Terrain;

pub const SEED: u32 = 0x5A2D_1965;
const RECENTRE: f64 = 2000.0;

#[derive(Resource, Clone)]
pub struct Desert(pub Arc<Terrain>);

/// World position of the render origin.
#[derive(Resource, Default)]
pub struct Origin(pub DVec3);

/// Authoritative position of anything placed in the world; its `Transform`
/// translation is derived from this.
#[derive(Component, Clone, Copy, Default)]
pub struct WorldPos(pub DVec3);

impl Origin {
    pub fn to_render(&self, p: DVec3) -> Vec3 {
        (p - self.0).as_vec3()
    }
}

/// Anything the origin should follow. The player.
#[derive(Component)]
pub struct OriginAnchor;

#[derive(SystemSet, Debug, Clone, PartialEq, Eq, Hash)]
pub enum Phase {
    /// Input and simulation update world positions.
    Simulate,
    /// World positions become transforms.
    Place,
    /// Cameras and anything else that reads final transforms.
    View,
}

pub struct WorldPlugin;

impl Plugin for WorldPlugin {
    fn build(&self, app: &mut App) {
        app.insert_resource(Desert(Arc::new(Terrain::new(SEED))))
            .init_resource::<Origin>()
            .configure_sets(Update, (Phase::Simulate, Phase::Place, Phase::View).chain())
            .add_systems(Update, (recentre, place).chain().in_set(Phase::Place));
    }
}

fn recentre(mut origin: ResMut<Origin>, anchor: Query<&WorldPos, With<OriginAnchor>>) {
    let Ok(p) = anchor.single() else { return };
    let d = p.0 - origin.0;
    if d.x.hypot(d.z) > RECENTRE {
        // Snap to a coarse grid so the new origin is itself a round number.
        origin.0 = DVec3::new((p.0.x / 256.0).round() * 256.0, 0.0, (p.0.z / 256.0).round() * 256.0);
    }
}

fn place(origin: Res<Origin>, mut q: Query<(Ref<WorldPos>, &mut Transform)>) {
    let all = origin.is_changed();
    for (wp, mut t) in &mut q {
        if all || wp.is_changed() {
            t.translation = origin.to_render(wp.0);
        }
    }
}
