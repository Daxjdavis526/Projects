//! What a worm decides to do, from what it hears.
//!
//! The brain sees only its [`Listener`]: tracks with estimated positions,
//! uncertainty, heat and rhythm. It never reads the player's position. It
//! sets the body's wanted heading, speed and depth, and the body's inertia
//! does the rest.
//!
//! ```text
//!   Roam ──interest──▶ Investigate ──more──▶ Track ──close──▶ Charge ──▶ Attack
//!    ▲                     │                   │                │           │
//!    │                     └──── silence ──────┴──── silence ───┘           ▼
//!    └──────────── give up ─────────────── Search ◀───────────────────── Pass
//! ```
//!
//! Rocks are impassable: every state's steering goes through an avoidance
//! pass that looks ahead and turns away from stone, and a target on rock is
//! circled rather than attacked.

use crate::rng::Rng;
use crate::vibration::{Listener, SourceKind};
use crate::worm::{wrap_angle, Worm};
use glam::DVec3;

/// Interest needed to turn toward a sound.
pub const I_INVESTIGATE: f64 = 6.0;
/// Interest needed to hunt it in earnest.
pub const I_TRACK: f64 = 20.0;
/// Below this a hunted track counts as silent.
pub const I_LOST: f64 = 2.5;
/// Seconds of silence before a hunt becomes a search.
const PATIENCE: f64 = 8.0;
const SEARCH_TIME: f64 = 35.0;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum State {
    Roam,
    Investigate,
    Track,
    Charge,
    Attack,
    Pass,
    Search,
    /// Hooks in its hide and someone on its back.
    Ridden,
}

/// What a rider is doing to the worm, from the rider's hooks and hands.
#[derive(Clone, Debug, Default)]
pub struct Reins {
    /// -1 pry for a left turn .. 1 right.
    pub steer: f64,
    /// -1 ease off .. 1 drive it on.
    pub drive: f64,
    /// Each anchored hook: metres behind the head, and which side of the
    /// body it is on (-1 left .. 1 right, from the hide angle).
    pub hooks: Vec<(f64, f64)>,
}

/// Seconds of being left alone before a ridden worm starts to go down.
pub const DIVE_AFTER: f64 = 18.0;
/// Seconds from starting down to fully under.
const DIVE_TIME: f64 = 14.0;

#[derive(Clone, Debug)]
pub struct Brain {
    pub state: State,
    /// When the current state began.
    pub since: f64,
    /// Where it is going: a track estimate, an attack point, a search centre.
    pub target: DVec3,
    pub track: Option<u32>,
    /// Last time the hunted track was loud enough to count.
    pub last_signal: f64,
    /// What it heard most recently is a thumper.
    pub thumper: bool,
    wander: f64,
    rng: Rng,
    /// Test and screenshot override: hold this (speed, depth) and the
    /// current heading, ignoring the ears.
    pub hold: Option<(f64, f64)>,
    pub hold_mouth: f64,
    /// Set from outside while it has prey: 1 keeps the mouth open, 0 snaps
    /// it shut, regardless of state.
    pub mouth_override: Option<f64>,
    // Riding.
    ride_speed: f64,
    last_pried: f64,
    /// Builds with hard prying, drains with gentle riding. Past 1 it thrashes.
    pub agitation: f64,
    thrash_until: f64,
    last_rider: f64,
}

/// Everything the brain needs to know about the world besides its ears.
pub trait Surroundings {
    /// Is there rock within `margin` metres of (x, z)? Returns its centre and
    /// the radius to keep outside of.
    fn rock(&self, x: f64, z: f64, margin: f64) -> Option<(f64, f64, f64)>;
}

impl Brain {
    pub fn new(seed: u64) -> Self {
        let mut rng = Rng::new(seed);
        let wander = rng.range(-3.14, 3.14);
        Self {
            state: State::Roam,
            since: 0.0,
            target: DVec3::ZERO,
            track: None,
            last_signal: f64::NEG_INFINITY,
            thumper: false,
            wander,
            rng,
            hold: None,
            hold_mouth: 0.0,
            mouth_override: None,
            ride_speed: 0.0,
            last_pried: 0.0,
            agitation: 0.0,
            thrash_until: f64::NEG_INFINITY,
            last_rider: f64::NEG_INFINITY,
        }
    }

