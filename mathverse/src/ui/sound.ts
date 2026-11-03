// Optional, very quiet interaction sounds (off by default; Settings or the
// command palette turns them on). Synthesized here — no audio files.
let ac: AudioContext | null = null;

/** A soft pitched click; pitch in [0, 1]. */
export function blip(pitch = 0.5, gain = 0.05) {
  try {
    ac ??= new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = 330 * Math.pow(2, pitch * 1.5);
    g.gain.setValueAtTime(0, ac.currentTime);
    g.gain.linearRampToValueAtTime(gain, ac.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12);
    o.connect(g).connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.13);
  } catch { /* audio unavailable */ }
}
