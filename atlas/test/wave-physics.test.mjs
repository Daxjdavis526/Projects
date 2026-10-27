// The DOM-free model behind the wave simulations (sims/wave-string.js,
// sims/wave-sound.js, sims/wave-doppler.js): string speed and travelling
// waves, superposition, standing waves and the driven string, sound speed and
// decibels, air columns, beats, the Doppler effect and the Mach cone —
// checked against closed forms and against the wave equation itself.
//   node atlas/test/wave-physics.test.mjs

import * as W from '../src/viz/model/wave-physics.js';
import { validate as validateString } from '../src/viz/sims/wave-string.js';
import { validate as validateSound, harmonicOf } from '../src/viz/sims/wave-sound.js';
import { validate as validateDoppler } from '../src/viz/sims/wave-doppler.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ─── strings ───────────────────────────────────────────────────────────────
check('string speed √(F/μ): 200 N on 0.2 kg/m is √1000 m/s', near(W.stringSpeed(200, 0.2), Math.sqrt(1000)));
check('four times the tension doubles the speed', near(W.stringSpeed(400, 0.2) / W.stringSpeed(100, 0.2), 2));
check('tensionFor inverts stringSpeed', near(W.stringSpeed(W.tensionFor(31.6, 0.05), 0.05), 31.6));
{
  // the travelling wave satisfies ∂²y/∂t² = v² ∂²y/∂x², numerically, at several points
  const w = { A: 0.02, lambda: 1.5, f: 4, dir: 1, phi: 0.3 }, v = w.lambda * w.f, h = 1e-4;
  let worst = 0;
  for (const [x, t] of [[0.1, 0.05], [0.77, 0.4], [1.3, 1.1]]) {
    const ytt = (W.travelling(x, t + h, w) - 2 * W.travelling(x, t, w) + W.travelling(x, t - h, w)) / (h * h);
    const yxx = (W.travelling(x + h, t, w) - 2 * W.travelling(x, t, w) + W.travelling(x - h, t, w)) / (h * h);
    worst = Math.max(worst, Math.abs(ytt - v * v * yxx) / (v * v * Math.max(1e-9, Math.abs(yxx)) + 1));
    check(`travellingAcceleration = −ω²y at (${x}, ${t})`, near(W.travellingAcceleration(x, t, w), ytt, 1e-3));
    const yt = (W.travelling(x, t + h, w) - W.travelling(x, t - h, w)) / (2 * h);
    check(`travellingVelocity = ∂y/∂t at (${x}, ${t})`, near(W.travellingVelocity(x, t, w), yt, 1e-5));
  }
  check('a sinusoidal travelling wave satisfies the wave equation', worst < 1e-3, worst.toExponential(2));
  // dir = +1 moves the pattern toward +x: y(x + vΔt, t + Δt) = y(x, t)
  check('dir = +1 travels toward +x at v = fλ', near(W.travelling(0.3 + v * 0.07, 0.17, w), W.travelling(0.3, 0.1, w)));
  check('dir = −1 travels toward −x', near(W.travelling(0.3 - v * 0.07, 0.17, { ...w, dir: -1 }), W.travelling(0.3, 0.1, { ...w, dir: -1 })));
}
{
  // a pulse keeps its shape and moves at v, whatever its height
  const v = 5, p = { h: 0.3, dur: 0.4, v };
  check('a pulse moves at v without changing shape', near(W.pulseRight(2 + v * 1.5, 1.9, p), W.pulseRight(2, 0.4, p)));
  check('a taller pulse arrives at the same time', near(W.pulseRight(4, 0.9, { ...p, h: 0.9 }) / W.pulseRight(4, 0.9, p), 3));
  check('its width on the string is v times the flick', W.pulseRight(0.01, 0.4 + 0.01 / v - 1e-6, p) > 0 && W.pulseRight(v * 0.4 + 0.01, 0.4, p) === 0);
  check('the pulse from the right end travels left', near(W.pulseLeft(10 - v * 0.3, 0.5, { ...p, L: 10 }), W.pulseRight(v * 0.3, 0.5, p)));
  check('a wave train is zero ahead of its front', W.wavetrain(6, 1, { A: 1, f: 2, v: 5 }) === 0 && W.wavetrain(4, 1, { A: 1, f: 2, v: 5 }) !== 0);
}

