//! Sound, all of it synthesised: no audio files.
//!
//! In the browser this drives the Web Audio graph directly — noise buffers,
//! oscillators, filters and panners that run on the browser's audio thread,
//! so a heavy frame never makes the sound crackle. Rust decides what should
//! be heard each frame and nudges the graph's parameters; the graph does
//! the sample work.
//!
//! Continuous: wind (two noise bands with slow gusts), the worm's sub-bass
//! rumble (rises in level and pitch as a worm closes in — made for
//! headphones), and the hiss of sand moving over a worm, panned to where it
//! is. One-shots: footsteps (walk, run and sandwalk each sound different),
//! landings, thumper blows, the breach roar, the eruption, the crush.
//!
//! Off the web this is silent for now.

use bevy::prelude::*;

pub struct AudioPlugin;

#[cfg(not(target_arch = "wasm32"))]
impl Plugin for AudioPlugin {
    fn build(&self, _app: &mut App) {}
}

#[cfg(target_arch = "wasm32")]
impl Plugin for AudioPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Update, (web::init, web::update).chain().in_set(crate::world::Phase::View).after(crate::player::camera));
    }
}

#[cfg(target_arch = "wasm32")]
mod web {
    use bevy::prelude::*;
    use wasm_bindgen::{JsCast, JsValue};
    use web_sys::{
        AudioBuffer, AudioBufferSourceNode, AudioContext, AudioNode, BiquadFilterNode, BiquadFilterType, GainNode, OscillatorNode,
        OscillatorType, StereoPannerNode,
    };
    use wormsign_core::brain::State;
    use wormsign_core::glam::DVec3;
    use wormsign_core::vibration::SourceKind;

    use crate::death::{Fate, Stage};
    use crate::player::PlayerBody;
    use crate::quake::Quakes;
    use crate::worms::{Danger, WormBody};
    use crate::world::Origin;

    pub struct Engine {
        ctx: AudioContext,
        out: GainNode,
        noise: AudioBuffer,
        wind: (BiquadFilterNode, GainNode),
        wind_hi: GainNode,
        rumble: (OscillatorNode, OscillatorNode, BiquadFilterNode, GainNode),
        hiss: (BiquadFilterNode, StereoPannerNode, GainNode),
        gust: f64,
        states: Vec<State>,
        stage: Stage,
        hooks: [u8; 2],
    }

    /// Picks up the AudioContext the page makes on the first click or key
    /// press (browsers only allow sound after a gesture), and builds the
    /// graph once.
    pub fn init(world: &mut World) {
        if world.get_non_send::<Engine>().is_some() {
            return;
        }
        let Ok(v) = js_sys::Reflect::get(&js_sys::global(), &JsValue::from_str("wormsignAudio")) else { return };
        let Ok(ctx) = v.dyn_into::<AudioContext>() else { return };
        if let Some(e) = Engine::new(ctx) {
            world.insert_non_send(e);
        }
    }

    fn noise_buffer(ctx: &AudioContext) -> Option<AudioBuffer> {
        let rate = ctx.sample_rate();
        let n = (rate * 3.0) as u32;
        let buf = ctx.create_buffer(1, n, rate).ok()?;
        // White noise from a small LCG; a fixed seed so it is the same wind
        // every time.
        let mut s: u32 = 0x1234_5678;
        let data: Vec<f32> = (0..n)
            .map(|_| {
                s = s.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
                (s >> 8) as f32 / (1u32 << 24) as f32 * 2.0 - 1.0
            })
            .collect();
        buf.copy_to_channel(&data, 0).ok()?;
        Some(buf)
    }

    fn filter(ctx: &AudioContext, kind: BiquadFilterType, f: f32, q: f32) -> Option<BiquadFilterNode> {
        let n = ctx.create_biquad_filter().ok()?;
        n.set_type(kind);
        n.frequency().set_value(f);
        n.q().set_value(q);
        Some(n)
    }

    fn gain(ctx: &AudioContext, g: f32) -> Option<GainNode> {
        let n = ctx.create_gain().ok()?;
        n.gain().set_value(g);
        Some(n)
    }

    fn looped_noise(ctx: &AudioContext, buf: &AudioBuffer, rate: f32) -> Option<AudioBufferSourceNode> {
        let s = ctx.create_buffer_source().ok()?;
        s.set_buffer(Some(buf));
        s.set_loop(true);
        s.playback_rate().set_value(rate);
        s.start().ok()?;
        Some(s)
    }

    fn chain(nodes: &[&AudioNode]) {
        for w in nodes.windows(2) {
            let _ = w[0].connect_with_audio_node(w[1]);
        }
    }

