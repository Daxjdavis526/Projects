//! Whole-game scenarios, headless: real terrain, the player's body and feet,
//! the vibration model, and a worm with its brain — everything but pixels.
//! These are the game's promises, checked end to end.

use wormsign_core::brain::{Brain, State, Surroundings};
use wormsign_core::gait::Stride;
use wormsign_core::glam::DVec3;
use wormsign_core::player::{GroundHit, Player, PlayerInput};
use wormsign_core::terrain::Terrain;
use wormsign_core::vibration::{sources, Listener, SourceKind, VibrationEvent};
use wormsign_core::worm::{Worm, WormSpec};

struct Rocks<'a>(&'a Terrain);
impl Surroundings for Rocks<'_> {
    fn rock(&self, x: f64, z: f64, margin: f64) -> Option<(f64, f64, f64)> {
        self.0.rock_near(x, z, margin).map(|r| (r.x, r.z, r.radius * 1.3))
    }
}

struct Outcome {
    states: Vec<State>,
    /// Closest the worm's mouth came to the player while attacking.
    strike_miss: Option<f64>,
    /// When the player was inside an attacking worm's open mouth.
    eaten_at: Option<f64>,
    ran: f64,
}

/// Put a player somewhere open, a roaming worm `worm_dist` away, and have
/// the player move in a straight line with `input` for `secs`.
fn scenario(input: PlayerInput, worm_dist: f64, secs: f64, seed: u64) -> Outcome {
    let terrain = Terrain::new(0x5A2D_1965);
    // Start somewhere sandy near the origin, heading away from any rock.
    let start = DVec3::new(335.0, terrain.height(335.0, -335.0) as f64, -335.0);
    let mut player = Player::new(start);
    let mut feet = Stride::new(seed);
    let ground = |x: f64, z: f64| {
        let n = terrain.normal(x, z);
        GroundHit::still(terrain.height(x, z) as f64, DVec3::new(n[0] as f64, n[1] as f64, n[2] as f64))
    };
    let sand = |x: f64, z: f64| terrain.sand(x, z);
    let a = seed as f64 * 1.7;
    let wx = start.x + a.cos() * worm_dist;
    let wz = start.z + a.sin() * worm_dist;
    let mut worm = Worm::new(WormSpec::standard(), wx, wz, a + 1.3, 26.0, sand);
    let mut brain = Brain::new(seed);
    brain.set_wander(a + 1.3);
    let mut ear = Listener::new(seed);
    let rocks = Rocks(&terrain);

    let dt = 1.0 / 120.0;
    let mut t = 0.0;
    let mut k = 0u64;
    let mut pending: Vec<VibrationEvent> = Vec::new();
    let mut out = Outcome { states: vec![brain.state], strike_miss: None, eaten_at: None, ran: 0.0 };
    while t < secs {
        let f = feet.speed_factor(player.gait);
        let mut i = input;
        i.forward *= f;
        i.right *= f;
        let before = player.pos;
        player.step(&i, dt, ground);
        out.ran += (player.pos - before).length();
        let speed = player.vel.x.hypot(player.vel.z);
        let gait_speed = if player.gait == wormsign_core::player::Gait::Sandwalk { speed / f.max(0.1) } else { speed };
        if let Some(s) = feet.update(player.gait, gait_speed, dt) {
            pending.push(VibrationEvent {
                pos: player.pos,
                energy: s.energy,
                freq: s.freq,
                coupling: sources::SAND_COUPLING,
                time: t,
                kind: SourceKind::Step,
            });
        }
        // The worm runs at 30 Hz.
        if k % 4 == 3 {
            for ev in pending.drain(..) {
                ear.hear(worm.head(), &ev);
            }
            brain.think(&mut worm, &mut ear, t, dt * 4.0, &rocks);
            worm.step(dt * 4.0, sand);
            if *out.states.last().unwrap() != brain.state {
                out.states.push(brain.state);
            }
            if matches!(brain.state, State::Attack | State::Pass) {
                let d = (worm.head() - player.pos).length();
                out.strike_miss = Some(out.strike_miss.map_or(d, |m: f64| m.min(d)));
                if out.eaten_at.is_none() && worm.in_mouth(player.pos + DVec3::new(0.0, 1.2, 0.0)) {
                    out.eaten_at = Some(t);
                }
            }
        }
        t += dt;
        k += 1;
    }
    out
}

#[test]
fn sprinting_across_open_sand_draws_a_worm_that_strikes() {
    let run = PlayerInput { forward: 1.0, run: true, yaw: 2.4, ..Default::default() };
    let o = scenario(run, 650.0, 240.0, 1);
    assert!(o.states.contains(&State::Track), "{:?}", o.states);
    let miss = o.strike_miss.expect(&format!("never attacked: {:?}", o.states));
    eprintln!("sprint: states {:?}, closest strike {miss:.1} m, eaten at {:?} s", o.states, o.eaten_at);
    // It hunts by ear, not by seeing, so it can miss a moving target — but
    // keep running across open sand and it gets you.
    assert!(o.eaten_at.is_some(), "never caught; closest {miss:.0} m; states {:?}", o.states);
}

#[test]
fn sandwalking_past_a_worm_goes_unnoticed() {
    let sw = PlayerInput { forward: 1.0, sandwalk: true, yaw: 2.4, ..Default::default() };
    let o = scenario(sw, 260.0, 240.0, 2);
    assert!(o.strike_miss.is_none() && o.eaten_at.is_none(), "{:?}", o.states);
    assert!(o.ran > 100.0, "the sandwalker actually went somewhere: {:.0} m", o.ran);
}

#[test]
fn standing_still_is_safe() {
    let o = scenario(PlayerInput::default(), 300.0, 180.0, 3);
    assert_eq!(o.states, vec![State::Roam]);
}
