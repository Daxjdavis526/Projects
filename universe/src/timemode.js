/* ============================================================================
   timemode.js — conceptual cosmic-history mode
   ----------------------------------------------------------------------------
   A time slider active at extragalactic scales. Sliding back: the scale
   factor shrinks (floored visually so the scene stays readable), large-scale
   structure un-forms toward a smooth primordial field, colors heat toward
   the CMB. Explicitly labeled a conceptual visualization: real structure
   growth and expansion are modeled qualitatively, redshift readout is real.
   ========================================================================== */
import { fmtYears, clamp, smoothstep } from './scale.js';

const $ = s => document.querySelector(s);
const AGE0 = 13.8e9;                    // yr

export class TimeMode {
  constructor(hooks) {
    this.active = false;
    this.early = 0;                     // 0 today -> 1 primordial
    this.scaleA = 1;                    // visual scale factor (floored)
    this.age = AGE0;
    this.hooks = hooks;
    this.slider = $('#timeSlider');
    this.slider.addEventListener('input', () => this._apply());
  }
  toggle(logS) {
    if (this.active) { this.deactivate(); return true; }
    if (logS < 23.6) return false;      // only meaningful at large scales
    this.active = true;
    this.slider.value = 1000;
    this._apply();
    $('#timebox').classList.add('on');
    $('#bTime').classList.add('on');
    return true;
  }
  deactivate() {
    this.active = false;
    this.early = 0; this.scaleA = 1; this.age = AGE0;
    $('#timebox').classList.remove('on');
    $('#bTime').classList.remove('on');
  }
  _apply() {
    const v = this.slider.value / 1000;               // 0..1
    this.age = Math.max(AGE0 * Math.pow(v, 2.6), 3.8e5);
    const a = Math.pow(this.age / AGE0, 2 / 3);       // matter-era scale factor
    const z = 1 / a - 1;
    this.scaleA = clamp(a, 0.14, 1);                  // visual floor, documented
    this.early = 1 - smoothstep(0.045, 0.72, a);
    $('#timeAge').textContent = this.age >= AGE0 * 0.999
      ? 'Today — 13.8 billion years' : fmtYears(this.age) + ' after the Big Bang';
    $('#timeZ').textContent = z < 0.01 ? 'z ≈ 0' : 'z ≈ ' + (z < 10 ? z.toFixed(1) : z.toFixed(0));
  }
}