    impl Engine {
        fn new(ctx: AudioContext) -> Option<Self> {
            let noise = noise_buffer(&ctx)?;
            let comp = ctx.create_dynamics_compressor().ok()?;
            let out = gain(&ctx, 0.8)?;
            chain(&[&out, &comp, &ctx.destination()]);

            // Wind: a low band that gusts, and a thin high hiss.
            let n1 = looped_noise(&ctx, &noise, 1.0)?;
            let wf = filter(&ctx, BiquadFilterType::Bandpass, 520.0, 0.6)?;
            let wg = gain(&ctx, 0.0)?;
            chain(&[&n1, &wf, &wg, &out]);
            let n2 = looped_noise(&ctx, &noise, 0.83)?;
            let hf = filter(&ctx, BiquadFilterType::Highpass, 4200.0, 0.5)?;
            let hg = gain(&ctx, 0.0)?;
            chain(&[&n2, &hf, &hg, &out]);

            // Rumble: two low sines and filtered noise.
            let o1 = ctx.create_oscillator().ok()?;
            o1.frequency().set_value(31.0);
            let o2 = ctx.create_oscillator().ok()?;
            o2.frequency().set_value(46.0);
            let n3 = looped_noise(&ctx, &noise, 0.61)?;
            let rf = filter(&ctx, BiquadFilterType::Lowpass, 95.0, 0.9)?;
            let rg = gain(&ctx, 0.0)?;
            let _ = o1.connect_with_audio_node(&rf);
            let _ = o2.connect_with_audio_node(&rf);
            chain(&[&n3, &rf, &rg, &out]);
            o1.start().ok()?;
            o2.start().ok()?;

            // Sand hiss over a moving worm, panned toward it.
            let n4 = looped_noise(&ctx, &noise, 0.72)?;
            let sf = filter(&ctx, BiquadFilterType::Bandpass, 380.0, 0.5)?;
            let sp = ctx.create_stereo_panner().ok()?;
            let sg = gain(&ctx, 0.0)?;
            chain(&[&n4, &sf, &sp, &sg, &out]);

            Some(Self {
                ctx,
                out,
                noise,
                wind: (wf, wg),
                wind_hi: hg,
                rumble: (o1, o2, rf, rg),
                hiss: (sf, sp, sg),
                gust: 0.0,
                states: Vec::new(),
                stage: Stage::Alive,
                hooks: [0; 2],
            })
        }

        fn now(&self) -> f64 {
            self.ctx.current_time()
        }

        /// Ease a parameter toward a value.
        fn ease(&self, p: &web_sys::AudioParam, v: f32, tc: f64) {
            let _ = p.set_target_at_time(v, self.now(), tc);
        }

        fn panner(&self, pan: f32) -> Option<StereoPannerNode> {
            let p = self.ctx.create_stereo_panner().ok()?;
            p.pan().set_value(pan.clamp(-1.0, 1.0));
            let _ = p.connect_with_audio_node(&self.out);
            Some(p)
        }

        /// A burst of filtered noise with a fast attack and a decay.
        fn burst(&self, dur: f64, kind: BiquadFilterType, f: f32, q: f32, level: f32, pan: f32, rate: f32) {
            let Some(p) = self.panner(pan) else { return };
            let Ok(src) = self.ctx.create_buffer_source() else { return };
            src.set_buffer(Some(&self.noise));
            src.playback_rate().set_value(rate);
            let Some(fl) = filter(&self.ctx, kind, f, q) else { return };
            let Some(g) = gain(&self.ctx, 0.0) else { return };
            chain(&[&src, &fl, &g, &p]);
            let t = self.now();
            let off = (js_sys::Math::random() * 2.0).max(0.0);
            let gp = g.gain();
            let _ = gp.linear_ramp_to_value_at_time(level, t + 0.006);
            let _ = gp.exponential_ramp_to_value_at_time(0.0005, t + dur);
            let _ = src.start_with_when_and_grain_offset(t, off);
            let _ = src.unchecked_ref::<web_sys::AudioScheduledSourceNode>().stop_with_when(t + dur + 0.05);
        }

        /// A pitched thump that drops in pitch as it dies.
        fn thud(&self, f0: f32, f1: f32, dur: f64, level: f32, pan: f32, wave: OscillatorType) {
            let Some(p) = self.panner(pan) else { return };
            let Ok(o) = self.ctx.create_oscillator() else { return };
            o.set_type(wave);
            let Some(g) = gain(&self.ctx, 0.0) else { return };
            chain(&[&o, &g, &p]);
            let t = self.now();
            let fp = o.frequency();
            fp.set_value(f0);
            let _ = fp.exponential_ramp_to_value_at_time(f1.max(1.0), t + dur);
            let gp = g.gain();
            let _ = gp.linear_ramp_to_value_at_time(level, t + 0.005);
            let _ = gp.exponential_ramp_to_value_at_time(0.0005, t + dur);
            let _ = o.start_with_when(t);
            let _ = o.stop_with_when(t + dur + 0.05);
        }

