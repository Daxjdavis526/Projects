//! Vibration: what goes into the sand, and what a worm makes of it.
//!
//! **Sources.** Everything that touches the sand emits discrete
//! [`VibrationEvent`]s — each footstrike, each landing, each thumper blow.
//! Nothing declares itself "rhythmic" or "quiet"; those are properties of
//! the stream of events, measured by the listener.
//!
//! **Propagation.** Seismic surface waves spread in two dimensions and are
//! absorbed on the way, faster at higher frequencies. Received strength is
//!
//! ```text
//!   R = E · coupling · r0 / (r0 + r) · exp(-K · f · r)
//! ```
//!
//! in units of the desert's background noise, so R = 1 is at the noise
//! floor. The constants are tuned for play, not measured. A single strike
//! is detectable out to roughly: thumper 6 km, run 900 m, walk 450 m,
//! sandwalk 75 m. Being *detected* is not being *hunted*; that takes enough
//! accumulated, rhythmic signal (see the worm AI's thresholds). The *shape* — geometric spreading plus frequency-dependent
//! absorption, so deep thuds outrun footsteps — is the physical part.
//!
//! **Listening.** A worm has no idea where the player is. It hears events,
//! estimates where each came from (worse when faint or far), and groups them
//! into [`Track`]s by estimated position. Each track keeps a decaying sum of
//! signal ("heat") and scores the regularity of its inter-arrival times from
//! their coefficient of variation. Interest in a track is heat weighted by
//! regularity: a metronome at a given loudness is far more interesting than
//! the same energy scattered at random, which is exactly why sandwalking
//! works — and why it is not invisibility, since a loud-enough irregular
//! source still gets heard.

use crate::rng::Rng;
use glam::DVec3;

/// Distance scale of the spreading law, metres.
pub const R0: f64 = 10.0;
/// Absorption per hertz per metre.
pub const K_ABSORB: f64 = 5.0e-5;
/// Events received below this signal-to-noise ratio are simply lost.
pub const DETECT_SNR: f64 = 0.7;
/// Heat decays with this time constant, seconds.
pub const HEAT_TAU: f64 = 10.0;
/// Inter-arrival intervals kept per track for rhythm scoring.
const RHYTHM_WINDOW: usize = 8;
const MAX_TRACKS: usize = 6;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SourceKind {
    Step,
    Landing,
    Thumper,
    Other,
}

#[derive(Clone, Copy, Debug)]
pub struct VibrationEvent {
    pub pos: DVec3,
    /// Source strength, noise-floor units at r0.
    pub energy: f64,
    /// Dominant frequency, Hz. Lower travels further.
    pub freq: f64,
    /// How well the source couples into the ground: sand 1, rock ~0.15.
    pub coupling: f64,
    pub time: f64,
    pub kind: SourceKind,
}

/// Canonical sources. Energies are per strike.
pub mod sources {
    pub const THUMPER_ENERGY: f64 = 8000.0;
    pub const THUMPER_FREQ: f64 = 10.0;
    /// Seconds between thumper blows; mechanical, so nearly exact.
    pub const THUMPER_PERIOD: f64 = 1.25;
    pub const RUN_ENERGY: f64 = 300.0;
    pub const RUN_FREQ: f64 = 35.0;
    pub const WALK_ENERGY: f64 = 90.0;
    pub const WALK_FREQ: f64 = 40.0;
    pub const CROUCH_ENERGY: f64 = 40.0;
    pub const SANDWALK_ENERGY: f64 = 10.0;
    pub const SANDWALK_FREQ: f64 = 45.0;
    pub const STEP_FREQ: f64 = 40.0;
    /// Landing energy per (m/s)^2 of impact speed.
    pub const LANDING_PER_V2: f64 = 25.0;
    pub const LANDING_FREQ: f64 = 25.0;
    pub const SAND_COUPLING: f64 = 1.0;
    pub const ROCK_COUPLING: f64 = 0.15;
}

/// Received strength of an event at distance `r`, in noise-floor units.
pub fn received(energy: f64, coupling: f64, freq: f64, r: f64) -> f64 {
    energy * coupling * R0 / (R0 + r.max(0.0)) * (-K_ABSORB * freq * r.max(0.0)).exp()
}

/// Regularity of a sequence of intervals: 1 for a metronome, falling to 0 as
/// the coefficient of variation reaches 0.35. Fewer than three intervals is
/// not yet a rhythm.
pub fn regularity(intervals: &[f64]) -> f64 {
    if intervals.len() < 3 {
        return 0.0;
    }
    let n = intervals.len() as f64;
    let mean = intervals.iter().sum::<f64>() / n;
    if mean <= 1e-6 {
        return 0.0;
    }
    let var = intervals.iter().map(|x| (x - mean) * (x - mean)).sum::<f64>() / n;
    let cv = var.sqrt() / mean;
    (1.0 - cv / 0.35).clamp(0.0, 1.0)
}