// ─── superposition ─────────────────────────────────────────────────────────
{
  // resultant amplitude against the numerical maximum of the sum
  for (const [A1, A2, phi] of [[1, 1, 0], [1, 1, Math.PI], [3, 5, 1.1], [2, 0.5, 2.6]]) {
    let mx = 0;
    for (let i = 0; i < 4000; i++) { const th = (i / 4000) * W.TAU; mx = Math.max(mx, Math.abs(A1 * Math.sin(th) + A2 * Math.sin(th + phi))); }
    check(`resultant amplitude of ${A1} and ${A2} at φ = ${phi.toFixed(2)}`, near(W.resultantAmplitude(A1, A2, phi), mx, 1e-5), `${W.resultantAmplitude(A1, A2, phi)} vs ${mx}`);
  }
  check('equal waves in phase double, out of phase cancel', near(W.resultantAmplitude(4, 4, 0), 8) && W.resultantAmplitude(4, 4, Math.PI) < 1e-6);
  check('half a wavelength of path difference is π of phase', near(W.phaseFromPath(0.25, 0.5), Math.PI));
  // two equal waves in opposite directions make a standing wave 2A sin kx cos ωt
  const w = { A: 0.7, lambda: 2, f: 3 };
  const x = 0.37, t = 0.21, k = W.TAU / w.lambda, om = W.TAU * w.f;
  check('opposite travelling waves sum to 2A sin kx cos ωt', near(W.travelling(x, t, w) + W.travelling(x, t, { ...w, dir: -1 }), 2 * w.A * Math.sin(k * x) * Math.cos(om * t)));
}

// ─── standing waves and the driven string ──────────────────────────────────
check('f_n = nv/2L: 200 m/s on 0.8 m gives 125, 250, 375 Hz', near(W.harmonic(1, 200, 0.8), 125) && near(W.harmonic(3, 200, 0.8), 375));
check('nodes of mode 3 on 0.8 m at 0, 0.267, 0.533, 0.8 m', W.nodes(3, 0.8).every((x, j) => near(x, (0.8 * j) / 3)));
{
  const p = { v: 20, L: 2, gamma: 0, a: 0.01 };
  // without damping: Y = a sin k(L − x)/sin kL; the ends are a and 0
  const Y0 = W.drivenString(0, { ...p, f: 3.3 }), YL = W.drivenString(2, { ...p, f: 3.3 });
  check('driven string: the driven end moves with the driver', near(Y0.re, 0.01) && Math.abs(Y0.im) < 1e-12);
  check('driven string: the far end is fixed', Math.hypot(YL.re, YL.im) < 1e-12);
  const k = (W.TAU * 3.3) / 20;
  check('driven string: undamped shape a sin k(L − x)/sin kL', near(W.drivenString(0.6, { ...p, f: 3.3 }).re, (0.01 * Math.sin(k * 1.4)) / Math.sin(k * 2)));
  // with damping the response peaks at the normal modes, all with gain ≈ 2v/(γL)
  const G = 25, gamma = W.dampingForGain(G, 20, 2);
  const f1 = W.harmonic(1, 20, 2);
  for (const n of [1, 2, 3]) {
    const g = W.drivenGain({ v: 20, L: 2, gamma, f: n * f1 });
    check(`driven string: resonance ${n} has gain ≈ ${G}`, near(g, G, 0.02), g.toFixed(2));
    const off = W.drivenGain({ v: 20, L: 2, gamma, f: (n + 0.5) * f1 });
    check(`driven string: between resonances the gain is small (n = ${n} + ½)`, off < 3, off.toFixed(2));
  }
  // the damped shape satisfies μ y_tt + b y_t = F y_xx, i.e. Y'' = −(ω/v)²(1 − iγ/ω) Y
  const q = { v: 20, L: 2, gamma, f: 7.1, a: 1 }, h = 1e-4, xx = 0.83;
  const Ym = W.drivenString(xx - h, q), Y = W.drivenString(xx, q), Yp = W.drivenString(xx + h, q);
  const d2 = { re: (Yp.re - 2 * Y.re + Ym.re) / (h * h), im: (Yp.im - 2 * Y.im + Ym.im) / (h * h) };
  const w = W.TAU * q.f, s = (w / q.v) ** 2;
  const rhs = { re: -s * (Y.re + (gamma / w) * Y.im), im: -s * (Y.im - (gamma / w) * Y.re) };   // −s(1 − iγ/ω)Y
  check('driven string: the damped shape satisfies the damped wave equation', near(d2.re, rhs.re, 1e-4) && near(d2.im, rhs.im, 1e-4), `${d2.re} vs ${rhs.re}`);
}

