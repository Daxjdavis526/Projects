// The synthesiser. Plays src/music.js through WebAudio — live, scheduled a
// couple of seconds ahead against the audio clock, or all at once into an
// OfflineAudioContext for the video render. Pads are detuned saws through a
// low-pass; the bell is a few inharmonic sines; ticks are short sine blips;
// the chirp is the GW150914-like waveform from src/physics.js, gently
// saturated so its 35–250 Hz sweep carries on small speakers.

import { SCORE, endOf, DURATION } from './music.js';
import { chirpWave, MSUN_SECONDS } from './physics.js';

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

function impulse(ctx, seconds = 2.8, decay = 3) {
  const n = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let seed = 1234567 + c * 7654321;
    for (let i = 0; i < n; i++) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      d[i] = ((seed / 4294967296) * 2 - 1) * (1 - i / n) ** decay;
    }
  }
  return buf;
}

function chirpBuffer(ctx) {
  const sr = ctx.sampleRate, T0 = -0.25, T1 = 0.03, n = Math.floor((T1 - T0) * sr);
  const buf = ctx.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    const t = T0 + i / sr;
    const h = chirpWave(t, { Mc: 30 * MSUN_SECONDS }).h;
    const fade = Math.min(1, i / (0.01 * sr));
    d[i] = Math.tanh(2.2 * h * fade) * 0.9;
  }
  return buf;
}

// The shared parts of the graph: a dry bus, a reverb, the chirp's buffer.
function graph(ctx, out) {
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx);
  const wet = ctx.createGain(); wet.gain.value = 0.35;
  reverb.connect(wet).connect(out);
  const dry = ctx.createGain(); dry.gain.value = 1;
  dry.connect(out);
  return { ctx, dry, reverb, chirp: chirpBuffer(ctx) };
}

// Schedule the events that start in film time [from, until) — and, for the
// first window after a seek (from === T), those already sounding at T.
// `at` is the context time that film time T maps to.
function schedule(gr, T, at, from, until) {
  const { ctx, dry, reverb, chirp } = gr;
  const nodes = [];
  const when = (ft) => Math.max(0, at + (ft - T));   // never before the context began

  for (const e of SCORE) {
    const start = e.t ?? e.t0;
    if (start >= until || endOf(e) <= T) continue;
    if (start < from && !(from === T && endOf(e) > T)) continue;
    if (e.type === 'pad') {
      const t0 = when(e.t0), t1 = when(e.t1);
      const g = ctx.createGain();
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.4;
      lp.connect(g); g.connect(dry); g.connect(reverb);
      const atk = 3.5, rel = 3.5;
      const now = Math.max(t0, at);
      // where in its envelope the pad is at `now`
      const env = (tt) => Math.max(0, Math.min(1, (tt - t0) / atk, (t1 - tt) / rel)) * e.gain;
      g.gain.setValueAtTime(env(now), now);
      if (now < t0 + atk) g.gain.linearRampToValueAtTime(e.gain, t0 + atk);
      g.gain.setValueAtTime(e.gain, Math.max(now, t1 - rel));
      g.gain.linearRampToValueAtTime(0, t1);
      for (const m of e.notes) {
        for (const det of [-6, 6]) {
          const o = ctx.createOscillator();
          o.type = m < 40 ? 'triangle' : 'sawtooth';
          o.frequency.value = mtof(m); o.detune.value = det;
          const v = ctx.createGain(); v.gain.value = m < 40 ? 0.5 : 0.22;
          o.connect(v).connect(lp);
          o.start(now); o.stop(t1 + 0.05);
          nodes.push(o);
        }
      }
    } else if (e.type === 'bell') {
      const t0 = when(e.t);
      if (t0 < at - 0.01) continue;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(e.gain, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.8);
      g.connect(dry); g.connect(reverb);
      for (const [ratio, amp] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(e.note) * ratio;
        const v = ctx.createGain(); v.gain.value = amp;
        o.connect(v).connect(g); o.start(t0); o.stop(t0 + 4); nodes.push(o);
      }
    } else if (e.type === 'tick') {
      const t0 = when(e.t);
      if (t0 < at - 0.01) continue;
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = e.freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(e.gain, t0 + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
      const p = ctx.createStereoPanner(); p.pan.value = e.pan;
      o.connect(g).connect(p); p.connect(dry);
      o.start(t0); o.stop(t0 + 0.08); nodes.push(o);
    } else if (e.type === 'chirp') {
      const t0 = when(e.t);
      if (t0 < at - 0.01) continue;
      const src = ctx.createBufferSource(); src.buffer = chirp;
      const g = ctx.createGain(); g.gain.value = e.gain;
      src.connect(g); g.connect(dry); g.connect(reverb);
      src.start(t0); nodes.push(src);
    }
  }
  return nodes;
}

function masterChain(ctx) {
  const master = ctx.createGain(); master.gain.value = 0.9;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
  master.connect(comp).connect(ctx.destination);
  return master;
}

export class Score {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'playback' });
    this.out = masterChain(this.ctx);
    this.muted = false;
    this.running = false;
    this.nodes = [];
  }
  start(T) {
    this.stop();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const at = this.ctx.currentTime + 0.12;
    this.anchor = { at, T };
    this.bus = this.ctx.createGain();
    this.bus.gain.value = this.muted ? 0 : 1;
    this.bus.connect(this.out);
    const gr = graph(this.ctx, this.bus);
    // schedule twenty seconds ahead, topping up every five
    let next = T + 20;
    const add = (list) => { for (const n of list) n.onended = () => { n.done = true; }; this.nodes.push(...list); };
    add(schedule(gr, T, at, T, next));
    this.timer = setInterval(() => {
      if (this.filmTime() > next - 12) {
        this.nodes = this.nodes.filter((n) => !n.done);
        add(schedule(gr, T, at, next, next + 10));
        next += 10;
      }
    }, 1000);
    this.running = true;
  }
  stop() {
    clearInterval(this.timer);
    for (const n of this.nodes) { try { n.stop(); } catch { /* not started */ } }
    this.nodes = [];
    if (this.bus) { this.bus.disconnect(); this.bus = null; }
    this.running = false;
  }
  filmTime() { return this.anchor.T + Math.max(0, this.ctx.currentTime - this.anchor.at); }
  setMuted(m) { this.muted = m; if (this.bus) this.bus.gain.value = m ? 0 : 1; }
}

// Render film time [from, to) offline; returns the AudioBuffer.
export async function renderOffline(from = 0, to = DURATION, sampleRate = 48000) {
  const ctx = new OfflineAudioContext(2, Math.ceil((to - from) * sampleRate), sampleRate);
  const out = masterChain(ctx);
  schedule(graph(ctx, out), from, 0, from, to);
  return ctx.startRendering();
}
