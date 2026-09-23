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

use wormsign_core::brain::Reins;
use wormsign_core::hook::{Hook, HookState};

/// The whole fantasy, scripted: a worm lopes past with its back out; the
/// player sprints alongside, throws a hook into its flank, is dragged on,
/// jumps up onto the back, sets the second hook, reels in, and rides it for
/// two minutes, steering. Nothing is teleported: every step is the same
/// physics the game runs.
#[test]
fn run_hook_climb_and_ride() {
    let terrain = Terrain::new(0x5A2D_1965);
    let sand = |x: f64, z: f64| terrain.sand(x, z);
    let r_std = WormSpec::standard().radius;
    // The worm: coming along +x past the start, back out of the sand.
    let start = DVec3::new(335.0, 0.0, -335.0);
    let mut worm = Worm::new(WormSpec::standard(), start.x - 260.0, start.z - 20.0, 0.0, 0.62 * r_std, sand);
    worm.speed = 15.0;
    worm.want_speed = 15.0;
    worm.want_depth = 0.62 * r_std;
    let mut brain = Brain::new(9);
    let mut ear = Listener::new(9);
    let rocks = Rocks(&terrain);
    brain.hold = Some((15.0, 0.62 * r_std));

    let mut player = Player::new(DVec3::new(start.x, terrain.height(start.x, start.z) as f64, start.z));
    let mut hooks = [Hook::default(), Hook::default()];
    let dt = 1.0 / 120.0;
    let mut t = 0.0;
    let mut mounted_at: Option<f64> = None;
    let mut on_sand_after_mount = 0.0;
    let mut start_ride = DVec3::ZERO;
    let mut ridden_path = 0.0;

    while t < 200.0 {
        // --- the rider's decisions ------------------------------------------
        let hit = worm.surface(player.pos + DVec3::Y);
        let to_body = hit.map(|h| h.point - player.pos).unwrap_or(DVec3::X);
        let flat = DVec3::new(to_body.x, 0.0, to_body.z);
        let on_back = player.grounded && worm.back_ground(player.pos.x, player.pos.z, player.pos.y + 0.5).map_or(false, |g| (g.0 - player.pos.y).abs() < 0.3);
        let hooked = hooks.iter().filter(|h| h.anchored()).count();
        let mut input = PlayerInput::default();
        let mut reins = Reins::default();
        if mounted_at.is_none() {
            // Wait for the head to go by, then run in beside the body.
            let behind_head = (worm.head() - player.pos).dot(worm.forward()) < -30.0 || (worm.head().x > player.pos.x + 30.0);
            if behind_head && worm.head().x > player.pos.x {
                let yaw = (-flat.x).atan2(-flat.z);
                input = PlayerInput { forward: 1.0, run: true, yaw, ..Default::default() };
                if hooked == 0 && flat.length() < 22.0 && !matches!(hooks[0].state, HookState::Flying { .. }) {
                    let aim = (hit.unwrap().point + DVec3::Y * 2.0) - (player.pos + DVec3::Y * 1.4);
                    hooks[0].throw(player.pos + DVec3::Y * 1.4, aim, player.vel);
                }
                if hooked > 0 {
                    // Haul in, and jump up the flank when close.
                    hooks[0].reel(-6.0 * dt);
                    if flat.length() < 6.0 && player.grounded {
                        input.jump = true;
                    }
                }
            }
            if on_back && hooked > 0 {
                mounted_at = Some(t);
                start_ride = worm.head();
                brain.hold = None;
                // Second hook, into the other side of the back.
                let (c, _, up, side, r) = worm.frame(hit.unwrap().d);
                let target = c + (up * 0.7 - side * 0.7).normalize() * r;
                hooks[1].throw(player.pos + DVec3::Y * 1.4, target - (player.pos + DVec3::Y * 1.4), player.vel);
            }
        } else {
            // Riding: reel in close and steer in long, gentle sweeps.
            for h in hooks.iter_mut() {
                h.reel(-2.0 * dt);
            }
            let phase = ((t - mounted_at.unwrap()) / 25.0) as i64;
            reins.steer = [0.0, 0.5, 0.0, -0.5][(phase % 4) as usize];
            reins.drive = 0.4;
            for h in &hooks {
                if let HookState::Anchored { d, angle, .. } = h.state {
                    reins.hooks.push((d, angle.sin().signum()));
                }
            }
        }

        // --- physics, exactly as the game does it ---------------------------
        let y_near = player.pos.y;
        let ground = |x: f64, z: f64| {
            let n = terrain.normal(x, z);
            let s = GroundHit::still(terrain.height(x, z) as f64, DVec3::new(n[0] as f64, n[1] as f64, n[2] as f64));
            match worm.back_ground(x, z, y_near + 0.5) {
                Some((h, n, v, _)) if h > s.height => GroundHit::hide(h, n, v),
                _ => s,
            }
        };
        player.step(&input, dt, ground);
        for h in hooks.iter_mut() {
            h.fly(dt, Some(&worm), |x, z| terrain.height(x, z) as f64);
            let grip = player.pos + DVec3::Y * 1.2;
            let (mut p, mut v) = (player.pos, player.vel);
            let fix = h.constrain(&worm, grip, &mut p, &mut v, dt);
            if fix.length() > 0.0 {
                player.pos = p;
                player.vel = v;
            }
        }
        if (t * 120.0) as i64 % 4 == 0 {
            if mounted_at.is_some() && !reins.hooks.is_empty() {
                brain.ride(&mut worm, &reins, t, dt * 4.0);
            } else {
                brain.think(&mut worm, &mut ear, t, dt * 4.0, &rocks);
            }
            worm.step(dt * 4.0, sand);
            if mounted_at.is_some() {
                ridden_path += worm.speed * dt * 4.0;
            }
        }

        if mounted_at.is_some() {
            let sand_here = terrain.height(player.pos.x, player.pos.z) as f64;
            if player.grounded && (player.pos.y - sand_here).abs() < 0.3 && worm.back_ground(player.pos.x, player.pos.z, player.pos.y + 0.5).is_none() {
                on_sand_after_mount += dt;
            }
        }
        t += dt;
    }

    let mounted = mounted_at.expect("never got onto the worm");
    let rode = ridden_path;
    let _ = start_ride;
    let anchored = hooks.iter().filter(|h| h.anchored()).count();
    eprintln!(
        "mounted at {mounted:.1} s; rode {:.0} m of path; {anchored} hooks in; {:.1} s on the sand after mounting; worm {:?} depth {:.1} speed {:.1}",
        rode, on_sand_after_mount, brain.state, worm.depth, worm.speed
    );
    assert!(mounted < 60.0, "took {mounted:.0} s to get on");
    assert!(on_sand_after_mount < 1.0, "fell off: {on_sand_after_mount:.1} s on the sand");
    assert!(anchored >= 1, "still holding on");
    assert!(rode > 3000.0, "rode {rode:.0} m");
}