/// One candidate source, as a listener believes it to be.
#[derive(Clone, Debug)]
pub struct Track {
    pub id: u32,
    /// Where the listener thinks it is.
    pub est: DVec3,
    /// How sure: rough 1-sigma error of `est`, metres.
    pub sigma: f64,
    pub heat: f64,
    pub last_time: f64,
    pub last_snr: f64,
    pub strongest_kind: SourceKind,
    intervals: Vec<f64>,
    heat_time: f64,
}

impl Track {
    pub fn regularity(&self) -> f64 {
        regularity(&self.intervals)
    }

    /// Heat at time `t`, decayed since last update.
    pub fn heat_at(&self, t: f64) -> f64 {
        self.heat * (-(t - self.heat_time).max(0.0) / HEAT_TAU).exp()
    }

    /// How much this source is worth moving toward.
    pub fn interest(&self, t: f64) -> f64 {
        self.heat_at(t) * (0.3 + 0.7 * self.regularity())
    }

    pub fn intervals(&self) -> &[f64] {
        &self.intervals
    }
}

/// A worm's hearing.
#[derive(Clone, Debug)]
pub struct Listener {
    pub tracks: Vec<Track>,
    next_id: u32,
    rng: Rng,
    /// Multiplies the noise floor: the worm's own movement deafens it.
    pub self_noise: f64,
}

/// What happened when an event reached a listener.
#[derive(Clone, Copy, Debug)]
pub struct Heard {
    pub snr: f64,
    pub track: u32,
    pub est: DVec3,
}

impl Listener {
    pub fn new(seed: u64) -> Self {
        Self { tracks: Vec::new(), next_id: 1, rng: Rng::new(seed), self_noise: 1.0 }
    }

    /// Offer an event to a listener standing at `at`. Returns what was
    /// heard, or None if it was lost in the noise.
    pub fn hear(&mut self, at: DVec3, ev: &VibrationEvent) -> Option<Heard> {
        let d = ev.pos - at;
        let r = d.x.hypot(d.z);
        let snr = received(ev.energy, ev.coupling, ev.freq, r) / self.self_noise.max(0.1);
        // Noise makes marginal events come and go.
        let seen = snr * (1.0 + 0.25 * self.rng.gauss());
        if seen < DETECT_SNR {
            return None;
        }

        // Localise: bearing and range errors shrink with signal strength.
        let root = snr.sqrt();
        let bearing_err = self.rng.gauss() * (0.35 / root).clamp(0.02, 0.6);
        let range_err = self.rng.gauss() * (0.4 / root).clamp(0.03, 0.6);
        let bearing = d.z.atan2(d.x) + bearing_err;
        let range = (r * (1.0 + range_err)).max(0.0);
        let est = DVec3::new(at.x + range * bearing.cos(), ev.pos.y, at.z + range * bearing.sin());
        let sigma = r * ((0.35 / root).clamp(0.02, 0.6) + (0.4 / root).clamp(0.03, 0.6)) * 0.7 + 2.0;

        // Same source as an existing track? Judge by estimated position.
        let gate = |tr: &Track| (tr.sigma + sigma).max(40.0).min(0.35 * r + 60.0);
        let pick = self
            .tracks
            .iter()
            .enumerate()
            .map(|(i, tr)| (i, (tr.est - est).length() / gate(tr)))
            .filter(|(_, g)| *g < 1.0)
            .min_by(|a, b| a.1.partial_cmp(&b.1).unwrap())
            .map(|(i, _)| i);

        let t = ev.time;
        let idx = match pick {
            Some(i) => {
                let tr = &mut self.tracks[i];
                // Precision-weighted blend of the old belief and the new fix.
                let w_old = 1.0 / (tr.sigma * tr.sigma);
                let w_new = 1.0 / (sigma * sigma);
                tr.est = (tr.est * w_old + est * w_new) / (w_old + w_new);
                tr.sigma = (1.0 / (w_old + w_new)).sqrt().max(sigma * 0.35);
                let dt = t - tr.last_time;
                if dt > 0.05 && dt < 6.0 {
                    tr.intervals.push(dt);
                    if tr.intervals.len() > RHYTHM_WINDOW {
                        tr.intervals.remove(0);
                    }
                } else if dt >= 6.0 {
                    // A long silence ends a rhythm.
                    tr.intervals.clear();
                }
                tr.heat = tr.heat_at(t) + snr;
                tr.heat_time = t;
                tr.last_time = t;
                tr.last_snr = snr;
                if ev.kind == SourceKind::Thumper {
                    tr.strongest_kind = SourceKind::Thumper;
                }
                i
            }
            None => {
                if self.tracks.len() >= MAX_TRACKS {
                    // Forget the least interesting.
                    let (i, _) = self
                        .tracks
                        .iter()
                        .enumerate()
                        .min_by(|a, b| a.1.interest(t).partial_cmp(&b.1.interest(t)).unwrap())
                        .unwrap();
                    self.tracks.remove(i);
                }
                self.tracks.push(Track {
                    id: self.next_id,
                    est,
                    sigma,
                    heat: snr,
                    heat_time: t,
                    last_time: t,
                    last_snr: snr,
                    strongest_kind: ev.kind,
                    intervals: Vec::new(),
                });
                self.next_id += 1;
                self.tracks.len() - 1
            }
        };
        Some(Heard { snr, track: self.tracks[idx].id, est })
    }