// ─── sound ─────────────────────────────────────────────────────────────────
check('sound in air at 20 °C is 343 m/s', near(W.soundSpeedAir(20), 343.2, 2e-3), W.soundSpeedAir(20).toFixed(2));
check('sound in air at 0 °C is 331 m/s', near(W.soundSpeedAir(0), 331.3, 2e-3), W.soundSpeedAir(0).toFixed(2));
check('sound in helium at 20 °C is about 1007 m/s', near(W.soundSpeed(5 / 3, 293.15, W.GASES.helium.M), 1007, 3e-3));
check('air at 20 °C, 1 atm has density 1.20 kg/m³', near(W.gasDensity(101325, 293.15, W.GASES.air.M), 1.204, 2e-3));
{
  // a 1 kHz tone at 1 µW/m²: Δp ≈ 0.029 Pa, s ≈ 11 nm
  const rho = 1.204, v = W.soundSpeedAir(20);
  const dp = W.pressureFromIntensity(1e-6, rho, v);
  check('pressure amplitude at 1 µW/m² is 0.029 Pa', near(dp, 0.0287, 0.01), dp.toFixed(4));
  const s = dp / (rho * v * W.TAU * 1000);
  check('pressure and displacement amplitudes are consistent', near(W.pressureAmplitude(rho, v, 1000, s), dp));
  check('intensity from pressure inverts pressure from intensity', near(W.intensityFromPressure(dp, rho, v), 1e-6));
}
check('inverse square: twice as far, a quarter of the intensity', near(W.intensityAt(100, 20) / W.intensityAt(100, 10), 0.25));
check('10⁻¹² W/m² is 0 dB, 1 W/m² is 120 dB', near(W.decibels(1e-12), 0) && near(W.decibels(1), 120));
check('dB and intensity invert each other', near(W.intensityFromDecibels(W.decibels(3.7e-5)), 3.7e-5));
check('two equal sources add 3.01 dB', near(W.addLevels(90, 90), 90 + 10 * Math.log10(2)));
check('90 dB and 95 dB together are 96.2 dB', near(W.addLevels(90, 95), 96.19, 1e-3));
check('a 2×10⁸ W source has a sound power level of 203 dB re 1 pW', near(W.powerLevel(2e8), 203.0, 1e-3));

// ─── air columns ───────────────────────────────────────────────────────────
{
  const v = 343, L = 0.5;
  const oo = W.pipeMode('open-open', 1, v, L), co = W.pipeMode('closed-open', 1, v, L), cc = W.pipeMode('closed-closed', 2, v, L);
  check('open–open fundamental v/2L', near(oo.f, 343));
  check('closed–open fundamental v/4L', near(co.f, 171.5));
  check('closed–open allows only odd modes', W.allowedModes('closed-open', 3).join() === '1,3,5' && W.allowedModes('open-open', 3).join() === '1,2,3');
  check('open end: displacement antinode, pressure node', near(Math.abs(oo.s(0)), 1) && Math.abs(oo.p(0)) < 1e-12 && near(Math.abs(oo.s(L)), 1) && Math.abs(oo.p(L)) < 1e-12);
  check('closed end: displacement node, pressure antinode', Math.abs(co.s(0)) < 1e-12 && near(co.p(0), 1));
  check('closed–open: open end is a displacement antinode', near(Math.abs(co.s(L)), 1) && Math.abs(co.p(L)) < 1e-12);
  check('closed–closed: displacement nodes at both ends', Math.abs(cc.s(0)) < 1e-12 && Math.abs(cc.s(L)) < 1e-9 && near(cc.f, 686));
  for (const ends of ['open-open', 'closed-open', 'closed-closed']) {
    const m = W.pipeMode(ends, ends === 'closed-open' ? 3 : 2, v, L);
    check(`${ends}: f λ = v`, near(m.f * m.lambda, v));
  }
}

