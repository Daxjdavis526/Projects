//! A tiny deterministic random source (SplitMix64). Seeded explicitly
//! everywhere, so a test run or a replay goes the same way every time.

#[derive(Clone, Debug)]
pub struct Rng(u64);

impl Rng {
    pub fn new(seed: u64) -> Self {
        Self(seed ^ 0x9E37_79B9_7F4A_7C15)
    }

    pub fn next_u64(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }

    /// Uniform in [0, 1).
    pub fn f64(&mut self) -> f64 {
        (self.next_u64() >> 11) as f64 / (1u64 << 53) as f64
    }

    pub fn range(&mut self, lo: f64, hi: f64) -> f64 {
        lo + (hi - lo) * self.f64()
    }

    /// Standard normal, by Box-Muller.
    pub fn gauss(&mut self) -> f64 {
        let u = self.f64().max(1e-12);
        let v = self.f64();
        (-2.0 * u.ln()).sqrt() * (std::f64::consts::TAU * v).cos()
    }

    pub fn chance(&mut self, p: f64) -> bool {
        self.f64() < p
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deterministic_and_roughly_uniform() {
        let mut a = Rng::new(7);
        let mut b = Rng::new(7);
        let xs: Vec<f64> = (0..10_000).map(|_| a.f64()).collect();
        assert!(xs.iter().zip((0..10_000).map(|_| b.f64())).all(|(x, y)| *x == y));
        let mean = xs.iter().sum::<f64>() / xs.len() as f64;
        assert!((mean - 0.5).abs() < 0.02);
        let mut g = Rng::new(1);
        let gs: Vec<f64> = (0..20_000).map(|_| g.gauss()).collect();
        let m = gs.iter().sum::<f64>() / gs.len() as f64;
        let var = gs.iter().map(|x| (x - m) * (x - m)).sum::<f64>() / gs.len() as f64;
        assert!(m.abs() < 0.03 && (var - 1.0).abs() < 0.05, "mean {m} var {var}");
    }
}