    /// Drop tracks that have gone cold.
    pub fn forget(&mut self, t: f64) {
        self.tracks.retain(|tr| tr.heat_at(t) > 0.3 || t - tr.last_time < 3.0);
    }

    /// The most interesting track right now.
    pub fn best(&self, t: f64) -> Option<&Track> {
        self.tracks.iter().max_by(|a, b| a.interest(t).partial_cmp(&b.interest(t)).unwrap())
    }

    pub fn track(&self, id: u32) -> Option<&Track> {
        self.tracks.iter().find(|t| t.id == id)
    }
}

#[cfg(test)]
mod tests {
    use super::sources::*;
    use super::*;

    #[test]
    fn attenuation_falls_with_distance_and_frequency() {
        let mut last = f64::MAX;
        for r in [0.0, 10.0, 100.0, 1000.0, 5000.0] {
            let a = received(100.0, 1.0, 30.0, r);
            assert!(a < last);
            last = a;
        }
        // Deep thuds outrun footsteps of the same energy.
        assert!(received(100.0, 1.0, 10.0, 2000.0) > 3.0 * received(100.0, 1.0, 40.0, 2000.0));
        // Rock is a poor transmitter.
        assert!(received(100.0, ROCK_COUPLING, 30.0, 50.0) < 0.2 * received(100.0, SAND_COUPLING, 30.0, 50.0));
    }

    #[test]
    fn nominal_ranges() {
        let snr = |e, f, r| received(e, SAND_COUPLING, f, r);
        assert!(snr(THUMPER_ENERGY, THUMPER_FREQ, 3000.0) > 2.0, "thumper carries kilometres");
        assert!(snr(RUN_ENERGY, RUN_FREQ, 600.0) > 1.0, "a run is heard at 600 m");
        assert!(snr(WALK_ENERGY, WALK_FREQ, 600.0) < DETECT_SNR, "a walk is not");
        assert!(snr(SANDWALK_ENERGY, SANDWALK_FREQ, 150.0) < DETECT_SNR, "nor a sandwalk at 150 m");
        assert!(snr(SANDWALK_ENERGY, SANDWALK_FREQ, 20.0) > 1.0, "but a sandwalk right overhead is");
    }

    #[test]
    fn regularity_scores() {
        assert!(regularity(&[1.25; 6]) > 0.99);
        assert!(regularity(&[0.36, 0.37, 0.35, 0.36, 0.37]) > 0.85);
        let mut rng = Rng::new(3);
        let random: Vec<f64> = (0..8).map(|_| rng.range(0.3, 1.6)).collect();
        assert!(regularity(&random) < 0.45, "{}", regularity(&random));
        assert_eq!(regularity(&[1.0, 1.0]), 0.0, "two intervals are not a rhythm");
    }

    fn feed(listener: &mut Listener, at: DVec3, src: DVec3, times: &[f64], energy: f64, freq: f64) {
        for &t in times {
            let ev = VibrationEvent { pos: src, energy, freq, coupling: 1.0, time: t, kind: SourceKind::Step };
            listener.hear(at, &ev);
        }
    }

    #[test]
    fn localisation_converges_and_is_worse_far_away() {
        let src = DVec3::new(0.0, 0.0, 0.0);
        let times: Vec<f64> = (0..30).map(|i| i as f64 * THUMPER_PERIOD).collect();
        let mut near = Listener::new(1);
        feed(&mut near, DVec3::new(300.0, 0.0, 0.0), src, &times, THUMPER_ENERGY, THUMPER_FREQ);
        let mut far = Listener::new(1);
        feed(&mut far, DVec3::new(2500.0, 0.0, 0.0), src, &times, THUMPER_ENERGY, THUMPER_FREQ);
        let en = near.best(40.0).unwrap();
        let ef = far.best(40.0).unwrap();
        let (dn, df) = (en.est.length(), ef.est.length());
        assert!(dn < 25.0, "near estimate off by {dn:.0} m");
        assert!(df < 400.0, "far estimate off by {df:.0} m");
        assert!(en.sigma < ef.sigma);
        // One thumper, one track.
        assert_eq!(near.tracks.len(), 1);
    }
}
