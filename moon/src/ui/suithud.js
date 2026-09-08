/* =============================================================================
   SUIT HUD — the numbers you actually glance at
   -----------------------------------------------------------------------------
   The brief for this display is "do not turn the game into a spreadsheet". So
   there is one big number, which is how much longer you can stay out, and five
   small ones behind it for when you want to know why.

   The five are the five a real suit has: oxygen, the carbon dioxide scrubber,
   electrical power, thermal control, and suit pressure. They are not decorative.
   Which of them runs out first depends on what you have been doing, and the
   display says which one it is, because "four hours left" is only useful if you
   also know that turning the lamps off would buy you two more.

   Carbon dioxide is shown as a partial pressure in millimetres of mercury
   rather than as a percentage of a tank, because that is the number the flight
   rules are written in and the one that decides whether you are still thinking
   clearly.
   ========================================================================== */

const el = (id) => document.getElementById(id);

/* Cached so the DOM is touched only when something has actually changed: at
   sixty frames a second, writing five identical strings is not free. */
export class SuitHud {
  constructor() {
    this.root = el('suit');
    this.warnings = el('warnings');
    this.blackout = el('blackout');
    this.gauges = {
      o2: el('g-o2'), co2: el('g-co2'), pwr: el('g-pwr'),
      thm: el('g-thm'), prs: el('g-prs'),
    };
    this.last = {};
    this.lastWarnings = '';
  }

  set(node, cls, text, fraction) {
    if (!node) return;
    const key = node.id;
    const sig = cls + '|' + text + '|' + fraction.toFixed(3);
    if (this.last[key] === sig) return;
    this.last[key] = sig;
    node.className = 'g' + (cls ? ' ' + cls : '');
    node.querySelector('b').textContent = text;
    node.querySelector('i').style.width = (Math.max(0, Math.min(1, fraction)) * 100).toFixed(1) + '%';
  }

  /** @param {object|null} s an EVA snapshot, or null when nobody is outside */
  update(s) {
    if (!s) {
      if (this.root.classList.contains('on')) {
        this.root.classList.remove('on');
        this.warnings.textContent = '';
        this.blackout.classList.remove('on');
        this.lastWarnings = '';
      }
      return;
    }
    this.root.classList.add('on');
    const suit = s.suit, p = s.player;

    el('v-eva').textContent = formatEndurance(suit.enduranceSeconds);
    el('v-limit').textContent = suit.mode === 'unlimited' ? 'unlimited'
      : 'limited by ' + suit.limiting;

    /* Level of concern comes from the warnings the suit itself raised, so the
       display and the caution tones never disagree about how bad it is. */
    const level = (id) => {
      const w = suit.warnings.find(x => x.id === id);
      return w ? w.level : '';
    };
    this.set(this.gauges.o2, level('o2'), pct(suit.o2Fraction), suit.o2Fraction);
    /* The scrubber fills up rather than draining, so its bar runs the other way
       and the number is the partial pressure it is letting through. */
    this.set(this.gauges.co2, level('co2'), suit.co2mmHg.toFixed(1),
             1 - Math.min(1, suit.co2mmHg / 20));
    this.set(this.gauges.pwr, level('power'), pct(suit.powerFraction), suit.powerFraction);
    this.set(this.gauges.thm, level('thermal'), pct(suit.waterFraction), suit.waterFraction);
    this.set(this.gauges.prs, level('pressure'), suit.pressureKpa.toFixed(1),
             suit.pressureKpa / 29.6);

    el('v-gait').textContent = p.fallen ? 'getting up'
      : `${p.gait}  ${p.speed.toFixed(1)} m/s`;
    el('v-lamps').textContent = s.lamps === 0 ? 'lamps off'
      : s.lamps === 1 ? 'lamps: flood + head' : 'lamps: all three';
    el('v-jet').textContent = p.jetHeat > 0.02
      ? `pack ${(p.jetHeat * 100).toFixed(0)} % hot` : `${(p.distance / 1000).toFixed(2)} km walked`;

    const text = suit.warnings.map(w => `<div class="${w.level}">${w.text}</div>`).join('');
    if (text !== this.lastWarnings) { this.warnings.innerHTML = text; this.lastWarnings = text; }
    this.blackout.classList.toggle('on', !!suit.unconscious);
  }
}

function pct(f) { return (Math.max(0, f) * 100).toFixed(0) + ' %'; }

/** Hours and minutes, because that is how an EVA is planned. */
function formatEndurance(seconds) {
  if (!Number.isFinite(seconds)) return '∞';
  if (seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