// ─── beats ─────────────────────────────────────────────────────────────────
check('beat frequency |f₁ − f₂|', near(W.beatFrequency(440, 444), 4) && near(W.beatFrequency(444, 440), 4));
{
  let ok = true;
  for (let i = 0; i < 500; i++) { const t = i * 0.0013; if (Math.abs(W.twoTones(t, 440, 444)) > W.beatEnvelope(t, 440, 444) + 1e-9) ok = false; }
  check('two tones stay inside the beat envelope', ok);
  check('the envelope falls to zero half a beat period in', W.beatEnvelope(1 / 8, 440, 444) < 1e-9);
}

// ─── Doppler and Mach ──────────────────────────────────────────────────────
{
  const v = 343;
  check('siren approaching at 25 m/s: 700 → 755 Hz', near(W.doppler(700, v, 0, 25), 755.03, 1e-4));
  check('siren receding at 25 m/s: 700 → 652 Hz', near(W.doppler(700, v, 0, -25), 652.45, 1e-4));
  check('observer approaching at 25 m/s: 700 → 751 Hz', near(W.doppler(700, v, 25, 0), 751.02, 1e-4));
  check('source speed from the two shifts', near(W.sourceSpeedFromShift(W.doppler(700, v, 0, 25), W.doppler(700, v, 0, -25), v), 25));
  check('Mach 2 cone half-angle is 30°', near(W.machAngle(2), Math.PI / 6));
  check('Mach 1 cone is a flat wall (90°)', near(W.machAngle(1), Math.PI / 2));
  // boom delay: Mach 2 at 15 km, v = 295 m/s: the cone meets the ground 26 km behind
  check('boom delay h/(u tan θ)', near(W.boomDelay(15000, 2, 295), 15000 / (590 * Math.tan(Math.PI / 6))));
  // the wavefront picture: fronts emitted every 1/f, centred where the source was
  const fr = W.wavefronts(1, { M: 0.5, v: 10, f: 2, tStart: 0 });
  check('wavefronts: one per period, centred on the source’s past positions', fr.length === 3 && near(fr[1].x, 2.5) && near(fr[1].r, 5) && near(fr[2].r, 0));
  // an observer far ahead hears f/(1 − M); far behind, f/(1 + M); the distance does not matter
  const M = 0.4, f = 100, P = { M, v, f };
  check('heard far ahead: f/(1 − M)', near(W.heardFrequency(5000, 0, 0, P), f / (1 - M), 1e-9));
  check('heard at twice the distance ahead: the same', near(W.heardFrequency(10000, 0, 0, P), f / (1 - M), 1e-9));
  check('heard behind: f/(1 + M)', near(W.heardFrequency(-5000, 0, 0, P), f / (1 + M), 1e-9));
  const side = W.heardFrequency(0, 300, 300 / v, P);   // directly abeam: front emitted when the source was off to the side
  check('heard abeam lies between the two', side > f / (1 + M) && side < f / (1 - M));
}

// ─── the simulation’s parameter check ──────────────────────────────────────
check('wave-string validate accepts its defaults', validateString({}).length === 0, validateString({}).join('; '));
check('wave-string validate rejects an unknown mode', validateString({ mode: 'nope' }).length > 0);
for (const mode of ['travel', 'pipe', 'beats']) check(`wave-sound validate accepts ${mode} defaults`, validateSound({ mode }).length === 0, validateSound({ mode }).join('; '));
check('wave-sound validate rejects a pipe with no such ends', validateSound({ mode: 'pipe', ends: 'open-shut' }).length > 0);
check('a closed–open pipe’s resonances are harmonics 1, 3, 5, 7, 9', [1, 2, 3, 4, 5].map((k) => harmonicOf('closed-open', k)).join() === '1,3,5,7,9');
check('wave-doppler validate accepts its defaults', validateDoppler({}).length === 0, validateDoppler({}).join('; '));
check('wave-doppler validate rejects Mach 3', validateDoppler({ M: 3 }).length > 0);
check('an open–open pipe’s resonances are harmonics 1, 2, 3, 4, 5', [1, 2, 3, 4, 5].map((k) => harmonicOf('open-open', k)).join() === '1,2,3,4,5');

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