        /// The worm's roar as it breaks the surface: a low saw through a
        /// filter that opens and closes, under a long wash of sand.
        fn roar(&self, level: f32, pan: f32) {
            let Some(p) = self.panner(pan) else { return };
            let t = self.now();
            for (f, detune) in [(48.0f32, 0.0f32), (61.0, 7.0), (36.0, -5.0)] {
                let Ok(o) = self.ctx.create_oscillator() else { return };
                o.set_type(OscillatorType::Sawtooth);
                o.frequency().set_value(f);
                o.detune().set_value(detune);
                let Some(fl) = filter(&self.ctx, BiquadFilterType::Lowpass, 150.0, 4.0) else { return };
                let Some(g) = gain(&self.ctx, 0.0) else { return };
                chain(&[&o, &fl, &g, &p]);
                let ff = fl.frequency();
                let _ = ff.linear_ramp_to_value_at_time(900.0, t + 0.9);
                let _ = ff.exponential_ramp_to_value_at_time(120.0, t + 3.2);
                let gp = g.gain();
                let _ = gp.linear_ramp_to_value_at_time(level * 0.28, t + 0.4);
                let _ = gp.exponential_ramp_to_value_at_time(0.0005, t + 3.5);
                let _ = o.start_with_when(t);
                let _ = o.stop_with_when(t + 3.6);
            }
            self.burst(3.0, BiquadFilterType::Lowpass, 700.0, 0.5, level * 0.8, pan, 0.8);
            self.thud(55.0, 24.0, 2.0, level, pan, OscillatorType::Sine);
        }
    }

