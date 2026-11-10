//! Footstrikes: turning how the player moves into what the sand receives.
//!
//! Each gait has a cadence and a strike energy. Walking and running are
//! metronomic — people's strides vary by only a few percent, which is
//! exactly what makes them easy to hear. Sandwalking is a deliberate
//! broken rhythm: step intervals drawn from a wide spread, occasional
//! pauses, and softer strikes. The body moves in the same stuttering way
//! (see [`Stride::speed_factor`]), so it looks and sounds different, and
//! the vibration model scores what the feet actually did.

use crate::player::{Gait, WALK};
use crate::rng::Rng;
use crate::vibration::sources::*;

#[derive(Clone, Copy, Debug)]
pub struct Strike {
    pub energy: f64,
    pub freq: f64,
    /// Which foot, for footprints and sound panning.
    pub left: bool,
}

#[derive(Clone, Debug)]
pub struct Stride {
    rng: Rng,
    /// Seconds until the next footstrike.
    until: f64,
    /// Seconds since the last one.
    since: f64,
    left: bool,
    /// Current interval, for the sandwalk envelope.
    interval: f64,
}

impl Stride {
    pub fn new(seed: u64) -> Self {
        Self { rng: Rng::new(seed), until: 0.2, since: 1.0, left: false, interval: 0.6 }
    }

    /// Advance by `dt` at the given gait and ground speed. Returns a strike
    /// if a foot came down during this step.
    pub fn update(&mut self, gait: Gait, speed: f64, dt: f64) -> Option<Strike> {
        self.since += dt;
        match gait {
            Gait::Still | Gait::Air => {
                // Standing still puts nothing into the sand. Starting again
                // puts a foot down promptly.
                self.until = self.until.min(0.15);
                return None;
            }
            _ => {}
        }
        self.until -= dt;
        if self.until > 0.0 {
            return None;
        }
        let r = &mut self.rng;
        let (interval, energy, freq) = match gait {
            Gait::Walk => {
                let pace = (speed / WALK).clamp(0.4, 1.6);
                (0.55 / pace.sqrt() * (1.0 + 0.03 * r.gauss()), WALK_ENERGY * pace, WALK_FREQ)
            }
            Gait::Run => (0.36 * (1.0 + 0.03 * r.gauss()), RUN_ENERGY, RUN_FREQ),
            Gait::Crouch => (0.75 * (1.0 + 0.06 * r.gauss()), CROUCH_ENERGY, STEP_FREQ),
            Gait::Sandwalk => {
                let mut i = r.range(0.3, 1.4);
                if r.chance(0.15) {
                    i += r.range(0.6, 1.5);
                }
                (i, SANDWALK_ENERGY * r.range(0.5, 1.2), SANDWALK_FREQ)
            }
            Gait::Still | Gait::Air => unreachable!(),
        };
        self.until += interval.max(0.2);
        self.interval = interval;
        self.since = 0.0;
        self.left = !self.left;
        Some(Strike { energy, freq, left: self.left })
    }

    /// Multiplier on movement speed. 1 except when sandwalking, where the
    /// body lurches forward on each step and nearly stops between them.
    pub fn speed_factor(&self, gait: Gait) -> f64 {
        if gait != Gait::Sandwalk {
            return 1.0;
        }
        if self.since < 0.28 { 1.9 } else { 0.35 }
    }

    /// 0..1 progress through the current step, for head bob.
    pub fn phase(&self) -> f64 {
        (self.since / self.interval.max(0.2)).min(1.0)
    }

    /// Seconds the current step is expected to last.
    pub fn interval(&self) -> f64 {
        self.interval.max(0.2)
    }

    /// Seconds since the last footstrike.
    pub fn since(&self) -> f64 {
        self.since
    }

