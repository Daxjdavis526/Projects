//! The vibration bus: every strike on the sand this frame, for whoever is
//! listening (worms, the HUD meter, the debug rings, the audio).

use bevy::prelude::*;
use wormsign_core::glam::DVec3;
use wormsign_core::vibration::{Listener, SourceKind, VibrationEvent};

use crate::hud::Debug;
use crate::player::PlayerBody;
use crate::world::{Origin, Phase, SimClock};

pub struct QuakePlugin;

impl Plugin for QuakePlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<Quakes>()
            .insert_resource(Meter { ear: Listener::new(77), level: 0.0 })
            .add_systems(First, clear)
            .add_systems(Update, (meter, rings).after(Phase::Simulate).before(Phase::View));
    }
}

/// Events emitted this frame, and a clock they are stamped with.
#[derive(Resource, Default)]
pub struct Quakes {
    pub events: Vec<VibrationEvent>,
    /// Recent events kept briefly for drawing.
    recent: Vec<VibrationEvent>,
}

impl Quakes {
    pub fn emit(&mut self, ev: VibrationEvent) {
        self.events.push(ev);
    }
}

fn clear(mut q: ResMut<Quakes>) {
    let evs = std::mem::take(&mut q.events);
    q.recent.extend(evs);
}

/// "What would a worm 150 m away make of you right now?" A real listener,
/// fed the player's own strikes from a fixed offset, so the meter tells the
/// truth about rhythm as well as loudness.
#[derive(Resource)]
pub struct Meter {
    ear: Listener,
    /// 0..1 for display.
    pub level: f32,
}

pub const METER_DISTANCE: f64 = 150.0;
/// Interest that fills the meter. Around a steady walk at 150 m.
const METER_FULL: f64 = 60.0;

fn meter(time: Res<Time>, clock: Res<SimClock>, q: Res<Quakes>, mut m: ResMut<Meter>, body: Query<&PlayerBody>) {
    let Ok(b) = body.single() else { return };
    let t = clock.0;
    let at = b.0.pos + DVec3::new(METER_DISTANCE, 0.0, 0.0);
    for ev in &q.events {
        // Only what your own feet put into the sand; a caller beside you is
        // its own source.
        if !matches!(ev.kind, SourceKind::Step | SourceKind::Landing) || (ev.pos - b.0.pos).length() > 3.0 {
            continue;
        }
        // The imaginary worm moves with the player, so place each event
        // relative to where the player is now.
        let mut e = *ev;
        e.pos = b.0.pos;
        m.ear.hear(at, &e);
    }
    m.ear.forget(t);
    let target = m.ear.best(t).map(|tr| tr.interest(t)).unwrap_or(0.0) / METER_FULL;
    m.level += (target.min(1.2) as f32 - m.level) * (1.0 - (-time.delta_secs() * 6.0).exp());
}

/// With `?debug`, each strike draws an expanding ring on the sand whose
/// size shows how far it carries.
fn rings(clock: Res<SimClock>, debug: Res<Debug>, origin: Res<Origin>, mut q: ResMut<Quakes>, mut gizmos: Gizmos) {
    let t = clock.0;
    q.recent.retain(|e| t - e.time < 1.5);
    if !debug.0 {
        return;
    }
    for e in &q.recent {
        let age = (t - e.time) as f32;
        // Radius where the strike is still at the noise floor.
        let reach = reach(e) as f32;
        let r = reach * (age / 1.5).sqrt();
        let a = (1.0 - age / 1.5).max(0.0) * 0.8;
        let p = origin.to_render(e.pos) + Vec3::Y * 0.15;
        gizmos.circle(
            Isometry3d::new(p, Quat::from_rotation_x(std::f32::consts::FRAC_PI_2)),
            r.max(0.3),
            Color::srgba(1.0, 0.35, 0.15, a),
        );
    }
}

/// Distance at which an event falls to the detection floor.
pub fn reach(e: &VibrationEvent) -> f64 {
    use wormsign_core::vibration::{received, DETECT_SNR};
    let (mut lo, mut hi) = (0.0, 20_000.0);
    for _ in 0..30 {
        let mid = 0.5 * (lo + hi);
        if received(e.energy, e.coupling, e.freq, mid) > DETECT_SNR { lo = mid } else { hi = mid }
    }
    lo
}