    #[allow(clippy::too_many_arguments)]
    pub fn update(
        engine: Option<NonSendMut<Engine>>,
        time: Res<Time<Real>>,
        origin: Res<Origin>,
        danger: Res<Danger>,
        quakes: Res<Quakes>,
        fate: Res<Fate>,
        riding: Res<crate::rider::Riding>,
        player: Query<&PlayerBody>,
        cam: Query<&Transform, With<Camera3d>>,
        worms: Query<&WormBody>,
    ) {
        let Some(mut e) = engine else { return };
        let (Ok(pb), Ok(ct)) = (player.single(), cam.single()) else { return };
        let dt = time.delta_secs_f64();
        let ear = origin.0 + ct.translation.as_dvec3();
        let right = (ct.rotation * Vec3::X).as_dvec3();
        let pan_of = |p: DVec3| {
            let d = p - ear;
            let l = d.length().max(1e-3);
            (d.dot(right) / l) as f32 * 0.85
        };
        let near = |p: DVec3, r: f64| (r / (r + (p - ear).length())) as f32;

        // --- continuous ---------------------------------------------------
        e.gust += dt * 0.13;
        let g = e.gust;
        let gust = 0.5 + 0.3 * (g * 1.3).sin() + 0.2 * (g * 3.1 + 1.0).sin();
        let height = ((pb.0.pos.y - 0.0) / 120.0).clamp(0.0, 0.6);
        e.ease(&e.wind.1.gain(), (0.05 + 0.10 * gust + height * 0.08) as f32, 0.6);
        e.ease(&e.wind.0.frequency(), (380.0 + 420.0 * gust) as f32, 0.8);
        e.ease(&e.wind_hi.gain(), (0.008 + 0.018 * gust) as f32, 0.8);

        let lvl = danger.level;
        // Felt before it is heard: most of the rise is below 60 Hz.
        e.ease(&e.rumble.3.gain(), (lvl.powf(1.1) * 1.1).min(1.2), 0.25);
        e.ease(&e.rumble.0.frequency(), 26.0 + 22.0 * lvl, 0.5);
        e.ease(&e.rumble.1.frequency(), 41.0 + 30.0 * lvl, 0.5);
        e.ease(&e.rumble.2.frequency(), 80.0 + 140.0 * lvl, 0.4);

        let hiss = (lvl * (0.3 + 0.7 * danger.surfaced) * (danger.speed as f32 / 30.0).min(1.0)).min(1.0);
        e.ease(&e.hiss.2.gain(), hiss * 0.5, 0.3);
        e.ease(&e.hiss.0.frequency(), 250.0 + 500.0 * hiss, 0.3);
        let pan = pan_of(ear + danger.bearing * 50.0);
        e.ease(&e.hiss.1.pan(), pan, 0.2);

        // --- one-shots ------------------------------------------------------
        for ev in &quakes.events {
            let own = (ev.pos - pb.0.pos).length() < 3.0;
            match ev.kind {
                SourceKind::Step if own => {
                    let r = || js_sys::Math::random() as f32;
                    if ev.energy < 20.0 {
                        // Sandwalk: a soft drag of sand, no heel strike.
                        e.burst(0.16, BiquadFilterType::Lowpass, 650.0 + 200.0 * r(), 0.5, 0.10, 0.0, 0.9);
                    } else if ev.energy < 150.0 {
                        e.burst(0.08, BiquadFilterType::Bandpass, 850.0 + 250.0 * r(), 1.1, 0.22, 0.0, 1.0);
                        e.thud(95.0, 55.0, 0.07, 0.10, 0.0, OscillatorType::Sine);
                    } else {
                        e.burst(0.07, BiquadFilterType::Bandpass, 1050.0 + 300.0 * r(), 1.0, 0.36, 0.0, 1.1);
                        e.thud(110.0, 50.0, 0.09, 0.22, 0.0, OscillatorType::Sine);
                    }
                }
                SourceKind::Landing if own => {
                    let k = (ev.energy / 600.0).min(1.0) as f32;
                    e.burst(0.18, BiquadFilterType::Lowpass, 1300.0, 0.6, 0.25 + 0.35 * k, 0.0, 1.0);
                    e.thud(120.0, 45.0, 0.22, 0.25 + 0.4 * k, 0.0, OscillatorType::Sine);
                }
                SourceKind::Thumper => {
                    let a = near(ev.pos, 25.0);
                    if a > 0.01 {
                        let p = pan_of(ev.pos);
                        e.thud(82.0, 40.0, 0.38, 0.9 * a, p, OscillatorType::Sine);
                        e.burst(0.035, BiquadFilterType::Highpass, 2600.0, 0.7, 0.35 * a, p, 1.0);
                        // The stake rings.
                        e.thud(742.0, 736.0, 0.3, 0.06 * a, p, OscillatorType::Triangle);
                    }
                }
                _ => {}
            }
        }

        // A worm breaking the surface to attack.
        let n = worms.iter().count();
        if e.states.len() != n {
            e.states = worms.iter().map(|w| w.brain.state).collect();
        }
        for (i, wb) in worms.iter().enumerate() {
            let s = wb.brain.state;
            if s == State::Attack && e.states[i] != State::Attack {
                let h = wb.worm.head();
                let a = near(h, 180.0);
                if a > 0.03 {
                    e.roar(a.min(1.0), pan_of(h));
                }
            }
            e.states[i] = s;
        }

        // Hooks: a whoosh as one is thrown, a thunk as it bites.
        for i in 0..2 {
            use wormsign_core::hook::HookState;
            let now = match riding.hooks[i].state {
                HookState::Stowed => 0,
                HookState::Flying { .. } => 1,
                HookState::Anchored { .. } => 2,
            };
            if now != e.hooks[i] {
                let pan = if i == 0 { -0.3 } else { 0.3 };
                match now {
                    1 => e.burst(0.25, BiquadFilterType::Bandpass, 1400.0, 2.0, 0.18, pan, 1.4),
                    2 => {
                        e.thud(190.0, 85.0, 0.14, 0.45, pan, OscillatorType::Triangle);
                        e.burst(0.06, BiquadFilterType::Highpass, 1800.0, 0.8, 0.25, pan, 1.0);
                    }
                    _ => {}
                }
                e.hooks[i] = now;
            }
        }

        // Being taken.
        if fate.stage != e.stage {
            match fate.stage {
                Stage::Seized => {
                    e.burst(1.8, BiquadFilterType::Lowpass, 900.0, 0.5, 1.0, 0.0, 0.7);
                    e.thud(62.0, 26.0, 1.4, 1.0, 0.0, OscillatorType::Sine);
                }
                Stage::Crushed => {
                    e.burst(0.28, BiquadFilterType::Bandpass, 1900.0, 2.0, 0.9, 0.0, 1.3);
                    e.burst(0.5, BiquadFilterType::Lowpass, 320.0, 0.7, 1.0, 0.0, 0.8);
                    e.thud(95.0, 38.0, 0.35, 0.9, 0.0, OscillatorType::Sine);
                }
                _ => {}
            }
            e.stage = fate.stage;
        }
    }
}