    /// Is it thrashing to throw a rider?
    pub fn thrashing(&self, t: f64) -> bool {
        t < self.thrash_until
    }

    /// Ridden: the rider's hooks and hands decide, through the worm's own
    /// inertia. Steering sets where it would like to head, not how fast it
    /// turns; driving builds speed and keeps it up; neglect lets it dive;
    /// prying too hard makes it roll to throw you.
    pub fn ride(&mut self, worm: &mut Worm, reins: &Reins, t: f64, dt: f64) {
        let s = worm.spec;
        let r = s.radius;
        if self.state != State::Ridden {
            self.enter(State::Ridden, t);
            self.ride_speed = worm.speed.max(s.cruise);
            self.last_pried = t;
        }
        self.last_rider = t;
        // Authority: hooks near the head pry harder, and a hook on the side
        // you turn toward does most of the work.
        let reach = |d: f64| (1.6 - d / (s.length * 0.5)).clamp(0.35, 1.6);
        let turn_auth: f64 = reins
            .hooks
            .iter()
            .map(|&(d, side)| reach(d) * (0.35 + 0.65 * (side * reins.steer.signum()).max(0.0)))
            .sum::<f64>()
            .min(1.5);
        let drive_auth: f64 = reins.hooks.iter().map(|&(d, _)| reach(d) * 0.7).sum::<f64>().min(1.3);

        let pried = reins.steer.abs() > 0.05 || reins.drive > 0.05;
        if pried && !reins.hooks.is_empty() {
            self.last_pried = t;
        }
        // Speed: drive builds it, easing off lets it bleed toward a lope.
        let target = if reins.drive > 0.0 {
            s.cruise + (s.max_speed - s.cruise) * (0.4 + 0.6 * reins.drive) * drive_auth.min(1.0)
        } else if reins.drive < 0.0 {
            s.cruise * 0.7
        } else {
            self.ride_speed
        };
        self.ride_speed += (target - self.ride_speed).clamp(-3.0 * dt, 3.0 * dt);

        // Hard, sustained prying agitates it; calm riding soothes it.
        let effort = reins.steer.abs() * turn_auth + reins.drive.max(0.0) * drive_auth * 0.6;
        self.agitation = (self.agitation + (effort - 0.55).max(-0.4) * 0.05 * dt).max(0.0);
        if self.agitation > 1.0 && !self.thrashing(t) {
            self.thrash_until = t + 5.0;
            self.agitation = 0.35;
        }

        let mut heading = worm.heading + reins.steer * 0.6 * turn_auth;
        // Neglected, it goes down again.
        let idle = t - self.last_pried;
        let dive = ((idle - DIVE_AFTER) / DIVE_TIME).clamp(0.0, 1.0);
        let mut depth = 0.62 * r + dive * 1.8 * r;
        let mut roll = (-worm.turn_rate * 4.0).clamp(-0.35, 0.35);
        let mut speed = self.ride_speed;
        if self.thrashing(t) {
            let k = t - (self.thrash_until - 5.0);
            roll = 0.95 * (k * std::f64::consts::TAU * 0.33).sin();
            depth += r * 0.5 * (k * 1.7).sin().max(0.0);
            speed = s.max_speed;
            heading += 0.4 * (k * 0.9).sin();
        }
        worm.want_heading = heading;
        worm.want_speed = speed;
        worm.want_depth = depth;
        worm.want_roll = roll;
        worm.lunge = false;
        worm.want_mouth = 0.0;
    }

    /// Nobody is holding on any more: go back to being a wild animal, and
    /// start by looking around where it lost its rider.
    pub fn unridden(&mut self, worm: &Worm, t: f64) {
        if self.state == State::Ridden && t - self.last_rider > 3.0 {
            self.target = worm.head();
            self.track = None;
            self.enter(State::Search, t);
        }
    }

    /// Commit to an attack on a point right now (scripted scenes and tests).
    pub fn attack(&mut self, target: DVec3, t: f64) {
        self.target = target;
        self.last_signal = t;
        self.enter(State::Attack, t);
    }

