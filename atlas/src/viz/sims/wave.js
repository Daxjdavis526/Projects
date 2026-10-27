// Waves on a string: one travelling wave, two waves superposed, or a
// standing wave in mode n — animated, with amplitude, wavelength, frequency
// and direction as labelled sliders, and v = fλ in the readout.

import { Plot } from '../plot.js';

export const defaults = { mode: 'travel', A: 1, lambda: 4, f: 0.5, A2: 1, lambda2: 4, f2: 0.5, dir2: -1, n: 3, Lstring: 10 };

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'wide', label: 'Waves on a string' });
  F.choice({ key: 'mode', label: 'Show', options: [['travel', 'Travelling wave'], ['super', 'Two waves'], ['standing', 'Standing wave']], value: P.mode, explain: 'Two equal waves travelling in opposite directions make a standing wave.' });
  F.slider({ key: 'A', label: 'Amplitude $A$', min: 0.1, max: 1.5, step: 0.05, value: P.A, unit: '\\mathrm{cm}', explain: 'Maximum displacement.' });
  F.slider({ key: 'lambda', label: 'Wavelength $\\lambda$', min: 1, max: 10, step: 0.1, value: P.lambda, unit: '\\mathrm{m}', explain: 'Distance between crests.' });
  F.slider({ key: 'f', label: 'Frequency $f$', min: 0.05, max: 2, step: 0.05, value: P.f, unit: '\\mathrm{Hz}', explain: 'Crests passing a point per second; speed $v = f\\lambda$.' });
  F.slider({ key: 'n', label: 'Standing-wave mode $n$', min: 1, max: 8, step: 1, value: P.n, unit: '', explain: 'For a string fixed at both ends, $\\lambda_n = 2L/n$.' });
  const plot = new Plot(canvas, { x: [0, P.Lstring], y: [-3.2, 3.2], xlabel: 'x (m)', ylabel: 'y' });
  let T = 0;
  F.animate((dt) => { T += dt; draw(); });
  F.onChange(() => draw());
  function draw() {
    plot.clear();
    const { mode, A, lambda, f, n } = F.params;
    const k = (2 * Math.PI) / lambda, w = 2 * Math.PI * f;
    if (mode === 'travel') {
      plot.fn((x) => A * Math.sin(k * x - w * T), { color: 'accent', width: 2.6 });
      const xc = ((((w * T) / k) % lambda) + lambda) % lambda + lambda / 4;
      plot.point(xc % P.Lstring, A, { color: 'gold', r: 5, label: 'crest' });
    } else if (mode === 'super') {
      const y1 = (x) => A * Math.sin(k * x - w * T), y2 = (x) => A * Math.sin(k * x + w * T);
      plot.fn(y1, { color: 'ink3', width: 1.4, dash: [5, 5] });
      plot.fn(y2, { color: 'ink3', width: 1.4, dash: [2, 4] });
      plot.fn((x) => y1(x) + y2(x), { color: 'accent', width: 2.6 });
    } else {
      const L = P.Lstring, kn = (n * Math.PI) / L, wn = w;
      plot.fn((x) => 2 * A * Math.sin(kn * x) * Math.cos(wn * T), { color: 'accent', width: 2.6 });
      plot.fn((x) => 2 * A * Math.sin(kn * x), { color: 'ink4', width: 1, dash: [3, 4] });
      plot.fn((x) => -2 * A * Math.sin(kn * x), { color: 'ink4', width: 1, dash: [3, 4] });
      for (let j = 0; j <= n; j++) plot.point((j * L) / n, 0, { color: 'warn', r: 4 });
    }
    F.readout(mode === 'standing'
      ? [['$\\lambda_n = 2L/n$', `${(2 * P.Lstring / n).toFixed(2)}\\,\\mathrm{m}`], ['nodes', String(n + 1)], ['antinodes', String(n)]]
      : [['speed $v = f\\lambda$', `${(f * lambda).toFixed(2)}\\,\\mathrm{m/s}`], ['period $T = 1/f$', `${(1 / f).toFixed(2)}\\,\\mathrm{s}`], ['$k = 2\\pi/\\lambda$', `${k.toFixed(3)}\\,\\mathrm{rad/m}`]]);
  }
  F.draw(draw);
  F.caption('Transverse displacement is exaggerated relative to length. Standing-wave mode uses a 10 m string fixed at both ends; orange dots are nodes.');
}