    /// Which foot struck last (true = left). The other one is swinging.
    pub fn last_left(&self) -> bool {
        self.left
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::player::{CROUCH, RUN, SANDWALK};
    use crate::vibration::{Listener, SourceKind, VibrationEvent};
    use glam::DVec3;

    /// Run a gait for `secs` at `dist` metres from a listener and return the
    /// listener's interest in its best track at the end.
    fn interest_after(gait: Gait, speed: f64, dist: f64, secs: f64, seed: u64) -> f64 {
        let mut stride = Stride::new(seed);
        let mut ear = Listener::new(seed);
        let at = DVec3::new(dist, 0.0, 0.0);
        let dt = 1.0 / 60.0;
        let mut t = 0.0;
        while t < secs {
            if let Some(s) = stride.update(gait, speed, dt) {
                let ev = VibrationEvent {
                    pos: DVec3::ZERO,
                    energy: s.energy,
                    freq: s.freq,
                    coupling: 1.0,
                    time: t,
                    kind: SourceKind::Step,
                };
                ear.hear(at, &ev);
            }
            t += dt;
        }
        ear.best(t).map(|tr| tr.interest(t)).unwrap_or(0.0)
    }

    fn thumper_interest(dist: f64, secs: f64) -> f64 {
        let mut ear = Listener::new(9);
        let at = DVec3::new(dist, 0.0, 0.0);
        let mut t = 0.0;
        while t < secs {
            let ev = VibrationEvent {
                pos: DVec3::ZERO,
                energy: THUMPER_ENERGY,
                freq: THUMPER_FREQ,
                coupling: 1.0,
                time: t,
                kind: SourceKind::Thumper,
            };
            ear.hear(at, &ev);
            t += THUMPER_PERIOD;
        }
        ear.best(t).map(|tr| tr.interest(t)).unwrap_or(0.0)
    }

    #[test]
    fn stillness_emits_nothing() {
        let mut s = Stride::new(1);
        for _ in 0..600 {
            assert!(s.update(Gait::Still, 0.0, 1.0 / 60.0).is_none());
        }
    }

    #[test]
    fn walking_is_metronomic_and_sandwalking_is_not() {
        let rhythm = |gait, speed| {
            let mut s = Stride::new(4);
            let mut times = vec![];
            let mut t = 0.0;
            while t < 30.0 {
                if s.update(gait, speed, 1.0 / 120.0).is_some() {
                    times.push(t);
                }
                t += 1.0 / 120.0;
            }
            let iv: Vec<f64> = times.windows(2).map(|w| w[1] - w[0]).collect();
            crate::vibration::regularity(&iv[iv.len() - 8..])
        };
        assert!(rhythm(Gait::Walk, WALK) > 0.8);
        assert!(rhythm(Gait::Run, RUN) > 0.8);
        assert!(rhythm(Gait::Sandwalk, SANDWALK) < 0.4);
    }

    #[test]
    fn salience_orders_thumper_run_walk_sandwalk_still() {
        // At 250 m: thumper >> run > walk, sandwalk and stillness unheard.
        let d = 250.0;
        let th = thumper_interest(d, 30.0);
        let run = interest_after(Gait::Run, RUN, d, 30.0, 1);
        let walk = interest_after(Gait::Walk, WALK, d, 30.0, 1);
        let sw = interest_after(Gait::Sandwalk, SANDWALK, d, 30.0, 1);
        let still = interest_after(Gait::Still, 0.0, d, 30.0, 1);
        assert!(th > run && run > walk && walk > sw, "{th:.1} {run:.1} {walk:.1} {sw:.1}");
        assert_eq!(sw, 0.0);
        assert_eq!(still, 0.0);

        // Close in, sandwalking is heard, but it is far less interesting
        // than walking at the same distance — not invisible.
        let d = 25.0;
        let walk = interest_after(Gait::Walk, WALK, d, 30.0, 2);
        let crouch = interest_after(Gait::Crouch, CROUCH, d, 30.0, 2);
        let sw = interest_after(Gait::Sandwalk, SANDWALK, d, 30.0, 2);
        assert!(sw > 0.0, "a sandwalk at 25 m is audible");
        assert!(walk > 4.0 * sw, "walk {walk:.1} vs sandwalk {sw:.1}");
        assert!(crouch > sw, "crouch-walking is quieter than walking but still rhythmic");
    }

    #[test]
    fn sandwalk_body_moves_in_lurches() {
        let mut s = Stride::new(5);
        let mut factors = vec![];
        for _ in 0..600 {
            s.update(Gait::Sandwalk, SANDWALK, 1.0 / 60.0);
            factors.push(s.speed_factor(Gait::Sandwalk));
        }
        assert!(factors.iter().any(|f| *f > 1.5) && factors.iter().any(|f| *f < 0.5));
        assert_eq!(s.speed_factor(Gait::Walk), 1.0);
    }
}