    /// Point the roaming drift somewhere in particular.
    pub fn set_wander(&mut self, heading: f64) {
        self.wander = heading;
    }

    fn enter(&mut self, s: State, t: f64) {
        if self.state != s {
            self.state = s;
            self.since = t;
        }
    }

    /// Decide. Call every substep (it is cheap) or every few.
    pub fn think(&mut self, worm: &mut Worm, ear: &mut Listener, t: f64, dt: f64, world: &impl Surroundings) {
        if let Some((speed, depth)) = self.hold {
            worm.want_speed = speed;
            worm.want_depth = depth;
            worm.want_mouth = self.hold_mouth;
            return;
        }
        if self.state == State::Ridden {
            self.unridden(worm, t);
            if self.state == State::Ridden {
                return;
            }
        }
        worm.want_roll = 0.0;
        let r = worm.spec.radius;
        let head = worm.head();
        // A fast worm hears worse over its own noise.
        ear.self_noise = 1.0 + (worm.speed / 14.0).powi(2);
        ear.forget(t);

        // The loudest thing it can hear, and the thing it was already after.
        let best = ear.best(t).map(|tr| (tr.id, tr.interest(t), tr.est, tr.strongest_kind));
        let hunted = self.track.and_then(|id| ear.track(id)).map(|tr| (tr.interest(t), tr.est, tr.strongest_kind));
        if let Some((i, est, kind)) = hunted {
            if i > I_LOST {
                self.last_signal = t;
                // The estimate refines as it closes in; keep following it
                // until it commits to an attack.
                if !matches!(self.state, State::Attack | State::Pass) {
                    self.target = est;
                }
                self.thumper = kind == SourceKind::Thumper;
            }
        }
        let hunted_i = hunted.map(|h| h.0).unwrap_or(0.0);
        let dist = (self.target - head).length_2d();

        match self.state {
            State::Roam | State::Search => {
                if let Some((id, i, est, kind)) = best {
                    let need = if self.state == State::Search { I_INVESTIGATE * 0.7 } else { I_INVESTIGATE };
                    if i > need {
                        self.track = Some(id);
                        self.target = est;
                        self.last_signal = t;
                        self.thumper = kind == SourceKind::Thumper;
                        self.enter(if i > I_TRACK { State::Track } else { State::Investigate }, t);
                    }
                }
                if self.state == State::Search && t - self.since > SEARCH_TIME {
                    self.track = None;
                    self.enter(State::Roam, t);
                }
            }
            State::Investigate => {
                // Something louder elsewhere wins.
                if let Some((id, i, est, _)) = best {
                    if Some(id) != self.track && i > hunted_i * 1.5 {
                        self.track = Some(id);
                        self.target = est;
                    }
                }
                if hunted_i > I_TRACK {
                    self.enter(State::Track, t);
                } else if t - self.last_signal > PATIENCE {
                    self.enter(State::Search, t);
                }
            }
            State::Track => {
                if t - self.last_signal > PATIENCE {
                    self.enter(State::Search, t);
                } else if dist < 380.0 + worm.speed * 4.0 {
                    self.enter(State::Charge, t);
                }
            }
            State::Charge => {
                if t - self.last_signal > PATIENCE * 0.75 {
                    self.enter(State::Search, t);
                } else if world.rock(self.target.x, self.target.z, r * 0.5).is_some() {
                    // It cannot go there. Circle and wait.
                    self.enter(State::Search, t);
                } else if dist < (worm.speed * 1.4).max(3.0 * r) {
                    // Commit: the attack point is frozen now. Whatever is
                    // there when the mouth arrives is what gets eaten.
                    self.enter(State::Attack, t);
                }
            }
            State::Attack => {
                // Lunge through the point and out the other side.
                let past = (head - self.target).dot(worm.forward()) > r * 2.0;
                if past || t - self.since > 10.0 {
                    self.enter(State::Pass, t);
                }
            }
            State::Pass => {
                // Fed on a thumper it lingers near the surface longer — the
                // window for getting on.
                if t - self.since > if self.thumper { 16.0 } else { 9.0 } {
                    self.enter(State::Search, t);
                }
            }
            State::Ridden => {}
        }

        // What each state wants of the body.
        let s = worm.spec;
        let (mut heading, speed, depth) = match self.state {
            State::Roam => {
                self.wander = wrap_angle(self.wander + self.rng.gauss() * 0.08 * dt.sqrt());
                (self.wander, s.cruise, 2.4 * r)
            }
            State::Investigate => (bearing(head, self.target), s.cruise + 0.3 * (s.max_speed - s.cruise), 2.0 * r),
            State::Track => (bearing(head, self.target), s.cruise + 0.65 * (s.max_speed - s.cruise), 1.6 * r),
            State::Charge => (bearing(head, self.target), s.max_speed, 1.15 * r),
            // The breach: the head rears out of the sand on the way in, then
            // comes down so the open mouth arrives at ground level over the
            // target.
            State::Attack => {
                let along = (self.target - head).dot(worm.forward());
                let depth = if along > 2.5 * r { -1.2 * r } else { -0.1 * r };
                (bearing(head, self.target).lerp_angle(worm.heading, 0.5), s.max_speed, depth)
            }
            // Carried on by momentum with its back out of the sand — the
            // moment to get on. Having fed on a thumper it lopes rather than
            // races.
            State::Pass => (worm.heading, s.max_speed * if self.thumper { 0.42 } else { 0.8 }, 0.62 * r),
            State::Ridden => (worm.heading, worm.speed, worm.depth),
            State::Search => {
                // Circle the last estimate at a few hundred metres.
                let to = self.target - head;
                let tangent = DVec3::new(-to.z, 0.0, to.x);
                let radial = to.normalize_or_zero() * ((to.length_2d() - 180.0) / 180.0).clamp(-1.0, 1.0);
                let dir = tangent.normalize_or_zero() + radial;
                (dir.z.atan2(dir.x), s.cruise + 0.25 * (s.max_speed - s.cruise), 1.9 * r)
            }
        };
        if !matches!(self.state, State::Attack) {
            heading = avoid_rocks(worm, heading, world);
        }
        worm.want_heading = heading;
        worm.want_speed = speed;
        worm.want_depth = depth;
        worm.lunge = self.state == State::Attack;
        // Open as the breach begins; shut once it is past.
        worm.want_mouth = self.mouth_override.unwrap_or(if self.state == State::Attack { 1.0 } else { 0.0 });
    }
}

fn bearing(from: DVec3, to: DVec3) -> f64 {
    (to.z - from.z).atan2(to.x - from.x)
}

trait Len2d {
    fn length_2d(&self) -> f64;
}
impl Len2d for DVec3 {
    fn length_2d(&self) -> f64 {
        self.x.hypot(self.z)
    }
}

trait LerpAngle {
    fn lerp_angle(self, other: f64, t: f64) -> f64;
}
impl LerpAngle for f64 {
    fn lerp_angle(self, other: f64, t: f64) -> f64 {
        wrap_angle(self + wrap_angle(other - self) * t)
    }
}

/// Check the route the body would actually fly if it steered for `want`:
/// a short forward prediction with the real turning limits, so a U-turn
/// that would sweep through stone is seen as blocked. If stone is coming,
/// pick the nearest heading whose predicted arc is clear.
fn avoid_rocks(worm: &Worm, want: f64, world: &impl Surroundings) -> f64 {
    let r = worm.spec.radius;
    let margin = r * 2.5 + 20.0;
    let v = worm.speed.max(6.0);
    let horizon = (worm.spec.turn_radius(worm.speed) * 1.6 + 80.0) / v;
    let step = (margin / v).min(1.0);
    let clear = |h: f64| {
        let mut p = worm.head();
        let mut heading = worm.heading;
        let mut rate = worm.turn_rate;
        let ceiling = worm.max_turn_rate();
        let mut t = 0.0;
        while t < horizon {
            let err = wrap_angle(h - heading);
            let want_rate = (err * 0.6).clamp(-ceiling, ceiling);
            rate += (want_rate - rate).clamp(-worm.spec.turn_accel * step, worm.spec.turn_accel * step);
            heading += rate * step;
            p += DVec3::new(heading.cos(), 0.0, heading.sin()) * v * step;
            if world.rock(p.x, p.z, margin).is_some() {
                return false;
            }
            t += step;
        }
        true
    };
    if clear(want) {
        return want;
    }
    for k in 1..=15 {
        let off = k as f64 * 0.2;
        // Prefer the side nearer the current heading.
        let (a, b) = (wrap_angle(want + off), wrap_angle(want - off));
        let (first, second) = if wrap_angle(a - worm.heading).abs() < wrap_angle(b - worm.heading).abs() { (a, b) } else { (b, a) };
        if clear(first) {
            return first;
        }
        if clear(second) {
            return second;
        }
    }
    // Boxed in: turn hard away from the nearest rock.
    let head = worm.head();
    if let Some((cx, cz, _)) = world.rock(head.x, head.z, 1000.0) {
        return (head.z - cz).atan2(head.x - cx);
    }
    want
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::vibration::sources::*;
    use crate::vibration::VibrationEvent;
    use crate::worm::WormSpec;

    struct Open;
    impl Surroundings for Open {
        fn rock(&self, _: f64, _: f64, _: f64) -> Option<(f64, f64, f64)> {
            None
        }
    }

    struct OneRock(f64, f64, f64);
    impl Surroundings for OneRock {
        fn rock(&self, x: f64, z: f64, margin: f64) -> Option<(f64, f64, f64)> {
            let d = (x - self.0).hypot(z - self.1);
            (d < self.2 + margin).then_some((self.0, self.1, self.2))
        }
    }

    fn flat(_: f64, _: f64) -> f64 {
        0.0
    }

    /// Simulate a worm and a source; returns the sequence of states visited,
    /// the closest the head came to the source, and the time of first attack.
    fn run(
        worm_at: (f64, f64, f64),
        src: DVec3,
        period: f64,
        energy: f64,
        freq: f64,
        secs: f64,
        world: &impl Surroundings,
    ) -> (Vec<State>, f64, Option<f64>, Worm) {
        let mut w = Worm::new(WormSpec::standard(), worm_at.0, worm_at.1, worm_at.2, 26.0, flat);
        let mut ear = Listener::new(5);
        let mut brain = Brain::new(5);
        let dt = 1.0 / 30.0;
        let mut t = 0.0;
        let mut next = 0.0;
        let mut states = vec![brain.state];
        let mut closest = f64::MAX;
        let mut attack_at = None;
        while t < secs {
            if period > 0.0 && t >= next {
                let ev = VibrationEvent { pos: src, energy, freq, coupling: 1.0, time: t, kind: if energy > 1000.0 { SourceKind::Thumper } else { SourceKind::Step } };
                ear.hear(w.head(), &ev);
                next += period;
            }
            brain.think(&mut w, &mut ear, t, dt, world);
            w.step(dt, flat);
            if *states.last().unwrap() != brain.state {
                states.push(brain.state);
                if brain.state == State::Attack && attack_at.is_none() {
                    attack_at = Some(t);
                }
            }
            closest = closest.min((w.head() - src).length_2d());
            t += dt;
        }
        (states, closest, attack_at, w)
    }

    #[test]
    fn a_thumper_three_km_away_is_hunted_down() {
        let (states, closest, attack, _) = run((3000.0, 0.0, 1.2), DVec3::ZERO, THUMPER_PERIOD, THUMPER_ENERGY, THUMPER_FREQ, 400.0, &Open);
        assert!(states.contains(&State::Track), "{states:?}");
        assert!(states.contains(&State::Charge), "{states:?}");
        let t = attack.expect("should attack");
        assert!(t > 60.0 && t < 300.0, "attack after {t:.0} s");
        assert!(closest < 25.0, "missed by {closest:.0} m");
    }

    #[test]
    fn silence_is_ignored() {
        let (states, _, attack, w) = run((800.0, 0.0, 0.0), DVec3::ZERO, 0.0, 0.0, 0.0, 200.0, &Open);
        assert_eq!(states, vec![State::Roam]);
        assert!(attack.is_none());
        assert!(w.speed <= w.spec.cruise + 1e-6);
    }

    #[test]
    fn running_draws_a_worm_and_sandwalking_does_not() {
        // A steady run 500 m away brings it in.
        let (s_run, _, a_run, _) = run((500.0, 0.0, 2.0), DVec3::ZERO, 0.36, RUN_ENERGY, RUN_FREQ, 200.0, &Open);
        assert!(a_run.is_some(), "{s_run:?}");
        // A metronomic sandwalk-energy source would be heard at 60 m... but a
        // real sandwalk is irregular; this checks raw loudness alone keeps it
        // below the investigate threshold at 150 m.
        let (s_sw, _, a_sw, _) = run((150.0, 0.0, 2.0), DVec3::ZERO, 0.8, SANDWALK_ENERGY, SANDWALK_FREQ, 120.0, &Open);
        assert!(a_sw.is_none() && s_sw == vec![State::Roam], "{s_sw:?}");
    }

    #[test]
    fn stops_hunting_when_the_noise_stops_and_searches() {
        let mut w = Worm::new(WormSpec::standard(), 1500.0, 0.0, 3.1, 26.0, flat);
        let mut ear = Listener::new(2);
        let mut brain = Brain::new(2);
        let dt = 1.0 / 30.0;
        let mut t = 0.0;
        let mut next = 0.0;
        let mut saw_track = false;
        while t < 150.0 {
            if t < 30.0 && t >= next {
                ear.hear(w.head(), &VibrationEvent { pos: DVec3::ZERO, energy: THUMPER_ENERGY, freq: THUMPER_FREQ, coupling: 1.0, time: t, kind: SourceKind::Thumper });
                next += THUMPER_PERIOD;
            }
            brain.think(&mut w, &mut ear, t, dt, &Open);
            w.step(dt, flat);
            saw_track |= brain.state == State::Track;
            t += dt;
        }
        assert!(saw_track);
        assert!(matches!(brain.state, State::Search | State::Roam), "{:?}", brain.state);
    }

    #[test]
    fn never_swims_through_rock() {
        // A thumper directly behind a big rock: the worm must go round.
        let rock = OneRock(-400.0, 0.0, 250.0);
        let mut w = Worm::new(WormSpec::standard(), 600.0, 0.0, std::f64::consts::PI, 26.0, flat);
        let mut ear = Listener::new(8);
        let mut brain = Brain::new(8);
        let src = DVec3::new(-1000.0, 0.0, 0.0);
        let dt = 1.0 / 30.0;
        let (mut t, mut next) = (0.0, 0.0);
        let mut min_clear = f64::MAX;
        while t < 300.0 {
            if t >= next {
                ear.hear(w.head(), &VibrationEvent { pos: src, energy: THUMPER_ENERGY, freq: THUMPER_FREQ, coupling: 1.0, time: t, kind: SourceKind::Thumper });
                next += THUMPER_PERIOD;
            }
            brain.think(&mut w, &mut ear, t, dt, &rock);
            w.step(dt, flat);
            let h = w.head();
            min_clear = min_clear.min((h.x - rock.0).hypot(h.z - rock.1) - rock.2);
            t += dt;
        }
        assert!(min_clear > 0.0, "head entered the rock by {:.0} m", -min_clear);
        // It still got to the thumper eventually.
        assert!((w.head() - src).length_2d() < 800.0 || brain.state != State::Roam);
    }

    #[test]
    fn a_player_on_rock_is_circled_not_eaten() {
        // Someone running on a rock 1 km away: heard (badly, rock couples
        // poorly, so make it loud), hunted, but never attacked.
        let rock = OneRock(0.0, 0.0, 120.0);
        let (states, closest, attack, _) =
            run((1200.0, 0.0, 3.1), DVec3::ZERO, THUMPER_PERIOD, THUMPER_ENERGY, THUMPER_FREQ, 300.0, &rock);
        assert!(states.contains(&State::Track), "{states:?}");
        assert!(attack.is_none(), "{states:?}");
        assert!(closest > 120.0, "came within {closest:.0} m of the centre");
    }

    fn right_hook() -> Reins {
        Reins { steer: 0.0, drive: 0.0, hooks: vec![(40.0, 1.0), (40.0, -1.0)] }
    }

    fn ride_for(w: &mut Worm, b: &mut Brain, reins: &Reins, t0: f64, secs: f64) -> f64 {
        let dt = 1.0 / 60.0;
        let mut t = t0;
        while t < t0 + secs {
            b.ride(w, reins, t, dt);
            w.step(dt, flat);
            t += dt;
        }
        t
    }

    #[test]
    fn a_ridden_worm_turns_gradually_where_it_is_pried() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 7.0, flat);
        w.speed = 20.0;
        let mut b = Brain::new(1);
        let mut reins = right_hook();
        reins.steer = 1.0;
        reins.drive = 0.3;
        let h0 = w.heading;
        ride_for(&mut w, &mut b, &reins, 0.0, 4.0);
        let turned = wrap_angle(w.heading - h0);
        assert!(turned > 0.05, "turned right: {turned}");
        assert!(turned < 0.8, "but not like a car: {turned}");
        assert_eq!(b.state, State::Ridden);
        // And the other way.
        let mut w2 = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 7.0, flat);
        w2.speed = 20.0;
        let mut b2 = Brain::new(1);
        reins.steer = -1.0;
        ride_for(&mut w2, &mut b2, &reins, 0.0, 4.0);
        assert!(wrap_angle(w2.heading - h0) < -0.05);
    }

    #[test]
    fn driven_it_stays_up_and_left_alone_it_dives() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 7.0, flat);
        let mut b = Brain::new(2);
        let mut reins = right_hook();
        reins.drive = 0.5;
        let t = ride_for(&mut w, &mut b, &reins, 0.0, 40.0);
        assert!(w.depth < w.spec.radius, "kept surfaced: depth {}", w.depth);
        assert!(w.speed > w.spec.cruise + 5.0, "driven on: {}", w.speed);
        reins.drive = 0.0;
        ride_for(&mut w, &mut b, &reins, t, DIVE_AFTER + DIVE_TIME + 10.0);
        assert!(w.depth > 1.8 * w.spec.radius, "went under: depth {}", w.depth);
    }

    #[test]
    fn prying_too_hard_makes_it_roll_to_throw_you() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 7.0, flat);
        w.speed = 20.0;
        let mut b = Brain::new(3);
        let mut reins = right_hook();
        reins.steer = 1.0;
        reins.drive = 1.0;
        let dt = 1.0 / 60.0;
        let mut t = 0.0;
        let mut max_roll: f64 = 0.0;
        while t < 90.0 {
            // Saw back and forth to keep the effort up.
            reins.steer = if (t / 6.0) as i64 % 2 == 0 { 1.0 } else { -1.0 };
            b.ride(&mut w, &reins, t, dt);
            w.step(dt, flat);
            max_roll = max_roll.max(w.roll.abs());
            t += dt;
        }
        assert!(max_roll > 0.5, "never thrashed: max roll {max_roll}");
        // Gentle riding does not.
        let mut w2 = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 7.0, flat);
        let mut b2 = Brain::new(3);
        let mut calm = right_hook();
        calm.drive = 0.3;
        calm.steer = 0.2;
        let mut t = 0.0;
        let mut calm_roll: f64 = 0.0;
        while t < 90.0 {
            b2.ride(&mut w2, &calm, t, dt);
            w2.step(dt, flat);
            calm_roll = calm_roll.max(w2.roll.abs());
            t += dt;
        }
        assert!(calm_roll < 0.4, "calm ride rolled {calm_roll}");
    }

    #[test]
    fn let_go_and_it_goes_wild_again() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 7.0, flat);
        let mut b = Brain::new(4);
        let t = ride_for(&mut w, &mut b, &right_hook(), 0.0, 5.0);
        let mut ear = Listener::new(4);
        b.think(&mut w, &mut ear, t + 1.0, 1.0 / 60.0, &Open);
        assert_eq!(b.state, State::Ridden, "a moment's let-go is not the end");
        b.think(&mut w, &mut ear, t + 5.0, 1.0 / 60.0, &Open);
        assert_eq!(b.state, State::Search);
    }
}
